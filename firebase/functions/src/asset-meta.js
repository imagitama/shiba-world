const {
  db,
  CollectionNames,
  AssetFieldNames,
  AssetMetaFieldNames,
  ProductFieldNames,
  AuthorFieldNames,
  DiscordServerFieldNames,
  getHasArrayOfReferencesChanged,
  SpeciesFieldNames,
  EndorsementFieldNames,
  Operators,
} = require('./firebase')

async function saveAsset(id, fields) {
  const docRef = db.collection(CollectionNames.AssetMeta).doc(id)

  const doc = await docRef.get()

  // initialise the count
  if (!doc.get(AssetMetaFieldNames.endorsementCount)) {
    fields[AssetMetaFieldNames.endorsementCount] = 0
  }

  return docRef.set(
    { ...fields, [AssetMetaFieldNames.lastModifiedAt]: new Date() },
    {
      merge: true,
    }
  )
}

const getFieldNamesThatChanged = (beforeData, afterData) => {
  const fieldNames = []

  // if we are creating the asset
  if (!beforeData) {
    return [
      AssetFieldNames.author,
      AssetFieldNames.species,
      AssetFieldNames.children,
      AssetFieldNames.discordServer,
    ]
  }

  // add or remove author
  if (
    beforeData[AssetFieldNames.author] &&
    !afterData[AssetFieldNames.author]
  ) {
    fieldNames.push(AssetFieldNames.author)
  }
  if (
    !beforeData[AssetFieldNames.author] &&
    afterData[AssetFieldNames.author]
  ) {
    fieldNames.push(AssetFieldNames.author)
  }

  // change author
  if (
    beforeData[AssetFieldNames.author] &&
    afterData[AssetFieldNames.author] &&
    beforeData[AssetFieldNames.author].id !==
      afterData[AssetFieldNames.author].id
  ) {
    fieldNames.push(AssetFieldNames.author)
  }

  // species add/remove
  if (
    getHasArrayOfReferencesChanged(
      beforeData[AssetFieldNames.species],
      afterData[AssetFieldNames.species]
    )
  ) {
    fieldNames.push(AssetFieldNames.species)
  }

  // linked asset changed
  if (
    getHasArrayOfReferencesChanged(
      beforeData[AssetFieldNames.children],
      afterData[AssetFieldNames.children]
    )
  ) {
    fieldNames.push(AssetFieldNames.children)
  }

  // add or remove discord server
  if (
    beforeData[AssetFieldNames.discordServer] &&
    !afterData[AssetFieldNames.discordServer]
  ) {
    fieldNames.push(AssetFieldNames.discordServer)
  }
  if (
    !beforeData[AssetFieldNames.discordServer] &&
    afterData[AssetFieldNames.discordServer]
  ) {
    fieldNames.push(AssetFieldNames.discordServer)
  }

  // change discord server
  if (
    beforeData[AssetFieldNames.discordServer] &&
    afterData[AssetFieldNames.discordServer] &&
    beforeData[AssetFieldNames.discordServer].id !==
      afterData[AssetFieldNames.discordServer].id
  ) {
    fieldNames.push(AssetFieldNames.discordServer)
  }

  return fieldNames
}

const getAuthorNameFromRef = async (authorRef) => {
  const authorDoc = await authorRef.get()
  return authorDoc.get(AuthorFieldNames.name)
}

const getSpeciesNamesFromRefs = async (speciesRefs) => {
  return Promise.all(
    speciesRefs.map(async (speciesRef) => {
      const speciesDoc = await speciesRef.get()
      return speciesDoc.get(SpeciesFieldNames.singularName)
    })
  )
}

const convertLinkedAssetToItem = (doc) => ({
  id: doc.id,
  ref: doc.ref,
  [AssetFieldNames.title]: doc.get(AssetFieldNames.title),
  [AssetFieldNames.description]: doc.get(AssetFieldNames.description),
  [AssetFieldNames.thumbnailUrl]: doc.get(AssetFieldNames.thumbnailUrl),
  [AssetFieldNames.species]: doc.get(AssetFieldNames.species),
  [AssetFieldNames.isAdult]: doc.get(AssetFieldNames.isAdult),
})

const getLinkedAssets = async (assetRefs) => {
  return Promise.all(
    assetRefs.map(async (assetRef) => {
      const assetDoc = await assetRef.get()
      return convertLinkedAssetToItem(assetDoc)
    })
  )
}

const getDiscordServerFromRef = async (ref) => {
  const doc = await ref.get()
  return {
    id: ref.id,
    ref: ref,
    [DiscordServerFieldNames.name]: doc.get(DiscordServerFieldNames.name),
    [DiscordServerFieldNames.inviteUrl]: doc.get(
      DiscordServerFieldNames.inviteUrl
    ),
    [DiscordServerFieldNames.requiresPatreon]: doc.get(
      DiscordServerFieldNames.requiresPatreon
    ),
    [DiscordServerFieldNames.patreonUrl]: doc.get(
      DiscordServerFieldNames.patreonUrl
    ),
  }
}

const getUpdatedFieldsForFieldNames = async (fieldNames, docData) => {
  console.debug(`fields ${fieldNames.join(', ')} have changed`)

  const fields = {}

  for (const fieldName of fieldNames) {
    switch (fieldName) {
      case AssetFieldNames.author: {
        // support onCreate
        if (!docData[AssetFieldNames.author]) {
          fields[AssetMetaFieldNames.authorName] = null
          break
        }

        const authorName = await getAuthorNameFromRef(
          docData[AssetFieldNames.author]
        )

        if (!authorName) {
          throw new Error(
            `Cannot hydrate without an author name! Author ${
              docData[AssetFieldNames.author].id
            }`
          )
        }

        fields[AssetMetaFieldNames.authorName] = authorName
        break
      }
      case AssetFieldNames.species: {
        const speciesNames = await getSpeciesNamesFromRefs(
          docData[AssetFieldNames.species]
        )

        // note that speciesNames can be empty array if asset has not set anything

        fields[AssetMetaFieldNames.speciesNames] = speciesNames
        break
      }
      case AssetFieldNames.children: {
        let linkedAssets

        if (!docData[AssetFieldNames.children]) {
          linkedAssets = []
        } else {
          linkedAssets = await getLinkedAssets(
            docData[AssetFieldNames.children]
          )
        }

        fields[AssetMetaFieldNames.linkedAssets] = linkedAssets
        break
      }
      case AssetFieldNames.discordServer: {
        let discordServer

        if (!docData[AssetFieldNames.discordServer]) {
          discordServer = null
        } else {
          discordServer = await getDiscordServerFromRef(
            docData[AssetFieldNames.discordServer]
          )
        }

        fields[AssetMetaFieldNames.discordServer] = discordServer
        break
      }
      default:
        throw new Error(`Have not configured field ${fieldName} for hydration!`)
    }
  }

  return fields
}

async function hydrateAsset(beforeDoc, afterDoc) {
  const fieldNamesThatChanged = getFieldNamesThatChanged(
    beforeDoc ? beforeDoc.data() : false, // support onCreate
    afterDoc.data()
  )

  if (!fieldNamesThatChanged.length) {
    console.debug('no fields have changed so skipping hydrate')
    return
  }

  const fields = await getUpdatedFieldsForFieldNames(
    fieldNamesThatChanged,
    afterDoc.data()
  )

  console.debug(
    `hydrating asset with ${fieldNamesThatChanged.length} fields...`
  )

  return saveAsset(afterDoc.id, fields)
}
module.exports.hydrateAsset = hydrateAsset

async function getProductForAssetRef(assetRef) {
  const { docs } = await db
    .collection(CollectionNames.Products)
    .where(ProductFieldNames.asset, Operators.EQUALS, assetRef)
    .get()

  if (docs.length === 1) {
    return mapProductDocToMeta(docs[0])
  }

  return null
}

module.exports.syncAllAssetMeta = async () => {
  const { docs: assetDocs } = await db.collection(CollectionNames.Assets).get()
  const { docs: endorsementDocs } = await db
    .collection(CollectionNames.Endorsements)
    .get()

  const batch = db.batch()

  for (const assetDoc of assetDocs) {
    const tally = endorsementDocs.reduce((val, endorsementDoc) => {
      if (endorsementDoc.get(EndorsementFieldNames.asset).id === assetDoc.id) {
        return val + 1
      } else {
        return val
      }
    }, 0)

    const metaRef = db.collection(CollectionNames.AssetMeta).doc(assetDoc.id)

    batch.set(
      metaRef,
      {
        [AssetMetaFieldNames.endorsementCount]: tally,
        [AssetMetaFieldNames.authorName]: assetDoc.get(AssetFieldNames.author)
          ? await getAuthorNameFromRef(assetDoc.get(AssetFieldNames.author))
          : null,
        [AssetMetaFieldNames.speciesNames]: await getSpeciesNamesFromRefs(
          assetDoc.get(AssetFieldNames.species)
        ),
        [AssetMetaFieldNames.linkedAssets]: assetDoc.get(
          AssetFieldNames.children
        )
          ? await getLinkedAssets(assetDoc.get(AssetFieldNames.children))
          : [],
        [AssetMetaFieldNames.discordServer]: assetDoc.get(
          AssetFieldNames.discordServer
        )
          ? await getDiscordServerFromRef(
              assetDoc.get(AssetFieldNames.discordServer)
            )
          : null,
        [AssetMetaFieldNames.product]: await getProductForAssetRef(
          assetDoc.ref
        ),
        [AssetMetaFieldNames.lastModifiedAt]: new Date(),
      },
      {
        merge: true,
      }
    )
  }

  await batch.commit()
}

module.exports.addEndorsementToAssetMeta = async (assetId) => {
  console.debug(`Adding endorsement for asset ${assetId}...`)

  const existingDoc = await db
    .collection(CollectionNames.AssetMeta)
    .doc(assetId)
    .get()
  let existingCount = 0

  if (existingDoc.exists) {
    existingCount = existingDoc.get(AssetMetaFieldNames.endorsementCount) || 0
  }

  console.debug(`Existing count: ${existingCount}`)

  const newCount = existingCount + 1

  return db
    .collection(CollectionNames.AssetMeta)
    .doc(assetId)
    .set(
      {
        [AssetMetaFieldNames.endorsementCount]: newCount,
        [AssetMetaFieldNames.lastModifiedAt]: new Date(),
      },
      {
        merge: true,
      }
    )
}

const mapProductDocToMeta = (productDoc) => ({
  id: productDoc.id,
  [ProductFieldNames.priceUsd]: productDoc.get(ProductFieldNames.priceUsd),
})

module.exports.hydrateAssetWithProductDoc = (productDoc) => {
  if (!productDoc.get(ProductFieldNames.asset)) {
    throw new Error(
      `Cannot hydrate asset meta without an asset! Product ${productDoc.id}`
    )
  }

  return db
    .collection(CollectionNames.AssetMeta)
    .doc(productDoc.get(ProductFieldNames.asset).id)
    .set(
      {
        [AssetMetaFieldNames.product]: mapProductDocToMeta(productDoc),
        [AssetMetaFieldNames.lastModifiedAt]: new Date(),
      },
      {
        merge: true,
      }
    )
}
