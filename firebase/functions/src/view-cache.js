const functions = require('firebase-functions')
const { performance } = require('perf_hooks')
const { db, Operators } = require('./firebase')
const viewCacheDefinitions = require('./views')

/**
 * Source {
 *   collectionName: string,
 *   where?: Array<[fieldName, operator, value]>,
 *   order?: [fieldName, dir],
 *   limit?: number,
 *   map?: (item, index, { addUnmappedItem: item => void }) => item,
 *   test?: (itemBefore, itemAfter) => boolean,
 *   fieldName?: string // summary only
 * }
 *
 * ViewCacheDefinition {
 *   sources: Source[],
 *   summary: {
 *     sources: Source[]
 *   }
 * }
 */

const doesDocMatchWhereCondition = (doc, where = []) => {
  for (const [field, operator, value] of where) {
    switch (operator) {
      case Operators.EQUALS:
        if (doc.get(field) !== value) {
          return false
        }
        break
      case Operators.NOT_EQUALS:
        if (doc.get(field) === value) {
          return false
        }
        break
      default:
        throw new Error(`Operator ${operator} not supported at this time`)
    }
  }
  return true
}

const limitPerPage = 100

const reduceItemsIntoPages = (items) => {
  let currentPageNumber = 1

  return items.reduce(
    (pages, item) => {
      if (pages[currentPageNumber].length === limitPerPage) {
        currentPageNumber++
        pages[currentPageNumber] = []
      }
      return {
        ...pages,
        [currentPageNumber]: pages[currentPageNumber].concat([item]),
      }
    },
    {
      [currentPageNumber]: [],
    }
  )
}

const getSourceItems = async (source, pages = {}) => {
  const {
    collectionName,
    where = [],
    order = undefined,
    filter,
    map,
    limit,
    join,
  } = source

  // console.debug(`get source items`, collectionName, where, order)

  let query = db.collection(collectionName)

  for (const [fieldName, operator, value] of where) {
    query = query.where(fieldName, operator, value)
  }

  if (order) {
    query = query.orderBy(order[0], order[1])
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { docs } = await query.get()

  let mappedItems = docs.map((doc) => ({
    id: doc.id,
    ref: doc.ref,
    ...doc.data(),
  }))

  if (filter) {
    mappedItems = mappedItems.filter((mappedItem, i) =>
      filter(mappedItem, i, { pages })
    )
  }

  if (map) {
    for (let i = 0; i < mappedItems.length; i++) {
      const item = mappedItems[i]
      mappedItems[i] = {
        id: item.id,
        ref: item.ref,
        ...map(item, i, {
          pages,
          addUnmappedItem: (newItem) => {
            mappedItems.push(newItem)
          },
        }),
      }
    }
  }

  if (join) {
    const joinedItems = await getSourceItems(join)

    const getJoinedItemById = (id) =>
      joinedItems.find((item) => item.id === id) || {}

    mappedItems = mappedItems.map((item) => ({
      ...item,
      ...getJoinedItemById(item.id),
    }))
  }

  return mappedItems
}

const storePages = async (viewName, itemsByPageNumber) => {
  for (const [pageNumber, items] of Object.entries(itemsByPageNumber)) {
    await db
      .collection(collectionName)
      .doc(`${viewName}_page${pageNumber}`)
      .set(
        {
          [pageFieldNames.items]: items,
        },
        {
          merge: false,
        }
      )
  }
}

const storeSummary = async (viewName, pageCount, summaryEntries = {}) => {
  await db
    .collection(collectionName)
    .doc(`${viewName}_summary`)
    .set(
      {
        [summaryFieldNames.pageCount]: pageCount,
        ...summaryEntries,
      },
      {
        merge: false,
      }
    )
}

const getSummaryEntriesForViewName = async (viewName, pages) => {
  const definition = viewCacheDefinitions[viewName]

  if (!definition.summary || !definition.summary.sources) {
    return {}
  }

  const entries = {}

  for (const source of definition.summary.sources) {
    const items = await getSourceItems(source, pages)

    entries[source.fieldName] = items
  }

  return entries
}

const rebuildViewCache = async (viewName) => {
  console.debug(`rebuild view cache`, viewName)

  // only single source right now
  const items = await getSourceItems(viewCacheDefinitions[viewName].sources[0])

  console.debug(`found ${items.length} items from primary source`)

  const itemsByPageNumber = reduceItemsIntoPages(items)

  const pageCount = Object.keys(itemsByPageNumber).length

  console.debug(`generated ${pageCount} pages`)

  const summaryEntries = await getSummaryEntriesForViewName(
    viewName,
    itemsByPageNumber
  )

  await storeSummary(viewName, pageCount, summaryEntries)

  await storePages(viewName, itemsByPageNumber)
}

const rebuildAllViewCaches = async () => {
  const viewNames = Object.keys(viewCacheDefinitions)
  for (const viewName of viewNames) {
    await rebuildViewCache(viewName)
  }
  return { viewNames }
}

module.exports.rebuildAllViewCaches = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '1GB',
  })
  .https.onRequest(async (req, res) => {
    try {
      const timeStart = performance.now()

      const result = await rebuildAllViewCaches()

      const timeEnd = performance.now()

      res.status(200).send({
        message: 'All view caches have been rebuilt',
        count: result.viewNames.length,
        time: ((timeEnd - timeStart) / 1000).toFixed(2),
      })
    } catch (err) {
      console.error(err)
      res.status(500).send({ message: err.message })
      // throw new functions.https.HttpsError('unknown', err.message)
    }
  })

const removeDocFromViewCache = async (doc, viewName) => {
  // this needs to be done because removing an asset changes the count per page
  await rebuildViewCache(viewName)
}

const addDocToViewCache = async (doc, viewName) => {
  // this needs to be done because adding an asset changes the count per page
  await rebuildViewCache(viewName)
}

const getIsDocToBeRemoved = (before, after, where) => {
  return !doesDocMatchWhereCondition(after, where)
}

const getIsDocToBeAdded = (before, after, where) => {
  return (
    !doesDocMatchWhereCondition(before, where) &&
    doesDocMatchWhereCondition(after, where)
  )
}

const doesDocNeedToBeUpdated = (before, after, test) => {
  return !test || test(before.data(), after.data()) === false
}

const collectionName = 'viewCache'
const summaryFieldNames = {
  pageCount: 'pageCount',
}
const pageFieldNames = {
  items: 'items',
}

// const retrievePageNumberForItemId = async (viewName, itemId) => {
//   const summaryDoc = await db.collection(collectionName).doc(`${viewName}_summary`).get()
//   const pageCount = summaryDoc.get(summaryFieldNames.pageCount)

//   for (const pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
//     const pageDoc = await db.collectionName(collectionName).doc(`${viewName}_page${pageNumber}`).get()
//     const items = pageDoc.get(pageFieldNames.items)

//     for (const item of items) {
//       if (item.id === itemId) {
//         return pageNumber
//       }
//     }
//   }

//   return false
// }

const updateDocInViewCache = async (doc, viewName) => {
  // get all data in all pages
  // find item
  // perform update

  // for now we cheat...
  await rebuildViewCache(viewName)
}

const checkSource = async (collectionName, viewName, source, before, after) => {
  // console.debug('CHECK SOURCE', collectionName, 'vs', source.collectionName)

  if (source.collectionName !== collectionName) {
    return
  }

  // handle edits to a document that was and still is invalid
  if (
    !doesDocMatchWhereCondition(before, source.where) &&
    !doesDocMatchWhereCondition(after, source.where)
  ) {
    // console.debug(`item is still invalid, ignoring...`)
    return
  }

  // handle edits to a document that should be added/edited/removed from the cache
  if (getIsDocToBeRemoved(before, after, source.where)) {
    // console.debug(`item is to be removed`)
    await removeDocFromViewCache(after, viewName)
  } else if (getIsDocToBeAdded(before, after, source.where)) {
    // console.debug(`item is to be added`)
    await addDocToViewCache(after, viewName)
  } else if (doesDocNeedToBeUpdated(before, after, source.test)) {
    // console.debug(`item is to be updated`)
    await updateDocInViewCache(after, viewName)
  } else {
    // console.debug('item is not removed or added or updated! odd!')
  }
}

const onUpdate = async (collectionName, before, after) => {
  for (const [viewName, { sources, summary }] of Object.entries(
    viewCacheDefinitions
  )) {
    if (summary && summary.sources) {
      for (const summarySource of summary.sources) {
        await checkSource(
          collectionName,
          viewName,
          summarySource,
          before,
          after
        )
      }
    }

    const primarySource = sources[0]

    await checkSource(collectionName, viewName, primarySource, before, after)
  }
}

const onCreate = (collectionName) => {
  for (const [, { source }] of Object.entries(viewCacheDefinitions)) {
    if (source.collectionName !== collectionName) {
      continue
    }

    //   if (getDoesUpdatedDocNeedToBeRemoved(before, after, source.where)) {
    //     removeDocFromViewCache(after, viewName)
    //   } else if (getDoesUpdatedDocNeedToBeAdded(before, after, source.where)) {
    //     addDocToViewCache(after, viewName)
    //   } else if (getDoesUpdatedDocNeedToBeUpdated(before, after, source.test)) {
    //     updateDocInViewCache(after, viewName)
    //   }
  }
}

const addCollectionOnWriteFunction = (existingFunctions, collectionName) => {
  const functionName = `viewCache_${collectionName}`

  if (existingFunctions[functionName]) {
    return
  }

  existingFunctions[functionName] = functions.firestore
    .document(`${collectionName}/{id}`)
    .onWrite(async ({ before, after }) => {
      if (before) {
        await onUpdate(collectionName, before, after)
      } else {
        await onCreate(collectionName, after)
      }
    })
}

const addDefinition = (existingFunctions, viewName, { sources, summary }) => {
  for (const { collectionName } of sources) {
    addCollectionOnWriteFunction(existingFunctions, collectionName)
  }

  if (summary) {
    for (const source of summary.sources) {
      addCollectionOnWriteFunction(existingFunctions, source.collectionName)
    }
  }
}

module.exports.cacheViews = (existingFunctions) => {
  for (const [viewName, definition] of Object.entries(viewCacheDefinitions)) {
    addDefinition(existingFunctions, viewName, definition)
  }
}
