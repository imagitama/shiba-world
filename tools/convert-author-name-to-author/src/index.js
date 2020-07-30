const admin = require("firebase-admin");
const isDryRun = !process.argv.includes("--go");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://shiba-world.firebaseio.com",
});
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

const Operators = {
  EQUALS: "==",
  GREATER_THAN: ">",
  ARRAY_CONTAINS: "array-contains",
};

const CollectionNames = {
  Users: "users",
  Assets: "assets",
  Comments: "comments",
  Notices: "notices",
  History: "history",
  Endorsements: "endorsements",
  Profiles: "profiles",
  Mail: "mail",
  Summaries: "summaries",
  Tweets: "tweets",
  Notifications: "notifications",
  Authors: "authors",
};

const AssetFieldNames = {
  title: "title",
  isAdult: "isAdult",
  isApproved: "isApproved",
  tags: "tags",
  createdBy: "createdBy",
  createdAt: "createdAt",
  isDeleted: "isDeleted",
  category: "category",
  species: "species",
  sourceUrl: "sourceUrl",
  videoUrl: "videoUrl",
  isPrivate: "isPrivate",
  lastModifiedBy: "lastModifiedBy",
  lastModifiedAt: "lastModifiedAt",
  thumbnailUrl: "thumbnailUrl",
  fileUrls: "fileUrls",
  description: "description",
  authorName: "authorName",
  children: "children",
};

const CommentFieldNames = {
  parent: "parent",
  createdBy: "createdBy",
};

const ProfileFieldNames = {
  vrchatUsername: "vrchatUsername",
  discordUsername: "discordUsername",
  twitterUsername: "twitterUsername",
  telegramUsername: "telegramUsername",
  youtubeChannelId: "youtubeChannelId",
  twitchUsername: "twitchUsername",
  lastModifiedBy: "lastModifiedBy",
  lastModifiedAt: "lastModifiedAt",
  bio: "bio",
  notifyOnUnapprovedAssets: "notifyOnUnapprovedAssets",
  notificationEmail: "notificationEmail",
};

const UserFieldNames = {
  username: "username",
  isEditor: "isEditor",
  isAdmin: "isAdmin",
  enabledAdultContent: "enabledAdultContent",
  lastModifiedBy: "lastModifiedBy",
  lastModifiedAt: "lastModifiedAt",
};

const NotificationsFieldNames = {
  recipient: "recipient",
  message: "message",
  parent: "parent",
  isRead: "isRead",
  data: "data",
  createdAt: "createdAt",
};

const RequestsFieldNames = {
  title: "title",
  description: "description",
  isClosed: "isClosed",
  createdBy: "createdBy",
  createdAt: "createdAt",
  lastModifiedBy: "lastModifiedBy",
  lastModifiedAt: "lastModifiedAt",
  isDeleted: "isDeleted",
};

async function getAllAssets() {
  const { docs } = await db.collection(CollectionNames.Assets).get();
  return docs;
}

async function getAllAuthors() {
  const { docs } = await db.collection(CollectionNames.Authors).get();
  return docs;
}

let authorDocs;

async function getAuthorDocByName(name) {
  if (!authorDocs) {
    authorDocs = await getAllAuthors();
  }

  return authorDocs.find((doc) => {
    console.log(doc.data().name, name);
    return doc.data().name === name;
  });
}

function getMyDocRef() {
  return db
    .collection(CollectionNames.Users)
    .doc("04D3yeAUxTMWo8MxscQImHJwtLV2");
}

async function main() {
  console.log("Starting up");

  if (isDryRun) {
    console.log("Is dry run. Pass --go to do it for realz");
  }

  console.log("Fetching assets...");

  const assets = await getAllAssets();

  console.log(`Found ${assets.length} assets`);

  let numSkipped = 0,
    numProcessed = 0,
    foundAuthorNames = [];
  const assetsByAuthorName = {};

  let batch = db.batch();
  const myDocRef = getMyDocRef();

  for (const doc of assets) {
    const asset = doc.data();

    if (asset.author || !asset.authorName) {
      numSkipped++;
      continue;
    }

    if (!foundAuthorNames.includes(asset.authorName)) {
      foundAuthorNames.push(asset.authorName);

      const authorDoc = db.collection(CollectionNames.Authors).doc();

      batch.set(authorDoc, {
        name: asset.authorName,
        createdAt: new Date(),
        createdBy: myDocRef,
      });
    }

    if (!assetsByAuthorName[asset.authorName]) {
      assetsByAuthorName[asset.authorName] = [];
    }

    assetsByAuthorName[asset.authorName].push(doc);

    numProcessed++;
  }

  console.log(`Author names: ${foundAuthorNames}`);

  console.log(`Inserting ${numProcessed} authors... (skipped ${numSkipped})`);

  if (isDryRun) {
    console.log("Is dry run - not committing...");
  } else {
    await batch.commit();
    console.log("Done!");
  }

  numSkipped = 0;
  numProcessed = 0;
  foundAuthorNames = [];
  batch = db.batch();

  for (const authorName in assetsByAuthorName) {
    const assets = assetsByAuthorName[authorName];
    const authorDoc = await getAuthorDocByName(authorName);

    if (!authorDoc) {
      console.log("Author no exist, skip");
      continue;
    }

    const authorRef = db.collection(CollectionNames.Authors).doc(authorDoc.id);

    for (const assetDoc of assets) {
      const assetRef = db.collection(CollectionNames.Assets).doc(assetDoc.id);

      batch.update(assetRef, {
        author: authorRef,
        lastModifiedAt: new Date(),
        lastModifiedBy: getMyDocRef(),
      });
    }

    numProcessed++;
  }

  console.log(
    `Updating ${numProcessed} assets with new author... (skipped ${numSkipped})`
  );

  if (isDryRun) {
    console.log("Is dry run - not committing...");
  } else {
    await batch.commit();
    console.log("Done!");
  }
}

main();
