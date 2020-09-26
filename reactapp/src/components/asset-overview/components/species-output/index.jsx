import React from 'react'
import { Link } from 'react-router-dom'
import { SpeciesFieldNames } from '../../../../hooks/useDatabaseQuery'
import speciesMeta from '../../../../species-meta'
import * as routes from '../../../../routes'

const allSpeciesLabel = 'All Species'

function getSpeciesDisplayNameBySpeciesName(speciesName) {
  if (!speciesName) {
    return allSpeciesLabel
  }
  if (!speciesMeta[speciesName]) {
    throw new Error(`Unknown species name ${speciesName}`)
  }
  return speciesMeta[speciesName].name
}

export default ({ species }) => {
  return species.map((speciesNameOrDoc, idx) => {
    if (typeof speciesNameOrDoc === 'string') {
      return (
        <>
          {idx !== 0 && ', '}
          <Link
            to={routes.viewSpeciesWithVar.replace(
              ':speciesName',
              speciesNameOrDoc
            )}>
            {getSpeciesDisplayNameBySpeciesName(speciesNameOrDoc)}
          </Link>
        </>
      )
    }
    return (
      <>
        {idx !== 0 && ', '}
        <Link
          to={routes.viewSpeciesWithVar.replace(
            ':speciesName',
            speciesNameOrDoc.id
          )}>
          {speciesNameOrDoc[SpeciesFieldNames.singularName]}
        </Link>
      </>
    )
  })
}
