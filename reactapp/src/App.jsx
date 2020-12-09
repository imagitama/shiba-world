import React, { lazy, Suspense, useEffect } from 'react'
import { Route, Switch, Redirect, useLocation } from 'react-router-dom'
import ThemeProvider from '@material-ui/styles/ThemeProvider'
import CssBaseline from '@material-ui/core/CssBaseline'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@material-ui/core/styles'

import * as routes from './routes'
import { darkTheme } from './themes'
import { UserFieldNames } from './hooks/useDatabaseQuery'

// Do not lazy load these routes as they are very popular so they should load fast
import Home from './containers/home'
import ViewAsset from './containers/view-asset'
import ViewSpecies from './containers/view-species'
import ViewSpeciesCategory from './containers/view-species-category'
import ViewCategory from './containers/view-category'
import ViewAllSpecies from './containers/view-all-species'

import PageHeader from './components/header'
import PageFooter from './components/footer'
import SearchResults from './components/search-results'
import SetupProfile from './components/setup-profile'
import Notices from './components/notices'
import ErrorBoundary from './components/error-boundary'
import LoadingIndicator from './components/loading-indicator'
import UnapprovedAssetsMessage from './components/unapproved-assets-message'
import BannedNotice from './components/banned-notice'
import Banner from './components/banner'

import useUserRecord from './hooks/useUserRecord'
import useSearchTerm from './hooks/useSearchTerm'
import useIsLoggedIn from './hooks/useIsLoggedIn'

import { scrollToTop } from './utils'
import { searchIndexNameLabels } from './modules/app'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow
} from './media-queries'

const catchChunkDeaths = functionToImport =>
  functionToImport().catch(err => {
    if (err.message.includes('Loading chunk')) {
      // Warning: this could cause an infinite loop :)
      window.location.reload()
    }
    throw err
  })

const useStyles = makeStyles({
  mainContainer: {
    padding: '2rem',
    [mediaQueryForTabletsOrBelow]: {
      maxWidth: '100vw',
      overflow: 'hidden'
    },
    [mediaQueryForMobiles]: {
      padding: '0.5rem'
    }
  }
})

// Lazy load these to improve performance (downloading and processing JS)
const Login = lazy(() => catchChunkDeaths(() => import('./containers/login')))
const SignUp = lazy(() => catchChunkDeaths(() => import('./containers/signup')))
const Logout = lazy(() => catchChunkDeaths(() => import('./containers/logout')))
const CreateAsset = lazy(() =>
  catchChunkDeaths(() => import('./containers/create-asset'))
)
const EditAsset = lazy(() =>
  catchChunkDeaths(() => import('./containers/edit-asset'))
)
const MyAccount = lazy(() =>
  catchChunkDeaths(() => import('./containers/my-account'))
)
const Admin = lazy(() => catchChunkDeaths(() => import('./containers/admin')))
const AdminHistory = lazy(() =>
  catchChunkDeaths(() => import('./containers/admin-history'))
)
const AdminUsers = lazy(() =>
  catchChunkDeaths(() => import('./containers/admin-users'))
)
const AdminAssets = lazy(() =>
  catchChunkDeaths(() => import('./containers/admin-assets'))
)
const AdminPolls = lazy(() =>
  catchChunkDeaths(() => import('./containers/admin-polls'))
)
const PrivacyPolicy = lazy(() =>
  catchChunkDeaths(() => import('./containers/privacy-policy'))
)
const Contributors = lazy(() =>
  catchChunkDeaths(() => import('./containers/contributors'))
)
const ErrorContainer = lazy(() =>
  catchChunkDeaths(() => import('./containers/error'))
)
const News = lazy(() => catchChunkDeaths(() => import('./containers/news')))
const Tags = lazy(() => catchChunkDeaths(() => import('./containers/tags')))
const Search = lazy(() => catchChunkDeaths(() => import('./containers/search')))
const ViewUser = lazy(() =>
  catchChunkDeaths(() => import('./containers/view-user'))
)
const Stats = lazy(() => catchChunkDeaths(() => import('./containers/stats')))
const Users = lazy(() => catchChunkDeaths(() => import('./containers/users')))
const Activity = lazy(() =>
  catchChunkDeaths(() => import('./containers/activity'))
)
const Requests = lazy(() =>
  catchChunkDeaths(() => import('./containers/requests'))
)
const CreateRequest = lazy(() =>
  catchChunkDeaths(() => import('./containers/create-request'))
)
const ViewRequest = lazy(() =>
  catchChunkDeaths(() => import('./containers/view-request'))
)
const Streams = lazy(() =>
  catchChunkDeaths(() => import('./containers/streams'))
)
const About = lazy(() => catchChunkDeaths(() => import('./containers/about')))
const AdultAssets = lazy(() =>
  catchChunkDeaths(() => import('./containers/adult-assets'))
)
const ViewAuthor = lazy(() =>
  catchChunkDeaths(() => import('./containers/view-author'))
)
const EditAuthor = lazy(() =>
  catchChunkDeaths(() => import('./containers/edit-author'))
)
const Authors = lazy(() =>
  catchChunkDeaths(() => import('./containers/authors'))
)
const EditUser = lazy(() =>
  catchChunkDeaths(() => import('./containers/edit-user'))
)
const DiscordServers = lazy(() =>
  catchChunkDeaths(() => import('./containers/discord-servers'))
)
const ViewDiscordServer = lazy(() =>
  catchChunkDeaths(() => import('./containers/view-discord-server'))
)
const EditDiscordServer = lazy(() =>
  catchChunkDeaths(() => import('./containers/edit-discord-server'))
)
const CreateSpecies = lazy(() =>
  catchChunkDeaths(() => import('./containers/create-species'))
)
const EditSpecies = lazy(() =>
  catchChunkDeaths(() => import('./containers/edit-species'))
)
const Patreon = lazy(() =>
  catchChunkDeaths(() => import('./containers/patreon'))
)
const ResetPassword = lazy(() =>
  catchChunkDeaths(() => import('./containers/reset-password'))
)
const Pedestals = lazy(() =>
  catchChunkDeaths(() => import('./containers/pedestals'))
)

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
  const [isLoadingUser, , username] = useUserRecord(UserFieldNames.username)
  const location = useLocation()

  useEffect(() => {
    scrollToTop(false)
  }, [location.pathname])

  if (searchTerm) {
    return <SearchResults />
  }

  if (isLoggedIn && !isLoadingUser && !username) {
    return <SetupProfile />
  }

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Switch>
        <Redirect
          // deprecated category
          from={routes.viewCategoryWithVar.replace(':categoryName', 'showcase')}
          to={routes.users}
        />
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
          from={routes.browseWithVar.replace(':tagName', ':speciesIdOrSlug')}
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
        <RouteWithMeta exact path={routes.admin} component={Admin} />
        <RouteWithMeta exact path={routes.adminUsers} component={AdminUsers} />
        <RouteWithMeta
          exact
          path={routes.adminHistory}
          component={AdminHistory}
        />
        <RouteWithMeta
          exact
          path={routes.adminAssets}
          component={AdminAssets}
        />
        <RouteWithMeta exact path={routes.adminPolls} component={AdminPolls} />
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
        <Route exact path={routes.createSpecies} component={CreateSpecies} />
        <Route exact path={routes.editSpeciesWithVar} component={EditSpecies} />
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
        <Route exact path={routes.searchWithVar} component={Search} />
        <Redirect
          from={routes.searchWithVarOld}
          to={routes.searchWithVar.replace(
            ':indexName',
            searchIndexNameLabels.ASSETS
          )}
        />
        <Route exact path={routes.viewAllSpecies} component={ViewAllSpecies} />
        <Route exact path={routes.editUserWithVar} component={EditUser} />
        <Route exact path={routes.viewUserWithVar} component={ViewUser} />
        <Route exact path={routes.stats} component={Stats} />
        <Route exact path={routes.users} component={Users} />
        <Route exact path={routes.activity} component={Activity} />
        <Route exact path={routes.requests} component={Requests} />
        <Route exact path={routes.createRequest} component={CreateRequest} />
        <Route exact path={routes.viewRequestWithVar} component={ViewRequest} />
        <Route exact path={routes.streams} component={Streams} />
        <Route exact path={routes.about} component={About} />
        <Route exact path={routes.adultAssets} component={AdultAssets} />
        <Route exact path={routes.authors} component={Authors} />
        <Route exact path={routes.createAuthor} component={EditAuthor} />
        <Route exact path={routes.editAuthorWithVar} component={EditAuthor} />
        <Route exact path={routes.viewAuthorWithVar} component={ViewAuthor} />
        <Route
          exact
          path={routes.createDiscordServer}
          component={EditDiscordServer}
        />
        <Route
          exact
          path={routes.editDiscordServerWithVar}
          component={EditDiscordServer}
        />
        <Route
          exact
          path={routes.viewDiscordServerWithVar}
          component={ViewDiscordServer}
        />
        <Route exact path={routes.discordServers} component={DiscordServers} />
        <Route exact path={routes.patreon} component={Patreon} />
        <Route exact path={routes.resetPassword} component={ResetPassword} />
        <Route exact path={routes.pedestals} component={Pedestals} />
        <Route
          component={() => (
            <ErrorContainer code={404} message="Page not found" />
          )}
        />
      </Switch>
    </Suspense>
  )
}

export default () => {
  const classes = useStyles()
  return (
    <ErrorBoundary>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Banner />
        <PageHeader />
        <main className="main">
          <div className={classes.mainContainer}>
            <BannedNotice />
            <Notices />
            <UnapprovedAssetsMessage />
            <MainContent />
          </div>
        </main>
        <PageFooter />
      </ThemeProvider>
    </ErrorBoundary>
  )
}
