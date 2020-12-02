var serviceAccount = require("./credentials.json");

var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://shiba-world.firebaseio.com",
});

// Since you mentioned your images are in a folder,
// we'll create a Reference to that folder:
var storageRef = admin
  .storage()
  .bucket("shiba-world.appspot.com")
  .getFiles()
  .then(([files]) => {
    const mappedFiles = files.map((file) => ({
      name: file.metadata.name,
      size: file.metadata.size,
      sizeMb: parseInt(file.metadata.size / 1000 / 1000),
    }));

    const sortedFiles = mappedFiles.sort(
      (fileA, fileB) => fileB.size - fileA.size
    );

    const topTen = sortedFiles.slice(0, 20);

    console.log(`${topTen.length} results:`);
    console.log(topTen.map(mapResult));
  })
  .catch(console.error);

const mapResult = (result) => `${result.name} - ${result.sizeMb} mb`;

// // Now we get the references of these images
// storageRef
//   .listAll()
//   .then(function (result) {
//     result.items.forEach(console.log);
//   })
//   .catch(function (error) {
//     // Handle any errors
//     console.error(error);
//   });
