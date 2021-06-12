export const NotificationEvents = {
  ASSET_APPROVED: 'ASSET_APPROVED',
  ASSET_UNAPPROVED: 'ASSET_UNAPPROVED',
  ASSET_DELETED: 'ASSET_DELETED',
  ASSET_AMENDED: 'ASSET_AMENDED',
  COMMENT_ON_ASSET: 'COMMENT_ON_ASSET',
  COMMENT_ON_USER: 'COMMENT_ON_USER',
  TAGGED_IN_COMMENT: 'TAGGED_IN_COMMENT',
  ASSET_NEEDS_APPROVAL: 'ASSET_NEEDS_APPROVAL',
  REPORT_CREATED: 'REPORT_CREATED',
  AWARD_GIVEN: 'AWARD_GIVEN'
}

export const NotificationMethods = {
  WEB: 'WEB',
  EMAIL: 'EMAIL',
  DISCORD: 'DISCORD'
}

export const defaultNotificationPrefs = {
  events: {
    [NotificationEvents.ASSET_APPROVED]: true,
    [NotificationEvents.ASSET_UNAPPROVED]: true,
    [NotificationEvents.ASSET_DELETED]: true,
    [NotificationEvents.ASSET_AMENDED]: true,
    [NotificationEvents.COMMENT_ON_ASSET]: true,
    [NotificationEvents.COMMENT_ON_USER]: true,
    [NotificationEvents.TAGGED_IN_COMMENT]: true,
    [NotificationEvents.AWARD_GIVEN]: true,
    // editors only
    [NotificationEvents.ASSET_NEEDS_APPROVAL]: true,
    [NotificationEvents.REPORT_CREATED]: true
  },
  methods: {
    [NotificationMethods.WEB]: true,
    [NotificationMethods.EMAIL]: true,
    [NotificationMethods.DISCORD]: true
  }
}
