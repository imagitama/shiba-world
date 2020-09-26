import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseEdit from '../../hooks/useDatabaseEdit'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'

import editableFields from '../../editable-fields'
import { fieldTypes } from '../../generic-forms'
import { trackAction } from '../../analytics'
import { scrollToTop, createRef } from '../../utils'
import { handleError } from '../../error-handling'

import Button from '../button'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'

import Field from './components/field'
import CheckboxInput from './components/checkbox-input'
import TextInput from './components/text-input'
import TextMarkdownInput from './components/text-markdown-input'
import MultichoiceInput from './components/multichoice-input'
import ImageUploadInput from './components/image-upload-input'

function getInputForFieldType(type) {
  switch (type) {
    case fieldTypes.text:
      return TextInput
    case fieldTypes.textMarkdown:
      return TextMarkdownInput
    case fieldTypes.checkbox:
      return CheckboxInput
    case fieldTypes.multichoice:
      return MultichoiceInput
    case fieldTypes.imageUpload:
      return ImageUploadInput
    default:
      throw new Error(`Invalid field type "${type}"`)
  }
}

const useStyles = makeStyles({
  saveBtn: {
    textAlign: 'center',
    marginTop: '1rem'
  },
  hint: {
    fontSize: '75%',
    fontStyle: 'italic',
    marginTop: '5px'
  }
})

export default ({
  collectionName,
  id = null,
  analyticsCategory = '',
  saveBtnAction = '',
  viewBtnAction = '',
  cancelBtnAction = '',
  successUrl = '',
  cancelUrl = '',
  extraFormData = {},
  getSuccessUrl = () => null
}) => {
  if (!(collectionName in editableFields)) {
    throw new Error(`Collection name ${collectionName} not in editable fields!`)
  }

  const fields = editableFields[collectionName]

  const userId = useFirebaseUserId()
  const [isLoading, isErrored, result] = useDatabaseEdit(collectionName, id)
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    collectionName,
    id
  )
  const [formFields, setFormFields] = useState(
    id
      ? null
      : fields.reduce((newFormFields, fieldConfig) => {
          return {
            ...newFormFields,
            [fieldConfig.name]: fieldConfig.default
          }
        }, {})
  )
  const classes = useStyles()
  const [createdDocId, setCreatedDocId] = useState(null)

  useEffect(() => {
    if (!result) {
      return
    }

    setFormFields(
      fields.reduce((newFormFields, fieldConfig) => {
        return {
          ...newFormFields,
          [fieldConfig.name]: result[fieldConfig.name] || fieldConfig.default
        }
      }, {})
    )
  }, [result === null])

  const onFieldChange = (name, newVal) =>
    setFormFields({
      ...formFields,
      [name]: newVal
    })

  const onFieldsChange = updates =>
    setFormFields({
      ...formFields,
      ...updates
    })

  const onSaveBtnClick = async () => {
    try {
      trackAction(analyticsCategory, saveBtnAction, id)

      scrollToTop()

      const [newId] = await save({
        ...formFields,
        ...(id
          ? {
              lastModifiedBy: createRef(CollectionNames.Users, userId),
              lastModifiedAt: new Date()
            }
          : {
              createdBy: createRef(CollectionNames.Users, userId),
              createdAt: new Date()
            })
      })

      setCreatedDocId(newId)
    } catch (err) {
      console.error(`Failed to save ${id} to ${collectionName}`, err)
      handleError(err)
    }
  }

  if (isLoading || !formFields || isSaving) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load item to edit</ErrorMessage>
  }

  if (isFailed) {
    return <ErrorMessage>Failed to save</ErrorMessage>
  }

  if (isSuccess) {
    return (
      <SuccessMessage>
        The record has been saved
        <br />
        <br />
        <Button
          url={id ? successUrl : getSuccessUrl(createdDocId)}
          onClick={() => trackAction(analyticsCategory, viewBtnAction, id)}>
          View
        </Button>
      </SuccessMessage>
    )
  }

  return (
    <>
      {fields.map(
        ({ name, type, default: defaultValue, label, hint, ...rest }) => {
          const Input = getInputForFieldType(type)

          return (
            <Field key={name} label={label}>
              <Input
                name={name}
                value={formFields[name] || defaultValue}
                {...rest}
                onChange={newVal => onFieldChange(name, newVal)}
                extraFormData={extraFormData}
                setFieldsValues={onFieldsChange}
              />
              {hint && <div className={classes.hint}>{hint}</div>}
            </Field>
          )
        }
      )}
      <div className={classes.saveBtn}>
        <Button
          url={cancelUrl}
          color="default"
          onClick={() => trackAction(analyticsCategory, cancelBtnAction, id)}>
          Cancel
        </Button>{' '}
        <Button onClick={onSaveBtnClick}>{id ? 'Save' : 'Create'}</Button>
      </div>
    </>
  )
}
