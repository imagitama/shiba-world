const admin = require('firebase-admin')
const prompt = require('prompt')
const argv = require('yargs').argv

admin.initializeApp()
const db = admin.firestore()

function getArgByName(name) {
  return argv[name]
}

const collectionNameArg = getArgByName('collectionName')
const fieldNameArg = getArgByName('fieldName')
const newValueArg = getArgByName('newValue')
const fieldTypeArg = getArgByName('fieldType')

async function getAllDocs(collectionName) {
  return db.collection(collectionName).listDocuments()
}

function getValueForFieldType(fieldType, newValue) {
  switch (fieldType) {
    case 'string':
      return newValue

    case 'boolean':
      if (newValue === 'true') {
        return true
      } else if (newValue === 'false') {
        return false
      }
      throw new Error(
        `New value must either be "true" or "false" you supplied: ${newValue}`
      )
      return
    default:
      throw new Error(`Field type ${fieldType} is not supported`)
  }
}

async function main() {
  try {
    if (!collectionNameArg) {
      throw new Error(
        'Need a collection name! Pass with --collectionName=assets'
      )
    }
    if (!fieldNameArg) {
      throw new Error('Need a field name! Pass with --fieldName=title')
    }
    if (!newValueArg) {
      throw new Error(
        'Need a new value! Pass with --newValue="Hello world!" (use fieldType to specify type)'
      )
    }
    if (!fieldTypeArg) {
      throw new Error(
        'Need a field type! Pass with --fieldType=boolean (where value equals one from dropdown menu of Firebase - string, number, boolean, timestamp, etc.)'
      )
    }

    console.log('Starting...')

    const docs = await getAllDocs(collectionNameArg)

    console.log(`Found ${docs.length} docs in collection ${collectionNameArg}`)

    const value = getValueForFieldType(fieldTypeArg, newValueArg)

    console.log('New value converted to:', value, typeof value)

    const batch = db.batch()

    for (const doc of docs) {
      console.log(
        `Updating doc ${doc.id} with ${fieldNameArg} = ${newValueArg} type (${fieldTypeArg})`
      )

      batch.update(doc, { [fieldNameArg]: value })
    }

    prompt.get(
      {
        name: 'yesno',
        message: 'Are you sure you want to do this? yes or no',
        validator: /y[es]*|n[o]?/,
        warning: 'Must respond yes or no',
        default: 'no',
      },
      async (err, result) => {
        if (err || result.yesno !== 'yes') {
          console.log('Job cancelled')
          process.exit(1)
        }

        await batch.commit()

        console.log('Job done')
        process.exit(0)
      }
    )
  } catch (err) {
    console.error('Failed to bulk edit docs:', err)
    process.exit(1)
  }
}

main()
