import React, { useState, useEffect } from 'react'
import Markdown from 'react-markdown'
import { makeStyles } from '@material-ui/core/styles'

import {
  TutorialStepFieldNames,
  CollectionNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

import Button from '../button'
import TextInput from '../text-input'
import Paper from '../paper'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import FallbackImageUploader from '../fallback-image-uploader'

const useStyles = makeStyles({
  step: {
    marginBottom: '1rem',
    '&:last-child': {
      margin: 0
    }
  },
  controls: {
    textAlign: 'right'
  },
  label: {
    fontWeight: 'bold',
    marginTop: '0.5rem'
  }
})

function Label({ children }) {
  const classes = useStyles()
  return <div className={classes.label}>{children}</div>
}

const doesStepNeedSaving = (existingStepData, newStepData) => {
  if (
    existingStepData[TutorialStepFieldNames.title] !==
    newStepData[TutorialStepFieldNames.title]
  ) {
    return true
  }
  if (
    existingStepData[TutorialStepFieldNames.description] !==
    newStepData[TutorialStepFieldNames.description]
  ) {
    return true
  }
  if (
    existingStepData[TutorialStepFieldNames.imageUrls] &&
    newStepData[TutorialStepFieldNames.imageUrls]
  ) {
    if (
      existingStepData[TutorialStepFieldNames.imageUrls].fallbackUrl !==
      newStepData[TutorialStepFieldNames.imageUrls].fallbackUrl
    ) {
      return true
    }
  }
  if (
    existingStepData[TutorialStepFieldNames.imageUrls] &&
    !newStepData[TutorialStepFieldNames.imageUrls]
  ) {
    return true
  }
  if (
    !existingStepData[TutorialStepFieldNames.imageUrls] &&
    newStepData[TutorialStepFieldNames.imageUrls]
  ) {
    return true
  }
  return false
}

function StepEditor({
  assetId,
  number,
  isFirst,
  isLast,
  step,
  onSave,
  onMoveUp,
  onMoveDown,
  onDelete
}) {
  const [stepFields, setStepFields] = useState(step)
  const classes = useStyles()

  const updateStepField = (fieldName, newValue) =>
    setStepFields({ ...stepFields, [fieldName]: newValue })

  const showSaveBtn = doesStepNeedSaving(step, stepFields)

  console.log(step, stepFields)

  return (
    <Paper className={classes.step}>
      <div>
        <strong>
          {number}. {step[TutorialStepFieldNames.title]}
        </strong>
        <br />
        <Markdown source={step[TutorialStepFieldNames.description]} />
        <br />
        {step[TutorialStepFieldNames.imageUrls] &&
        step[TutorialStepFieldNames.imageUrls].url ? (
          <>
            Attached image:{' '}
            <picture>
              <source
                srcSet={step[TutorialStepFieldNames.imageUrls].url}
                type="image/webp"
              />
              <source
                srcSet={step[TutorialStepFieldNames.imageUrls].fallbackUrl}
                type="image/png"
              />
              <img
                src={step[TutorialStepFieldNames.imageUrls].fallbackUrl}
                alt={`Attachment for step`}
              />
            </picture>
          </>
        ) : step[TutorialStepFieldNames.imageUrls] &&
          step[TutorialStepFieldNames.imageUrls].fallbackUrl ? (
          <>
            Attached image:{' '}
            <img
              src={step[TutorialStepFieldNames.imageUrls].fallbackUrl}
              alt={`Attachment for step`}
            />
          </>
        ) : null}
      </div>
      <div>
        {/* <Label>Number (eg. 1)</Label>
        <TextInput
          value={stepFields[TutorialStepFieldNames.number]}
          onChange={e =>
            updateStepField(
              TutorialStepFieldNames.number,
              parseInt(e.target.value)
            )
          }
        /> */}
        <Label>Step Title</Label>
        <TextInput
          value={stepFields[TutorialStepFieldNames.title]}
          onChange={e =>
            updateStepField(TutorialStepFieldNames.title, e.target.value)
          }
          style={{ width: '100%' }}
        />
        <Label>Instructions</Label>
        <TextInput
          value={stepFields[TutorialStepFieldNames.description]}
          onChange={e =>
            updateStepField(TutorialStepFieldNames.description, e.target.value)
          }
          rows={10}
          multiline
          style={{ width: '100%' }}
        />
        <Label>Attached Image</Label>
        <FallbackImageUploader
          directoryPath={`tutorial-step-attachments/${assetId}`}
          onUploadedUrls={result => {
            updateStepField(TutorialStepFieldNames.imageUrls, result)
          }}
        />

        <div className={classes.controls}>
          {showSaveBtn && (
            <Button onClick={() => onSave(stepFields)}>Save</Button>
          )}
          {isFirst ? null : (
            <Button onClick={() => onMoveUp()} color="default">
              Move Up
            </Button>
          )}
          {isLast ? null : (
            <Button onClick={() => onMoveDown()} color="default">
              Move Down
            </Button>
          )}
          <Button onClick={() => onDelete()} color="default">
            Delete
          </Button>
        </div>
      </div>
    </Paper>
  )
}

function getStepsAsString(steps) {
  return steps.map(step => step[TutorialStepFieldNames.uniqueName]).join('+')
}

function moveItemInArray(from, to, array) {
  const newArray = [].concat(array)
  newArray.splice(to, 0, newArray.splice(from, 1)[0])
  return newArray
}

export default ({ assetId, existingSteps, onSave }) => {
  const [stepsBeingEdited, setStepsBeingEdited] = useState([])
  const classes = useStyles()
  const [isSaving, , isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const userId = useFirebaseUserId()

  useEffect(() => {
    setStepsBeingEdited(existingSteps)
  }, [getStepsAsString(existingSteps)])

  const saveSteps = async () => {
    try {
      await save({
        [AssetFieldNames.tutorialSteps]: stepsBeingEdited,
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetFieldNames.lastModifiedAt]: new Date()
      })

      onSave()
    } catch (err) {
      console.error('Failed to save tutorial steps', err)
      handleError(err)
    }
  }

  if (isSaving) {
    return <LoadingIndicator />
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save your changes</ErrorMessage>
  }

  const addStep = () => {
    setStepsBeingEdited(steps =>
      steps.concat([
        {
          [TutorialStepFieldNames.title]: '',
          [TutorialStepFieldNames.description]: ''
        }
      ])
    )
  }

  const moveStepUp = stepIdx => {
    setStepsBeingEdited(moveItemInArray(stepIdx, stepIdx - 1, stepsBeingEdited))
  }

  const moveStepDown = stepIdx => {
    setStepsBeingEdited(moveItemInArray(stepIdx, stepIdx + 1, stepsBeingEdited))
  }

  const deleteStep = stepIdx => {
    setStepsBeingEdited(stepsBeingEdited.splice(stepIdx, 1))
  }

  const saveStep = (stepIdx, newStepFields) => {
    const step = stepsBeingEdited[stepIdx]
    const newStep = {
      ...step,
      ...newStepFields
    }

    // fix undefined error if no image attached
    if (newStepFields[TutorialStepFieldNames.imageUrls]) {
      newStep[TutorialStepFieldNames.imageUrls] =
        newStepFields[TutorialStepFieldNames.imageUrls]
    }

    const newStepsBeingEdited = [...stepsBeingEdited]
    newStepsBeingEdited[stepIdx] = newStep

    setStepsBeingEdited(newStepsBeingEdited)
  }

  return (
    <div className={classes.root}>
      <div>
        {stepsBeingEdited.map((step, idx) => (
          <StepEditor
            key={step[TutorialStepFieldNames.number]}
            assetId={assetId}
            step={step}
            number={idx + 1}
            onSave={newStepFields => saveStep(idx, newStepFields)}
            onMoveUp={() => moveStepUp(idx)}
            onMoveDown={() => moveStepDown(idx)}
            onDelete={() => deleteStep(idx)}
            isFirst={idx === 0}
            isLast={idx === stepsBeingEdited.length - 1}
          />
        ))}
      </div>
      <Paper>
        <div className={classes.controls}>
          <Button onClick={() => addStep()} color="default">
            Add Step
          </Button>
          &nbsp;
          <Button onClick={() => saveSteps()}>Save</Button>
        </div>
      </Paper>
    </div>
  )
}
