import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { SpeciesFieldNames } from '../../../../hooks/useDatabaseQuery'
import * as routes from '../../../../routes'

export default ({ species }) => {
  return species.map((speciesDoc, idx) => {
    return (
      <Fragment key={speciesDoc.id}>
        {idx !== 0 && ', '}
        <Link
          to={routes.viewSpeciesWithVar.replace(
            ':speciesIdOrSlug',
            speciesDoc.id
          )}>
          {speciesDoc[SpeciesFieldNames.singularName]}
        </Link>
      </Fragment>
    )
  })
}
