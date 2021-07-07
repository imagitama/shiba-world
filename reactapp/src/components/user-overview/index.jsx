import React, { createContext, useContext } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  CollectionNames,
  UserFieldNames,
  mapDates
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Heading from '../heading'
import AssetResults from '../asset-results'
import Message from '../message'
import CommentList from '../comment-list'
import AddCommentForm from '../add-comment-form'
import SocialMediaList from '../social-media-list'
import Button from '../button'
import AuthorResults from '../author-results'
import Avatar from '../avatar'
import Markdown from '../markdown'
import Award from '../award'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import { canEditUsers } from '../../permissions'

const UserContext = createContext()
const useUser = () => useContext(UserContext)

const useStyles = makeStyles({
  awards: {
    display: 'flex'
  }
})

function Comments() {
  const {
    user: { comments }
  } = useUser()

  return <CommentList comments={comments.map(mapDates)} />
}

function Profile() {
  const { user } = useUser()

  return <SocialMediaList socialMedia={user} />
}

function Endorsements() {
  const {
    user: { mostRecentEndorsements }
  } = useUser()

  return <AssetResults assets={mostRecentEndorsements.map(mapDates)} />
}

function Authors() {
  const {
    user: { authors }
  } = useUser()

  return <AuthorResults authors={authors.map(mapDates)} />
}

function MostRecentAssets() {
  const {
    user: { mostRecentAssets }
  } = useUser()

  return <AssetResults assets={mostRecentAssets.map(mapDates)} />
}

function Awards() {
  const {
    user: {
      awardIds: { awards: awardIds }
    }
  } = useUser()
  const classes = useStyles()

  return (
    <div className={classes.awards}>
      {awardIds.map(awardId => (
        <Award key={awardId} awardId={awardId} />
      ))}
    </div>
  )
}

export default ({ userId }) => {
  const [, , currentUser] = useUserRecord()
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const [isLoadingUser, isErroredLoadingUser, cacheResult] = useDatabaseQuery(
    'viewCache',
    `view-user_${userId}_${isAdultContentEnabled ? 'nsfw' : 'sfw'}`
  )
  const classes = useStyles()

  if (isLoadingUser) {
    return <LoadingIndicator />
  }

  // Profiles are optional and do not exist until they "set it up" so null check here
  if (isErroredLoadingUser || !cacheResult) {
    return <ErrorMessage>Failed to load their profile</ErrorMessage>
  }

  const {
    [UserFieldNames.username]: username = '',
    [UserFieldNames.avatarUrl]: avatarUrl,
    [UserFieldNames.isBanned]: isBanned,
    [UserFieldNames.isEditor]: isEditor,
    [UserFieldNames.isAdmin]: isAdmin
  } = cacheResult

  if (!username) {
    return <ErrorMessage>User does not appear to exist</ErrorMessage>
  }

  return (
    <UserContext.Provider value={{ user: cacheResult }}>
      <Helmet>
        <title>View user {username} | VRCArena</title>
        <meta
          name="description"
          content={`Browse all of the accessories, animations, avatars, news articles, tutorials and more uploaded by ${username}`}
        />
      </Helmet>
      <Avatar username={username} url={avatarUrl} />
      <Heading
        variant="h1"
        className={`${classes.username} ${isBanned ? classes.isBanned : ''}`}>
        <Link to={routes.viewUserWithVar.replace(':userId', userId)}>
          {username}
        </Link>{' '}
        <Awards />
      </Heading>
      {canEditUsers(currentUser) && (
        <Button url={routes.editUserWithVar.replace(':userId', userId)}>
          Edit User
        </Button>
      )}
      {/* {isStaffMember(user) && <StaffMemberMessage />} */}
      <Profile />
      <Heading variant="h2">Comments</Heading>
      <Comments />
      <AddCommentForm
        collectionName={CollectionNames.Users}
        parentId={userId}
        onAddClick={() =>
          trackAction('ViewUser', 'Click add comment button', { userId })
        }
      />
      <Heading variant="h2">Authors</Heading>
      <p>
        Anyone who has signed up can have multiple authors associated with them.
      </p>
      <Authors />
      <Heading variant="h2">Most Recent Endorsements</Heading>
      <Endorsements />
      <Heading variant="h2">Most Recent Uploads</Heading>
      <MostRecentAssets />
    </UserContext.Provider>
  )
}
