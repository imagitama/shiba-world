import React, { useState, useEffect, useRef } from 'react'
import TextField from '@material-ui/core/TextField'
import { useHistory } from 'react-router'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import {
  CollectionNames,
  AssetFieldNames,
  AssetCategories
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import ErrorMessage from '../../components/error-message'
import Button from '../../components/button'
import NoPermissionMessage from '../../components/no-permission-message'
import CategorySelector from '../../components/category-selector'
import SpeciesSelector from '../../components/species-selector'
import Heading from '../../components/heading'
import SyncWithGumroadForm from '../../components/sync-with-gumroad-form'
import PageControls from '../../components/page-controls'
import LoadingIndicator from '../../components/loading-indicator'
import DuplicateAssetForm from '../../components/duplicate-asset-form'

import { scrollToTop, isRef } from '../../utils'
import * as routes from '../../routes'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'
import defaultThumbnailUrl from '../../assets/images/default-thumbnail.webp'
import useCategoryMeta from '../../hooks/useCategoryMeta'
import ContentOverviewEditor from '../../components/content-overview-editor'

export default () => {
  const userId = useFirebaseUserId()
  const [isSaving, , isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets
  )
  const redirectRef = useRef()

  const [
    hasFinishedSelectingSpecies,
    setHasFinishedSelectingSpecies
  ] = useState(false)
  const [newDocumentId, setNewDocumentId] = useState(null)
  const [speciesValue, setSpeciesValue] = useState([])
  const [categoryValue, setCategoryValue] = useState(null)
  const [titleValue, setTitleValue] = useState('')
  const [
    hasDuplicateCheckBeenPerformed,
    setHasDuplicateCheckBeenPerformed
  ] = useState(false)
  const [gumroadUrl, setGumroadUrl] = useState('')
  const [isToSyncWithGumroad, setIsToSyncWithGumroad] = useState(false)
  const [hasFinishedSyncWithGumroad, setHasFinishedSyncWithGumroad] = useState(
    false
  )
  const categoryDetails = useCategoryMeta(categoryValue)
  const { push } = useHistory()

  useEffect(() => {
    return () => clearTimeout(redirectRef.current)
  }, [])

  const onDone = async newFields => {
    try {
      trackAction('CreateAsset', 'Click create button')

      scrollToTop()

      const [docId] = await save({
        // required files
        [AssetFieldNames.title]: titleValue,
        [AssetFieldNames.description]: '',
        [AssetFieldNames.thumbnailUrl]: defaultThumbnailUrl,
        [AssetFieldNames.fileUrls]: [],
        [AssetFieldNames.category]: categoryValue,
        [AssetFieldNames.species]: speciesValue,
        [AssetFieldNames.sourceUrl]: '',
        ...newFields,

        // need this to set as draft
        [AssetFieldNames.isPrivate]: true,

        // need to initialize these so our queries work later
        [AssetFieldNames.isApproved]: false,
        [AssetFieldNames.isDeleted]: false,
        [AssetFieldNames.isAdult]: false,
        [AssetFieldNames.createdBy]: createRef(CollectionNames.Users, userId),
        [AssetFieldNames.createdAt]: new Date()
      })

      setNewDocumentId(docId)

      return docId
    } catch (err) {
      console.error('Failed to create asset', newFields, err)
      handleError(err)
    }
  }

  const onSyncWithGumroadBtnClick = () => setIsToSyncWithGumroad(true)

  if (!userId) {
    return <NoPermissionMessage />
  }

  if (isSaving) {
    return <LoadingIndicator message="Creating..." />
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to create asset</ErrorMessage>
  }

  if (!categoryValue) {
    return (
      <CategorySelector
        onSelect={async newCategory => {
          if (newCategory === AssetCategories.content) {
            const docId = await onDone({
              [AssetFieldNames.category]: AssetCategories.content,
              [AssetFieldNames.isPrivate]: false // for content we upload the content immediately so get it out the door quickly
            })
            push(routes.editAssetWithVar.replace(':assetId', docId))
          } else {
            setCategoryValue(newCategory)
            scrollToTop()
          }
        }}
        selectedCategory={categoryValue}
        title={titleValue}
      />
    )
  }

  // navigate away
  if (categoryValue === AssetCategories.content) {
    return <LoadingIndicator />
    // if (!newDocumentId) {
    //   return <LoadingIndicator />
    // }

    // return (
    //   <>
    //     <ContentOverviewEditor
    //       asset={{
    //         id: newDocumentId
    //       }}
    //       onDone={() =>

    //       }
    //     />
    //   </>
    // )
  }

  if (!hasDuplicateCheckBeenPerformed) {
    return (
      <>
        <Heading variant="h1">
          Upload {categoryDetails ? categoryDetails.nameSingular : 'Asset'}
        </Heading>
        <Heading variant="h2">Title</Heading>
        <DuplicateAssetForm
          categoryName={categoryValue}
          onDone={newTitle => {
            setTitleValue(newTitle)
            setHasDuplicateCheckBeenPerformed(true)
          }}
        />
      </>
    )
  }

  if (!hasFinishedSelectingSpecies) {
    return (
      <SpeciesSelector
        selectedCategory={categoryValue}
        title={titleValue}
        onSelect={idToAdd =>
          setSpeciesValue(currentVal =>
            currentVal.concat([createRef(CollectionNames.Species, idToAdd)])
          )
        }
        onDeSelect={idToRemove =>
          setSpeciesValue(currentVal =>
            currentVal.filter(species => {
              if (isRef(species)) {
                if (species.ref.id === idToRemove) {
                  return false
                }
              }
              return true
            })
          )
        }
        selectedSpeciesMulti={speciesValue}
        onDone={() => {
          setHasFinishedSelectingSpecies(true)
          onDone()
          scrollToTop()
        }}
      />
    )
  }

  if (newDocumentId) {
    return (
      <>
        <Heading variant="h1">Upload "{titleValue}"</Heading>
        <Heading variant="h2">Gumroad</Heading>
        <p>
          Most assets on this site are on Gumroad so we can automatically fetch
          basic information from Gumroad itself. Enter the Gumroad URL below or
          skip to continue:
        </p>
        {!isToSyncWithGumroad && (
          <>
            <TextField
              onChange={e => setGumroadUrl(e.target.value)}
              variant="filled"
              style={{ width: '100%' }}
            />
            {gumroadUrl && (
              <PageControls>
                <Button onClick={() => onSyncWithGumroadBtnClick()}>
                  Fetch From Gumroad
                </Button>
              </PageControls>
            )}
          </>
        )}
        {!hasFinishedSyncWithGumroad && isToSyncWithGumroad && (
          <SyncWithGumroadForm
            assetId={newDocumentId}
            gumroadUrl={gumroadUrl}
            onDone={() => setHasFinishedSyncWithGumroad(true)}
          />
        )}
        <PageControls>
          {hasFinishedSyncWithGumroad && (
            <>
              <p>Sync successful.</p>
              <Button
                url={routes.viewAssetWithVar.replace(
                  ':assetId',
                  newDocumentId
                )}>
                Done
              </Button>
            </>
          )}{' '}
          {!hasFinishedSyncWithGumroad && (
            <Button
              color="default"
              url={routes.viewAssetWithVar.replace(':assetId', newDocumentId)}>
              Skip
            </Button>
          )}
        </PageControls>
      </>
    )
  }

  return null
}
