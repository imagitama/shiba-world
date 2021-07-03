import React, { useState, useEffect, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import TextInput from '../text-input'
import Button from '../button'

import {
  CollectionNames,
  AssetFieldNames,
  AuthorFieldNames
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useAlgoliaSearch from '../../hooks/useAlgoliaSearch'
import { searchIndexNames } from '../../modules/app'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { createRef } from '../../utils'
import { formHideDelay } from '../../config'

const useStyles = makeStyles({
  textInput: {
    width: '100%'
  },
  row: {
    marginTop: '1rem'
  }
})

function SearchForm({ searchTerm, onSelectIdAndName }) {
  const [isSearching, isErrored, results] = useAlgoliaSearch(
    searchIndexNames.AUTHORS,
    searchTerm
  )

  if (isSearching) {
    return 'Searching...'
  }

  if (isErrored) {
    return 'Errored'
  }

  if (!results) {
    return null
  }

  if (!results.length) {
    return 'No results!'
  }

  return (
    <>
      {results.map(result => (
        <Button
          key={result.id}
          onClick={() => onSelectIdAndName(result.id, result.name)}
          variant="default">
          {result.name}
        </Button>
      ))}
    </>
  )
}

function CreateForm({ onDoneWithIdAndName, actionCategory }) {
  const [authorName, setAuthorName] = useState('')
  const [isSaving, isSuccess, isErrored, save] = useDatabaseSave(
    CollectionNames.Authors
  )
  const timeoutRef = useRef()
  const createdDocumentId = useRef()
  const userId = useFirebaseUserId()

  useEffect(() => {
    if (isSuccess) {
      timeoutRef.current = setTimeout(() => {
        onDoneWithIdAndName(createdDocumentId.current, authorName)
      }, formHideDelay)
    }

    return () => clearTimeout(timeoutRef.current)
  }, [isSuccess])

  if (isSaving) {
    return 'Creating author...'
  }

  if (isErrored) {
    return 'Failed to create author'
  }

  if (isSuccess) {
    return 'Author created. Selecting it in 2 seconds...'
  }

  const onCreateBtnClick = async () => {
    try {
      trackAction(actionCategory, 'Click create new author button', authorName)

      if (!authorName) {
        return
      }

      const [documentId] = await save({
        [AuthorFieldNames.name]: authorName,
        [AuthorFieldNames.isDeleted]: false,
        createdAt: new Date(),
        createdBy: createRef(CollectionNames.Users, userId)
      })

      // store for later
      createdDocumentId.current = documentId
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <>
      Enter their name:
      <TextInput
        onChange={e => setAuthorName(e.target.value)}
        value={authorName}
      />
      <Button onClick={onCreateBtnClick}>Create</Button>
      <br />
      (Note: After creating an author please contact staff via Discord to make
      changes)
    </>
  )
}

export default ({
  collectionName,
  id,
  existingAuthorId,
  existingAuthorName,
  actionCategory
}) => {
  const userId = useFirebaseUserId()
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    collectionName,
    id
  )
  const [searchTerm, setSearchTerm] = useState(null)
  const [selectedAuthorId, setSelectedAuthorId] = useState(
    existingAuthorId || null
  )
  const [selectedAuthorName, setSelectedAuthorName] = useState(
    existingAuthorName || null
  )
  const [isCreatingAuthor, setIsCreatingAuthor] = useState(false)
  const classes = useStyles()

  if (!userId) {
    return 'You are not logged in'
  }

  if (isSaving) {
    return 'Saving...'
  }

  if (isSuccess) {
    return 'Author has been changed'
  }

  if (isFailed) {
    return 'Error saving new author'
  }

  const onSaveBtnClick = async (shouldDelete = false) => {
    try {
      trackAction(actionCategory, 'Click save new author button', id)

      let newValue =
        shouldDelete === true
          ? null
          : selectedAuthorId
          ? createRef(CollectionNames.Authors, selectedAuthorId)
          : null

      await save({
        [AssetFieldNames.author]: newValue,
        lastModifiedAt: new Date(),
        lastModifiedBy: createRef(CollectionNames.Users, userId)
      })
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const onCancelBtnClick = () => {
    setSelectedAuthorId(null)
    setSelectedAuthorName(null)
    setSearchTerm(null)
  }

  const onSelectIdAndName = (id, name) => {
    setSelectedAuthorId(id)
    setSelectedAuthorName(name)
  }

  const onClickCreateBtn = () => {
    setIsCreatingAuthor(true)
  }

  const onClickClearBtn = () => {
    onSaveBtnClick(true)
  }

  return (
    <>
      {isCreatingAuthor ? (
        <CreateForm
          actionCategory={actionCategory}
          onDoneWithIdAndName={(id, name) => {
            onSelectIdAndName(id, name)
            setIsCreatingAuthor(false)
          }}
        />
      ) : selectedAuthorId ? (
        <>
          You have selected: {selectedAuthorName}
          <br />
          <Button onClick={onSaveBtnClick}>Save</Button>{' '}
          <Button onClick={onCancelBtnClick} color="default">
            Cancel
          </Button>
          <br />
          <br />
          {selectedAuthorId && (
            <Button onClick={onClickClearBtn} color="default">
              Remove Author From This Asset
            </Button>
          )}
        </>
      ) : (
        <>
          <div className={classes.row}>
            {searchTerm && (
              <>
                <SearchForm
                  searchTerm={searchTerm}
                  onSelectIdAndName={onSelectIdAndName}
                />
              </>
            )}
          </div>

          <div className={classes.row}>
            Search
            <TextInput
              onChange={e => setSearchTerm(e.target.value)}
              value={searchTerm}
              variant="filled"
              className={classes.textInput}
            />
            <div className={classes.row} />
            Can't find the author?{' '}
            <Button onClick={onClickCreateBtn}>Create Author</Button>
          </div>
        </>
      )}
    </>
  )
}
