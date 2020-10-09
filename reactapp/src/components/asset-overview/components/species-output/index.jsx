import React from 'react'
import { Link } from 'react-router-dom'
import { SpeciesFieldNames } from '../../../../hooks/useDatabaseQuery'
import * as routes from '../../../../routes'

export default ({ species }) => {
  return species.map((speciesNameOrDoc, idx) => {
    return (
      <>
        {idx !== 0 && ', '}
        <Link
          to={routes.viewSpeciesWithVar.replace(
            ':speciesIdOrSlug',
            speciesNameOrDoc.id
          )}>
          {speciesNameOrDoc[SpeciesFieldNames.singularName]}
        </Link>
      </>
    )
  })
}
