export const home = '/'
export const login = '/login'
export const logout = '/logout'
export const createAsset = '/assets/create'
export const editAssetWithVar = '/assets/:assetId/?edit'
export const oldEditAssetWithVar = '/assets/:assetId/edit'
export const viewAssetWithVar = '/assets/:assetId'
export const admin = '/admin'
export const myAccount = '/my-account'
export const privacyPolicy = '/privacy-policy'
export const signUp = '/sign-up'
export const contributors = '/contributors'
export const unapproved = '/unapproved'
export const viewAllSpecies = '/species'
export const viewSpeciesWithVar = '/species/:speciesIdOrSlug'
export const viewSpeciesCategoryWithVar =
  '/species/:speciesIdOrSlug/:categoryName'
export const viewCategoryWithVar = '/category/:categoryName'
export const viewCategoryWithVarAndPageVar = '/category1/:categoryName/:pageNumber?' // for avatars pagination
export const news = '/news'
export const viewTagWithVar = '/tags/:tagName'
export const searchWithVarOld = '/search/:searchTerm'
export const searchWithVar = '/search/:indexName/:searchTerm'
export const viewUserWithVar = '/users/:userId'
export const editUserWithVar = '/users/:userId/edit'
export const stats = '/stats'
export const users = '/users'
export const activity = '/activity'
export const requests = '/requests'
export const viewRequestWithVar = '/requests/:requestId'
export const createRequest = '/requests/create'
export const streams = '/streams'
export const about = '/about'
export const nsfw = '/nsfw'
export const authors = '/authors'
export const viewAuthorWithVar = '/authors/:authorId'
export const editAuthorWithVar = '/authors/:authorId/edit'
export const createAuthor = '/authors/create'
export const discordServers = '/discord-servers'
export const viewDiscordServerWithVar = '/discord-servers/:discordServerId'
export const editDiscordServerWithVar = '/discord-servers/:discordServerId/edit'
export const createDiscordServer = '/discord-servers/create'
export const editSpeciesWithVar = '/species/:speciesId/edit'
export const createSpecies = '/species/create'
export const patreon = '/patreon'
export const resetPassword = '/reset-password'
export const pedestals = '/pedestals'
export const vsScreen = '/vs-screen'
export const tags = '/tags'
export const memoryGame = '/memory'
export const guessTheAvatar = '/guess-the-avatar'
export const launchWorldWithVar = '/assets/:assetId/launch'
export const viewProducts = '/products'
export const viewProductWithVar = '/products/:productId'
export const editProductWithVar = '/products/:productId/edit'
export const createProduct = '/products/create'
export const viewTransactions = '/transactions'
export const viewTransactionWithVar = '/transactions/:transactionId'
export const createTransactionWithVar = '/transactions/create/:productId'
export const setupProfile = '/setup-profile'
export const createReportWithAssetVar = '/reports/create/:assetId'
export const editReportWithVar = '/reports/edit/:reportId'
export const viewReportWithVar = '/reports/:reportId'
export const dmcaPolicy = '/dcma-policy'
export const avatarTutorial = '/avatar-tutorial'
export const avatarTutorialWithVar = '/avatar-tutorial/:pageName'
export const viewAwardWithVar = '/awards/:awardId'
export const viewConversationWithVar = '/conversation/:conversationId'
export const viewConversationWithoutVar = '/conversation'

// Outdated routes
export const browseAssets = '/browse'
export const browseTutorials = '/browse/tutorial'
export const browseWithVar = '/browse/:tagName'
