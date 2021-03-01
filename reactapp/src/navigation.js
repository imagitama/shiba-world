import React from 'react'
import * as routes from './routes'
import categoriesMeta from './category-meta'
import { UserFieldNames, AssetCategories } from './hooks/useDatabaseQuery'

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
  ...Object.entries(categoriesMeta)
    .filter(([name]) => name !== AssetCategories.article)
    .filter(([name]) => name !== AssetCategories.content)
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
        id: 'news',
        url: routes.news,
        label: 'News'
      },
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
        id: 'patreon',
        url: routes.patreon,
        label: 'Patreon'
      },
      {
        id: 'tags',
        url: routes.tags,
        label: 'Tags'
      },
      {
        id: 'adult',
        url: routes.nsfw,
        label: 'NSFW Content',
        requiresAdultContentEnabled: true
      },
      {
        id: 'products',
        url: routes.viewProducts,
        label: 'Products',
        requiresAdmin: true
      },
      {
        id: 'admin',
        label: 'Admin',
        url: routes.admin,
        requiresAdmin: true
      }
    ]
  }
]
