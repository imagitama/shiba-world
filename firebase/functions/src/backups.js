const admin = require('firebase-admin')
const { firestoreExport } = require('node-firestore-import-export')
const config = require('./config')
const { db } = require('./firebase')

const BACKUP_BUCKET_NAME = config.global.backupBucketName

module.exports.backupRunWithOptions = {
  timeoutSeconds: 540, // default 60 sec
  memory: '1GB',
}

module.exports.backupDatabaseToStorage = async () => {
  if (!BACKUP_BUCKET_NAME) {
    throw new Error('No backup bucket name specified')
  }

  const collectionRefs = await db.listCollections()

  const backups = await Promise.all(
    collectionRefs.map((collectionRef) =>
      firestoreExport(collectionRef).then((backupData) => ({
        collectionName: collectionRef.id,
        data: backupData,
      }))
    )
  )

  const date = new Date()
  const dateAsString = `${date.getDate()}-${date.getMonth()}-${date
    .getFullYear()
    .toString()
    .padStart(2, '0')}_${date
    .getHours()
    .toString()
    .padStart(2, '0')}-${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}-${date.getSeconds().toString().padStart(2, '0')}`

  const file = admin
    .storage()
    .bucket(BACKUP_BUCKET_NAME)
    .file(`backups/${dateAsString}/db.json`)

  // The nodejs module does not do a complete export so rebuild the structure
  // it expects when importing
  const dataToJsonify = {
    __collections__: backups.reduce(
      (obj, backupItem) =>
        Object.assign({}, obj, {
          [backupItem.collectionName]: backupItem.data,
        }),
      {}
    ),
  }

  const json = JSON.stringify(dataToJsonify, null, '  ')

  await file.save(json, {
    metadata: {
      contentType: 'application/json',
    },
  })

  return {
    collectionNames: backups.map((backupItem) => backupItem.collectionName),
  }
}
