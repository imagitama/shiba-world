const admin = require('firebase-admin')
const {
  db,
  CollectionNames,
  NotificationsFieldNames,
  UserFieldNames,
  Operators,
  ProfileFieldNames,
  AssetFieldNames,
  isUserDocument,
} = require('./firebase')
const siteSettings = require('./site')

// Note: Web message is not user-friendly and gets translated clientside
const getWebMessageForEvent = (eventName) => {
  switch (eventName) {
    case NotificationEvents.ASSET_APPROVED:
      return 'Approved asset'
    case NotificationEvents.ASSET_AMENDED:
      return 'Amended tags' // TODO: Rename to be generic
    case NotificationEvents.TAGGED_IN_COMMENT:
      return 'Tagged user' // TODO: Rename to be more specific to comments (can tag in asset body etc. in future)
    case NotificationEvents.COMMENT_ON_ASSET:
    case NotificationEvents.COMMENT_ON_USER:
      return 'Created comment' // TODO: Split up?
    // editors only
    case NotificationEvents.ASSET_NEEDS_APPROVAL:
      return NotificationEvents.ASSET_NEEDS_APPROVAL
    default:
      console.warn(
        `Cannot get web message for event name ${eventName}: not recognized (using Unknown)`
      )
      return eventName
  }
}

const sendWebNotification = (
  eventName,
  parentRef,
  recipientRef,
  data = null
) => {
  console.debug('Sending web notification', eventName, recipientRef.id)

  const message = getWebMessageForEvent(eventName)

  return db.collection(CollectionNames.Notifications).add({
    [NotificationsFieldNames.message]: message,
    [NotificationsFieldNames.parent]: parentRef,
    [NotificationsFieldNames.recipient]: recipientRef,
    [NotificationsFieldNames.isRead]: false,
    [NotificationsFieldNames.data]: data,
    [NotificationsFieldNames.createdAt]: new Date(),
  })
}

const getEmailSubjectForEventName = async (
  eventName,
  parentRef
  // data = null
) => {
  const parentDoc = await parentRef.get()

  switch (eventName) {
    case NotificationEvents.ASSET_NEEDS_APPROVAL:
      return `Asset "${parentDoc.get(AssetFieldNames.title)}" needs approval`
    case NotificationEvents.ASSET_APPROVED:
      return `Your asset "${parentDoc.get(
        AssetFieldNames.title
      )}" has been approved`
    case NotificationEvents.ASSET_DELETED:
      return `Your asset "${parentDoc.get(
        AssetFieldNames.title
      )}" has been rejected or deleted`
    case NotificationEvents.ASSET_AMENDED:
      return `Your asset "${parentDoc.get(
        AssetFieldNames.title
      )}" has been amended`
    case NotificationEvents.COMMENT_ON_ASSET:
      return `Someone has commented on your asset "${parentDoc.get(
        AssetFieldNames.title
      )}"`
    case NotificationEvents.COMMENT_ON_USER:
      return `Someone has commented on your user profile`
    case NotificationEvents.TAGGED_IN_COMMENT:
      return `Someone has tagged you in a comment`
    case NotificationEvents.REPORT_CREATED:
      return 'Report created'
    default:
      throw new Error(
        `Cannot get email subject for event name ${eventName}: unknown! Using default`
      )
  }
}

const appendFooterForEmailText = (text) => `${text}

<em>You can unsubscribe from these types of notifications by going to My Account / Settings / Uncheck what you want to unsubscribe from.`
const appendFooterForEmailHtml = (html) =>
  `${html}<br /><br /><em>You can unsubscribe from these types of notifications by going to <a href="${siteSettings.VRCARENA_BASE_URL}/my-account">My Account</a> / Settings / Uncheck what you want to unsubscribe from.</em>`

const sendEmailNotification = async (
  eventName,
  parentRef,
  recipientRef,
  recipientEmail,
  data = null,
  methodConfig = {}
) => {
  console.debug(
    'Sending email notification',
    eventName,
    parentRef.id,
    recipientRef.id
  )

  const result = await db.collection(CollectionNames.Mail).add({
    // BCC = blind carbon copy = others cant see it
    bcc: recipientEmail,
    message: {
      subject: await getEmailSubjectForEventName(eventName, parentRef, data),
      text: appendFooterForEmailText(methodConfig.text),
      html: appendFooterForEmailHtml(methodConfig.html),
    },
  })

  console.debug(`Inserted email doc ${result.id}`)
}

const sendDiscordNotification = async () => {
  console.warn('Discord notifications not implemented yet')
  return Promise.resolve()
}

const getTaggedNotificationRecipientByUsername = (username) => {
  return db
    .collection(CollectionNames.Users)
    .where(UserFieldNames.username, Operators.EQUALS, username)
    .get()
}

const NotificationEvents = {
  ASSET_APPROVED: 'ASSET_APPROVED',
  ASSET_DELETED: 'ASSET_DELETED',
  ASSET_AMENDED: 'ASSET_AMENDED',
  COMMENT_ON_ASSET: 'COMMENT_ON_ASSET',
  COMMENT_ON_USER: 'COMMENT_ON_USER',
  TAGGED_IN_COMMENT: 'TAGGED_IN_COMMENT',
  ASSET_NEEDS_APPROVAL: 'ASSET_NEEDS_APPROVAL',
  REPORT_CREATED: 'REPORT_CREATED',
}
module.exports.NotificationEvents = NotificationEvents

const NotificationMethods = {
  WEB: 'WEB',
  EMAIL: 'EMAIL',
  DISCORD: 'DISCORD',
}
module.exports.NotificationMethods = NotificationMethods

const getEmailTextForTagged = (isForUser, assetTitle) => `Hello from VRCArena,

Somebody has tagged you in a comment on ${
  isForUser ? 'your user profile' : `on the asset "${assetTitle}"`
}.

Regards,

VRCArena`
const getEmailHtmlForTagged = (
  isForUser,
  userId,
  assetTitle,
  assetId
) => `Hello from VRCArena,
<br /><br />
Somebody has tagged you in a comment on ${
  isForUser
    ? `<a href="${
        siteSettings.VRCARENA_BASE_URL
      }${siteSettings.routes.viewUserWithVar.replace(
        ':userId',
        userId
      )}">your profile</a>`
    : `on the asset "<a href="${
        siteSettings.VRCARENA_BASE_URL
      }${siteSettings.routes.viewAssetWithVar.replace(
        ':assetId',
        assetId
      )}">${assetTitle}</a>`
}.
<br /><br />
Regards,
<br /><br />
VRCArena`

module.exports.notifyTaggedUserIfNeeded = async (
  commentMessage,
  parentRef,
  taggerRef
) => {
  if (commentMessage[0] !== '@') {
    return Promise.resolve()
  }

  const commentMessageWithAtSymbol = commentMessage.substr(1)

  // Does NOT support username with spaces yet
  const chunks = commentMessageWithAtSymbol.split(' ')
  const username = chunks[0]

  const recipientRefs = await getTaggedNotificationRecipientByUsername(username)

  if (recipientRefs.empty || recipientRefs.docs.length !== 1) {
    return Promise.resolve()
  }

  const parentDoc = await parentRef.get()
  const hasCommentedOnUser = isUserDocument(parentDoc)
  // const originalAuthor = hasCommentedOnUser
  //   ? parentRef
  //   : parentDoc.get(AssetFieldNames.createdBy)

  const recipientRef = recipientRefs.docs[0].ref

  return sendNotification(
    NotificationEvents.TAGGED_IN_COMMENT,
    parentRef,
    recipientRef,
    {
      author: taggerRef,
    },
    {
      [NotificationMethods.EMAIL]: {
        text: getEmailTextForTagged(
          hasCommentedOnUser,
          parentDoc.get(AssetFieldNames.title)
        ),
        html: getEmailHtmlForTagged(
          hasCommentedOnUser,
          parentRef.id,
          hasCommentedOnUser ? '' : parentDoc.get(AssetFieldNames.title),
          parentRef.id
        ),
      },
    }
  )
}

const getUserSignupEmail = async (userId) => {
  const authUser = await admin.auth().getUser(userId)
  return authUser.email
}

const defaultNotificationPrefs = {
  events: {
    [NotificationEvents.ASSET_APPROVED]: true,
    [NotificationEvents.ASSET_DELETED]: true,
    [NotificationEvents.ASSET_AMENDED]: true,
    [NotificationEvents.COMMENT_ON_ASSET]: true,
    [NotificationEvents.COMMENT_ON_USER]: true,
    [NotificationEvents.TAGGED_IN_COMMENT]: true,
    // editors only
    [NotificationEvents.ASSET_NEEDS_APPROVAL]: true,
    [NotificationEvents.REPORT_CREATED]: true,
  },
  methods: {
    [NotificationMethods.WEB]: true,
    [NotificationMethods.EMAIL]: true,
    [NotificationMethods.DISCORD]: true,
  },
}

async function sendNotification(
  eventName,
  parentRef,
  recipientRef,
  data = null,
  methodConfig = {}
) {
  // load up user's profile
  // look at notificationPreferences field
  // check if they want to get the notification event
  // if so, check what methods they want to recieve it on and for each one, send it

  console.debug(`Send notification`, eventName, parentRef.id, recipientRef.id)

  const recipientProfileDoc = await db
    .collection(CollectionNames.Profiles)
    .doc(recipientRef.id)
    .get()

  const recipientNotificationPrefs =
    recipientProfileDoc.get(ProfileFieldNames.notificationPrefs) ||
    defaultNotificationPrefs

  if (recipientNotificationPrefs.events[eventName] !== true) {
    return
  }

  for (const methodName in recipientNotificationPrefs.methods) {
    let isEnabled = recipientNotificationPrefs.methods[methodName]

    console.debug(`Trying method ${methodName}: ${isEnabled ? 'YES' : 'NO'}`)

    if (!isEnabled) {
      continue
    }

    switch (methodName) {
      case NotificationMethods.WEB:
        await sendWebNotification(eventName, parentRef, recipientRef, data)
        break

      case NotificationMethods.EMAIL: {
        const recipientEmail =
          recipientProfileDoc.get(ProfileFieldNames.notificationEmail) ||
          (await getUserSignupEmail(recipientRef.id))
        await sendEmailNotification(
          eventName,
          parentRef,
          recipientRef,
          recipientEmail,
          data,
          methodConfig[NotificationMethods.EMAIL]
        )
        break
      }

      case NotificationMethods.DISCORD:
        await sendDiscordNotification(parentRef, recipientRef, data)
        break

      default:
        console.warn(`Unknown notification method: ${methodName}`)
    }
  }
}
module.exports.sendNotification = sendNotification

async function getAllEditorUserIds() {
  const { docs } = await db
    .collection(CollectionNames.Users)
    .where(UserFieldNames.isEditor, '==', true)
    .get()

  return docs.map((doc) => doc.id)
}

async function sendNotificationToAllEditors(
  notificationEvent,
  parentRef,
  data = null,
  methodConfig = {}
) {
  const editorUserIds = await getAllEditorUserIds()

  console.debug(`Found ${editorUserIds.length} editor user IDs`)

  for (const userId of editorUserIds) {
    const recipientRef = db.collection(CollectionNames.Users).doc(userId)
    await sendNotification(
      notificationEvent,
      parentRef,
      recipientRef,
      data,
      methodConfig
    )
  }
}
module.exports.sendNotificationToAllEditors = sendNotificationToAllEditors
