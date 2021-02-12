import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '../button'
import { trackAction } from '../../analytics'
import { searchFilters } from '../../config'

const useStyles = makeStyles({
  root: {
    display: 'flex'
  },
  items: {
    flex: 1,
    display: 'flex'
  },
  item: {
    marginRight: '1rem'
  },
  numberOfResults: {
    fontStyle: 'italic'
  }
})

export default ({
  activeFilterNames = searchFilters.map(filter => filter.name),
  onChangeActiveFilterNames,
  numberOfResults
}) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <div className={classes.items}>
        {searchFilters.map(({ name, label }) => {
          const isActive = activeFilterNames.includes(name)
          return (
            <div key={name} className={classes.item}>
              <Checkbox
                checked={isActive}
                onClick={() => {
                  onChangeActiveFilterNames(
                    isActive
                      ? activeFilterNames.filter(item => item !== name)
                      : activeFilterNames.concat([name])
                  )
                  trackAction('SearchResults', 'Click filter checkbox', name)
                }}
              />
              {label}
            </div>
          )
        })}
        <div className={classes.item}>
          <Button
            color="default"
            onClick={() => {
              onChangeActiveFilterNames([])
              trackAction('SearchResults', 'Click clear filters button')
            }}>
            Clear Filters
          </Button>
        </div>
      </div>
      <div className={classes.numberOfResults}>{numberOfResults} results</div>
    </div>
  )
}
