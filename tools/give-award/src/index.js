const admin = require("firebase-admin");
const isDryRun = !process.argv.includes("--go");

// process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://shiba-world.firebaseio.com",
});
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

async function getUserRefs() {
  const { docs } = await db.collection("users").get();

  return docs;
}

async function getUserRefsWithinFirstYear() {
  const userRefs = await getUserRefs();

  // for (const userRef of userRefs) {
  //     const signupDate = await getSignupDateById(userRef.id)

  //     if (signupDate < new Date(''))
  // }

  return userRefs;
}

async function getSignupDateById(userId) {
  const user = await admin.auth().getUser(userId);
  return user.metadata.creationTime;
}

async function insertAwardsForEachUserRef(userRefs) {
  const batch = db.batch();

  for (const userRef of userRefs) {
    const awardForUserRef = db.collection("awardsForUsers").doc(userRef.id);
    batch.set(awardForUserRef, {
      awards: ["1_year_anniversary"],
      lastModifiedAt: new Date(),
    });
  }

  if (isDryRun) {
    console.log("is dry run - not committing");
  } else {
    console.log("inserting awards...");
    await batch.commit();
  }
}

async function main() {
  try {
    console.log("starting...");

    const userRefsWithinFirstYear = await getUserRefsWithinFirstYear();

    console.log(`found ${userRefsWithinFirstYear.length} users`);

    let total = 0;

    for (let i = 0; i < 5; i++) {
      let itemsToInsert = userRefsWithinFirstYear.slice(
        i * 5 * 100,
        i * 5 * 100 + 500
      );

      total = total + itemsToInsert.length;

      console.log(`chunk ${itemsToInsert.length}`);

      await insertAwardsForEachUserRef(itemsToInsert);
    }

    console.log(`inserted ${total} awards`);
  } catch (err) {
    console.error(err);
    process.exit(0);
  }
}

main();
