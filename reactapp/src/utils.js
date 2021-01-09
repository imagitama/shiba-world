import firebase from 'firebase/app'
import 'firebase/firestore'
import { AuthorFieldNames, UserFieldNames } from './hooks/useDatabaseQuery'

export function scrollToTop(isSmooth) {
  return scrollTo(0, isSmooth)
}

export function scrollTo(x, isSmooth) {
  window.scrollTo({
    top: x,
    left: 0,
    behavior: isSmooth ? 'smooth' : 'auto'
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

export function canEditAsset(currentUser, createdBy, ownedBy) {
  if (!currentUser) {
    return false
  }
  if (ownedBy && currentUser.id === ownedBy.id) {
    return true
  }
  if (!ownedBy && currentUser.id === createdBy.id) {
    return true
  }
  if (currentUser.isEditor) {
    return true
  }
  if (currentUser.isAdmin) {
    return true
  }
  return false
}

export function canEditPedestal(currentUser, createdBy, ownedBy) {
  if (!canEditAsset(currentUser, createdBy, ownedBy)) {
    return false
  }

  if (currentUser[UserFieldNames.isPatron]) {
    return true
  }

  if (
    currentUser[UserFieldNames.isAdmin] ||
    currentUser[UserFieldNames.isEditor]
  ) {
    return true
  }

  return false
}

export function canEditAuthor(user, author) {
  if (!user) {
    return false
  }
  if (user.isAdmin || user.isEditor) {
    return true
  }
  if (
    author[AuthorFieldNames.ownedBy] &&
    user.id === author[AuthorFieldNames.ownedBy].id
  ) {
    return true
  }
  if (
    !author[AuthorFieldNames.ownedBy] &&
    user.id === author[AuthorFieldNames.createdBy].id
  ) {
    return true
  }
  return false
}

export function canEditDiscordServer(user) {
  if (!user) {
    return false
  }
  if (user.isAdmin || user.isEditor) {
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

export function canEditSpecies(user) {
  if (!user) {
    return false
  }
  if (user.isAdmin || user.isEditor) {
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
    validUrl.includes('jpeg') ||
    validUrl.includes('webp')
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

export function isDocument(value) {
  return value && typeof value === 'object' && 'id' in value
}

export function mapRefToDoc(val) {
  return getDocument(val.ref.collectionName, val.ref.id)
}

export function mapRefsToDocs(value) {
  if (!Array.isArray(value)) {
    return false
  }

  return value.map(val => {
    if (isRef(val)) {
      return mapRefToDoc(val)
    }
    return val
  })
}

export function convertDocToRef(doc) {
  return createRef(doc.parent.id, doc.id)
}

// even if you grant public access to a Firebase bucket
// if you provide an access ID it will still error?
// so strip that out
export function fixAccessingImagesUsingToken(url) {
  if (!url) {
    return ''
  }
  if (!url.includes('GoogleAccessId')) {
    return url
  }
  return url.split('?')[0]
}
