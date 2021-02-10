// need to put this in a new file because recursive imports

const viewCategory = require('./view-category')
const viewAllSpecies = require('./view-all-species')

async function syncAllViewCaches() {
  await viewCategory.sync()
  await viewAllSpecies.sync()
}
module.exports.syncAllViewCaches = syncAllViewCaches
