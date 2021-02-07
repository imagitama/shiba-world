const {
  db,
  CollectionNames,
  AssetFieldNames,
  AssetMetaFieldNames,
  AuthorFieldNames,
  getHasSpeciesChanged,
  SpeciesFieldNames,
  EndorsementFieldNames,
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
    return [AssetFieldNames.author, AssetFieldNames.species]
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
    getHasSpeciesChanged(
      beforeData[AssetFieldNames.species],
      afterData[AssetFieldNames.species]
    )
  ) {
    fieldNames.push(AssetFieldNames.species)
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

  return saveAsset(beforeDoc.id, fields)
}
module.exports.hydrateAsset = hydrateAsset

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
