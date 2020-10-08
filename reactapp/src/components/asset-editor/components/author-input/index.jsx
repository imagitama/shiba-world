import React, { Fragment, useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  CollectionNames,
  AuthorFieldNames,
  OrderDirections
} from '../../../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../../../hooks/useFirebaseUserId'
import Button from '../../../button'
import Paper from '../../../paper'
import Heading from '../../../heading'
import { createRef, isRef, mapRefToDoc } from '../../../../utils'
import { handleError } from '../../../../error-handling'

const useStyles = makeStyles({
  heading: {
    margin: 0
  }
})

function AuthorList({ onSelect }) {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Authors,
    undefined,
    undefined,
    [AuthorFieldNames.name, OrderDirections.ASC]
  )

  if (isLoading) {
    return 'Loading...'
  }

  if (isErrored) {
    return 'Error!'
  }

  if (!results.length) {
    return 'No authors found'
  }

  return (
    <>
      {results.map(result => (
        <Fragment key={result.id}>
          <Button onClick={() => onSelect(result)} color="default">
            {result[AuthorFieldNames.name]}
          </Button>{' '}
        </Fragment>
      ))}
    </>
  )
}

function AddAuthorForm() {
  const [isSaving, isSuccess, isErrored, save] = useDatabaseSave(
    CollectionNames.Authors
  )
  const [formFields, setFormFields] = useState({
    [AuthorFieldNames.name]: ''
  })
  const userId = useFirebaseUserId()

  const onFormFieldChanged = (fieldName, fieldValue) => {
    setFormFields(currentFields => ({
      ...currentFields,
      [fieldName]: fieldValue
    }))
  }

  const onSaveBtnClick = async () => {
    try {
      if (!formFields[AuthorFieldNames.name]) {
        return
      }

      await save({
        ...formFields,
        [AuthorFieldNames.createdAt]: new Date(),
        [AuthorFieldNames.createdBy]: createRef(CollectionNames.Users, userId)
      })
    } catch (err) {
      handleError(err)
    }
  }

  if (isSaving) {
    return 'Saving...'
  }

  if (isErrored) {
    return 'Failed to save. Please try again later'
  }

  if (isSuccess) {
    return 'Success! It should now be in the list to choose from'
  }

  return (
    <>
      Enter their name:
      <TextField
        onChange={e =>
          onFormFieldChanged(AuthorFieldNames.name, e.target.value)
        }
      />
      <Button onClick={onSaveBtnClick}>Save</Button>
    </>
  )
}

export default ({ onNewAuthorId, deleteAuthor, author = null }) => {
  const [isAuthorListExpanded, setIsAuthorListExpanded] = useState(false)
  const [isAddAuthorFormVisible, setIsAddAuthorFormVisible] = useState(false)
  const [selectedAuthor, setSelectedAuthor] = useState(null)
  const classes = useStyles()

  useEffect(() => {
    async function main() {
      if (!author) {
        setSelectedAuthor(null)
        return
      }

      try {
        let firebaseDocRef

        if (isRef(author)) {
          firebaseDocRef = mapRefToDoc(author)
        } else {
          firebaseDocRef = author
        }

        const doc = await firebaseDocRef.get()

        setSelectedAuthor(doc.data())
      } catch (err) {
        handleError(err)
      }
    }

    main()
  }, [author === null])

  return (
    <Paper>
      <Heading variant="h3" className={classes.heading}>
        Author
      </Heading>
      <p>
        Select an author from the list below. Create a new one if you cannot
        find the author. This feature is new and will be improved over time.
      </p>
      {selectedAuthor ? (
        <>
          Selected author "${selectedAuthor.name}"{' '}
          <Button onClick={() => deleteAuthor()}>Remove Author</Button>
        </>
      ) : (
        'No author selected'
      )}
      <br />
      <br />
      {isAuthorListExpanded ? (
        <AuthorList
          onSelect={doc => {
            // useDatabaseQuery spits out nicely formatted data
            // pass the ID up to the main editor so it can do a createRef() for us
            // TODO: Do not use useDatabaseQuery() or modify hook to allow not mapping refs?
            onNewAuthorId(doc.id)
            setSelectedAuthor(doc)
            setIsAuthorListExpanded(false)
          }}
        />
      ) : (
        <Button onClick={() => setIsAuthorListExpanded(true)}>
          Load authors
        </Button>
      )}
      <br />
      <br />
      {isAddAuthorFormVisible ? (
        <AddAuthorForm />
      ) : (
        <Button onClick={() => setIsAddAuthorFormVisible(true)} color="default">
          Create New Author
        </Button>
      )}
    </Paper>
  )
}
