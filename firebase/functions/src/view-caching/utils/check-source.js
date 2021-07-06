const {
  doesDocMatchWhereCondition,
  getIsDocToBeAdded,
  getIsDocToBeRemoved,
  getDoesDocNeedToBeUpdated,
} = require('./')
const {
  addDocToViewCache,
  updateDocInViewCache,
  removeDocFromViewCache,
} = require('./docs')

const checkSource = async (
  collectionNameOfDoc,
  viewName,
  source,
  before = null,
  after,
  viewCacheDefinitions
) => {
  // console.log('CHECK', source)
  if (source.debug)
    console.debug(
      'checkSource',
      `view:${viewName}`,
      `collection:${source.collectionName}`
    )

  if (source.add) {
    if (source.debug) console.debug('"add" found')
    for (const addSource of Object.values(source.add)) {
      const sourceToCheck =
        typeof addSource === 'function'
          ? addSource({ ref: after.ref, doc: after })
          : addSource
      await checkSource(
        collectionNameOfDoc,
        viewName,
        { ...sourceToCheck, debug: source.debug },
        before,
        after,
        viewCacheDefinitions
      )
    }
  }

  if (source.merge) {
    if (source.debug) console.debug('"merge" found')
    const sourceToCheck =
      typeof source.merge === 'function'
        ? source.merge({ ref: after.ref, doc: after })
        : source.merge
    await checkSource(
      collectionNameOfDoc,
      viewName,
      { ...sourceToCheck, debug: source.debug },
      before,
      after,
      viewCacheDefinitions
    )
  }

  if (source.join) {
    if (source.debug) console.debug('"join" found')
    await checkSource(
      collectionNameOfDoc,
      viewName,
      { ...source.join, debug: source.debug },
      before,
      after,
      viewCacheDefinitions
    )
  }

  if (source.collectionName !== collectionNameOfDoc) {
    return
  }

  if (
    !before &&
    !doesDocMatchWhereCondition(after, source.where, source.debug)
  ) {
    if (source.debug)
      console.debug(
        'doc has just been created but does not match where query, ignoring...'
      )
    return
  }

  // handle edits to a document that was and still is invalid
  if (
    !doesDocMatchWhereCondition(before, source.where, source.debug) &&
    !doesDocMatchWhereCondition(after, source.where, source.debug)
  ) {
    if (source.debug) console.debug(`item is still invalid, ignoring...`)
    return
  }

  // handle edits to a document that should be added/edited/removed from the cache
  if (getIsDocToBeRemoved(before, after, source.where)) {
    if (source.debug) console.debug(`item is to be removed`)
    await removeDocFromViewCache(after, viewName, viewCacheDefinitions)
  } else if (getIsDocToBeAdded(before, after, source.where)) {
    if (source.debug) console.debug(`item is to be added`)
    await addDocToViewCache(after, viewName, viewCacheDefinitions)
  } else if (getDoesDocNeedToBeUpdated(before, after, source.test)) {
    if (source.debug) console.debug(`item is to be updated`)
    await updateDocInViewCache(after, viewName, viewCacheDefinitions)
  } else {
    if (source.debug)
      console.debug('item is not removed or added or updated! odd!')
  }
}
module.exports.checkSource = checkSource
