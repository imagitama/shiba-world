const { db, CollectionNames } = require(
    './firebase'
)

module.exports.getUserFromFirestore = async (userId) => {
    const doc = await db.collection(CollectionNames.Users).doc(userId).get()
    return doc.data()
}