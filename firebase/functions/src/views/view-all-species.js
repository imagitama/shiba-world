const { CollectionNames, SpeciesFieldNames } = require('../firebase')
const { basicTest } = require('./mappers')

module.exports['view-all-species_pluralName_desc'] = {
  sources: [
    {
      collectionName: CollectionNames.Species,
      map: (item) => ({
        [SpeciesFieldNames.thumbnailUrl]: item[SpeciesFieldNames.thumbnailUrl],
        [SpeciesFieldNames.pluralName]: item[SpeciesFieldNames.pluralName],
        [SpeciesFieldNames.singularName]: item[SpeciesFieldNames.singularName],
        [SpeciesFieldNames.shortDescription]:
          item[SpeciesFieldNames.shortDescription],
      }),
      test: basicTest,
    },
  ],
}
