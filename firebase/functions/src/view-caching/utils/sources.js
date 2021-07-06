const { db, Operators } = require('../../firebase')

// module.exports.getChildSourceDefinition = (sourceOrFunc, props = {}) => {
//   // if a regular source definition
//   if (typeof sourceOrFunc === 'object' && sourceOrFunc.collectionName) {
//     return sourceOrFunc
//   }

//   // if a "getter" of a source definition (need to pass props)
//   if (typeof sourceOrFunc === 'function') {
//     return sourceOrFunc(props)
//   }

//   // if a "map" where key is a field name (used for "merge")
//   if (typeof sourceOrFunc === 'object') {
//     // TODO
//     return false
//   }

//   return false
// }

const getSourceItems = async (source, pages = {}, id = null) => {
  const {
    debug = false,
    collectionName,
    where = [],
    order = undefined,
    filter,
    map,
    limit,
    join,
    add,
  } = source

  if (debug) console.debug(`get source items`, source)

  let query = db.collection(collectionName)

  if (id) {
    query = query.doc(id)
  }

  for (let [fieldName, operator, value] of where) {
    // if provided a reference to another document
    if (operator === Operators.EQUALS && Array.isArray(value)) {
      if (debug) console.debug('where ref', value[0], value[1])
      value = db.collection(value[0]).doc(value[1])
    }

    query = query.where(fieldName, operator, value)
  }

  if (order) {
    query = query.orderBy(order[0], order[1])
  }

  if (limit) {
    query = query.limit(limit)
  }

  const result = await query.get()

  const docs = id ? [result] : result.docs

  let mappedItems = docs.map((doc) => ({
    id: doc.id,
    ref: doc.ref,
    ...doc.data(),
  }))

  if (filter) {
    mappedItems = mappedItems.filter((mappedItem, i) =>
      filter(mappedItem, i, { pages })
    )
  }

  if (map) {
    for (let i = 0; i < mappedItems.length; i++) {
      const item = mappedItems[i]
      mappedItems[i] = {
        id: item.id,
        ref: item.ref,
        ...map(item, i, {
          pages,
          addUnmappedItem: (newItem) => {
            mappedItems.push(newItem)
          },
        }),
      }
    }
  }

  if (join) {
    // const getJoinedItemById = (id) =>
    //   joinedItems.find((item) => item.id === id) || {}

    mappedItems = await Promise.all(
      mappedItems.map(async (item) => {
        console.log('joining', collectionName, item)
        const joinedItem = await getSourceItems({ ...join, debug }, {}, item.id)
        return {
          ...item,
          ...joinedItem,
        }
      })
    )
  }

  if (add) {
    mappedItems = await Promise.all(
      mappedItems.map(async (item) => {
        const fieldsToAdd = {}

        for (const [fieldName, addedSource] of Object.entries(add)) {
          if (typeof addedSource === 'function') {
            fieldsToAdd[fieldName] = await getSourceItems({
              ...addedSource(item),
              debug,
            })
          } else {
            fieldsToAdd[fieldName] = await getSourceItems({
              ...addedSource,
              debug,
            })
          }
        }

        return {
          ...item,
          ...fieldsToAdd,
        }
      })
    )
  }

  if (debug) console.log('finished getting source items', mappedItems)

  if (id) {
    return mappedItems[0]
  }

  return mappedItems
}
module.exports.getSourceItems = getSourceItems
