import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { Container } from '@material-ui/core'
import { Helmet } from 'react-helmet'

import * as routes from './routes'

import Home from './containers/home'
import Login from './containers/login'
import SignUp from './containers/signup'
import Logout from './containers/logout'
import BrowseAssets from './containers/browse'
import CreateAsset from './containers/create-asset'
import EditAsset from './containers/edit-asset'
import ViewAsset from './containers/view-asset'
import MyAccount from './containers/my-account'
import Admin from './containers/admin'
import PrivacyPolicy from './containers/privacy-policy'
import Contributors from './containers/contributors'
import Unapproved from './containers/unapproved'
import ErrorContainer from './containers/error'

import PageHeader from './components/header'
import PageFooter from './components/footer'
import SearchResults from './components/search-results'
import useUserRecord from './hooks/useUserRecord'
import SetupProfile from './components/setup-profile'
import useSearchTerm from './hooks/useSearchTerm'
import Notices from './components/notices'

const RouteWithMeta = ({ meta, component: Component, ...routeProps }) => {
  return (
    <Route
      {...routeProps}
      component={props => (
        <>
          {meta && (
            <Helmet>
              <title>{meta.title} | VRCArena</title>
              <meta name="description" content={meta.description} />
            </Helmet>
          )}
          <Component {...props} />
        </>
      )}
    />
  )
}

const MainContent = () => {
  const searchTerm = useSearchTerm()
  const [, , user] = useUserRecord()

  if (searchTerm) {
    return <SearchResults />
  }

  if (user && !user.username) {
    return <SetupProfile />
  }

  return (
    <>
      <Switch>
        <RouteWithMeta
          exact
          path={routes.home}
          component={Home}
          meta={{
            title:
              'Browse and upload assets and tutorials for the different species of VRChat',
            description:
              'Download and upload various kinds of assets and tutorials for the different species found in the online multiplayer VR social game VRChat.'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.login}
          component={Login}
          meta={{
            title: 'Log in to manage assets',
            description:
              'Use the log in form to log in to your account so that you can manage assets.'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.signUp}
          component={SignUp}
          meta={{
            title: 'Create a new account',
            description:
              'Use the form below to create a new account to begin uploading new assets for VRChat species.'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.logout}
          component={Logout}
          meta={{
            title: 'Logging you out',
            description:
              'Visit this page to automatically log out of your account.'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.browseAssets}
          component={BrowseAssets}
          meta={{
            title: 'Browse all of the assets that users have uploaded',
            description:
              'All available assets are shown here so that you can browse them. Click an asset to view more info about it and to download the files.'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.browseWithVar}
          component={BrowseAssets}
          meta={{
            title: 'Browse the assets and tutorials by tag name',
            description:
              'The assets and tutorials that users have uploaded except filtered by a specific tag name.'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.createAsset}
          component={CreateAsset}
          meta={{
            title: 'Upload a new asset',
            description: 'Create a new asset and upload the files for it.'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.viewAssetWithVar}
          component={ViewAsset}
          // TODO: Use list title as page title
          meta={{
            title: 'View a single asset',
            description:
              'An overview of a single asset. Find out what the asset is for, how to use it and where to download it plus more.'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.editAssetWithVar}
          component={EditAsset}
          meta={{
            title: 'Edit an asset',
            description:
              'Change the meta data about an asset and upload new files for it.'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.admin}
          component={Admin}
          meta={{
            title: 'Admins only area',
            description: 'A restricted space for admins only.'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.myAccount}
          component={MyAccount}
          meta={{
            title: 'View details about your account',
            description:
              'An overview of your account including a way to change your username and see statistics of your account.'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.privacyPolicy}
          component={PrivacyPolicy}
          meta={{
            title: 'Our privacy policy',
            description:
              'View the privacy policy of our website including what we do with your personal data.'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.contributors}
          component={Contributors}
          meta={{
            title: 'People that have contributed',
            description: 'Thanks!'
          }}
        />
        <RouteWithMeta
          exact
          path={routes.unapproved}
          component={Unapproved}
          meta={{
            title: 'Unapproved assets',
            description: ''
          }}
        />
        <Route
          component={() => (
            <ErrorContainer code={404} message="Page not found" />
          )}
        />
      </Switch>
    </>
  )
}

export default () => (
  <>
    <PageHeader />
    <main className="main">
      <Container maxWidth="lg">
        <Notices />
        <MainContent />
      </Container>
    </main>
    <PageFooter />
  </>
)
