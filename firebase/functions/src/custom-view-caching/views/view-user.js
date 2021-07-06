const {
  CollectionNames,
  UserFieldNames,
  ProfileFieldNames,
  AssetFieldNames,
  Operators,
  CommentFieldNames,
  OrderDirections,
} = require('../../firebase')
const {
  map: mapAssetResultsItem,
  wherePublicSfw,
} = require('../entities/asset-results-item')
const { map: mapCommenter } = require('../entities/comment')

module.exports['view-user'] = {
  usePrimarySourceAsId: true,
  sources: [
    {
      debug: true,
      collectionName: CollectionNames.Users,
      map: (item) => ({
        [UserFieldNames.username]: item[UserFieldNames.username],
        [UserFieldNames.avatarUrl]: item[UserFieldNames.avatarUrl],
      }),
      test: 'basic',
      join: {
        collectionName: CollectionNames.Profiles,
        map: (item) => ({
          [ProfileFieldNames.twitchUsername]:
            item[ProfileFieldNames.twitchUsername],
        }),
        test: 'basic',
      },
      add: {
        comments: ({ ref, doc }) => ({
          collectionName: CollectionNames.Comments,
          where: [
            [
              CommentFieldNames.parent,
              Operators.EQUALS,
              doc && doc.ref.parent.id === CollectionNames.Comments
                ? doc.get(CommentFieldNames.createdBy)
                : [CollectionNames.Users, ref.id],
            ],
            [CommentFieldNames.isDeleted, Operators.EQUALS, false],
          ],
          map: (item) => ({
            [CommentFieldNames.comment]: item[CommentFieldNames.comment],
            [CommentFieldNames.createdAt]: item[CommentFieldNames.createdAt],
            [CommentFieldNames.createdBy]: item[CommentFieldNames.createdBy],
          }),
          order: [CommentFieldNames.createdAt, OrderDirections.DESC],
          merge: ({ [CommentFieldNames.createdBy]: createdBy }) => ({
            collectionName: CollectionNames.Users,
            where: createdBy,
            map: mapCommenter,
          }),
        }),
        mostRecentUploads: ({ ref }) => ({
          collectionName: CollectionNames.Assets,
          where: [[AssetFieldNames.createdBy, Operators.EQUALS, ref]].concat(
            wherePublicSfw
          ),
          limit: 10,
          map: mapAssetResultsItem,
        }),
      },
    },
  ],
}
