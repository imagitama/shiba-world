const functions = require('firebase-functions')
const { checkSource } = require('./check-source')

const onUpdate = async (
  collectionName,
  before,
  after,
  viewCacheDefinitions
) => {
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
          after,
          viewCacheDefinitions
        )
      }
    }

    const primarySource = sources[0]

    await checkSource(
      collectionName,
      viewName,
      primarySource,
      before,
      after,
      viewCacheDefinitions
    )
  }
}

const onCreate = async (collectionName, doc, viewCacheDefinitions) => {
  for (const [viewName, { sources, summary }] of Object.entries(
    viewCacheDefinitions
  )) {
    if (summary && summary.sources) {
      for (const summarySource of summary.sources) {
        await checkSource(
          collectionName,
          viewName,
          summarySource,
          null,
          doc,
          viewCacheDefinitions
        )
      }
    }

    const primarySource = sources[0]

    await checkSource(
      collectionName,
      viewName,
      primarySource,
      null,
      doc,
      viewCacheDefinitions
    )
  }
}

const addCollectionOnWriteFunction = (
  existingFunctions,
  collectionName,
  viewCacheDefinitions
) => {
  const functionName = `itemViewCache_${collectionName}`

  if (existingFunctions[functionName]) {
    return
  }

  existingFunctions[functionName] = functions.firestore
    .document(`${collectionName}/{id}`)
    .onWrite(async ({ before, after }) => {
      if (before) {
        await onUpdate(collectionName, before, after, viewCacheDefinitions)
      } else {
        await onCreate(collectionName, after, viewCacheDefinitions)
      }
    })
}

const defineFunctionsForSource = (
  existingFunctions,
  source,
  viewCacheDefinitions
) => {
  addCollectionOnWriteFunction(
    existingFunctions,
    source.collectionName,
    viewCacheDefinitions
  )

  if (source.join) {
    const joinSource =
      typeof source.join === 'function' ? source.join({}) : source.join

    defineFunctionsForSource(
      existingFunctions,
      joinSource.collectionName,
      viewCacheDefinitions
    )
  }

  if (source.merge) {
    // todo
  }

  if (source.add) {
    for (const [, addSource] of Object.entries(source.add)) {
      const itemSource =
        typeof addSource === 'function' ? addSource({ ref: {} }) : addSource

      defineFunctionsForSource(
        existingFunctions,
        itemSource,
        viewCacheDefinitions
      )
    }
  }
}
module.exports.defineFunctionsForSource = defineFunctionsForSource

const addDefinition = (
  existingFunctions,
  viewName,
  { sources, summary },
  viewCacheDefinitions
) => {
  for (const source of sources) {
    defineFunctionsForSource(existingFunctions, source, viewCacheDefinitions)
  }

  if (summary) {
    for (const source of summary.sources) {
      addCollectionOnWriteFunction(
        existingFunctions,
        source.collectionName,
        viewCacheDefinitions
      )
    }
  }
}
module.exports.addDefinition = addDefinition

// module.exports.cacheViews = (existingFunctions, viewCacheDefinitions) => {
//   for (const [viewName, definition] of Object.entries(viewCacheDefinitions)) {
//     addDefinition(existingFunctions, viewName, definition, viewCacheDefinitions)
//   }
// }
