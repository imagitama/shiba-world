import React from 'react'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'
import NoPermissionMessage from '../../components/no-permission-message'

import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import * as routes from '../../routes'
import { canEditProduct } from '../../permissions'

export default ({
  match: {
    params: { productId }
  }
}) => {
  const isCreating = !productId

  const [, , user] = useUserRecord()

  if (!canEditProduct(user)) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">{isCreating ? 'Create' : 'Edit'} Product</Heading>
      <GenericEditor
        collectionName={CollectionNames.Products}
        id={isCreating ? null : productId}
        analyticsCategory={isCreating ? 'CreateProduct' : 'EditProduct'}
        saveBtnAction="Click save item button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        successUrl={routes.viewProductWithVar.replace(':productId', productId)}
        getSuccessUrl={newId =>
          routes.viewProductWithVar.replace(':productId', newId)
        }
        cancelUrl={
          isCreating
            ? routes.viewProducts
            : routes.viewProductWithVar.replace(':productId', productId)
        }
      />
    </>
  )
}
