import React, { useState, Fragment } from 'react'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import { makeStyles } from '@material-ui/core/styles'
import shortid from 'shortid'
import Markdown from 'react-markdown'

import { AssetCategories, AssetFieldNames } from '../../hooks/useDatabaseQuery'
import { species as speciesTags } from '../../tags'

import FileUploader from '../file-uploader'
import ThumbnailUploader from '../thumbnail-uploader'
import Heading from '../heading'
import Button from '../button'

const useStyles = makeStyles({
  hint: { color: 'grey', marginTop: '0.5rem' },
  formFieldRoot: { padding: '2rem' },
  fileAttacherItem: { margin: '0 0 1rem 0', padding: '2rem' },
  fileAttacherUploader: { padding: '2rem' },
  advancedModeBtn: { margin: '0.5rem 0' },
  controls: { marginTop: '2rem', textAlign: 'center' }
})

const Hint = ({ children }) => {
  const classes = useStyles()
  return <div className={classes.hint}>{children}</div>
}

const formFieldType = {
  text: 'text',
  checkbox: 'checkbox',
  dropdown: 'dropdown'
}

const FormField = ({
  label,
  type = formFieldType.text,
  value,
  hint,
  convertToValidField,
  options,
  onChange,
  ...textFieldProps
}) => {
  const classes = useStyles()
  return (
    <Paper className={classes.formFieldRoot}>
      <FormControl fullWidth>
        {type === formFieldType.text ? (
          <TextField
            label={label}
            value={value || ''}
            onChange={event =>
              onChange(
                convertToValidField
                  ? convertToValidField(event.target.value)
                  : event.target.value
              )
            }
            {...textFieldProps}
          />
        ) : type === formFieldType.dropdown ? (
          <Select
            label={label}
            value={value}
            onChange={event =>
              onChange(
                convertToValidField
                  ? convertToValidField(event.target.value)
                  : event.target.value
              )
            }
            {...textFieldProps}>
            {options.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <FormControlLabel
            control={
              <Checkbox
                checked={value}
                onChange={event => onChange(event.target.checked)}
              />
            }
            label={label}
          />
        )}
        <Hint>
          {typeof hint === 'string'
            ? hint.split('\n').map((hint, idx) => (
                <Fragment key={hint}>
                  {idx !== 0 && <br />}
                  {hint}
                </Fragment>
              ))
            : hint}
        </Hint>
      </FormControl>
    </Paper>
  )
}

const FileAttacherItem = ({ url, onRemove }) => {
  const classes = useStyles()
  return (
    <Paper className={classes.fileAttacherItem}>
      {url}
      <br />
      <Button color="default" onClick={onRemove}>
        Remove
      </Button>
    </Paper>
  )
}

const FileAttacher = ({ fileUrls, onFileAttached, onFileRemoved }) => {
  const classes = useStyles()
  return (
    <>
      {fileUrls.map(fileUrl => (
        <FileAttacherItem
          key={fileUrl}
          url={fileUrl}
          onRemove={() => onFileRemoved(fileUrl)}
        />
      ))}
      <Paper className={classes.fileAttacherUploader}>
        <FileUploader
          directoryPath="asset-uploads"
          filePrefix={shortid.generate()}
          onDownloadUrl={url => onFileAttached(url)}
        />
      </Paper>
    </>
  )
}

const getIsFormValid = (formFields, doesHavePermission) => {
  if (!formFields.title) {
    return false
  }
  if (!formFields.description) {
    return false
  }
  if (!formFields.species.length) {
    return false
  }
  if (!formFields.category) {
    return false
  }
  if (!formFields.thumbnailUrl) {
    return false
  }
  if (!doesHavePermission) {
    return false
  }
  return true
}

export default ({
  assetId,
  asset: {
    title,
    description,
    species = [],
    category,
    tags = [],
    thumbnailUrl,
    fileUrls = [],
    isAdult = false,
    sourceUrl
  } = {},
  onSubmit
}) => {
  const [fieldData, setFieldData] = useState({
    title,
    description,
    species,
    category,
    tags,
    fileUrls,
    thumbnailUrl,
    isAdult
  })
  const [doesHavePermission, setDoesHavePermission] = useState(false)
  const [showAdvancedFileUrls, setShowAdvancedFileUrls] = useState(false)
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false)
  const [showThumbnailUrlInput, setShowThumbnailUrlInput] = useState(false)
  const classes = useStyles()

  const onFieldChange = (fieldName, newVal) => {
    setFieldData({
      ...fieldData,
      [fieldName]: newVal
    })
  }

  const onFormSubmitted = () => {
    if (!doesHavePermission) {
      return
    }
    onSubmit(fieldData)
  }

  const onThumbnailUploaded = url => onFieldChange('thumbnailUrl', url)

  const isFormValid = getIsFormValid(fieldData, doesHavePermission)

  return (
    <>
      <form>
        <Heading variant="h2">Category</Heading>
        <FormField
          label="Category"
          value={fieldData.category}
          type={formFieldType.dropdown}
          options={Object.values(AssetCategories)}
          hint={`What kind of asset are you uploading or posting? For "News" select "article".`}
          onChange={newVal => onFieldChange('category', newVal)}
        />

        <Heading variant="h2">Title</Heading>
        <FormField
          label="Title"
          value={fieldData.title}
          hint="The name of the accessory/animation. The title of your tutorial. The name of your character/avatar. The title of the news article."
          onChange={newVal => onFieldChange('title', newVal)}
        />
        <Heading variant="h2">Description</Heading>
        <FormField
          label="Description"
          value={fieldData.description}
          hint={
            <>
              A short paragraph that describes the accessory/animation. The
              steps of your tutorial. A bio of your avatar with links to your
              social media. The content of the news article.
              <br />
              <br />
              You can use markdown to <strong>format</strong> <em>your</em>{' '}
              content. It is the same as Discord. A guide is here:{' '}
              <a
                href="https://www.markdownguide.org/basic-syntax/"
                target="_blank"
                rel="noopener noreferrer">
                Markdown
              </a>
            </>
          }
          onChange={newVal => onFieldChange('description', newVal)}
          multiline
          rows={10}
        />
        {showMarkdownPreview === false && (
          <>
            <Button
              color="default"
              className={classes.advancedModeBtn}
              onClick={() => setShowMarkdownPreview(true)}>
              Show Markdown preview
            </Button>
          </>
        )}
        {showMarkdownPreview && (
          <div>
            <Markdown source={fieldData.description} />
          </div>
        )}

        <Heading variant="h2">Thumbnail</Heading>

        {showThumbnailUrlInput === false && (
          <ThumbnailUploader
            directoryPath="asset-thumbnails"
            filePrefix={shortid.generate()}
            onUploaded={onThumbnailUploaded}
          />
        )}

        {showThumbnailUrlInput === false && (
          <Button
            color="default"
            className={classes.advancedModeBtn}
            onClick={() => setShowThumbnailUrlInput(true)}>
            Enter thumbnail URL yourself
          </Button>
        )}
        {showThumbnailUrlInput && (
          <FormField
            label="Thumbnail"
            value={fieldData.thumbnailUrl}
            hint={`Use the file upload below (it gives you a URL you can paste in here).

Please crop your thumbnails to something like 300x300 (automatic cropping coming soon)`}
            onChange={newVal => onFieldChange('thumbnailUrl', newVal)}
          />
        )}

        <Heading variant="h2">Species</Heading>
        <FormField
          label="Species"
          type={formFieldType.dropdown}
          multiple
          options={Object.values(speciesTags)}
          value={fieldData.species}
          hint={`What species your asset is for. You can select multiple.`}
          onChange={newVal => onFieldChange('species', newVal)}
        />

        <Heading variant="h2">Tags</Heading>
        <FormField
          label="Tags"
          value={fieldData.tags.join('\n')}
          hint={'Help users find your assets using filters and searching.'}
          onChange={newVal => onFieldChange('tags', newVal)}
          convertToValidField={text => text.split('\n')}
          multiline
          rows={10}
        />

        <Heading variant="h2">Source</Heading>
        <FormField
          label="Source"
          value={fieldData.sourceUrl}
          hint={
            'Where did you find it? Link to the Discord message or Patreon or wherever.'
          }
          onChange={newVal => onFieldChange(AssetFieldNames.sourceUrl, newVal)}
        />

        <Heading variant="h2">Files</Heading>
        <FileAttacher
          fileUrls={fieldData.fileUrls}
          onFileAttached={fileUrl =>
            onFieldChange('fileUrls', fieldData.fileUrls.concat([fileUrl]))
          }
          onFileRemoved={fileUrl =>
            onFieldChange(
              'fileUrls',
              fieldData.fileUrls.filter(url => url !== fileUrl)
            )
          }
        />
        {showAdvancedFileUrls === false && (
          <>
            <Button
              color="default"
              className={classes.advancedModeBtn}
              onClick={() => setShowAdvancedFileUrls(true)}>
              Show advanced mode for files
            </Button>
          </>
        )}
        {showAdvancedFileUrls && (
          <FormField
            label="Attached URLs"
            value={fieldData.fileUrls.join('\n')}
            hint={`A list of URLs that have been attached. Add and remove them as you need.`}
            onChange={newVal => onFieldChange('fileUrls', newVal)}
            convertToValidField={text => text.split('\n')}
            multiline
            rows={10}
          />
        )}

        <Heading variant="h2">Additional settings</Heading>

        <FormField
          label="Is adult content"
          type={formFieldType.checkbox}
          value={fieldData.isAdult}
          hint={`If enabled it is hidden for everyone except logged in users who have opted-in.`}
          onChange={newVal => onFieldChange('isAdult', newVal)}
        />

        <Heading variant="h2">Upload</Heading>
        <FormField
          label="I have permission to upload this asset"
          type="checkbox"
          value={doesHavePermission}
          hint="We don't want to steal content. If you want to share someone else's work, please link directly to their website or Discord message (not the file itself)."
          onChange={newVal => setDoesHavePermission(newVal)}
        />
        <div className={classes.controls}>
          {isFormValid === false && (
            <>
              {'Form is invalid. Please check each field.'}
              <br />
            </>
          )}
          <Button onClick={onFormSubmitted} disabled={!isFormValid}>
            {assetId ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </>
  )
}
