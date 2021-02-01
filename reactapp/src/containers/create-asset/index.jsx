import React, { useState, useEffect, useRef } from 'react'
import { useHistory } from 'react-router'
import TextField from '@material-ui/core/TextField'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames, AssetFieldNames } from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import LoadingIndicator from '../../components/loading-indicator'
import SuccessMessage from '../../components/success-message'
import ErrorMessage from '../../components/error-message'
import Button from '../../components/button'
import NoPermissionMessage from '../../components/no-permission-message'
import CategorySelector from '../../components/category-selector'
import SpeciesSelector from '../../components/species-selector'
import Heading from '../../components/heading'

import { scrollToTop, isRef } from '../../utils'
import * as routes from '../../routes'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'
import defaultThumbnailUrl from '../../assets/images/default-thumbnail.webp'
import useCategoryMeta from '../../hooks/useCategoryMeta'

export default () => {
  const userId = useFirebaseUserId()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets
  )
  const { push } = useHistory()
  const redirectRef = useRef()

  const [
    hasFinishedSelectingSpecies,
    setHasFinishedSelectingSpecies
  ] = useState(false)
  const [newDocumentId, setNewDocumentId] = useState(null)
  const [speciesValue, setSpeciesValue] = useState([])
  const [categoryValue, setCategoryValue] = useState(null)
  const [gumroadUrl, setGumroadUrl] = useState('')
  const { nameSingular: categoryName } = useCategoryMeta(categoryValue)

  useEffect(() => {
    return () => clearTimeout(redirectRef.current)
  }, [])

  const onDone = async newFields => {
    try {
      trackAction('CreateAsset', 'Click create button')

      scrollToTop()

      const [docId] = await save({
        // required files
        [AssetFieldNames.title]: 'Untitled',
        [AssetFieldNames.description]: '',
        [AssetFieldNames.thumbnailUrl]: defaultThumbnailUrl,
        [AssetFieldNames.fileUrls]: [],
        [AssetFieldNames.category]: categoryValue,
        [AssetFieldNames.species]: speciesValue,
        [AssetFieldNames.sourceUrl]: gumroadUrl || '',
        ...newFields,

        // need this to set as draft
        [AssetFieldNames.isPrivate]: true,

        // need to initialize these so our queries work later
        [AssetFieldNames.isApproved]: false,
        [AssetFieldNames.isDeleted]: false,
        [AssetFieldNames.createdBy]: createRef(CollectionNames.Users, userId),
        [AssetFieldNames.createdAt]: new Date()
      })

      setNewDocumentId(docId)

      redirectRef.current = setTimeout(
        () => push(routes.editAssetWithVar.replace(':assetId', docId)),
        2000
      )
    } catch (err) {
      console.error('Failed to create asset', newFields, err)
      handleError(err)
    }
  }

  if (!userId) {
    return <NoPermissionMessage />
  }

  if (isSaving) {
    return <LoadingIndicator message="Creating..." />
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to create asset</ErrorMessage>
  }

  if (isSaveSuccess) {
    return (
      <SuccessMessage>
        Created a draft for you. Redirecting to it in 2 seconds...
        <br />
        <br />
        <Button
          url={routes.viewAssetWithVar.replace(':assetId', newDocumentId)}
          onClick={() =>
            trackAction(
              'CreateAsset',
              'Click view created asset button',
              newDocumentId
            )
          }>
          Skip
        </Button>
      </SuccessMessage>
    )
  }

  if (!categoryValue) {
    return (
      <CategorySelector
        onSelect={newCategory => {
          setCategoryValue(newCategory)
          scrollToTop()
        }}
        selectedCategory={categoryValue}
      />
    )
  }

  if (!hasFinishedSelectingSpecies) {
    return (
      <SpeciesSelector
        selectedCategory={categoryValue}
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
          scrollToTop()
        }}
      />
    )
  }

  return (
    <>
      <Heading variant="h1">Upload {categoryName}</Heading>
      <Heading variant="h2">Source</Heading>
      <p>
        If you are uploading an asset from Gumroad please enter the URL below or
        leave it empty. You can always change it later.
      </p>
      <p>
        By providing a Gumroad URL you can click a button to sync the thumbnail,
        title and description with Gumroad.
      </p>
      <strong>Gumroad URL</strong>
      <br />
      <TextField
        onChange={e => setGumroadUrl(e.target.value)}
        variant="filled"
        style={{ width: '100%' }}
      />
      <br />
      <br />
      <Button onClick={() => onDone()}>Done</Button>
    </>
  )
}
