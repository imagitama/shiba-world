import React from 'react'
import * as routes from './routes'
import speciesMeta from './species-meta'
import categoriesMeta from './category-meta'
import NotificationsMenuLabel from './components/notifications-menu-label'
import NotificationsMenuChildren from './components/notifications-menu-children'

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
    id: 'home',
    label: 'Home',
    url: routes.home
  },
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
        label: meta.name,
        url: routes.viewSpeciesWithVar.replace(':speciesName', name)
      }))
    )
  },
  {
    id: 'categories',
    label: 'Categories',
    children: Object.entries(categoriesMeta).map(([name, meta]) => ({
      label: meta.name,
      url: routes.viewCategoryWithVar.replace(':categoryName', name)
    }))
  },
  {
    id: 'requests',
    label: 'Requests',
    url: routes.requests
  },
  {
    id: 'upload',
    label: 'Upload',
    url: routes.createAsset,
    requiresAuth: true
  },
  {
    id: 'my-account',
    label: 'Your Account',
    url: routes.myAccount,
    requiresAuth: true
  },
  {
    id: 'login',
    label: 'Login',
    url: routes.login,
    requiresNotAuth: true
  },
  {
    id: 'sign-up',
    label: 'Sign Up',
    url: routes.signUp,
    requiresNotAuth: true
  },
  {
    id: 'logout',
    label: 'Logout',
    url: routes.logout,
    requiresAuth: true
  },
  {
    id: 'admin',
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
  },
  {
    id: 'notifications',
    label: NotificationsMenuLabel,
    requiresAuth: true,
    children: NotificationsMenuChildren
  }
]
