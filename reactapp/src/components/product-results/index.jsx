import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ProductResultsItem from '../product-results-item'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' }
})

export default ({ products }) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      {products.map(product => (
        <ProductResultsItem key={product.id} product={product} />
      ))}
    </div>
  )
}
