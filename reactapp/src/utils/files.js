export const getImageUrlAsFile = async (
  url,
  filenameWithoutExt = 'my-file'
) => {
  const resp = await fetch(url)
  const blob = await resp.blob()
  const fileExt = url
    .split('?')[0]
    .split('/')
    .pop()
    .split('.')[1]
  const filename = `${filenameWithoutExt}.${fileExt}`
  const file = new File([blob], filename, blob)
  return file
}
