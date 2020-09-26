import React from 'react'
import TwitterIcon from '@material-ui/icons/Twitter'
import * as routes from './routes'
import categoriesMeta from './category-meta'
import { TWITTER_URL, DISCORD_URL } from './config'
import { UserFieldNames, AssetCategories } from './hooks/useDatabaseQuery'
import { ReactComponent as DiscordIcon } from './assets/images/icons/discord.svg'

export function canShowMenuItem(menuItem, user) {
  if (menuItem.requiresAuth && !user) {
    return false
  }
  if (menuItem.requiresNotAuth && user) {
    return false
  }
  if (menuItem.requiresEditor && (!user || user.isEditor !== true)) {
    return false
  }
  if (menuItem.requiresAdmin && (!user || user.isAdmin !== true)) {
    return false
  }
  if (menuItem.requiresAdminOrEditor) {
    if (!user) {
      return false
    }
    if (user.isAdmin || user.isEditor) {
      return true
    }
    return false
  }
  if (menuItem.requiresAdultContentEnabled) {
    if (!user) {
      return false
    }
    if (user[UserFieldNames.enabledAdultContent]) {
      return true
    }
    return false
  }
  return true
}

export function getLabelForMenuItem(Label) {
  if (typeof Label === 'string') {
    return Label
  }
  return <Label />
}

export default [
  {
    id: 'news',
    url: routes.news,
    label: 'News'
  },
  ...Object.entries(categoriesMeta)
    .filter(([name]) => name !== AssetCategories.article)
    .map(([name, meta]) => ({
      id: `category-${name}`,
      label: meta.name,
      url: routes.viewCategoryWithVar.replace(':categoryName', name)
    })),
  {
    id: 'species',
    label: 'Species',
    url: routes.viewAllSpecies
  },
  {
    id: 'more',
    label: 'More',
    children: [
      {
        id: 'authors',
        url: routes.authors,
        label: 'Authors'
      },
      {
        id: 'users',
        url: routes.users,
        label: 'Users'
      },
      {
        id: 'activity',
        url: routes.activity,
        label: 'Activity'
      },
      {
        id: 'streams',
        url: routes.streams,
        label: 'Streams'
      },
      {
        id: 'requests',
        label: 'Requests',
        url: routes.requests
      },
      {
        id: 'discord-servers',
        label: 'Discord Servers',
        url: routes.discordServers
      },
      {
        id: 'about',
        url: routes.about,
        label: 'About'
      },
      {
        id: 'adult',
        url: routes.adultAssets,
        label: 'Adult Content',
        requiresAdultContentEnabled: true
      }
    ]
  },
  {
    id: 'twitter',
    label: TwitterIcon,
    url: TWITTER_URL
  },
  {
    id: 'discord',
    label: DiscordIcon,
    url: DISCORD_URL
  },
  {
    id: 'admin',
    label: 'Admin',
    url: routes.admin,
    requiresAdminOrEditor: true,
    children: [
      {
        id: 'admin-users',
        label: 'Users',
        url: routes.adminUsers,
        requiresAdmin: true
      },
      {
        id: 'admin-assets',
        label: 'Assets',
        url: routes.adminAssets
      },
      {
        id: 'admin-history',
        label: 'History',
        url: routes.adminHistory,
        requiresAdmin: true
      },
      {
        id: 'admin-polls',
        label: 'Polls',
        url: routes.adminPolls,
        requiresAdmin: true
      }
    ]
  }
]
