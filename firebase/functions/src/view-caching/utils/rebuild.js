const {
  reduceItemsIntoPages,
  storeSummary,
  storePages,
  storeItems,
} = require('./pagination')
const { getSourceItems } = require('./sources')

const getSummaryEntriesForViewName = async (
  viewName,
  pages,
  viewCacheDefinitions
) => {
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

const rebuildView = async (viewName, viewCacheDefinitions) => {
  console.debug(`rebuild item view cache`, viewName)

  const definition = viewCacheDefinitions[viewName]

  // if we are setting the document ID then assume it is a single item eg. a user page
  if (definition.usePrimarySourceAsId) {
    const items = await getSourceItems(definition.sources[0])

    console.debug(`found ${items.length} items from primary source`)

    await storeItems(viewName, items)
  } else {
    // only single source right now
    const items = await getSourceItems(definition.sources[0])

    console.debug(`found ${items.length} items from primary source`)

    const itemsByPageNumber = reduceItemsIntoPages(items)

    const pageCount = Object.keys(itemsByPageNumber).length

    console.debug(`generated ${pageCount} pages`)

    const summaryEntries = await getSummaryEntriesForViewName(
      viewName,
      itemsByPageNumber,
      viewCacheDefinitions
    )

    await storeSummary(viewName, pageCount, summaryEntries)

    await storePages(viewName, itemsByPageNumber)
  }

  console.debug(`${viewName} done`)
}
module.exports.rebuildView = rebuildView

module.exports.rebuildAllViewCaches = async (viewCacheDefinitions) => {
  const viewNames = Object.keys(viewCacheDefinitions)
  for (const viewName of viewNames) {
    await rebuildView(viewName, viewCacheDefinitions)
  }
  return { viewNames, views: viewCacheDefinitions }
}
