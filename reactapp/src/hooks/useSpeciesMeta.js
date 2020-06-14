import speciesMeta from '../species-meta'

export default speciesName => {
  return speciesName in speciesMeta ? speciesMeta[speciesName] : false
}
