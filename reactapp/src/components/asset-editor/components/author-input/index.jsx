import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'
import useDatabaseQuery, {
  CollectionNames,
  AuthorFieldNames
} from '../../../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../../../hooks/useFirebaseUserId'
import Button from '../../../button'
import Paper from '../../../paper'
import { createRef } from '../../../../utils'
import { handleError } from '../../../../error-handling'

function AuthorList({ onSelect }) {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Authors
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
    <ul>
      {results.map(result => (
        <li
          key={result.id}
          onClick={() => onSelect(result)}
          style={{ cursor: 'pointer' }}>
          {result[AuthorFieldNames.name]}
        </li>
      ))}
    </ul>
  )
}

function AuthorResult({ author }) {
  return (
    <>
      <strong>{author[AuthorFieldNames.name]}</strong>
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

export default ({ onNewAuthorId, author = null }) => {
  const [isAuthorListExpanded, setIsAuthorListExpanded] = useState(false)
  const [isAddAuthorFormVisible, setIsAddAuthorFormVisible] = useState(false)
  const [selectedAuthor, setSelectedAuthor] = useState(null)

  return (
    <Paper>
      <strong>Author</strong>
      <br />
      <br />
      {author || selectedAuthor ? (
        <AuthorResult author={selectedAuthor || author} />
      ) : (
        'No author selected'
      )}
      <br />
      <br />
      {isAuthorListExpanded ? (
        <AuthorList
          onSelect={doc => {
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
        <Button onClick={() => setIsAddAuthorFormVisible(true)}>
          Create Author
        </Button>
      )}
    </Paper>
  )
}
