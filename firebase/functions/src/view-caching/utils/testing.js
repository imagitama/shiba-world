module.exports.basicTest = (itemA, itemB) => {
  for (const [fieldName, value] of Object.entries(itemA)) {
    if (value === null && itemB[value] !== null) {
      return false
    }
    if (value !== null && itemB[value] === null) {
      return false
    }
    if (typeof value === 'string' || typeof value === 'boolean') {
      if (value !== itemB[fieldName]) {
        return false
      }
    }
  }
  return true
}
