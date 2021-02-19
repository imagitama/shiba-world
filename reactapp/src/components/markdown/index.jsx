import React from 'react'
import Markdown from 'react-markdown'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import { trackAction } from '../../analytics'

export default ({ source, analyticsCategory = '' }) => (
  <Markdown
    source={source}
    renderers={{
      link: linkProps => (
        <a
          href={linkProps.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            if (analyticsCategory) {
              trackAction(
                analyticsCategory,
                'Click external link from markdown',
                linkProps.href
              )
            }
          }}>
          {linkProps.children} <OpenInNewIcon style={{ fontSize: '1em' }} />
        </a>
      )
    }}
  />
)
