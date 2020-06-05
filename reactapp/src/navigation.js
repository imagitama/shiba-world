import React from 'react'
import UnapprovedMenuItemLabel from './components/unapproved-menu-item-label'
import * as routes from './routes'
import { AssetCategories } from './hooks/useDatabaseQuery'

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
    label: 'Accessories',
    url: routes.viewCategoryWithVar.replace(
      ':categoryName',
      AssetCategories.accessory
    )
  },
  {
    label: 'Animations',
    url: routes.viewCategoryWithVar.replace(
      ':categoryName',
      AssetCategories.animation
    )
  },
  {
    label: 'Tutorials',
    url: routes.viewCategoryWithVar.replace(
      ':categoryName',
      AssetCategories.tutorial
    )
  },
  {
    label: 'Avatars',
    url: routes.viewCategoryWithVar.replace(
      ':categoryName',
      AssetCategories.avatar
    )
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
  // {
  //   label: 'Contributors',
  //   url: routes.contributors
  // },
  {
    // Use a component here to avoid unnecessary hook calls for non-editors
    label: UnapprovedMenuItemLabel,
    url: routes.unapproved,
    requiresEditor: true
  },
  {
    label: 'Admin',
    url: routes.admin,
    requiresAdmin: true
  }
]
