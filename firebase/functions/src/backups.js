const firestore = require('@google-cloud/firestore')
const config = require('./config')

const BACKUP_BUCKET_NAME = config.global.backupBucketName

let client

function getClient() {
  if (!client) {
    client = new firestore.v1.FirestoreAdminClient()
  }
  return client
}

/**
 * Source: https://firebase.google.com/docs/firestore/solutions/schedule-export#create_a_cloud_function_and_a_job
 *
 * Note if running in emulator your service account must have these IAM permissions:
 * Cloud Firestore: `Owner`, `Cloud Datastore Owner`, or `Cloud Datastore Import Export Admin`
 * Storage: `Owner` or `Storage Admin`
 *
 * This function just starts a backup. See status here: https://console.cloud.google.com/firestore/import-export?project=shiba-world&folder=&organizationId=
 *
 * Read more: https://firebase.google.com/docs/firestore/manage-data/export-import#before_you_begin
 */
module.exports.backupDatabaseToStorage = async () => {
  try {
    const myClient = getClient()
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT

    if (!projectId) {
      throw new Error('No project ID found')
    }

    const databaseName = client.databasePath(projectId, '(default)')
    const bucket = `gs://${BACKUP_BUCKET_NAME}`

    if (!BACKUP_BUCKET_NAME) {
      throw new Error('No backup bucket name specified')
    }

    const responses = await myClient.exportDocuments({
      name: databaseName,
      outputUriPrefix: bucket,
      // Leave collectionIds empty to export all collections
      // or set to a list of collection IDs to export,
      // collectionIds: ['users', 'posts']
      collectionIds: [],
    })

    const response = responses[0]
    console.log(`Operation name: ${response.name}`)
  } catch (err) {
    console.error(err)
    throw new Error('Backup failed')
  }
}
