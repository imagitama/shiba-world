const admin = require("firebase-admin");
const isDryRun = !process.argv.includes("--go");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://shiba-world-dev.firebaseio.com",
});
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

const UserFieldNames = {
  isPatron: "isPatron", // deprecated
  patreonUserId: "patreonUserId", // deprecated
};

const UserMetaFieldNames = {
  isPatron: "isPatron",
  patreonUserId: "patreonUserId",
  patreonRewardIds: "patreonRewardIds",
  // meta
  lastModifiedAt: "lastModifiedAt",
  lastModifiedBy: "lastModifiedBy",
};

async function getAllExistingPatrons() {
  return db
    .collection("users")
    .where(UserFieldNames.isPatron, "==", true)
    .get();
}

async function main() {
  try {
    const existingUsersThatPatrons = await getAllExistingPatrons();

    console.log(
      `Found ${existingUsersThatPatrons.size} users that are patrons`
    );

    const batch = db.batch();
    let count = 0;

    for (const userRef of existingUsersThatPatrons.docs) {
      const userMetaRef = db.collection("userMeta").doc(userRef.id);

      const doc = await userMetaRef.get();

      if (doc.exists) {
        continue;
      }

      batch.create(userMetaRef, {
        [UserMetaFieldNames.isPatron]: true,
        [UserMetaFieldNames.patreonUserId]: userRef.get(
          UserFieldNames.patreonUserId
        ),
        [UserMetaFieldNames.patreonRewardIds]: [
          "4508629",
          "4508436",
          "5934668",
        ],
        [UserMetaFieldNames.lastModifiedAt]: new Date(),
        [UserMetaFieldNames.lastModifiedBy]: null,
      });

      count++;
    }

    console.log(`Inserting ${count} new user meta docs`);

    if (isDryRun) {
      console.log("Is dry run! Pass --go to do it for real");
    } else {
      await batch.commit();
    }

    console.log("Job complete!");
    process.exit(0);
  } catch (err) {
    console.error("Failed to do job", err);
    process.exit(1);
  }
}

main();
