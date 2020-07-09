import React from 'react'
import TwitterIcon from '@material-ui/icons/Twitter'
import * as routes from './routes'
import speciesMeta from './species-meta'
import categoriesMeta from './category-meta'
import { TWITTER_URL } from './config'

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
    label: 'News',
    url: routes.news
  },
  {
    id: 'species',
    label: 'Species',
    children: [
      {
        label: 'All Species',
        url: routes.viewAllSpecies
      }
    ].concat(
      Object.entries(speciesMeta).map(([name, meta]) => ({
        id: name,
        label: meta.name,
        url: routes.viewSpeciesWithVar.replace(':speciesName', name)
      }))
    )
  },
  {
    id: 'categories',
    label: 'Categories',
    children: Object.entries(categoriesMeta).map(([name, meta]) => ({
      id: name,
      label: meta.name,
      url: routes.viewCategoryWithVar.replace(':categoryName', name)
    }))
  },
  {
    id: 'users',
    url: routes.users,
    label: 'Users'
  },
  {
    id: 'more',
    label: 'More',
    children: [
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
        id: 'about',
        url: routes.about,
        label: 'About'
      }
    ]
  },
  {
    id: 'twitter',
    label: TwitterIcon,
    url: TWITTER_URL
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
      }
    ]
  }
]
