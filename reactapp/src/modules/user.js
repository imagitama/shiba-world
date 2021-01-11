export const USER_IS_LOADING = 'user/USER_IS_LOADING'
export const USER_IS_DONE_LOADING = 'user/USER_IS_DONE_LOADING'
export const USER_IS_ERRORED = 'user/USER_IS_ERRORED'
export const USER_LOADED = 'user/USER_LOADED'
export const USER_UNLOADED = 'user/USER_UNLOADED'

const initialState = {
  isLoading: true,
  isErrored: false,
  record: null // initialize as null for setup profile component
}

export default (state = initialState, action) => {
  switch (action.type) {
    case USER_IS_LOADING:
      return {
        ...state,
        isLoading: true
      }

    case USER_IS_DONE_LOADING:
      return {
        ...state,
        isLoading: false
      }

    case USER_IS_ERRORED:
      return {
        ...state,
        isErrored: true
      }

    case USER_LOADED:
      return {
        ...state,
        isLoading: false,
        isErrored: false,
        record: action.record
      }

    case USER_UNLOADED:
      return {
        ...state,
        isLoading: false,
        isErrored: false,
        record: null
      }

    default:
      return state
  }
}
