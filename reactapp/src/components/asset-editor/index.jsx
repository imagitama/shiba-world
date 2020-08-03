import React, { useState } from 'react'
import Markdown from 'react-markdown'
import shortid from 'shortid'
import { makeStyles } from '@material-ui/core/styles'

import SpeciesSelector from './components/species-selector'
import CategorySelector from './components/category-selector'
import FormField, { formFieldType } from './components/form-field'
import InvalidMessage from './components/invalid-message'
import FileAttacher from './components/file-attacher'
import ChildrenInput from './components/children-input'
import AuthorInput from './components/author-input'
import PopularTagsSelector from './components/popular-tags-selector'

import Heading from '../heading'
import ThumbnailUploader from '../thumbnail-uploader'
import Button from '../button'
import TagChip from '../tag-chip'

import {
  AssetFieldNames,
  AssetCategories,
  CollectionNames
} from '../../hooks/useDatabaseQuery'
import useCategoryMeta from '../../hooks/useCategoryMeta'
import categoryMeta from '../../category-meta'
import speciesMeta from '../../species-meta'
import { scrollToTop, createRef } from '../../utils'

const useStyles = makeStyles({
  controls: { marginTop: '2rem', textAlign: 'center' }
})

function getFormFieldHint(fieldName, category) {
  switch (fieldName) {
    case AssetFieldNames.title:
      switch (category) {
        case AssetCategories.accessory:
          return 'The title of the accessory. eg. "Hoodie" or "Sunglasses" or "Spikey hair"'
        case AssetCategories.animation:
          return 'The title of the animation. eg. "Dog running" or "A big smile"'
        case AssetCategories.article:
          return 'The title of the news article. eg. "Pikapetey just released a new shiba!"'
        case AssetCategories.avatar:
          return 'The name of the avatar. eg. "Avali Base Model 2.0" or "Pikapetey Shiba Inu"'
        case AssetCategories.world:
          return 'The name of the world. eg. "Shiba Paradise" or "Avali Homeworld""'
        case AssetCategories.tutorial:
          return 'The title of the tutorial. eg. "How to import your Shiba into Beat Saber"'
        default:
          return 'The title of the asset.'
      }
    case AssetFieldNames.description:
      switch (category) {
        case AssetCategories.accessory:
          return 'What is the accessory, how do they use it, tips for using it, etc.'
        case AssetCategories.animation:
          return 'What the animation is for, how do they use it, etc.'
        case AssetCategories.article:
          return 'The contents of the news article.'
        case AssetCategories.avatar:
          return 'Information about the avatar including is it a paid or free avatar and instructions for importing it.'
        case AssetCategories.world:
          return 'Describe the world, why it exists, etc.'
        case AssetCategories.tutorial:
          return 'The steps in the tutorial. Use Markdown to use headings and embed images.'
        default:
          return 'The description of the asset.'
      }
    case AssetFieldNames.sourceUrl:
      switch (category) {
        case AssetCategories.world:
          return 'A URL to where people can go to visit the world.'
        case AssetCategories.avatar:
          return 'Where you found the avatar OR a URL to where they can download it.'
        case AssetCategories.article:
          return 'A URL to the thing you used for your news article. eg. a tweet or a blog'
        default:
          return 'A URL which is where you found the asset.'
      }
    default:
      return ''
  }
}

function getFormFieldLabel(fieldName, category) {
  switch (fieldName) {
    case AssetFieldNames.description:
      switch (category) {
        case AssetCategories.article:
          return 'Article Contents'
        case AssetCategories.tutorial:
          return 'Tutorial Steps'
        default:
          return 'Description'
      }
    default:
      return ''
  }
}

function getLabelForCategory(category) {
  switch (category) {
    case AssetCategories.accessory:
      return 'Upload Accessory'
    case AssetCategories.animation:
      return 'Upload Animation'
    case AssetCategories.article:
      return 'Post News Article'
    case AssetCategories.avatar:
      return 'Upload Avatar'
    case AssetCategories.world:
      return 'Post World'
    case AssetCategories.tutorial:
      return 'Post Tutorial'
    default:
      return 'Upload Asset'
  }
}

const getIsFormValid = formFields => {
  if (!formFields[AssetFieldNames.title]) {
    return false
  }
  if (!formFields[AssetFieldNames.description]) {
    return false
  }
  if (!formFields[AssetFieldNames.category]) {
    return false
  }
  if (!formFields[AssetFieldNames.thumbnailUrl]) {
    return false
  }
  return true
}

export default ({
  assetId,
  asset = {},
  onSubmit,
  preSelectedCategory,
  preSelectedSpecies
}) => {
  const classes = useStyles()
  const [hasTriedSubmitting, setHasTriedSubmitting] = useState(false)

  const {
    // WARNING: If optional you must specify a default (not undefined) or Firebase errors
    title,
    description,
    species = preSelectedSpecies ? [preSelectedSpecies] : [],
    category = preSelectedCategory,
    tags = [],
    thumbnailUrl,
    fileUrls = [],
    isAdult = false,
    sourceUrl = '',
    videoUrl = '',
    isPrivate = false,
    author = null,
    children = []
  } = asset

  const [fieldData, setFieldData] = useState({
    title,
    description,
    species,
    category,
    tags,
    fileUrls,
    thumbnailUrl,
    isAdult,
    sourceUrl,
    videoUrl,
    isPrivate,
    author,
    children
  })
  const [
    hasFinishedSelectingSpecies,
    setHasFinishedSelectingSpecies
  ] = useState(asset.id ? true : species.length !== 0 ? true : false)
  const { nameSingular } = useCategoryMeta(fieldData[AssetFieldNames.category])

  const isFormValid = getIsFormValid(fieldData)

  const onFormSubmitted = () => {
    if (!isFormValid) {
      if (!hasTriedSubmitting) {
        setHasTriedSubmitting(true)
      }
      return
    }

    onSubmit(fieldData)
  }

  const onFieldChange = (fieldName, newVal) => {
    setFieldData({
      ...fieldData,
      [fieldName]: newVal
    })
  }

  if (!fieldData[AssetFieldNames.category]) {
    return (
      <CategorySelector
        onSelect={newCategory => {
          onFieldChange(AssetFieldNames.category, newCategory)
          scrollToTop()
        }}
        selectedCategory={fieldData[AssetFieldNames.category]}
      />
    )
  }

  if (!hasFinishedSelectingSpecies) {
    return (
      <SpeciesSelector
        selectedCategory={fieldData[AssetFieldNames.category]}
        onSelect={speciesToAdd =>
          onFieldChange(
            AssetFieldNames.species,
            fieldData[AssetFieldNames.species].concat([speciesToAdd])
          )
        }
        onDeSelect={speciesToRemove =>
          onFieldChange(
            AssetFieldNames.species,
            fieldData[AssetFieldNames.species].filter(
              species => species !== speciesToRemove
            )
          )
        }
        selectedSpeciesMulti={fieldData.species}
        onDone={() => {
          setHasFinishedSelectingSpecies(true)
          scrollToTop()
        }}
      />
    )
  }

  return (
    <>
      <Heading variant="h1">
        {assetId
          ? `Edit ${nameSingular}`
          : getLabelForCategory(fieldData[AssetFieldNames.category])}
      </Heading>
      <Heading variant="h2">
        {categoryMeta[fieldData[AssetFieldNames.category]].nameSingular} -{' '}
        {fieldData[AssetFieldNames.species].length
          ? fieldData[AssetFieldNames.species]
              .map(speciesName => speciesMeta[speciesName].name)
              .join(', ')
          : 'All Species'}
      </Heading>
      <Button onClick={() => onFieldChange(AssetFieldNames.category, '')}>
        Reset Category
      </Button>{' '}
      <Button onClick={() => setHasFinishedSelectingSpecies(false)}>
        Reset Species
      </Button>
      <Heading variant="h3">Title</Heading>
      <FormField
        label="Title"
        value={fieldData[AssetFieldNames.title]}
        hint={getFormFieldHint(
          AssetFieldNames.title,
          fieldData[AssetFieldNames.category]
        )}
        onChange={newVal => onFieldChange(AssetFieldNames.title, newVal)}
        isRequired
      />
      <Heading variant="h3">Description</Heading>
      <FormField
        label={getFormFieldLabel(
          AssetFieldNames.description,
          fieldData[AssetFieldNames.description]
        )}
        value={fieldData[AssetFieldNames.description]}
        hint={
          <>
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
        onChange={newVal => onFieldChange(AssetFieldNames.description, newVal)}
        multiline
        rows={10}
        isRequired
      />
      <Markdown source={fieldData[AssetFieldNames.description]} />
      <Heading variant="h3">Thumbnail</Heading>
      {fieldData[AssetFieldNames.thumbnailUrl] ? (
        <img
          src={fieldData[AssetFieldNames.thumbnailUrl]}
          alt="Preview of the thumbnail"
        />
      ) : (
        <strong>Please use the form below to upload a thumbnail</strong>
      )}
      <Heading variant="h4">Upload</Heading>
      <ThumbnailUploader
        directoryPath="asset-thumbnails"
        filePrefix={shortid.generate()}
        onUploaded={url => onFieldChange(AssetFieldNames.thumbnailUrl, url)}
      />
      <Heading variant="h2">Source</Heading>
      <FormField
        label={getFormFieldLabel(
          AssetFieldNames.sourceUrl,
          fieldData[AssetFieldNames.category]
        )}
        value={fieldData.sourceUrl}
        hint={getFormFieldHint(
          AssetFieldNames.sourceUrl,
          fieldData[AssetFieldNames.category]
        )}
        onChange={newVal => onFieldChange(AssetFieldNames.sourceUrl, newVal)}
      />
      <Heading variant="h3">Tags</Heading>
      Click a popular tag to add it:{' '}
      <PopularTagsSelector
        currentTags={fieldData[AssetFieldNames.tags]}
        onSelect={tagName =>
          onFieldChange(
            AssetFieldNames.tags,
            fieldData[AssetFieldNames.tags].concat([tagName])
          )
        }
      />
      <FormField
        label="Tags"
        value={fieldData[AssetFieldNames.tags].join('\n')}
        hint={
          'Help users find your assets using filters and searching. One tag per line. All lowercase.'
        }
        onChange={newVal => onFieldChange(AssetFieldNames.tags, newVal)}
        convertToValidField={text => text.split('\n')}
        multiline
        rows={10}
      />
      <br />
      {fieldData[AssetFieldNames.tags].map(tag => (
        <TagChip key={tag} tagName={tag} isDisabled />
      ))}
      {fieldData[AssetFieldNames.category] === AssetCategories.tutorial && (
        <>
          <Heading variant="h2">Video</Heading>
          <FormField
            label="Video URL"
            value={fieldData.videoUrl}
            hint="Paste a URL to any video. Supports any popular video site like YouTube or file formats like MP4, MKV, etc. Use the file attachment form to upload your own video to the site."
            onChange={newVal => onFieldChange(AssetFieldNames.videoUrl, newVal)}
          />
        </>
      )}
      <Heading variant="h2">Attachments</Heading>
      <FileAttacher
        fileUrls={fieldData[AssetFieldNames.fileUrls]}
        onFileAttached={fileUrl =>
          onFieldChange(
            AssetFieldNames.fileUrls,
            fieldData[AssetFieldNames.fileUrls].concat([fileUrl])
          )
        }
        onFilesChanged={newFileUrls =>
          onFieldChange(AssetFieldNames.fileUrls, newFileUrls)
        }
        onFileRemoved={fileUrl =>
          onFieldChange(
            AssetFieldNames.fileUrls,
            fieldData[AssetFieldNames.fileUrls].filter(url => url !== fileUrl)
          )
        }
      />
      <Heading variant="h3">Additional settings</Heading>
      <AuthorInput
        authorRef={fieldData[AssetFieldNames.author]}
        onNewAuthorId={newAuthorId =>
          onFieldChange(
            AssetFieldNames.author,
            createRef(CollectionNames.Authors, newAuthorId)
          )
        }
      />
      <br />
      <ChildrenInput
        assetChildren={fieldData[AssetFieldNames.children]}
        onChange={newChildren =>
          onFieldChange(AssetFieldNames.children, newChildren)
        }
      />
      <br />
      <FormField
        label="Is adult content"
        type={formFieldType.checkbox}
        value={fieldData.isAdult}
        hint={`If enabled it is hidden for everyone except logged in users who have opted-in.`}
        onChange={newVal => onFieldChange(AssetFieldNames.isAdult, newVal)}
      />
      <br />
      <FormField
        label="Is private"
        type={formFieldType.checkbox}
        value={fieldData.isPrivate}
        hint={`If checked it will not show up in search results and in any results when browsing assets. You can only directly visit the URL and it shows up in your private account overview.`}
        onChange={newVal => onFieldChange(AssetFieldNames.isPrivate, newVal)}
      />
      <div className={classes.controls}>
        {hasTriedSubmitting && <InvalidMessage fieldData={fieldData} />}
        <Button onClick={onFormSubmitted}>{assetId ? 'Save' : 'Create'}</Button>
      </div>
    </>
  )
}
