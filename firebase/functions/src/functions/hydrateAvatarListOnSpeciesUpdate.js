const functions = require('firebase-functions')
const { CollectionNames } = require('../firebase')
const { hydrateAvatarListWithSpeciesDoc } = require('../avatar-list')

module.exports = functions.firestore
  .document(`${CollectionNames.Species}/{id}`)
  .onUpdate(async ({ after }) => hydrateAvatarListWithSpeciesDoc(after))
