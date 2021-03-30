import React from 'react'
import ReportIcon from '@material-ui/icons/Report'
import { trackAction } from '../../analytics'
import Button from '../button'
import * as routes from '../../routes'

export default ({ assetId, analyticsCategoryName }) => {
  const onBtnClick = () => {
    trackAction(analyticsCategoryName, 'Click report button', {
      assetId
    })
  }

  return (
    <Button
      color="default"
      icon={<ReportIcon />}
      onClick={onBtnClick}
      url={routes.createReportWithAssetVar.replace(':assetId', assetId)}>
      Report
    </Button>
  )
}
