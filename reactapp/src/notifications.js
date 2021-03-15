export const NotificationEvents = {
  ASSET_APPROVED: 'ASSET_APPROVED',
  ASSET_DELETED: 'ASSET_DELETED',
  ASSET_AMENDED: 'ASSET_AMENDED',
  COMMENT_ON_ASSET: 'COMMENT_ON_ASSET',
  COMMENT_ON_USER: 'COMMENT_ON_USER',
  TAGGED_IN_COMMENT: 'TAGGED_IN_COMMENT',
  ASSET_NEEDS_APPROVAL: 'ASSET_NEEDS_APPROVAL'
}

export const NotificationMethods = {
  WEB: 'WEB',
  EMAIL: 'EMAIL',
  DISCORD: 'DISCORD'
}

export const defaultNotificationPrefs = {
  events: {
    [NotificationEvents.ASSET_APPROVED]: true,
    [NotificationEvents.ASSET_DELETED]: true,
    [NotificationEvents.ASSET_AMENDED]: true,
    [NotificationEvents.COMMENT_ON_ASSET]: true,
    [NotificationEvents.COMMENT_ON_USER]: true,
    [NotificationEvents.TAGGED_IN_COMMENT]: true,
    // editors only
    [NotificationEvents.ASSET_NEEDS_APPROVAL]: true
  },
  methods: {
    [NotificationMethods.WEB]: true,
    [NotificationMethods.EMAIL]: true,
    [NotificationMethods.DISCORD]: true
  }
}
