export const USER_IS_LOADING = 'user/USER_IS_LOADING'
export const USER_IS_ERRORED = 'user/USER_IS_ERRORED'
export const USER_LOADED = 'user/USER_LOADED'
export const USER_UNLOADED = 'user/USER_UNLOADED'

const initialState = {
  isLoading: false,
  isErrored: false,
  record: null // immutable record for deep equality checks
}

export default (state = initialState, action) => {
  switch (action.type) {
    case USER_IS_LOADING:
      return {
        ...state,
        isLoading: true
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
        record: action.record // immutable record
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
