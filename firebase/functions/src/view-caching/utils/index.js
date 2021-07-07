const admin = require('firebase-admin')
const { db, Operators } = require('../../firebase')
const { basicTest } = require('./testing')

module.exports.summaryFieldNames = {
  pageCount: 'pageCount',
}
module.exports.pageFieldNames = {
  items: 'items',
}

const getIsDocToBeRemoved = (before = null, after, where) => {
  return !doesDocMatchWhereCondition(after, where)
}
module.exports.getIsDocToBeRemoved = getIsDocToBeRemoved

const getIsDocToBeAdded = (before = null, after, where) => {
  return (
    (before &&
      !doesDocMatchWhereCondition(before, where) &&
      doesDocMatchWhereCondition(after, where)) ||
    doesDocMatchWhereCondition(after, where)
  )
}
module.exports.getIsDocToBeAdded = getIsDocToBeAdded

const getDoesDocNeedToBeUpdated = (before = null, after, test) => {
  if (!before) {
    return false
  }

  if (!test) {
    return true
  }

  if (typeof test === 'string') {
    switch (test) {
      case 'basic':
        return basicTest(before.data(), after.data()) === false
      default:
        throw new Error(`Unknown test name "${test}"!`)
    }
  }

  // TODO: Check if a func before calling it?
  return test(before.data(), after.data())
}
module.exports.getDoesDocNeedToBeUpdated = getDoesDocNeedToBeUpdated

const doesDocMatchWhereCondition = (doc, where = [], isDebug = false) => {
  if (isDebug) console.debug('checking where conditions', where)

  for (let [field, operator, value] of where) {
    if (Array.isArray(value)) {
      value = db.collection(value[0]).doc(value[1])
    }

    if (isDebug) console.debug('check where condition', field)

    const currentValue = doc.get(field)

    switch (operator) {
      case Operators.EQUALS:
        if (currentValue instanceof admin.firestore.DocumentReference) {
          if (!currentValue.isEqual(value)) {
            console.debug(
              `field`,
              field,
              'fails the doc ref test!',
              currentValue.path,
              '!=',
              value ? value.path : '(none)'
            )
            return false
          }
        } else if (value instanceof admin.firestore.DocumentReference) {
          if (!value.isEqual(currentValue)) {
            console.debug(
              `field`,
              field,
              'fails the doc ref test!',
              currentValue ? currentValue.path : '(none)',
              '!=',
              value.path
            )
            return false
          }
        } else {
          if (currentValue !== value) {
            if (isDebug)
              console.debug(
                'field',
                field,
                'fails the test!',
                currentValue,
                '!=',
                value
              )
            return false
          }
        }
        break
      case Operators.NOT_EQUALS:
        if (currentValue === value) {
          if (isDebug)
            console.debug(
              'field',
              field,
              'fails the test!',
              currentValue,
              '==',
              value
            )
          return false
        }
        break
      case Operators.GREATER_THAN:
        if (currentValue <= value) {
          return false
        }
        break
      default:
        throw new Error(
          `Could not check where condition: operator ${operator} not supported at this time!`
        )
    }
  }
  return true
}
module.exports.doesDocMatchWhereCondition = doesDocMatchWhereCondition
