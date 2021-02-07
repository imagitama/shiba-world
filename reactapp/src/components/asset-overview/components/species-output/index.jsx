import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import * as routes from '../../../../routes'

export default ({ speciesRefs, speciesNames = [] }) => {
  return speciesRefs.map((speciesRef, idx) => {
    return (
      <Fragment key={speciesRef.id}>
        {idx !== 0 && ', '}
        <Link
          to={routes.viewSpeciesWithVar.replace(
            ':speciesIdOrSlug',
            speciesRef.id
          )}>
          {speciesNames[idx] || '???'}
        </Link>
      </Fragment>
    )
  })
}
