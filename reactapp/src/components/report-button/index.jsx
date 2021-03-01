import React from 'react'
import ReportIcon from '@material-ui/icons/Report'
import { trackAction } from '../../analytics'
import Button from '../button'

export default ({ assetId, analyticsCategoryName, onClick }) => {
  const onBtnClick = () => {
    onClick()
    trackAction(analyticsCategoryName, 'Click report button', {
      assetId
    })
  }

  return (
    <Button color="default" icon={<ReportIcon />} onClick={onBtnClick}>
      Report
    </Button>
  )
}
