const admin = require("firebase-admin");
const prompt = require("prompt");
const argv = require("yargs").argv;

admin.initializeApp();
const db = admin.firestore();

async function getAllDocs(collectionName) {
  return db.collection(collectionName).listDocuments();
}

const collectionName = "assets";
const fieldName = "tags";

async function main() {
  try {
    console.log("Starting...");

    const docs = await getAllDocs(collectionName);

    console.log(`Found ${docs.length} docs in collection ${collectionName}`);

    const batch = db.batch();

    for (const docRef of docs) {
      const doc = await docRef.get();

      const oldTagsValue = doc.get(fieldName);
      const newTagsValue = oldTagsValue.map((tagName) => tagName.toLowerCase());

      console.log(
        `Updating doc ${
          docRef.id
        } tags ${oldTagsValue.toString()} to ${newTagsValue.toString()}`
      );

      batch.update(docRef, { [fieldName]: newTagsValue });
    }

    prompt.get(
      {
        name: "yesno",
        message: "Are you sure you want to do this? yes or no",
        validator: /y[es]*|n[o]?/,
        warning: "Must respond yes or no",
        default: "no",
      },
      async (err, result) => {
        if (err || result.yesno !== "yes") {
          console.log("Job cancelled");
          process.exit(1);
        }

        await batch.commit();

        console.log("Job done");
        process.exit(0);
      }
    );
  } catch (err) {
    console.error("Failed to set tags:", err);
    process.exit(1);
  }
}

main();
