import React, { createContext, useContext, memo } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import Typography from '@material-ui/core/Typography'
import LazyLoad from 'react-lazyload'

import Heading from '../../components/heading'
import AllTagsBrowser from '../../components/all-tags-browser'
import Button from '../../components/button'
import FormattedDate from '../../components/formatted-date'
import Polls from '../../components/polls'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import useSearchTerm from '../../hooks/useSearchTerm'
import useDatabaseQuery, {
  CollectionNames,
  specialCollectionIds,
  AssetCategories,
  AssetFieldNames,
  mapDates
} from '../../hooks/useDatabaseQuery'
import { isAbsoluteUrl } from '../../utils'

import placeholderUrl from './assets/placeholder.webp'
import discordTileBgUrl from './assets/discord.webp'
import patreonTileBgUrl from './assets/patreon.webp'
import statsTileBgUrl from './assets/stats.webp'
import twitterTileBgUrl from './assets/twitter.webp'
import avatarsTileBgUrl from './assets/avatars.webp'
import accessoriesTileBgUrl from './assets/accessories.webp'
import { DISCORD_URL, TWITTER_URL } from '../../config'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'

const useStyles = makeStyles({
  tiles: {
    margin: '0 auto',
    maxWidth: '1000px',
    display: 'flex',
    flexWrap: 'wrap'
  },
  tile: {
    position: 'relative',
    width: '33.3%',
    minHeight: '10rem',
    backgroundSize: 'cover',
    padding: '0.75rem',
    '& a': {
      color: 'inherit'
    },
    [mediaQueryForTabletsOrBelow]: {
      width: '100%',
      padding: '0.5rem'
    }
  },
  double: {
    width: '50%',
    [mediaQueryForTabletsOrBelow]: {
      width: '100%'
    }
  },
  card: {
    position: 'relative',
    background: '#000',
    '&:hover $content': {
      transform: 'translateY(50%)'
    },
    '&:hover $media': {
      opacity: 1
    }
  },
  media: {
    opacity: 0.7,
    transition: 'all 100ms',
    '& img': {
      width: '100%',
      display: 'block'
    }
  },
  cardActions: {
    position: 'absolute',
    bottom: 0,
    left: 0
  },
  metaText: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    margin: '0.5rem',
    fontSize: '75%',
    opacity: '0.5',
    transition: 'all 200ms'
  },
  fakeImage: {
    width: '300px',
    height: '300px'
  },
  statValue: {
    fontSize: '175%'
  },
  content: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    padding: '1rem',
    background: 'rgba(0, 0, 0, 0.7)',
    transition: 'all 100ms'
  },
  desc: {
    padding: '0.25rem 0 0.5rem',
    lineHeight: 1.5
  },
  assetTitle: {
    fontSize: '125%',
    margin: '1rem 0 0.5rem'
  },
  actions: {
    textAlign: 'right',
    marginTop: '0.5rem'
  }
})

const analyticsCategoryName = 'Home'

function TileDesc({ children }) {
  const classes = useStyles()
  return <div className={classes.desc}>{children}</div>
}

function Asset({ asset }) {
  const classes = useStyles()
  return (
    <div>
      <div className={classes.assetTitle}>{asset[AssetFieldNames.title]}</div>
      <div>
        {asset.authorName
          ? `by ${asset.authorName}`
          : asset.createdByName
          ? `uploaded by ${asset.createdByName}`
          : null}
      </div>
    </div>
  )
}

function Tile({
  name,
  title,
  description,
  actionLabel,
  url,
  actionUrl,
  imageUrl,
  children,
  metaText,
  double = false
}) {
  const classes = useStyles()

  const onClick = () => {
    trackAction(analyticsCategoryName, 'Click home tile', name)
  }

  const LinkOrAnchor = ({ children }) =>
    isAbsoluteUrl(url) ? (
      <a href={url} onClick={onClick}>
        {children}
      </a>
    ) : url ? (
      <Link to={url} onClick={onClick}>
        {children}
      </Link>
    ) : (
      <>{children}</>
    )

  return (
    <LazyLoad>
      <div className={`${classes.tile} ${double ? classes.double : ''}`}>
        <Card className={classes.card}>
          <CardActionArea
            className={classes.contentsWrapper}
            component="div"
            onClick={onClick}>
            <LinkOrAnchor>
              {!double && (
                <div className={classes.media}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={`Thumbnail for tile`}
                      className={classes.thumbnail}
                    />
                  ) : (
                    <img
                      alt="Placeholder"
                      src={placeholderUrl}
                      className={classes.thumbnail}
                    />
                  )}
                </div>
              )}
              <div className={classes.content}>
                <Typography variant="h5" component="h2">
                  {title}
                </Typography>
                {description && <TileDesc>{description}</TileDesc>}
                {children}
                {actionLabel && (
                  <div className={classes.actions}>
                    <Button
                      size="small"
                      color="primary"
                      // note: no URL is provided here because entire tile is clickable and produces nest anchor warnings
                      onClick={() =>
                        trackAction(
                          analyticsCategoryName,
                          'Click home tile button',
                          name
                        )
                      }>
                      {actionLabel}
                    </Button>
                  </div>
                )}
                {/* {metaText && <div className={classes.metaText}>{metaText}</div>} */}
              </div>
            </LinkOrAnchor>
          </CardActionArea>
        </Card>
      </div>
    </LazyLoad>
  )
}

function AvatarsTile() {
  const url = routes.viewCategoryWithVar.replace(
    ':categoryName',
    AssetCategories.avatar
  )
  return (
    <Tile
      name="avatars"
      title="Browse Avatars"
      imageUrl={avatarsTileBgUrl}
      url={url}
      actionLabel="Browse"
      actionUrl={url}
      description="Find your next avatar in our collection of over 200 avatars for VRChat."
    />
  )
}

function AccessoriesTile() {
  const url = routes.viewCategoryWithVar.replace(
    ':categoryName',
    AssetCategories.accessory
  )
  return (
    <Tile
      name="accessories"
      title="Browse Accessories"
      imageUrl={accessoriesTileBgUrl}
      url={url}
      actionLabel="Browse"
      actionUrl={url}
      description="Customize your VRChat avatar with one of many accessories."
    />
  )
}

function MostRecentAvatarTile() {
  const result = useHomepage()

  const {
    assets: { mostRecentAvatar }
  } = result || { assets: {} }

  if (!mostRecentAvatar) {
    return <LoadingTile />
  }

  const { id, thumbnailUrl, createdAt } = mapDates(mostRecentAvatar)
  const url = routes.viewAssetWithVar.replace(':assetId', id)

  return (
    <Tile
      name="recent-avatars"
      title="Most Recent Avatar"
      imageUrl={thumbnailUrl}
      url={url}
      actionLabel="View Avatar"
      actionUrl={url}
      metaText={<FormattedDate date={createdAt} />}>
      <Asset asset={mostRecentAvatar} />
    </Tile>
  )
}

function MostRecentAccessoryTile() {
  const result = useHomepage()

  const {
    assets: { mostRecentAccessory }
  } = result || { assets: {} }

  if (!mostRecentAccessory) {
    return <LoadingTile />
  }

  const { id, thumbnailUrl, createdAt } = mapDates(mostRecentAccessory)
  const url = routes.viewAssetWithVar.replace(':assetId', id)

  return (
    <Tile
      name="accessories"
      title="Most Recent Accessory"
      imageUrl={thumbnailUrl}
      url={url}
      actionLabel="View This"
      actionUrl={url}
      metaText={<FormattedDate date={createdAt} />}>
      <Asset asset={mostRecentAccessory} />
    </Tile>
  )
}

function FeaturedAssetTile() {
  const [, , result] = useDatabaseQuery(
    CollectionNames.Special,
    specialCollectionIds.featuredAssets
  )

  if (!result || !result.activeAsset) {
    return <LoadingTile />
  }

  const { thumbnailUrl } = result.activeAsset
  const id = result.activeAsset.asset.id

  return (
    <Tile
      name="featured-asset"
      title="Featured asset"
      imageUrl={thumbnailUrl}
      url={routes.viewAssetWithVar.replace(':assetId', id)}
      actionLabel="View Asset"
      actionUrl={routes.viewAssetWithVar.replace(':assetId', id)}
      // metaText={<FormattedDate date={createdAt} />}
    >
      <Asset asset={result.activeAsset} />
    </Tile>
  )
}

function LoadingTile() {
  return <Tile title="Loading..." />
}

function MostRecentNewsTile() {
  const result = useHomepage()

  const {
    assets: { mostRecentArticle }
  } = result || { assets: {} }

  if (!mostRecentArticle) {
    return <LoadingTile />
  }

  const { id, title, thumbnailUrl, createdAt } = mapDates(mostRecentArticle)
  const url = routes.viewAssetWithVar.replace(':assetId', id)

  return (
    <Tile
      name="news"
      title="News"
      url={url}
      imageUrl={thumbnailUrl}
      actionLabel="Read News"
      actionUrl={routes.news}
      metaText={<FormattedDate date={createdAt} />}
      description={title}
    />
  )
}

function PatreonTile() {
  const result = useHomepage()
  const classes = useStyles()

  const {
    patreon: { numConnectedToPatreon }
    // lastUpdatedAt
  } = result || {
    patreon: {
      numConnectedToPatreon: '-'
    }
  }

  return (
    <Tile
      name="patreon"
      title="Patreon"
      actionLabel="Learn more"
      url={routes.patreon}
      imageUrl={patreonTileBgUrl}
      // metaText={result && <FormattedDate date={lastUpdatedAt} />}
      description="Support our site and get access to unique Patreon-only features.">
      <div className={classes.stat}>
        <span className={classes.statValue}>{numConnectedToPatreon}</span> users
        have connected their account to Patreon
      </div>
    </Tile>
  )
}

function DiscordTile() {
  return (
    <Tile
      name="discord"
      title="Discord"
      actionLabel="Join Discord"
      url={DISCORD_URL}
      imageUrl={discordTileBgUrl}
      description="
        Join our Discord server for news, feedback, bug reporting and
        notifications."
    />
  )
}

function TwitterTile() {
  return (
    <Tile
      name="twitter"
      title="Twitter"
      actionLabel="Visit Twitter"
      url={TWITTER_URL}
      imageUrl={twitterTileBgUrl}
      description="Follow us on Twitter for news about the site and new tweets when an
        asset is published."
    />
  )
}

function SiteStatsTile() {
  const result = useHomepage()
  const classes = useStyles()

  const {
    siteStats: { numAssets, numAvatars, numAccessories, numUsers },
    lastUpdatedAt
  } = result || {
    siteStats: {
      numAssets: '-',
      numAvatars: '-',
      numAccessories: '-',
      numUsers: '-'
    }
  }

  return (
    <Tile
      name="site-stats"
      title="Stats"
      imageUrl={statsTileBgUrl}
      metaText={result && <FormattedDate date={lastUpdatedAt} />}>
      <>
        <div className={classes.stat}>
          <span className={classes.statValue}>{numAssets}</span> assets
        </div>
        <div className={classes.stat}>
          <span className={classes.statValue}>{numAvatars}</span> avatars
        </div>
        <div className={classes.stat}>
          <span className={classes.statValue}>{numAccessories}</span>{' '}
          accessories
        </div>
        <div className={classes.stat}>
          <span className={classes.statValue}>{numUsers}</span> users
        </div>
      </>
    </Tile>
  )
}

const PollTile = memo(() => {
  return (
    <Tile name="poll" title="Poll" double>
      <Polls />
    </Tile>
  )
})

const homepageContext = createContext(null)
const useHomepage = () => useContext(homepageContext)

function Tiles() {
  const [, , result] = useDatabaseQuery(
    CollectionNames.Special,
    specialCollectionIds.homepage
  )
  const classes = useStyles()

  return (
    <homepageContext.Provider value={result}>
      <div className={classes.root}>
        <div className={classes.tiles}>
          <AvatarsTile />
          <AccessoriesTile />
          <FeaturedAssetTile />
          <MostRecentNewsTile />
          <MostRecentAvatarTile />
          <MostRecentAccessoryTile />
          <PatreonTile />
          <DiscordTile />
          <TwitterTile />
          <SiteStatsTile />
          <PollTile />
        </div>
      </div>
    </homepageContext.Provider>
  )
}

export default () => {
  const searchTerm = useSearchTerm()

  if (searchTerm) {
    return null
  }

  return (
    <>
      <Tiles />
      <Heading variant="h2">Tags</Heading>
      <AllTagsBrowser lazyLoad />
    </>
  )
}
