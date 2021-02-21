import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useAlgoliaSearch from '../../hooks/useAlgoliaSearch'
import TextInput from '../text-input'
import Button from '../button'

const useStyles = makeStyles({
  textInput: {
    width: '100%'
  },
  row: {
    marginTop: '1rem'
  },
  assets: {
    display: 'flex'
  }
})

function SearchForm({
  indexName,
  searchTerm,
  fieldAsLabel,
  onClickWithIdAndDetails
}) {
  const [isSearching, isErrored, results] = useAlgoliaSearch(
    indexName,
    searchTerm
  )

  if (isSearching) {
    return 'Searching...'
  }

  if (isErrored) {
    return 'Errored'
  }

  if (!results) {
    return null
  }

  if (!results.length) {
    return 'No results!'
  }

  return (
    <>
      Select a result:
      <br />
      {results.map(result => (
        <Button
          key={result.id}
          onClick={() => onClickWithIdAndDetails(result.id, result)}
          color="default">
          {result[fieldAsLabel]}
        </Button>
      ))}
    </>
  )
}

export default ({ indexName, fieldAsLabel, onDone }) => {
  const [searchTerm, setSearchTerm] = useState(null)
  const classes = useStyles()

  return (
    <>
      <div className={classes.row}>
        {searchTerm && (
          <>
            <SearchForm
              indexName={indexName}
              searchTerm={searchTerm}
              fieldAsLabel={fieldAsLabel}
              onClickWithIdAndDetails={onDone}
            />
          </>
        )}
      </div>

      <div className={classes.row}>
        Search:
        <TextInput
          onChange={e => setSearchTerm(e.target.value)}
          value={searchTerm}
          variant="filled"
          className={classes.textInput}
        />
      </div>
    </>
  )
}
