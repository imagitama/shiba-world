import React, { createContext, useContext } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'
import { useMediaQuery } from 'react-responsive'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

import FormattedDate from '../../components/formatted-date'
// import Polls from '../../components/polls'
import LoadingIndicator from '../../components/loading-indicator'
import AssetResultItem from '../../components/asset-results-item'
import Heading from '../../components/heading'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import useSearchTerm from '../../hooks/useSearchTerm'
import useDatabaseQuery, {
  CollectionNames,
  specialCollectionIds,
  AssetCategories,
  mapDates
} from '../../hooks/useDatabaseQuery'
import { isAbsoluteUrl } from '../../utils'

import discordTileBgUrl from './assets/discord.webp'
import patreonTileBgUrl from './assets/patreon.webp'
import statsTileBgUrl from './assets/stats.webp'
import twitterTileBgUrl from './assets/twitter.webp'
import avatarsTileBgUrl from './assets/avatars.webp'
import accessoriesTileBgUrl from './assets/accessories.webp'
import { DISCORD_URL, TWITTER_URL } from '../../config'
import {
  mediaQueryForTabletsOrBelow,
  queryForMobiles,
  mediaQueryForMobiles
} from '../../media-queries'

import FeaturedAsset from './components/featured-asset'

const useStyles = makeStyles(theme => ({
  tiles: {
    margin: '0 auto',
    maxWidth: '1000px',
    display: 'flex',
    flexWrap: 'wrap'
  },
  tile: {
    display: 'flex',
    position: 'relative',
    width: '100%',
    background: 'rgba(0,0,0,0.1)',
    marginBottom: '1rem',
    [mediaQueryForMobiles]: {
      flexWrap: 'wrap',
      marginBottom: '2rem'
    }
  },
  tileHeader: {
    marginTop: 0
  },
  tileImage: {
    width: 'auto',
    height: '200px',
    '& img': {
      height: '100%'
    },
    '@media (max-width: 480px)': {
      width: '100%',
      textAlign: 'center'
    }
  },
  tileCallToAction: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: '0.75rem',
    display: 'flex',
    alignItems: 'center'
  },
  tileContents: {
    padding: '1rem 1rem 4rem'
  },
  pollTile: {
    padding: '0.75rem',
    width: '66.6%',
    [mediaQueryForTabletsOrBelow]: {
      width: '100%'
    }
  },
  pollTileCard: {
    padding: '1rem',
    height: '100%'
  },
  card: {
    position: 'relative',
    background: '#000',
    '&:hover:not($noHover) $content': {
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
      height: 'auto',
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
  },
  cols: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  col: {
    width: '50%',
    '&:nth-child(0)': {
      paddingRight: '0.5rem'
    },
    '&:nth-child(1)': {
      paddingLeft: '0.5rem'
    },
    [mediaQueryForTabletsOrBelow]: {
      width: '100%',
      padding: '0.5rem'
    }
  }
}))

const analyticsCategoryName = 'Home'

function Asset({ asset }) {
  const isMobile = useMediaQuery({ query: queryForMobiles })
  return <AssetResultItem asset={mapDates(asset)} isLandscape={!isMobile} />
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
  double = false,
  disableHover = false
}) {
  const classes = useStyles()

  const onClick = () => {
    trackAction(analyticsCategoryName, 'Click home tile', name)
  }

  const LinkOrAnchor = ({ children, ...props }) => {
    const urlToUse = url || actionUrl
    return isAbsoluteUrl(urlToUse) ? (
      <a href={urlToUse} onClick={onClick} {...props}>
        {children}
      </a>
    ) : urlToUse ? (
      <Link to={urlToUse} onClick={onClick} {...props}>
        {children}
      </Link>
    ) : (
      <>{children}</>
    )
  }

  return (
    <LazyLoad>
      <section className={classes.tile}>
        <div className={classes.tileImage}>
          <LinkOrAnchor>
            <img src={imageUrl} alt="Tile thumbnail" />
          </LinkOrAnchor>
        </div>
        <div className={classes.tileContents}>
          <Heading variant="h2" className={classes.tileHeader}>
            <LinkOrAnchor>{title}</LinkOrAnchor>
          </Heading>
          {description}
          {children}
          {url || actionUrl ? (
            <LinkOrAnchor className={classes.tileCallToAction}>
              {actionLabel || 'Learn More'} <ChevronRightIcon />
            </LinkOrAnchor>
          ) : null}
        </div>
      </section>
    </LazyLoad>
  )
}

function AvatarsTile() {
  const result = useHomepage()

  const url = routes.viewCategoryWithVar.replace(
    ':categoryName',
    AssetCategories.avatar
  )

  const {
    assets: { mostRecentAvatar }
  } = result || { assets: {} }

  return (
    <Tile
      name="avatars"
      title="Browse Avatars"
      imageUrl={avatarsTileBgUrl}
      url={url}
      actionLabel="Browse All Avatars"
      actionUrl={url}
      description="Find your next avatar in our collection of over 200 avatars for VRChat.">
      {!mostRecentAvatar ? (
        <LoadingIndicator />
      ) : (
        <>
          <Heading variant="h3">Most Recent Avatar</Heading>
          <Asset asset={mostRecentAvatar} />
        </>
      )}
    </Tile>
  )
}

function AccessoriesTile() {
  const result = useHomepage()

  const {
    assets: { mostRecentAccessory }
  } = result || { assets: {} }

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
      actionLabel="Browse All Accessories"
      actionUrl={url}
      description="Customize your VRChat avatar with one of many accessories.">
      {!mostRecentAccessory ? (
        <LoadingIndicator />
      ) : (
        <>
          <Heading variant="h3">Most Recent Accessory</Heading>
          <Asset asset={mostRecentAccessory} />
        </>
      )}
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

// const PollTile = memo(() => {
//   const classes = useStyles()
//   return (
//     <div className={classes.pollTile}>
//       <Card className={classes.pollTileCard}>
//         <Polls />
//       </Card>
//     </div>
//   )
// })

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
      <div className={classes.cols}>
        <div className={classes.col}>
          <FeaturedAsset />
        </div>
        <div className={classes.col}>
          <div className={classes.tiles}>
            <AvatarsTile />
            <AccessoriesTile />
            <MostRecentNewsTile />
            <PatreonTile />
            <DiscordTile />
            <TwitterTile />
            <SiteStatsTile />
          </div>
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
    </>
  )
}
