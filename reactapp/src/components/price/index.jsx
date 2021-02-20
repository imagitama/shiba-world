const getSymbolForCurrency = currency => {
  switch (currency) {
    case 'usd':
      return '$'
    default:
      return '$'
  }
}

export default ({ price, currency = 'usd' }) => {
  return `${getSymbolForCurrency(currency)}${
    typeof price === 'string' ? price : price.toFixed(2)
  }`
}
