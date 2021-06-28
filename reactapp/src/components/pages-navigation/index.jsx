import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '../button'

const useStyles = makeStyles({
    root: {
        display: 'flex'
    }
})

export default ({ pageCount, currentPageNumber, onClickWithPageNumber }) => {
    const classes = useStyles()
    return (
        <div className={classes.root}>
            {[...Array(pageCount)].map((item, idx) => {
                const pageNumber = idx + 1
                return <div key={idx}>
                    <Button
                        color={pageNumber === currentPageNumber ? 'primary' : 'default'}
                        onClick={() => onClickWithPageNumber(pageNumber)}
                    >
                        {pageNumber}
                    </Button>
                </div>
            })}
        </div>
    )
}