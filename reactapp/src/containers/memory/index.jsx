import React, { useState, useEffect, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import useDatabaseQuery, { CollectionNames } from '../../hooks/useDatabaseQuery'
import { fixAccessingImagesUsingToken } from '../../utils'
import Button from '../../components/button'
import Heading from '../../components/heading'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', userSelect: 'none', userDrag: 'none' },
  items: {
    display: 'flex',
    flexWrap: 'wrap',
    paddingLeft: '4rem'
  },
  item: {
    width: '100px',
    height: '140px',
    position: 'relative',
    margin: '0.25rem',
    // clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)',
    transition: 'all 1s',
    '& img': {
      height: '100%',
      userSelect: 'none',
      userDrag: 'none',
      pointerEvents: 'none',
      transition: 'all 100ms'
    },
    transformStyle: 'preserve-3d',
    transform: 'rotateY(0deg)'
  },
  side: {
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: '0.5rem'
  },
  front: {
    background: '#d2d2d2',
    '&:after': {
      content: '" "',
      position: 'absolute',
      top: '0.25rem',
      left: '0.25rem',
      width: 'calc(100% - 0.5rem)',
      height: 'calc(100% - 0.5rem)',
      background: '#490000',
      borderRadius: '0.5rem'
    }
  },
  back: {
    transform: 'rotateY(180deg)',
    background: '#FFF'
  },
  inner: {
    position: 'absolute',
    top: '0.25rem',
    left: '0.25rem',
    width: 'calc(100% - 0.5rem)',
    height: 'calc(100% - 0.5rem)',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    background: '#000'
  },
  title: {
    width: '100%',
    position: 'absolute',
    bottom: '44%',
    right: '-30%',
    color: '#FFF',
    textShadow: '0 0 2px #000',
    opacity: 0,
    transition: 'all 100ms',
    transform: 'rotate(-76deg)',
    fontSize: '150%'
  },
  scored: {
    transform: 'rotateY(180deg)',
    '& $inner img': {
      opacity: '0.2'
    }
  },
  revealed: {
    transform: 'rotateY(180deg)'
  }
})

const Species = ({
  id,
  title,
  description,
  optimizedThumbnailUrl,
  onSpeciesClick = null,
  isFullWidth = false,
  isScored = false,
  isRevealed = false
}) => {
  const classes = useStyles()

  return (
    <div
      className={`${classes.item} ${isScored ? classes.scored : ''} ${
        isRevealed ? classes.revealed : ''
      }`}
      onClick={() => onSpeciesClick(id)}
      data-id={id}>
      <div className={`${classes.side} ${classes.front}`} />
      <div className={`${classes.side} ${classes.back}`}>
        <div className={classes.inner}>
          <span className={classes.title}>{title}</span>
          <img
            src={fixAccessingImagesUsingToken(optimizedThumbnailUrl)}
            alt={`Thumbnail for species ${title}`}
            className={classes.thumbnail}
            draggable="false"
          />
        </div>
      </div>
    </div>
  )
}

// https://stackoverflow.com/a/2450976/1215393
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

const delay = 1000

export default () => {
  const classes = useStyles()
  const [speciesToRender, setSpeciesToRender] = useState([])
  const [speciesIdsThatAreScored, setSpeciesIdsThatAreScored] = useState([])
  const [speciesIdsThatAreRevealed, setSpeciesIdsThatAreRevealed] = useState([])
  const [isLoading, isError, results] = useDatabaseQuery(
    CollectionNames.Summaries,
    'avatarList'
  )
  const hideRevealedCardsTimeoutRef = useRef()
  const tallyRef = useRef(0)
  const totalGamesPlayedRef = useRef(0)

  const resetSpeciesToRender = () => {
    totalGamesPlayedRef.current++

    const shuffledSpecies = shuffle(results.species)
    const speciesIdsToUse = shuffledSpecies.slice(
      0,
      totalGamesPlayedRef.current * 2
    )

    setSpeciesToRender(
      shuffle(
        speciesIdsToUse.concat(
          speciesIdsToUse.map(item => ({
            ...item,
            isBrother: true
          }))
        )
      )
    )
  }

  useEffect(() => {
    if (!results) {
      return
    }

    resetSpeciesToRender()

    return () => {
      clearTimeout(hideRevealedCardsTimeoutRef.current)
    }
  }, [results !== null])

  if (!results || !results.species || !results.species.length) return null
  if (isLoading) return 'Loading'
  if (isError) return 'Error'

  const reset = () => {
    setSpeciesIdsThatAreScored([])
    setSpeciesIdsThatAreRevealed([])

    tallyRef.current = 0

    resetSpeciesToRender()
  }

  if (
    speciesToRender.length > 0 &&
    speciesIdsThatAreScored.length === speciesToRender.length
  )
    return (
      <div>
        <Heading variant="h1">You won!</Heading>
        <p>It took you {tallyRef.current} attempts</p>
        <Button onClick={() => reset()}>Try Again</Button>
      </div>
    )

  const scoreSpeciesIds = ids => {
    console.log(`score species ids`, ids)
    setSpeciesIdsThatAreScored(currentVal => currentVal.concat(ids))
  }

  const revealSpeciesId = id => {
    console.log(`reveal species id`, id)
    setSpeciesIdsThatAreRevealed(currentVal => {
      const newVal = currentVal.concat([id])

      if (
        newVal.length === 2 &&
        newVal[0].split('_')[0] === newVal[1].split('_')[0]
      ) {
        hideRevealedCardsTimeoutRef.current = setTimeout(() => {
          scoreSpeciesIds(newVal)
        }, delay)
      }

      return newVal
    })
  }

  const onSpeciesClick = id => {
    if (hideRevealedCardsTimeoutRef.current) {
      return
    }

    // ignore scored cards
    if (speciesIdsThatAreScored.includes(id)) {
      console.log('cannot do anything with card - already scored', id)
      return false
    }

    if (speciesIdsThatAreRevealed.includes(id)) {
      console.log('already revealed')
      return
    } else {
      console.log('species is not revealed yet...', id)

      if (speciesIdsThatAreRevealed.length === 0) {
        revealSpeciesId(id)
        return
      }

      if (speciesIdsThatAreRevealed.length === 1) {
        if (!hideRevealedCardsTimeoutRef.current) {
          console.log('hiding cards after a few sec...')
          hideRevealedCardsTimeoutRef.current = setTimeout(() => {
            console.log('hide')
            hideRevealedCardsTimeoutRef.current = null
            tallyRef.current++
            setSpeciesIdsThatAreRevealed([])
          }, delay)
        }

        revealSpeciesId(id)
        return
      }

      console.log('bad length', speciesIdsThatAreRevealed.length)

      console.log('cannot reveal card - already revealed 2 cards! Just chill')
    }
  }

  return (
    <div className={classes.root}>
      #{totalGamesPlayedRef.current}
      <div className={classes.items}>
        {speciesToRender.map(
          ({ id, nameSingular, thumbnailUrl, isBrother = false }) => {
            const newId = `${id}_${isBrother ? 'brother' : 'sister'}`
            console.log(newId)
            return (
              <Species
                key={newId}
                id={newId}
                title={nameSingular}
                optimizedThumbnailUrl={thumbnailUrl}
                onSpeciesClick={onSpeciesClick}
                isScored={speciesIdsThatAreScored.includes(newId)}
                isRevealed={speciesIdsThatAreRevealed.includes(newId)}
              />
            )
          }
        )}
      </div>
    </div>
  )
}
