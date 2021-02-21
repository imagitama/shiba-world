import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  options
} from '../../hooks/useDatabaseQuery'
import { setBannerUrls as setBannerUrlsAction } from '../../modules/app'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import Button from '../../components/button'
import AssetThumbnail from '../../components/asset-thumbnail'
import * as routes from '../../routes'

const useStyles = makeStyles({
  thumbnail: {
    marginTop: '1rem'
  }
})

const getLaunchUrlFromSourceUrl = sourceUrl => {
  const worldId = sourceUrl.split('/').pop()
  // return `https://vrchat.com/home/launch?worldId=${worldId}&instanceId=0`
  return `vrchat://launch?ref=vrchat.com&id=${worldId}:0`
}

const secondsUntilLaunch = 4

const getUrlSearchParams = () =>
  new URLSearchParams(window.location.search.substr(1))

const getAvatarAssetId = () => {
  return getUrlSearchParams().get('avatarId')
}

export default ({
  match: {
    params: { assetId }
  }
}) => {
  const [isLoading, isErrored, result] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId,
    {
      [options.subscribe]: true,
      [options.populateRefs]: false,
      [options.queryName]: 'launch-world'
    }
  )
  const dispatch = useDispatch()
  const setBannerUrls = urls => dispatch(setBannerUrlsAction(urls))
  const unloadBannerOnUnmountRef = useRef(true)
  const [secondsRemaining, setSecondsRemaining] = useState(secondsUntilLaunch)
  const classes = useStyles()

  useEffect(() => {
    if (!result || !result[AssetFieldNames.bannerUrl]) {
      return
    }

    setBannerUrls({ url: result[AssetFieldNames.bannerUrl] })

    return () => {
      // if switching to edit mode do not unload
      if (unloadBannerOnUnmountRef.current) {
        setBannerUrls({ url: '' })
      }
    }
  }, [result ? result.title : null])

  useEffect(() => {
    if (!result) {
      return
    }

    setTimeout(() => {
      window.location.href = getLaunchUrlFromSourceUrl(
        result[AssetFieldNames.sourceUrl]
      )
    }, secondsUntilLaunch * 1000)

    const timerId = setInterval(() => {
      setSecondsRemaining(currentVal => {
        if (currentVal > 0) {
          return currentVal - 1
        } else {
          clearInterval(timerId)
          return 0
        }
      })
    }, 1000)
  }, [result ? result.title : null])

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored || result === null) {
    return <ErrorMessage>Failed to load asset</ErrorMessage>
  }

  const originalAvatarAssetId = getAvatarAssetId()

  return (
    <div style={{ textAlign: 'center' }}>
      <Heading variant="h1">
        Launch world "{result[AssetFieldNames.title]}"
      </Heading>
      <AssetThumbnail
        url={result[AssetFieldNames.thumbnailUrl]}
        className={classes.thumbnail}
        spin
      />
      <Heading variant="h2">
        {secondsRemaining > 0
          ? `Opening the world in your VRChat client in ${secondsRemaining} seconds...`
          : 'Opened in your VRChat client'}
      </Heading>
      <>
        <Button
          url={getLaunchUrlFromSourceUrl(result[AssetFieldNames.sourceUrl])}>
          Go Now
        </Button>{' '}
        <Button
          color="default"
          url={routes.viewAssetWithVar.replace(
            ':assetId',
            originalAvatarAssetId || assetId
          )}>
          {originalAvatarAssetId ? 'Back to Avatar' : 'Back to World'}
        </Button>
      </>
    </div>
  )
}
