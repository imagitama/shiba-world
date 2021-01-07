import React, { useState, useEffect, useRef } from 'react'
import CopyrightIcon from '@material-ui/icons/Copyright'

import TextInput from '../text-input'
import Button from '../button'
import Paper from '../paper'

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
      }, 2000)
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

export default ({ collectionName, id, actionCategory }) => {
  const userId = useFirebaseUserId()
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    collectionName,
    id
  )
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState(null)
  const [selectedAuthorId, setSelectedAuthorId] = useState(null)
  const [selectedAuthorName, setSelectedAuthorName] = useState(null)
  const [isCreatingAuthor, setIsCreatingAuthor] = useState(false)

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

  const onSaveBtnClick = async () => {
    try {
      trackAction(actionCategory, 'Click save new author button', id)

      const newValue = selectedAuthorId
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

  if (!isEditorOpen) {
    return (
      <Button
        onClick={() => setIsEditorOpen(true)}
        color="default"
        icon={<CopyrightIcon />}>
        Change Author
      </Button>
    )
  }

  const onSelectIdAndName = (id, name) => {
    setSelectedAuthorId(id)
    setSelectedAuthorName(name)
  }

  const onClickCreateBtn = () => {
    setIsCreatingAuthor(true)
  }

  return (
    <Paper>
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
        </>
      ) : (
        <>
          {searchTerm && (
            <>
              <SearchForm
                searchTerm={searchTerm}
                onSelectIdAndName={onSelectIdAndName}
              />
              <hr />
            </>
          )}
          Search for an author name:
          <TextInput
            onChange={e => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
          <hr />
          Can't find the author? Create a new one by clicking here:{' '}
          <Button onClick={onClickCreateBtn}>Create</Button>
        </>
      )}
    </Paper>
  )
}
