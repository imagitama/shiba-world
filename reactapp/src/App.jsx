import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import Container from '@material-ui/core/Container'
import ThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import CssBaseline from '@material-ui/core/CssBaseline'
import { Helmet } from 'react-helmet'
import { useSelector } from 'react-redux'

import * as routes from './routes'
import { lightTheme, darkTheme } from './themes'
import { UserFieldNames } from './hooks/useDatabaseQuery'

import Home from './containers/home'
import Login from './containers/login'
import SignUp from './containers/signup'
import Logout from './containers/logout'
import CreateAsset from './containers/create-asset'
import EditAsset from './containers/edit-asset'
import ViewAsset from './containers/view-asset'
import MyAccount from './containers/my-account'
import Admin from './containers/admin'
import PrivacyPolicy from './containers/privacy-policy'
import Contributors from './containers/contributors'
import Unapproved from './containers/unapproved'
import ErrorContainer from './containers/error'
import ViewCategory from './containers/view-category'
import News from './containers/news'
import Tags from './containers/tags'

import ViewSpecies from './containers/view-species'
import ViewSpeciesCategory from './containers/view-species-category'

import PageHeader from './components/header'
import PageFooter from './components/footer'
import SearchResults from './components/search-results'
import SetupProfile from './components/setup-profile'
import Notices from './components/notices'
import ErrorBoundary from './components/error-boundary'

import useUserRecord from './hooks/useUserRecord'
import useSearchTerm from './hooks/useSearchTerm'
import useIsLoggedIn from './hooks/useIsLoggedIn'

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
  const isLoggedIn = useIsLoggedIn()
  const [, , username] = useUserRecord(UserFieldNames.username)

  if (searchTerm) {
    return <SearchResults />
  }

  if (isLoggedIn && !username) {
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
            title: 'Browse assets for the species of VRChat',
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
        <Redirect
          from={routes.browseWithVar.replace(':tagName', ':speciesName')}
          to={routes.viewSpeciesWithVar}
        />
        <Redirect from={routes.browseAssets} to={routes.home} />
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
        <Route exact path={routes.viewSpeciesWithVar} component={ViewSpecies} />
        <Route
          exact
          path={routes.viewSpeciesCategoryWithVar}
          component={ViewSpeciesCategory}
        />
        <Route
          exact
          path={routes.viewCategoryWithVar}
          component={ViewCategory}
        />
        <Route exact path={routes.news} component={News} />
        <Route exact path={routes.tagsWithVar} component={Tags} />
        <Route
          component={() => (
            <ErrorContainer code={404} message="Page not found" />
          )}
        />
      </Switch>
    </>
  )
}

export default () => {
  const darkModeEnabled = useSelector(
    ({ app: { darkModeEnabled } }) => darkModeEnabled
  )
  return (
    <ErrorBoundary>
      <ThemeProvider theme={darkModeEnabled ? darkTheme : lightTheme}>
        <CssBaseline />
        <PageHeader />
        <main className="main">
          <Container maxWidth="lg">
            <Notices />
            <MainContent />
          </Container>
        </main>
        <PageFooter />
      </ThemeProvider>
    </ErrorBoundary>
  )
}
