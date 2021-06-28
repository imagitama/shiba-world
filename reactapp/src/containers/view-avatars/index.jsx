import React, { createContext, useContext } from 'react'
import useDatabaseQuery, { AssetCategories, mapDates, SpeciesFieldNames } from '../../hooks/useDatabaseQuery'
import { useParams, useHistory } from 'react-router'
import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import PagesNavigation from '../../components/pages-navigation'
import SpeciesVsSelector from '../../components/species-vs-selector'
import Heading from '../../components/heading'
import AssetResults from '../../components/asset-results'
import * as routes from '../../routes'
import NoResultsMessage from '../../components/no-results-message'

const AvatarPageContext = createContext({ currentPageNumber: null })
const useAvatarPage = () => useContext(AvatarPageContext)

const getUrlForPageNumber = pageNumber => routes.viewCategoryWithVarAndPageVar.replace(':categoryName', AssetCategories.avatar).replace(':pageNumber', pageNumber)

const getPageNumberForSpeciesId = (speciesWithPageNumbers, speciesId) => {
    const match = speciesWithPageNumbers.find(({ id }) => id === speciesId)
    return match.pageNumber
}

function Species() {
    const { speciesWithPageNumbers } = useAvatarPage()
    const { push } = useHistory()

    const onSpeciesClickWithId = speciesId => {
        const pageNumber = getPageNumberForSpeciesId(speciesWithPageNumbers, speciesId)

        // navigate to that page

        push(getUrlForPageNumber(pageNumber))
    }

    return (
        <div>
          <SpeciesVsSelector
            species={speciesWithPageNumbers}
            onSpeciesClick={onSpeciesClickWithId}
          />
        </div>
    )
}

function Avatars({ avatars }) {
    return <AssetResults assets={avatars.map(mapDates)} />
}

function Page() {
    const { currentPageNumber, speciesWithPageNumbers } = useAvatarPage()
    const [isLoading, isError, page] = useDatabaseQuery('avatarPages', `page${currentPageNumber}`)

    const { avatarsBySpeciesId } = page || { avatarsBySpeciesId: {} }

    if (isLoading) {
        return <LoadingIndicator message="Loading avatars..." />
    }

    if (isError) {
        return <ErrorMessage>Failed to load avatars (code {isError ? '201' : '202'})</ErrorMessage>
    }

    if (!page || !Object.keys(avatarsBySpeciesId).length) {
        return <NoResultsMessage />
    }

    return (
        <div>
            {Object.entries(avatarsBySpeciesId).map(([speciesId, avatars]) => {
                const matchingSpecies = speciesWithPageNumbers.find(({ id }) => id === speciesId)

                if (!speciesId) {
                    throw new Error(`Could not find species with id "${speciesId}" (code 203)`)
                }

                return (
                    <div>
                        <Heading variant="h2">{matchingSpecies[SpeciesFieldNames.pluralName]}</Heading>
                        <Avatars avatars={avatars} />
                    </div>
                )
            })}
        </div>
    )
}

export default () => {
    const [isLoadingSummary, isErrorLoadingSummary, summary] = useDatabaseQuery('avatarPages', 'summary')
    const { pageNumber: pageNumberFromUrl = 1 } = useParams()
    const { push } = useHistory()

    const currentPageNumber = parseInt(pageNumberFromUrl)

    const { speciesWithPageNumbers, pageCount } = summary || { speciesWithPageNumbers: [], pageCount: 0 }

    if (isLoadingSummary) {
        return <LoadingIndicator message="Loading avatars..." />
    }

    const isInvalid = !summary || !pageCount || !speciesWithPageNumbers.length

    if (isErrorLoadingSummary || isInvalid) {
        return <ErrorMessage>Failed to load the avatars page (code {isErrorLoadingSummary ? '101' : '102'}). Please try again later</ErrorMessage>
    }

    return (
        <AvatarPageContext.Provider value={{ currentPageNumber, speciesWithPageNumbers }}>
            <div>
                <Heading variant="h1">Avatars</Heading>
                <Species />
                <Page />
                <PagesNavigation 
                pageCount={pageCount} 
                currentPageNumber={currentPageNumber}
                onClickWithPageNumber={pageNumber => push(getUrlForPageNumber(pageNumber))} />
            </div>
        </AvatarPageContext.Provider>
    )
}