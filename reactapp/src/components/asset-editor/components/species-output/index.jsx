import { useEffect, useState } from 'react'
import { firestore } from 'firebase/app'
import { isRef } from '../../../../utils'
import {
  CollectionNames,
  SpeciesFieldNames
} from '../../../../hooks/useDatabaseQuery'

function stringify(species) {
  if (!species || !species.length) {
    return ''
  }

  return species
    .map(item => {
      if (typeof item === 'string') {
        return item
      }
      if (isRef(item)) {
        return item.id
      }
      return '---'
    })
    .join(',')
}

export default ({ species }) => {
  const [speciesNames, setSpeciesNames] = useState([])

  useEffect(() => {
    async function getSpeciesNameById(id) {
      const result = await firestore()
        .collection(CollectionNames.Species)
        .doc(id)
        .get()
      return result.get(SpeciesFieldNames.singularName)
    }

    async function main() {
      const results = await Promise.all(
        species.map(async item => {
          if (isRef(item)) {
            return getSpeciesNameById(item.ref.id)
          }
          return Promise.resolve(item)
        })
      )

      setSpeciesNames(results)
    }

    main()
  }, [stringify(species)])

  if (!species.length) {
    return 'All Species'
  }

  return speciesNames.join(', ')
}
