import React from 'react'
import {
  ProductFieldNames,
  CollectionNames,
  AssetFieldNames
} from '../hooks/useDatabaseQuery'
import { fieldTypes } from '../generic-forms'
import { searchIndexNames } from '../modules/app'
import AssetResultsItem from '../components/asset-results-item'

export default [
  {
    name: ProductFieldNames.asset,
    type: fieldTypes.searchable,
    fieldProperties: {
      collectionName: CollectionNames.Assets,
      indexName: searchIndexNames.ASSETS,
      fieldAsLabel: AssetFieldNames.title,
      renderer: ({ item }) => <AssetResultsItem asset={item} />
    },
    label: 'Asset',
    hint: 'All products must be associated with an asset.',
    default: null
  },
  {
    name: ProductFieldNames.priceUsd,
    type: fieldTypes.text,
    label: 'Price (USD)',
    hint:
      'In the format 00.00 with no $ or any other currency symbol. Other currencies are not available at this time. Free products not available too.',
    isRequired: true
  },
  {
    name: ProductFieldNames.title,
    type: fieldTypes.text,
    label: 'Title',
    hint: 'An alternative title. Leave blank to inherit from the asset.',
    default: ''
  },
  {
    name: ProductFieldNames.description,
    type: fieldTypes.textMarkdown,
    label: 'Description',
    hint: 'Any notes specifically about purchasing the product.',
    default: ''
  },
  {
    name: ProductFieldNames.isApproved,
    type: fieldTypes.hidden,
    default: true
  },
  {
    name: ProductFieldNames.isDeleted,
    type: fieldTypes.hidden,
    default: false
  },
  {
    name: ProductFieldNames.isSaleable,
    type: fieldTypes.checkbox,
    default: true,
    label: 'Is the product ready for sales?',
    hint:
      'If disabled the product will be visible in the store but nobody will be able to purchase it.'
  }
]
