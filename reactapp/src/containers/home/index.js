import React, { createContext, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import CardActions from '@material-ui/core/CardActions'
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
  Operators,
  OrderDirections,
  AuthorFieldNames,
  UserFieldNames,
  formatRawDoc
} from '../../hooks/useDatabaseQuery'
import { isAbsoluteUrl } from '../../utils'

import placeholderUrl from './assets/placeholder.webp'
import discordTileBgUrl from './assets/discord.webp'
import patreonTileBgUrl from './assets/patreon.webp'
import statsTileBgUrl from './assets/stats.webp'
import twitterTileBgUrl from './assets/twitter.webp'
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
    width: '25%',
    minHeight: '10rem',
    backgroundSize: 'cover',
    padding: '0.75rem',
    '& a': {
      color: 'inherit'
    },
    [mediaQueryForTabletsOrBelow]: {
      width: '50%',
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
    position: 'relative'
  },
  media: {
    '& img': {
      width: '100%'
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
    transition: 'all 200ms',
    '&:hover': {
      opacity: 1
    }
  },
  fakeImage: {
    width: '300px',
    height: '300px'
  },
  statValue: {
    fontSize: '200%'
  },
  content: {
    minHeight: '200px'
  },
  desc: {
    padding: '0.25rem 0 0.5rem',
    lineHeight: 1.5
  },
  assetTitle: {
    fontSize: '125%',
    margin: '1rem 0 0.5rem'
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
        {asset[AssetFieldNames.author]
          ? `by ${asset[AssetFieldNames.author][AuthorFieldNames.name]}`
          : `uploaded by ${
              asset[AssetFieldNames.createdBy][UserFieldNames.username]
            }`}
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
  double = false,
  image: Image
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
    ) : (
      <Link to={url} onClick={onClick}>
        {children}
      </Link>
    )

  return (
    <LazyLoad>
      <div className={`${classes.tile} ${double ? classes.double : ''}`}>
        <Card className={classes.card}>
          <CardActionArea className={classes.contentsWrapper} onClick={onClick}>
            <LinkOrAnchor>
              <div className={classes.media}>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`Thumbnail for tile`}
                    className={classes.thumbnail}
                  />
                ) : Image ? (
                  Image
                ) : (
                  <img
                    alt="Placeholder"
                    src={placeholderUrl}
                    className={classes.thumbnail}
                  />
                )}
              </div>
              <CardContent className={classes.content}>
                <Typography variant="h5" component="h2">
                  {title}
                </Typography>
                {description && <TileDesc>{description}</TileDesc>}
                {children}
              </CardContent>
            </LinkOrAnchor>
          </CardActionArea>
          <CardActions className={classes.cardActions}>
            {actionLabel && (
              <Button
                size="small"
                color="default"
                url={actionUrl || url}
                onClick={() =>
                  trackAction(
                    analyticsCategoryName,
                    'Click home tile button',
                    name
                  )
                }>
                {actionLabel}
              </Button>
            )}
          </CardActions>
          {metaText && <div className={classes.metaText}>{metaText}</div>}
        </Card>
      </div>
    </LazyLoad>
  )
}

function MostRecentAvatarTile() {
  const [isLoading, , result] = useDatabaseQuery(
    CollectionNames.Assets,
    [
      [AssetFieldNames.category, Operators.EQUALS, AssetCategories.avatar],
      [AssetFieldNames.isApproved, Operators.EQUALS, true],
      [AssetFieldNames.isPrivate, Operators.EQUALS, false],
      [AssetFieldNames.isAdult, Operators.EQUALS, false],
      [AssetFieldNames.isDeleted, Operators.EQUALS, false]
    ],
    1,
    [AssetFieldNames.createdAt, OrderDirections.DESC],
    false,
    undefined,
    true
  )

  if (isLoading || !result || !result.length) {
    return <LoadingTile />
  }

  const { id, thumbnailUrl, createdAt } = result[0]

  return (
    <Tile
      name="avatars"
      title="Browse Avatars"
      imageUrl={thumbnailUrl}
      url={routes.viewCategoryWithVar.replace(
        ':categoryName',
        AssetCategories.avatar
      )}
      actionLabel="View This"
      actionUrl={routes.viewAssetWithVar.replace(':assetId', id)}
      metaText={<FormattedDate date={createdAt} />}>
      <Asset asset={result[0]} />
    </Tile>
  )
}

function MostRecentAccessoryTile() {
  const [isLoading, , result] = useDatabaseQuery(
    CollectionNames.Assets,
    [
      [AssetFieldNames.category, Operators.EQUALS, AssetCategories.accessory],
      [AssetFieldNames.isApproved, Operators.EQUALS, true],
      [AssetFieldNames.isPrivate, Operators.EQUALS, false],
      [AssetFieldNames.isAdult, Operators.EQUALS, false],
      [AssetFieldNames.isDeleted, Operators.EQUALS, false]
    ],
    1,
    [AssetFieldNames.createdAt, OrderDirections.DESC],
    false,
    undefined,
    true
  )

  if (isLoading || !result || !result.length) {
    return <LoadingTile />
  }

  const { id, thumbnailUrl, createdAt } = result[0]

  return (
    <Tile
      name="accessories"
      title="Browse Accessories"
      imageUrl={thumbnailUrl}
      url={routes.viewCategoryWithVar.replace(
        ':categoryName',
        AssetCategories.accessory
      )}
      actionLabel="View This"
      actionUrl={routes.viewAssetWithVar.replace(':assetId', id)}
      metaText={<FormattedDate date={createdAt} />}>
      <Asset asset={result[0]} />
    </Tile>
  )
}

function FeaturedAssetTile() {
  const [, , result] = useDatabaseQuery(
    CollectionNames.Special,
    specialCollectionIds.featuredAssets
  )
  const [completeAsset, setCompleteAsset] = useState(null)

  useEffect(() => {
    if (!result || !result.activeAsset) {
      return
    }

    async function main() {
      const assetDoc = await result.activeAsset.asset.get()

      // dirty until I get the time to update what the function caches
      const formattedResult = await formatRawDoc(assetDoc, true, true)
      setCompleteAsset(formattedResult)
    }

    main()
  }, [result === null])

  if (!result || !result.activeAsset || !completeAsset) {
    return <LoadingTile />
  }

  const { title, thumbnailUrl, author } = completeAsset
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
      <Asset
        asset={{
          title,
          author
        }}
      />
    </Tile>
  )
}

function LoadingTile() {
  return <Tile title="Loading..." />
}

function MostRecentNewsTile() {
  const [isLoading, , result] = useDatabaseQuery(
    CollectionNames.Assets,
    [
      [AssetFieldNames.category, Operators.EQUALS, AssetCategories.article],
      [AssetFieldNames.isApproved, Operators.EQUALS, true],
      [AssetFieldNames.isPrivate, Operators.EQUALS, false],
      [AssetFieldNames.isAdult, Operators.EQUALS, false],
      [AssetFieldNames.isDeleted, Operators.EQUALS, false]
    ],
    1,
    [AssetFieldNames.createdAt, OrderDirections.DESC]
  )

  if (isLoading || !result || !result.length) {
    return <LoadingTile />
  }

  const { id, title, thumbnailUrl, createdAt } = result[0]

  return (
    <Tile
      name="news"
      title="News"
      url={routes.viewAssetWithVar.replace(':assetId', id)}
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

function PollTile() {
  return (
    <Tile name="poll" title="Poll" image={<Polls />} double>
      Vote in the poll above.
    </Tile>
  )
}

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
          <MostRecentAvatarTile />
          <MostRecentAccessoryTile />
          <FeaturedAssetTile />
          <MostRecentNewsTile />
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
