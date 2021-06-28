const functions = require('firebase-functions')
const { CollectionNames } = require('../firebase')
const { syncAvatarPages } = require('../avatar-pages')

module.exports = functions.firestore
  .document(`${CollectionNames.Species}/{id}`)
  .onUpdate(async () => syncAvatarPages())
