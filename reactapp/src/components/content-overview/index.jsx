import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import EditIcon from '@material-ui/icons/Edit'
import LazyLoad from 'react-lazyload'
import { Helmet } from 'react-helmet'

import {
  AssetFieldNames,
  AssetMetaFieldNames,
  CollectionNames
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import {
  canEditAsset,
  getDescriptionForHtmlMeta,
  getOpenGraphUrlForRouteUrl,
  canApproveAsset
} from '../../utils'
import { trackAction } from '../../analytics'
import * as routes from '../../routes'

import Markdown from '../markdown'
import Heading from '../heading'
import Button from '../button'
import ReportButton from '../report-button'
import EndorseAssetButton from '../endorse-asset-button'
import ReportMessage from '../asset-overview/components/report-message'
import VisitSourceButton from '../visit-source-button'
import CommentList from '../comment-list'
import AddCommentForm from '../add-comment-form'
import ChildrenAssets from '../asset-overview/components/children-assets'
import ApproveAssetButton from '../approve-asset-button'
import DeleteAssetButton from '../delete-asset-button'
import PinAssetButton from '../pin-asset-button'
import AssetThumbnail from '../asset-thumbnail'
import AssetContentOutput from '../asset-content-output'

const useStyles = makeStyles({
  contentWrapper: {
    maxWidth: '100%',
    margin: '2rem 0',
    display: 'flex',
    justifyContent: 'center',
    '& img': {
      maxWidth: '100%'
    }
  },
  controls: {
    justifyContent: 'center',
    display: 'flex'
  },
  control: {
    padding: '0.25rem'
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  thumbnail: {
    width: '100px',
    height: '100px',
    marginRight: '1rem'
  },
  title: {
    margin: 0
  }
})

const Control = ({ children }) => {
  const classes = useStyles()
  return <div className={classes.control}>{children}</div>
}

export default ({
  asset: {
    id,
    [AssetFieldNames.fileUrls]: fileUrls,
    [AssetFieldNames.title]: title,
    [AssetFieldNames.description]: description,
    [AssetFieldNames.sourceUrl]: sourceUrl,
    [AssetFieldNames.createdBy]: createdBy,
    [AssetFieldNames.ownedBy]: ownedBy,
    [AssetFieldNames.thumbnailUrl]: thumbnailUrl,
    [AssetFieldNames.author]: authorRef,
    [AssetFieldNames.isDeleted]: isDeleted,
    [AssetFieldNames.isApproved]: isApproved,
    [AssetFieldNames.isPinned]: isPinned
  },
  assetMeta: {
    [AssetMetaFieldNames.authorName]: authorName,
    // [AssetMetaFieldNames.speciesNames]: speciesNames,
    [AssetMetaFieldNames.linkedAssets]: linkedAssets,
    [AssetMetaFieldNames.endorsementCount]: endorsementCount
  },
  analyticsCategoryName,
  switchEditorOpen
}) => {
  const assetId = id
  const classes = useStyles()
  const [, , user] = useUserRecord()
  const [isReportMessageOpen, setIsReportMessageOpen] = useState(false)

  const isOwnerOrEditor = canEditAsset(user, createdBy, ownedBy)

  const isApprover = canApproveAsset(user)

  return (
    <div>
      <Helmet>
        <title>
          {title || 'View uploaded content'} |{' '}
          {authorRef ? `By ${authorName || '???'} | ` : ''}VRCArena
        </title>
        <meta
          name="description"
          content={getDescriptionForHtmlMeta(description)}
        />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={getDescriptionForHtmlMeta(description)}
        />
        <meta
          property="og:url"
          content={getOpenGraphUrlForRouteUrl(
            routes.viewAssetWithVar.replace(':assetId', id)
          )}
        />
        <meta property="og:image" content={thumbnailUrl} />
        <meta property="og:site_name" content="VRCArena" />
      </Helmet>
      {isReportMessageOpen && <ReportMessage assetId={id} />}
      <div className={classes.meta}>
        <div>
          <AssetThumbnail url={thumbnailUrl} className={classes.thumbnail} />
        </div>
        <div>
          {title && (
            <Heading variant="h1" className={classes.title}>
              {title}
            </Heading>
          )}
          {/* {authorName && (
            <Heading variant="h2" className={classes.title}>
              By {authorName}
            </Heading>
          )} */}
        </div>
      </div>
      <div className={classes.contentWrapper}>
        <AssetContentOutput
          assetId={id}
          fileUrls={fileUrls}
          sourceUrl={sourceUrl}
          analyticsCategoryName={analyticsCategoryName}
        />
      </div>
      {description && <Markdown source={description} />}
      <div className={classes.controls}>
        {sourceUrl && (
          <Control>
            <VisitSourceButton
              assetId={id}
              sourceUrl={sourceUrl}
              isNoFilesAttached
            />
          </Control>
        )}
        {isOwnerOrEditor && (
          <Control>
            <Button
              onClick={() => {
                trackAction(analyticsCategoryName, 'Click switch editor button')
                switchEditorOpen()
              }}
              color="default"
              icon={<EditIcon />}>
              Edit Asset
            </Button>
          </Control>
        )}
        <Control>
          <ReportButton
            assetId={id}
            analyticsCategoryName={analyticsCategoryName}
            onClick={() => setIsReportMessageOpen(true)}
          />
        </Control>
        <Control>
          <EndorseAssetButton
            assetId={id}
            endorsementCount={endorsementCount}
            onClick={({ newValue }) =>
              trackAction(
                analyticsCategoryName,
                newValue === true
                  ? 'Click endorse button'
                  : 'Click disendorse button',
                id
              )
            }
          />
        </Control>
      </div>
      {isApprover ? (
        <div className={classes.controls}>
          <Control>
            <ApproveAssetButton
              assetId={assetId}
              isAlreadyApproved={isApproved}
            />
          </Control>
          <Control>
            <DeleteAssetButton
              assetId={assetId}
              isAlreadyDeleted={isDeleted}
              onClick={({ newValue }) =>
                trackAction(
                  analyticsCategoryName,
                  newValue === true
                    ? 'Click delete asset button'
                    : 'Click undelete asset button',
                  assetId
                )
              }
            />
          </Control>
          <Control>
            <PinAssetButton
              assetId={assetId}
              isAlreadyPinned={isPinned}
              onClick={({ newValue }) =>
                trackAction(
                  analyticsCategoryName,
                  newValue === true
                    ? 'Click pin asset button'
                    : 'Click unpin asset button',
                  assetId
                )
              }
            />
          </Control>
        </div>
      ) : null}
      {linkedAssets.length ? (
        <>
          <Heading variant="h2">Related Assets</Heading>
          <ChildrenAssets assetChildren={linkedAssets} />
        </>
      ) : null}
      <Heading variant="h2">Comments</Heading>
      <LazyLoad>
        <CommentList
          collectionName={CollectionNames.Assets}
          parentId={assetId}
        />
        <AddCommentForm
          collectionName={CollectionNames.Assets}
          parentId={assetId}
          onAddClick={() =>
            trackAction(analyticsCategoryName, 'Click add comment button', {
              assetId
            })
          }
        />
      </LazyLoad>
    </div>
  )
}
