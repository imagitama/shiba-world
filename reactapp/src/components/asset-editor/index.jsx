import React, { useState, Fragment } from 'react'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import shortid from 'shortid'
import Markdown from 'react-markdown'
import FileUploader from '../file-uploader'
import ThumbnailUploader from '../thumbnail-uploader'
import Heading from '../heading'
import { AssetCategories } from '../../hooks/useDatabaseQuery'
import { species as speciesTags } from '../../tags'

const Hint = ({ children }) => (
  <div style={{ fontSize: '80%', color: 'grey' }}>{children}</div>
)

const formFieldType = {
  text: 'text',
  checkbox: 'checkbox'
}

const FormField = ({
  label,
  type = formFieldType.text,
  value,
  hint,
  convertToValidField,
  onChange,
  ...textFieldProps
}) => (
  <Paper style={{ margin: '0 0 1rem 0', padding: '2rem' }}>
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

const FileAttacherItem = ({ url, onRemove }) => (
  <Paper style={{ margin: '0 0 1rem 0', padding: '2rem' }}>
    {url}
    <br />
    <Button variant="contained" onClick={() => onRemove()}>
      Remove
    </Button>
  </Paper>
)

const FileAttacher = ({ fileUrls, onFileAttached, onFileRemoved }) => (
  <>
    {fileUrls.map(fileUrl => (
      <FileAttacherItem
        key={fileUrl}
        url={fileUrl}
        onRemove={() => onFileRemoved(fileUrl)}
      />
    ))}
    <Paper style={{ margin: '0 0 1rem 0', padding: '2rem' }}>
      <FileUploader
        directoryPath="asset-uploads"
        filePrefix={shortid.generate()}
        onDownloadUrl={url => onFileAttached(url)}
      />
    </Paper>
  </>
)

const isFormValid = (formFields, doesHavePermission) => {
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
    isAdult = false
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

  return (
    <>
      <form>
        <Heading variant="h2">Basics</Heading>
        <FormField
          label="Title"
          value={fieldData.title}
          hint="The name of the asset."
          onChange={newVal => onFieldChange('title', newVal)}
        />
        <FormField
          label="Description"
          value={fieldData.description}
          hint={
            <>
              A short paragraph that describes the asset.
              <br />
              <br />
              You can use markdown. A guide is here:{' '}
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
              style={{ marginBottom: '0.5rem' }}
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
            style={{ marginBottom: '0.5rem' }}
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
          value={fieldData.species.join('\n')}
          hint={`What species your asset is for. Type one species per line.

Can be left blank and it will not show up at all.

Include all species to list for all. In future there might be an "all" checkbox.
          
Available species: ${Object.values(speciesTags).join(', ')}

In future there will be checkboxes!`}
          onChange={newVal => onFieldChange('species', newVal)}
          convertToValidField={text => text.split('\n')}
          multiline
          rows={10}
        />

        <Heading variant="h2">Category</Heading>
        <FormField
          label="Category"
          value={fieldData.category}
          hint={`What kind of asset it is.
            
Type in one of these: ${Object.values(AssetCategories).join(', ')}

In future there will be a dropdown menu!`}
          onChange={newVal => onFieldChange('category', newVal)}
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
              style={{ marginBottom: '0.5rem' }}
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
        <div style={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={onFormSubmitted}
            disabled={!isFormValid(fieldData, doesHavePermission)}>
            {assetId ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </>
  )
}
