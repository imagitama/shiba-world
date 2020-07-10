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

// Some uploaded files have an uppercase extension (.PNG)
// TODO: Upload the files always as lowercase?
function getValidUrl(url) {
  if (!url) {
    return ''
  }
  return url.toLowerCase()
}

export function isUrlAnImage(url) {
  const validUrl = getValidUrl(url)
  return (
    validUrl.includes('jpg') ||
    validUrl.includes('png') ||
    validUrl.includes('gif') ||
    validUrl.includes('jpeg')
  )
}

export function isUrlAVideo(url) {
  const validUrl = getValidUrl(url)
  return validUrl.includes('.mp4') || validUrl.includes('.avi')
}

export function isUrlAFbx(url) {
  const validUrl = getValidUrl(url)
  return validUrl.includes('.fbx')
}

export function isUrlNotAnImageOrVideo(url) {
  const validUrl = getValidUrl(url)
  return !isUrlAnImage(validUrl) && !isUrlAVideo(validUrl)
}

export function getFilenameFromUrl(url) {
  const validUrl = getValidUrl(url)
  return validUrl
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
  // To help debug Sentry issue #1766726990
  console.log('createRef', collectionName, id)
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
  // To help debug Sentry issue #1766726990
  console.log('getDocument', collectionName, id)
  return firebase
    .firestore()
    .collection(collectionName)
    .doc(id)
}
