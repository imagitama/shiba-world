import { SpeciesFieldNames } from '../hooks/useDatabaseQuery'
import { fieldTypes } from '../generic-forms'

export default [
  {
    name: SpeciesFieldNames.singularName,
    label: 'Name (singular)',
    type: fieldTypes.text,
    isRequired: true,
    hint: 'A single of them - "Dog" (not "Dogs")'
  },
  {
    name: SpeciesFieldNames.pluralName,
    label: 'Name (plural)',
    type: fieldTypes.text,
    isRequired: true,
    hint: 'Multiple of them - "Dogs" (not "Dog")'
  },
  {
    name: SpeciesFieldNames.shortDescription,
    label: 'Short Description',
    type: fieldTypes.text,
    hint:
      'A sentence that describes the species. Shown in the list of all species.'
  },
  {
    name: SpeciesFieldNames.description,
    label: 'Description',
    type: fieldTypes.textMarkdown,
    hint:
      'A longer description of the species. Shown when you visit the species.'
  },
  {
    name: SpeciesFieldNames.thumbnailUrl,
    label: 'Thumbnail',
    type: fieldTypes.imageUpload,
    fieldProperties: {
      width: 300,
      height: 300,
      directoryName: 'species-thumbnails',
      fallbackFieldName: SpeciesFieldNames.fallbackThumbnailUrl
    },
    isRequired: true
  },
  {
    name: SpeciesFieldNames.isPopular,
    label: 'Is popular',
    type: fieldTypes.checkbox,
    hint:
      'Popular species are always shown in the list of species. Others will be hidden by default',
    default: false
  }
]
