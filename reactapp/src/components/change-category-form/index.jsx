import React, { useState } from 'react'
import Chip from '@material-ui/core/Chip'
import { makeStyles } from '@material-ui/core/styles'

import Button from '../button'

import {
  CollectionNames,
  AssetFieldNames,
  AssetCategories
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { createRef } from '../../utils'
import categoryMeta from '../../category-meta'

const useStyles = makeStyles({
  chip: { margin: '0 0.25rem 0.25rem 0' },
  btns: {
    textAlign: 'center',
    marginTop: '1rem'
  }
})

function CategoryButtons({ selectedCategory, onSelect }) {
  const classes = useStyles()
  return (
    <span>
      {Object.keys(AssetCategories).map(categoryName => (
        <Chip
          key={categoryName}
          className={classes.chip}
          label={categoryMeta[categoryName].nameSingular}
          color={selectedCategory === categoryName ? 'primary' : undefined}
          onClick={() => onSelect(categoryName)}
        />
      ))}
    </span>
  )
}

export default ({
  assetId,
  existingCategory,
  actionCategory = '',
  onDone = null
}) => {
  const userId = useFirebaseUserId()
  const [isSaving, , , save] = useDatabaseSave(CollectionNames.Assets, assetId)
  const [newCategory, setNewCategory] = useState(existingCategory)
  const classes = useStyles()

  if (!userId) {
    return 'You are not logged in'
  }

  if (isSaving) {
    return 'Saving...'
  }

  const onSaveBtnClick = async () => {
    try {
      trackAction(actionCategory, 'Click save asset category button', assetId)

      await save({
        [AssetFieldNames.category]: newCategory,
        [AssetFieldNames.lastModifiedAt]: new Date(),
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        )
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <>
      <CategoryButtons
        selectedCategory={newCategory}
        onSelect={categoryName => setNewCategory(categoryName)}
      />
      <div className={classes.btns}>
        <Button onClick={onSaveBtnClick}>Save</Button>
      </div>
    </>
  )
}
