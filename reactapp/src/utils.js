import firebase from 'firebase/app'
import 'firebase/firestore'

export function scrollToTop() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  })
}

export function getDescriptionForHtmlMeta(desc) {
  let newDesc = desc
    .split('\n')
    .join(' ')
    .replace(/\s\s+/g, ' ')
  if (newDesc.length > 255) {
    return `${newDesc.substr(0, 255)}...`
  }
  return newDesc
}

export function getOpenGraphUrlForRouteUrl(routeUrl) {
  return `https://www.vrcarena.com${routeUrl}`
}

export function convertSearchTermToUrlPath(searchTerm) {
  return window.encodeURIComponent(searchTerm)
}

export function parseSearchTermFromUrlPath(urlPath) {
  return window.decodeURIComponent(urlPath)
}

export function canEditAsset(currentUser, createdBy) {
  if (!currentUser) {
    return false
  }
  if (currentUser.id === createdBy.id) {
    return true
  }
  if (currentUser.isEditor) {
    return true
  }
  return false
}

export function canApproveAsset(currentUser) {
  if (!currentUser) {
    return false
  }
  if (currentUser.isEditor) {
    return true
  }
  return false
}

export function isUrlAnImage(url) {
  return (
    url.includes('jpg') ||
    url.includes('png') ||
    url.includes('gif') ||
    url.includes('jpeg')
  )
}

export function isUrlAVideo(url) {
  return url.includes('.mp4') || url.includes('.avi')
}

export function isUrlAFbx(url) {
  return url.includes('.fbx')
}

export function isUrlNotAnImageOrVideo(url) {
  return !isUrlAnImage(url) && !isUrlAVideo(url)
}

export function getFilenameFromUrl(url) {
  return url
    .replace('%2F', '/')
    .split('/')
    .pop()
    .split('?')
    .shift()
    .replace(/%20/g, ' ')
    .split('___')
    .pop()
}

// TODO: Move these funcs to a firestore utils file

export function createRef(collectionName, id) {
  return {
    ref: {
      collectionName,
      id
    }
  }
}

export function isRef(value) {
  return value && typeof value === 'object' && value.hasOwnProperty('ref')
}

export function getDocument(collectionName, id) {
  return firebase
    .firestore()
    .collection(collectionName)
    .doc(id)
}
