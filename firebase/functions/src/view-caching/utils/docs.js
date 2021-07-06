const { rebuildView } = require('./rebuild')

module.exports.updateDocInViewCache = async (
  doc,
  viewName,
  viewCacheDefinitions
) => {
  // get all data in all pages
  // find item
  // perform update

  // for now we cheat...
  await rebuildView(viewName, viewCacheDefinitions)
}

module.exports.removeDocFromViewCache = async (
  doc,
  viewName,
  viewCacheDefinitions
) => {
  // this needs to be done because removing an asset changes the count per page
  await rebuildView(viewName, viewCacheDefinitions)
}

module.exports.addDocToViewCache = async (
  doc,
  viewName,
  viewCacheDefinitions
) => {
  // this needs to be done because adding an asset changes the count per page
  await rebuildView(viewName, viewCacheDefinitions)
}
