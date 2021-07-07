const { db } = require('../../firebase')

const viewCacheCollectionName = 'viewCache'
const limitPerPage = 100
const summaryFieldNames = {
  pageCount: 'pageCount',
}
const pageFieldNames = {
  items: 'items',
}

module.exports.reduceItemsIntoPages = (items) => {
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

module.exports.storePages = async (viewName, itemsByPageNumber) => {
  for (const [pageNumber, items] of Object.entries(itemsByPageNumber)) {
    await db
      .collection(viewCacheCollectionName)
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

module.exports.storeSummary = async (
  viewName,
  pageCount,
  summaryEntries = {}
) => {
  await db
    .collection(viewCacheCollectionName)
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

module.exports.storeItems = async (viewName, items) => {
  let batch
  let count

  const restart = () => {
    batch = db.batch()
    count = 0
  }

  restart()

  for (const item of items) {
    count++

    const docId = viewName.replace('{id}', item.id)

    const ref = db.collection(viewCacheCollectionName).doc(docId)

    batch.set(ref, item)

    if (count === 500 || count === items.length) {
      await batch.commit()
      restart()
    }
  }
}
