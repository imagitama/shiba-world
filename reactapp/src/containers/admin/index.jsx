import React, { useState } from 'react'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { makeStyles } from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'
import { useMediaQuery } from 'react-responsive'

// import AdminUserManagement from '../../components/admin-user-management'
import Heading from '../../components/heading'
import LoadingIndicator from '../../components/loading-indicator'
import NoPermissionMessage from '../../components/no-permission-message'
import ErrorMessage from '../../components/error-message'
import AdminHistory from '../../components/admin-history'
import UnapprovedAssets from '../../components/unapproved-assets'
import DeletedAssets from '../../components/deleted-assets'
import AdminAssetAmendments from '../../components/admin-asset-amendments'
import AdminPolls from '../../components/admin-polls'
import AdminAdvancedTools from '../../components/admin-advanced-tools'
import AdminReports from '../../components/admin-reports'

import useUserRecord from '../../hooks/useUserRecord'
import {
  queryForTabletsOrBelow,
  mediaQueryForTabletsOrBelow
} from '../../media-queries'

import PrivateAssets from './components/private-assets'

const TabPanel = ({ value, index, children }) =>
  value === index ? (
    <LazyLoad placeholder={<LoadingIndicator />}>{children}</LazyLoad>
  ) : null

const useStyles = makeStyles({
  tabsContainer: {
    display: 'flex',
    margin: '1rem 0',
    [mediaQueryForTabletsOrBelow]: {
      display: 'block'
    }
  },
  tabs: {
    marginRight: '2rem',
    [mediaQueryForTabletsOrBelow]: {
      margin: 0
    }
  },
  tabPanels: {
    flex: 1,
    [mediaQueryForTabletsOrBelow]: {
      margin: '1rem 0'
    }
  }
})

export default () => {
  const [isLoading, isErrored, user] = useUserRecord()
  const [activeTabIdx, setActiveTabIdx] = useState(0)
  const classes = useStyles()
  const isMobile = useMediaQuery({ query: queryForTabletsOrBelow })

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage />
  }

  if (!user || (!user.isAdmin && !user.isEditor)) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">Admin</Heading>

      <div className={classes.tabsContainer}>
        <Tabs
          orientation={isMobile ? 'horizontal' : 'vertical'}
          variant="scrollable"
          value={activeTabIdx}
          onChange={(event, newIdx) => setActiveTabIdx(newIdx)}
          className={classes.tabs}>
          <Tab label="Overview" index={0} />
          <Tab label="Unapproved Assets" index={1} />
          <Tab label="Deleted Assets" index={2} />
          <Tab label="Users" index={3} />
          <Tab label="Tag Amendments" index={4} />
          <Tab label="Asset History" index={5} />
          <Tab label="Polls" index={6} />
          <Tab label="Advanced" index={7} />
          <Tab label="Reports" index={8} />
          <Tab label="Private Assets" index={9} />
        </Tabs>
        <div className={classes.tabPanels}>
          <TabPanel value={activeTabIdx} index={0}>
            Welcome to the admin area.
          </TabPanel>
          <TabPanel value={activeTabIdx} index={1}>
            <UnapprovedAssets />
          </TabPanel>
          <TabPanel value={activeTabIdx} index={2}>
            <DeletedAssets />
          </TabPanel>
          <TabPanel value={activeTabIdx} index={3}>
            We have over 800 users so this view is too big. Use the search tool
            in header.
          </TabPanel>
          <TabPanel value={activeTabIdx} index={4}>
            <AdminAssetAmendments />
          </TabPanel>
          <TabPanel value={activeTabIdx} index={5}>
            <AdminHistory />
          </TabPanel>
          <TabPanel value={activeTabIdx} index={6}>
            <AdminPolls />
          </TabPanel>
          <TabPanel value={activeTabIdx} index={7}>
            <AdminAdvancedTools />
          </TabPanel>
          <TabPanel value={activeTabIdx} index={8}>
            <AdminReports />
          </TabPanel>
          <TabPanel value={activeTabIdx} index={9}>
            <PrivateAssets />
          </TabPanel>
        </div>
      </div>
    </>
  )
}
