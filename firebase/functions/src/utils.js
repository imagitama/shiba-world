const diff = require('deep-diff')

module.exports.getDifferenceInObjects = (objectA, objectB) => {
  const result = diff(objectA, objectB)

  if (!result) {
    return undefined
  }

  // Firestore does not support custom prototypes so just map into a basic thing
  return result.map(recursiveMap)
}

module.exports.secondsToDate = (seconds) => {
  return new Date(seconds * 1000)
}

function recursiveMap({ kind, path, lhs, rhs, item, index }) {
  const newItem = {
    kind,
    path,
    lhs,
    rhs,
    index,
  }

  // Firestore does not let us store as undefined so check for it
  if (item) {
    newItem.item = recursiveMap(item)
  }

  return newItem
}
