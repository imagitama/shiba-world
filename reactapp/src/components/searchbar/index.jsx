import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import ThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import { changeSearchTerm } from '../../modules/app'
import { lightTheme } from '../../themes'
import * as routes from '../../routes'
import { convertSearchTermToUrlPath } from '../../utils'

const useStyles = makeStyles({
  root: {
    padding: '2px 2px 2px 24px',
    borderRadius: '3rem',
    margin: '1.5rem auto',
    display: 'flex',
    alignItems: 'center',
    '@media (min-width: 960px)': {
      margin: '0 auto'
    }
  },
  input: {
    padding: 10,
    marginLeft: 8,
    flex: 1
  }
})

export default () => {
  const { searchTerm } = useSelector(({ app: { searchTerm } }) => ({
    searchTerm
  }))
  const dispatch = useDispatch()
  const classes = useStyles()

  const onSearchTermInputChange = event => {
    const newTerm = event.target.value

    window.history.replaceState(
      null,
      'Search',
      routes.searchWithVar.replace(
        ':searchTerm',
        convertSearchTermToUrlPath(newTerm)
      )
    )

    dispatch(changeSearchTerm(newTerm))
  }

  return (
    <ThemeProvider theme={lightTheme}>
      <Paper className={classes.root}>
        <InputBase
          className={classes.input}
          placeholder={`Search title, description and tags`}
          autoFocus={true}
          autoComplete="false"
          onChange={onSearchTermInputChange}
          defaultValue={searchTerm || ''}
        />
      </Paper>
    </ThemeProvider>
  )
}
