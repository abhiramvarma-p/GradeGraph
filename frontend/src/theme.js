import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#A35C7A',
      light: '#C890A7',
      dark: '#8B4B66',
      contrastText: '#fff',
    },
    secondary: {
      main: '#C890A7',
      light: '#FBF5E5',
      dark: '#A67A8E',
      contrastText: '#212121',
    },
    background: {
      default: '#FBF5E5',
      paper: '#fff',
    },
    text: {
      primary: '#212121',
      secondary: '#666666',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: '"Futura Book", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: '3.5rem',
      color: '#212121',
      fontFamily: 'Futura Book',
      letterSpacing: '0.02em',
    },
    h2: {
      fontWeight: 500,
      fontSize: '3rem',
      color: '#212121',
      fontFamily: 'Futura Book',
      letterSpacing: '0.02em',
    },
    h3: {
      fontWeight: 500,
      fontSize: '2.5rem',
      color: '#212121',
      fontFamily: 'Futura Book',
      letterSpacing: '0.02em',
    },
    h4: {
      fontWeight: 500,
      fontSize: '2rem',
      color: '#212121',
      fontFamily: 'Futura Book',
      letterSpacing: '0.02em',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.75rem',
      color: '#212121',
      fontFamily: 'Futura Book',
      letterSpacing: '0.02em',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.5rem',
      color: '#212121',
      fontFamily: 'Futura Book',
      letterSpacing: '0.02em',
    },
    subtitle1: {
      fontSize: '1.1rem',
      fontWeight: 500,
      color: '#212121',
      fontFamily: 'Futura Book',
    },
    subtitle2: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#666666',
      fontFamily: 'Futura Book',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#212121',
      fontFamily: 'Futura Book',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      color: '#666666',
      fontFamily: 'Futura Book',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontFamily: 'Futura Book',
    },
    caption: {
      fontSize: '0.75rem',
      color: '#666666',
      fontFamily: 'Futura Book',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '6px 16px',
          transition: 'all 0.2s ease',
          fontFamily: 'Futura Book',
        },
        outlined: {
          borderColor: '#A35C7A',
          color: '#A35C7A',
          '&:hover': {
            borderColor: '#C890A7',
            backgroundColor: 'rgba(163, 92, 122, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          backgroundImage: 'none',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontFamily: 'Futura Book',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: 'Futura Book',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#212121',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily: 'Futura Book',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: 'Futura Book',
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme; 