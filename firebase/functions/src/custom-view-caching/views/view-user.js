const {
  CollectionNames,
  UserFieldNames,
  ProfileFieldNames,
  AssetFieldNames,
  Operators,
  CommentFieldNames,
  OrderDirections,
  EndorsementFieldNames,
  AuthorFieldNames,
  AwardsForUsersFieldNames,
} = require('../../firebase')
const {
  map: mapAssetResultsItem,
  wherePublic,
} = require('../entities/asset-results-item')
const { map: mapAuthorResultsItem } = require('../entities/author-results-item')
const { map: mapCommenter } = require('../entities/comment')

const getDefinition = (isAdult) => ({
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
        awardIds: ({ ref }) => ({
          collectionName: CollectionNames.AwardsForUsers,
          id: ref.id,
          map: (item) => ({
            [AwardsForUsersFieldNames.awards]:
              item[AwardsForUsersFieldNames.awards],
          }),
        }),
        authors: ({ ref }) => ({
          collectionName: CollectionNames.Authors,
          where: [
            [
              AuthorFieldNames.ownedBy,
              Operators.EQUALS,
              [CollectionNames.Users, ref.id],
            ],
            [AuthorFieldNames.isDeleted, Operators.EQUALS, false],
          ],
          map: mapAuthorResultsItem,
        }),
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
        mostRecentEndorsements: ({ ref }) => ({
          collectionName: CollectionNames.Endorsements,
          where: [
            [
              EndorsementFieldNames.createdBy,
              Operators.EQUALS,
              [CollectionNames.Users, ref.id],
            ],
          ],
          limit: 10,
          join: ({ item }) => ({
            collectionName: CollectionNames.Assets,
            id: item ? item[EndorsementFieldNames.asset].id : null,
            map: mapAssetResultsItem,
          }),
        }),
        mostRecentAssets: ({ ref }) => ({
          collectionName: CollectionNames.Assets,
          where: [
            [
              AssetFieldNames.createdBy,
              Operators.EQUALS,
              [CollectionNames.Users, ref.id],
            ],
            [AssetFieldNames.isAdult, Operators.EQUALS, isAdult],
          ].concat(wherePublic),
          limit: 10,
          map: mapAssetResultsItem,
        }),
      },
    },
  ],
})

module.exports['view-user_{id}_sfw'] = getDefinition(false)
module.exports['view-user_{id}_nsfw'] = getDefinition(true)
