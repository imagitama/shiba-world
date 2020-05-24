import React from 'react'
import Heading from '../../components/heading'

const contributors = [
  {
    name: 'A5TR0',
    items: ['created species thumbnails']
  },
  {
    name: 'Wolfee',
    items: ['beta testing and created early assets']
  },
  {
    name: 'Adivote',
    items: ['code improvements via GitHub']
  }
]

export default () => (
  <>
    <Heading variant="h1">Contributors</Heading>
    <p>People that have helped develop the site.</p>
    <ul>
      {contributors.map(({ name, items }) => (
        <li key={name}>
          <strong>{name}</strong>
          <br />
          <ul>
            {items.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
    <Heading variant="h2">How to contribute</Heading>
    <Heading variant="h3">GitHub</Heading>
    <p>
      All of the sourcecode for VRCArena is available in a public{' '}
      <a href="https://github.com/imagitama/shiba-world">GitHub repo</a>.
    </p>
    <p>
      Repos contain the sourcecode of the website and anyone can have a "clone"
      or copy of it on their computer.
    </p>
    <p>
      People that want to contribute to the repo need to "fork" it which is like
      your own version of it.{' '}
      <em>GitHub creates a fork for you automatically from your browser.</em>
    </p>
    <p>
      Modifications to the code exist on "branches". They branch off of "master"
      which is what is used on the live site.{' '}
      <em>GitHub creates a branch for you automatically from your browser.</em>
    </p>
    <p>
      Your changes are a "commit". Every change is a commit and Git tracks
      changes to individual lines and doesn't copy entire files. Commits have
      messages that summarize your changes. eg. "Changed the upload button from
      green to blue."{' '}
      <em>
        GitHub asks you to create a commit if you edit a file from your browser.
      </em>
    </p>
    <p>
      To get your work from your fork into the live site, you need to use a
      "pull request" to ask to merge your changes into master (the live site).
      The owner of the repo can approve or request changes to your work.{' '}
      <em>
        When you edit a file from GitHub it will ask you if you want to make a
        pull request.
      </em>
    </p>
    <p>If you need help please ask Peanut via Discord: Peanut#1756</p>
    <Heading variant="h2">Build Status</Heading>
    <p>When pull requests are merged it takes 2-3 minutes for it to be live:</p>
    <img
      src="https://api.netlify.com/api/v1/badges/d9ba52e1-13fa-4b88-94cf-a7d6065111a5/deploy-status"
      alt="Status of build"
    />
  </>
)
