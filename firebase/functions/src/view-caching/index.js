const { addDefinition } = require('./utils/functions')
const getRebuildAllViewCachesFunction = require('./functions/rebuildAllViewCaches')

module.exports.getRebuildAllViewCachesFunction = getRebuildAllViewCachesFunction

module.exports.cacheViews = (existingFunctions, viewCacheDefinitions) => {
  for (const [viewName, definition] of Object.entries(viewCacheDefinitions)) {
    addDefinition(existingFunctions, viewName, definition, viewCacheDefinitions)
  }
}
