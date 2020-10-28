import React from 'react'
import { Container } from '@material-ui/core'
import Heading from '../../components/heading'
import PatreonList from '../../components/patreon-list'

export default () => (
  <>
    <Container maxWidth="md">
      <Heading variant="h1">Patreon</Heading>
      <p>
        <a
          href="https://www.patreon.com/bePatron?u=43812267"
          data-patreon-widget-type="become-patron-button">
          Become a Patron!
        </a>
        <script
          async
          src="https://c6.patreon.com/becomePatronButton.bundle.js"
        />
      </p>
      <Heading variant="h2">
        Users who have connected their account with Patreon
      </Heading>
      <PatreonList />
    </Container>
  </>
)
