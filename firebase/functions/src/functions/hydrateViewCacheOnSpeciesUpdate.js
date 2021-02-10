const functions = require('firebase-functions')
const { CollectionNames } = require('../firebase')
const { hydrate } = require('../views/view-all-species')

module.exports = functions.firestore
  .document(`${CollectionNames.Species}/{id}`)
  .onUpdate(async ({ after }) => hydrate(after))
