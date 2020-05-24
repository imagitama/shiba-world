import React from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import Markdown from 'react-markdown'
import { Helmet } from 'react-helmet'
import useUserRecord from '../../hooks/useUserRecord'
import LoadingIndicator from '../../components/loading-indicator'
import AssetResults from '../../components/asset-results'
import speciesMeta from '../../species-meta'
import ErrorMessage from '../../components/error-message'
import tags from '../../tags'
import useDatabaseQuery, {
  Operators,
  CollectionNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'
import Heading from '../../components/heading'
import TagChip from '../../components/tag-chip'

const useStyles = makeStyles({
  root: {
    padding: '1rem'
  }
})

function getTitleTextForTagName(tagName) {
  if (!tagName) {
    return 'Assets'
  }
  if (tagName === tags.tutorial) {
    return 'Tutorials'
  }
  if (speciesMeta[tagName]) {
    return speciesMeta[tagName].name
  }
  return 'Browse'
}

function Title({ tagName }) {
  return <Heading variant="h1">{getTitleTextForTagName(tagName)}</Heading>
}

function Description({ tagName }) {
  const classes = useStyles()
  if (!tagName || !speciesMeta[tagName]) {
    return null
  }
  return (
    <Paper className={classes.root}>
      <Markdown>{speciesMeta[tagName].description}</Markdown>
    </Paper>
  )
}

function Tutorials({ tutorials }) {
  return (
    <>
      <Heading variant="h2">Tutorials</Heading>
      {tutorials.length ? <AssetResults assets={tutorials} /> : 'None found :('}
    </>
  )
}

function splitResultsIntoFilesAndTutorials(results) {
  return results.reduce(
    (newObj, asset) => {
      const isTutorial = asset.tags.includes(tags.tutorial)
      return {
        files: isTutorial ? newObj.files : newObj.files.concat(asset),
        tutorials: isTutorial
          ? newObj.tutorials.concat(asset)
          : newObj.tutorials
      }
    },
    { files: [], tutorials: [] }
  )
}

function TagBrowser({ assets, filterOutTag }) {
  return (
    <>
      <Heading variant="h2">Popular Tags</Heading>
      {!assets.length && 'None'}
      {assets
        .reduce((allTags, { tags }) => allTags.concat(tags), [])
        .sort()
        .filter(
          (tagName, idx, self) =>
            tagName !== filterOutTag && self.indexOf(tagName) === idx
        )
        .map(tagName => (
          <TagChip key={tagName} tagName={tagName} />
        ))}
    </>
  )
}

export default ({
  match: {
    params: { tagName }
  }
}) => {
  const [, , user] = useUserRecord()

  let whereClauses = [
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isAdult, Operators.EQUALS, false]
  ]

  // NSFW content is super risky and firebase doesnt have a != operator
  // so default to adult content just to be sure
  if (user && user.enabledAdultContent === true) {
    whereClauses = whereClauses.filter(
      ([fieldName]) => fieldName !== AssetFieldNames.isAdult
    )
  }

  if (tagName) {
    whereClauses.push([AssetFieldNames.tags, Operators.ARRAY_CONTAINS, tagName])
  }

  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Assets,
    whereClauses.length ? whereClauses : undefined
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get assets by tag {tagName}</ErrorMessage>
  }

  const splitResultsUp = tagName && tagName !== tags.tutorial

  const { files, tutorials } = splitResultsIntoFilesAndTutorials(results)

  return (
    <>
      {tagName && tagName === tags.tutorial && (
        <Helmet>
          <title>
            Browse tutorials and guides for working in Unity, Substance Painter,
            Blender and more | VRChat
          </title>
          <meta
            name="description"
            content="This is a list of all of the tutorials and guides created by other users. Read them to learn about how to do things in Unity, Substance Painter, Blender and other kinds of software."
          />
        </Helmet>
      )}
      <Title tagName={tagName} />
      <Description tagName={tagName} />
      <TagBrowser assets={results} />
      <Heading variant="h2">Results</Heading>
      {!results.length && <ErrorMessage>None found</ErrorMessage>}
      {!splitResultsUp && <AssetResults assets={results} />}
      {splitResultsUp && <AssetResults assets={files} />}
      {splitResultsUp && <Tutorials tutorials={tutorials} />}
    </>
  )
}
