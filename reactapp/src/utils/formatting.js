export const addQuotesToDescription = desc => {
  return desc
    .split('\n')
    .map(line => `> ${line}`)
    .join('\n')
}
