import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'

import Heading from '../../../../components/heading'
import Fireworks from '../../../../components/fireworks'

const useStyles = makeStyles({
  headings: {
    textAlign: 'center'
  }
})

export default () => {
  const classes = useStyles()
  return (
    <div>
      <Helmet>
        <title>Tutorial complete | VRCArena</title>
        <meta name="description" content="You have completed the tutorial." />
      </Helmet>
      <div className={classes.headings}>
        <Heading variant="h2">Tutorial Complete!</Heading>
      </div>
      <p>
        We hope you have enjoyed reading this tutorial. Please submit any
        feedback and suggestions via our Discord server's #feedback channel
        (link to the Discord server is next to our logo at the top of the page)
      </p>
      <Fireworks />
    </div>
  )
}
