import React from 'react'
import * as routes from './routes'
import speciesMeta from './species-meta'
import categoriesMeta from './category-meta'

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
    label: 'Home',
    url: routes.home
  },
  {
    label: 'News',
    url: routes.news
  },
  {
    label: 'Species',
    children: [
      {
        label: 'All Species',
        url: routes.viewAllSpecies
      }
    ].concat(
      Object.entries(speciesMeta).map(([name, meta]) => ({
        label: meta.name,
        url: routes.viewSpeciesWithVar.replace(':speciesName', name)
      }))
    )
  },
  {
    label: 'Categories',
    children: Object.entries(categoriesMeta).map(([name, meta]) => ({
      label: meta.name,
      url: routes.viewCategoryWithVar.replace(':categoryName', name)
    }))
  },
  {
    label: 'Requests',
    url: routes.requests
  },
  {
    label: 'Upload',
    url: routes.createAsset,
    requiresAuth: true
  },
  {
    label: 'Your Account',
    url: routes.myAccount,
    requiresAuth: true
  },
  {
    label: 'Login',
    url: routes.login,
    requiresNotAuth: true
  },
  {
    label: 'Sign Up',
    url: routes.signUp,
    requiresNotAuth: true
  },
  {
    label: 'Logout',
    url: routes.logout,
    requiresAuth: true
  },
  {
    label: 'Admin',
    url: routes.admin,
    requiresAdminOrEditor: true,
    children: [
      {
        label: 'Users',
        url: routes.adminUsers,
        requiresAdmin: true
      },
      {
        label: 'Assets',
        url: routes.adminAssets
      },
      {
        label: 'History',
        url: routes.adminHistory,
        requiresAdmin: true
      }
    ]
  }
]
