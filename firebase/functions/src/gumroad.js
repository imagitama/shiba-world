const fetch = require('node-fetch')
const TurndownService = require('turndown')

let turndownService

const getTurndownService = () => {
  if (!turndownService) {
    turndownService = new TurndownService()
  }
  return turndownService
}

const getMarkdownFromHtml = (html) => {
  return getTurndownService().turndown(html)
}

const getCodeFromUrl = (url) => {
  return url.split('/').pop()
}

const getProductInfoByCode = async (code) => {
  const resp = await fetch(`https://gumroad.com/l/${code}.json`, {
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // custom permalink
  if (resp.status === 302) {
    return getProductInfoByCode(getCodeFromUrl(resp.headers.get('location')))
  }

  if (!resp.ok) {
    throw new Error(
      `Response not OK! Status: ${resp.status} Text: ${resp.statusText}`
    )
  }

  const result = await resp.json()

  return {
    ...result,
    descriptionMarkdown: getMarkdownFromHtml(result.description),
  }
}
module.exports.getProductInfoByCode = getProductInfoByCode
