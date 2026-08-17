import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#973f69',
        light: '#f8d7da',
        dark: '#7b2852',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#ff6b8b',
        light: '#ff95c3',
        dark: '#c43a5e',
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'light' ? '#fbf9f1' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#1b1c17' : '#f5f5f5',
        secondary: mode === 'light' ? '#584144' : '#b0a8a9',
      },
      success: {
        main: '#2e7d32',
        light: '#e8f5e9',
        dark: '#1b5e20',
      },
      warning: {
        main: '#ed6c02',
        light: '#fff3e0',
      },
      divider: mode === 'light' ? '#e4e3db' : '#2d2d2d',
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Noto Sans KR", "Pretendard", sans-serif',
      h1: {
        fontSize: '2.25rem',
        fontWeight: 800,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: '1.75rem',
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontSize: '1.35rem',
        fontWeight: 700,
      },
      h4: {
        fontSize: '1.15rem',
        fontWeight: 600,
      },
      subtitle1: {
        fontSize: '0.95rem',
        fontWeight: 600,
      },
      subtitle2: {
        fontSize: '0.85rem',
        fontWeight: 500,
      },
      body1: {
        fontSize: '0.95rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.85rem',
        lineHeight: 1.5,
      },
      button: {
        fontWeight: 700,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '8px 20px',
            fontSize: '0.9rem',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(151, 63, 105, 0.15)',
            },
          },
          containedPrimary: {
            backgroundColor: '#973f69',
            color: '#ffffff',
            fontWeight: 700,
            '&:hover': {
              backgroundColor: '#7b2852',
            },
          },
          containedSecondary: {
            backgroundColor: '#ff6b8b',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#e05373',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            boxShadow: mode === 'light' ? '0 2px 14px rgba(0, 0, 0, 0.04)' : '0 2px 14px rgba(0, 0, 0, 0.25)',
            border: `1px solid ${mode === 'light' ? '#edece6' : '#2d2d2d'}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 18,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.75rem',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  });

export default getAppTheme;
