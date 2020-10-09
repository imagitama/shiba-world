const admin = require("firebase-admin");
const isDryRun = !process.argv.includes("--go");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://shiba-world-dev.firebaseio.com",
});
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

let speciesNameToFind = process.argv.find((arg) =>
  arg.includes("--speciesNameToFind")
);

if (!speciesNameToFind) {
  throw new Error("Need species name to find! --speciesNameToFind=shiba");
}

speciesNameToFind = speciesNameToFind.split("=")[1];

let speciesIdToUse = process.argv.find((arg) =>
  arg.includes("--speciesIdToUse")
);

if (!speciesIdToUse) {
  throw new Error(
    "Need species ID to replace with! --speciesIdToUse=dflgkjsdflgkjfdg"
  );
}

speciesIdToUse = speciesIdToUse.split("=")[1];

let userIdToModifyBy = process.argv.find((arg) =>
  arg.includes("--userIdToModifyBy")
);

if (!userIdToModifyBy) {
  throw new Error(
    "Need user ID to set as last modified by! --userIdToModifyBy=dflgkjsdflgkjfdg"
  );
}

userIdToModifyBy = userIdToModifyBy.split("=")[1];

if (isDryRun) {
  console.log("Is dry run. Pas --go to do it for realz");
}

async function getAllAssetsWithSpecies() {
  return db
    .collection("assets")
    .where("species", "array-contains", speciesNameToFind)
    .get();
}

async function main() {
  // fetch all assets
  // for each one:
  //   if has species set and they are strings
  //   convert to reference to the one with id
  //   add to batch update
  // perform batch update

  console.log(speciesNameToFind, speciesIdToUse, userIdToModifyBy);

  try {
    const batchJob = db.batch();

    const results = await getAllAssetsWithSpecies();

    const speciesRef =
      speciesIdToUse !== "false"
        ? db.collection("species").doc(speciesIdToUse)
        : false;

    console.log(
      `Found ${results.docs.length} assets with species name "${speciesNameToFind}"`
    );

    results.docs.forEach((doc) => {
      batchJob.update(doc.ref, {
        species: speciesRef ? [speciesRef] : [],
        lastModifiedBy: db.collection("users").doc(userIdToModifyBy),
        lastModifiedAt: new Date(),
      });

      console.log("update", doc.id);
    });

    if (isDryRun) {
      console.log("Is dry run, skip");
    } else {
      await batchJob.commit();
    }

    console.log("Done!");
  } catch (err) {
    console.error("Failed to run!", err);
  }
}

main();
