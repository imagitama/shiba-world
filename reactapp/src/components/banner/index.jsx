import React, { useState, useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/styles'
import { useSelector } from 'react-redux'
import { mediaQueryForWideDesktops } from '../../media-queries'
import { fixAccessingImagesUsingToken } from '../../utils'

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: '-5',
    width: '100%',
    height: '400px',
    textAlign: 'center',
    opacity: 1,
    transition: 'all 500ms',
    overflow: 'hidden'
  },
  image: {
    height: '100%',
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
    maskImage: 'linear-gradient(to top, transparent, #282828 500%)',
    [mediaQueryForWideDesktops]: {
      maskImage:
        'radial-gradient(ellipse at top, #282828 -200%, transparent 65%, transparent)'
    }
  },
  unloaded: {
    opacity: 0
  }
})

export default () => {
  const classes = useStyles()
  const imageRef = useRef()
  const [lastKnownBannerUrl, setLastKnownBannerUrl] = useState(null)
  const { bannerUrl, bannerFallbackUrl } = useSelector(
    ({ app: { bannerUrl, bannerFallbackUrl } }) => ({
      bannerUrl,
      bannerFallbackUrl
    })
  )
  const [isLoaded, setIsLoaded] = useState(false)
  const timeoutRef = useRef()

  useEffect(() => {
    if (!lastKnownBannerUrl) {
      return
    }

    imageRef.current.addEventListener('load', () => setIsLoaded(true))
  }, [lastKnownBannerUrl ? lastKnownBannerUrl.url : ''])

  useEffect(() => {
    setIsLoaded(false)

    timeoutRef.current = setTimeout(
      () => {
        setLastKnownBannerUrl({
          url: bannerUrl,
          fallbackUrl: bannerFallbackUrl
        })
      },
      isLoaded ? 500 : 0
    )

    return () => clearTimeout(timeoutRef.current)
  }, [bannerUrl && bannerUrl.url === lastKnownBannerUrl.url])

  if (!lastKnownBannerUrl) {
    return null
  }

  const { url, fallbackUrl } = lastKnownBannerUrl

  return (
    <div
      className={`${classes.root} ${
        isLoaded ? classes.loaded : classes.unloaded
      }`}>
      <picture>
        <source srcSet={fixAccessingImagesUsingToken(url)} type="image/webp" />
        <source
          srcSet={fixAccessingImagesUsingToken(fallbackUrl)}
          type="image/png"
        />
        <img
          src={fixAccessingImagesUsingToken(fallbackUrl)}
          alt={'Banner for the page'}
          ref={imageRef}
          className={classes.image}
        />
      </picture>
    </div>
  )
}
