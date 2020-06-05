import { createMuiTheme } from '@material-ui/core/styles'

const colorBrand = '#6e4a9e'
const colorBrandLight = '#9E85C4'

const createTheme = isDark =>
  createMuiTheme({
    palette: {
      type: isDark ? 'dark' : undefined,
      primary: {
        light: colorBrandLight,
        main: colorBrand,
        dark: '#49326B'
      },
      secondary: {
        light: '#5C1B96',
        main: isDark ? '#9E85C4' : '#461470',
        dark: '#240b36'
      },
      background: {
        default: isDark ? '#282828' : 'hsl(25, 1%, 90%)'
      }
    },
    overrides: {
      MuiCssBaseline: {
        '@global': {
          html: {
            WebkitFontSmoothing: 'auto'
          },
          a: {
            color: isDark ? colorBrandLight : colorBrand,
            textDecoration: 'none'
          },
          strong: {
            fontWeight: 600
          }
        }
      }
    }
  })

export const lightTheme = createTheme(false)
export const darkTheme = createTheme(true)
