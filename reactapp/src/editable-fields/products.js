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
    hint: 'All products must be associated with an asset.'
  },
  {
    name: ProductFieldNames.priceUsd,
    type: fieldTypes.text,
    label: 'Price (USD)',
    hint: 'Other currencies are not available at this time.'
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
