import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5b9aff',
      light: '#82b1ff',
      dark: '#3d7be8',
    },
    secondary: {
      main: '#ffb300',
      light: '#ffca28',
      dark: '#ff8f00',
    },
    background: {
      default: '#0a0e27',
      paper: 'rgba(10,14,39,0.75)',
    },
    text: {
      primary: 'rgba(255,255,255,0.9)',
      secondary: 'rgba(150,200,255,0.6)',
    },
    divider: 'rgba(255,255,255,0.08)',
    action: {
      hover: 'rgba(100,180,255,0.08)',
      selected: 'rgba(100,180,255,0.12)',
      disabledBackground: 'rgba(255,255,255,0.05)',
    },
    info: { main: '#5b9aff' },
    success: { main: '#00dbb4', light: 'rgba(0,219,180,0.15)' },
    warning: { main: '#ffb300', light: 'rgba(255,180,0,0.15)' },
    error: { main: '#ff6b6b', light: 'rgba(255,80,80,0.15)' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, color: 'rgba(255,255,255,0.92)' },
    h5: { fontWeight: 600, color: 'rgba(255,255,255,0.92)' },
    h6: { fontWeight: 600, color: 'rgba(255,255,255,0.92)' },
    subtitle1: { color: 'rgba(255,255,255,0.85)' },
    body2: { color: 'rgba(255,255,255,0.75)' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #0a0e27 0%, #1a1040 40%, #0d1b3e 70%, #0a0e27 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
        '&::-webkit-scrollbar': { width: 6 },
        '&::-webkit-scrollbar-track': { bgcolor: 'rgba(255,255,255,0.02)' },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(10,14,39,0.9) 0%, rgba(26,16,64,0.9) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(100,180,255,0.1)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, rgba(10,14,39,0.95) 0%, rgba(15,10,35,0.95) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRight: '1px solid rgba(100,180,255,0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(10,14,39,0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(100,180,255,0.1)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
          borderRadius: 12,
          '&:hover': {
            boxShadow: '0 6px 30px rgba(0,0,0,0.35)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'rgba(10,14,39,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(100,180,255,0.12)',
          boxShadow: '0 8px 60px rgba(0,0,0,0.6)',
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 20px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, rgba(0,100,255,0.3) 0%, rgba(0,150,255,0.2) 100%)',
          border: '1px solid rgba(0,150,255,0.3)',
          boxShadow: '0 0 20px rgba(0,150,255,0.08)',
          color: 'rgba(150,220,255,0.95)',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(0,100,255,0.45) 0%, rgba(0,150,255,0.35) 100%)',
            boxShadow: '0 0 30px rgba(0,150,255,0.15)',
          },
          '&.Mui-disabled': {
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.2)',
          },
        },
        outlined: {
          borderColor: 'rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.7)',
          '&:hover': {
            borderColor: 'rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.05)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            minHeight: '2.5em',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.85)',
            borderRadius: 8,
            '& fieldset': { border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 },
            '&:hover fieldset': { borderColor: 'rgba(100,180,255,0.3) !important' },
            '&.Mui-focused fieldset': { borderColor: 'rgba(100,180,255,0.5) !important' },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(150,200,255,0.5)',
            '&.Mui-focused': { color: 'rgba(100,200,255,0.7)' },
          },
          '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.4)' },
          '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: 'rgba(150,200,255,0.5)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.7rem',
        },
        filled: {
          '&.MuiChip-colorSuccess': {
            background: 'rgba(0,219,180,0.15)',
            color: '#00dbb4',
          },
          '&.MuiChip-colorInfo': {
            background: 'rgba(91,154,255,0.15)',
            color: '#5b9aff',
          },
          '&.MuiChip-colorWarning': {
            background: 'rgba(255,180,0,0.15)',
            color: '#ffb300',
          },
          '&.MuiChip-colorError': {
            background: 'rgba(255,80,80,0.15)',
            color: '#ff6b6b',
          },
          '&.MuiChip-colorDefault': {
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.6)',
          },
        },
        outlined: {
          borderColor: 'rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.6)',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          background: 'transparent',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            background: 'rgba(255,255,255,0.03)',
            color: 'rgba(150,200,255,0.7)',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 700,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            background: 'rgba(100,180,255,0.05) !important',
          },
          '& .MuiTableCell-body': {
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.75)',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: 'rgba(255,255,255,0.75)',
          '&:hover': { background: 'rgba(100,180,255,0.1)' },
          '&.Mui-selected': { background: 'rgba(100,180,255,0.15)' },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          background: 'transparent',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255,255,255,0.06)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 4,
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardSuccess: {
          background: 'rgba(0,219,180,0.12)',
          color: 'rgba(0,219,180,0.9)',
          '& .MuiAlert-icon': { color: '#00dbb4' },
        },
        standardWarning: {
          background: 'rgba(255,180,0,0.12)',
          color: 'rgba(255,200,0,0.9)',
          '& .MuiAlert-icon': { color: '#ffb300' },
        },
        standardError: {
          background: 'rgba(255,80,80,0.1)',
          color: 'rgba(255,100,100,0.9)',
          '& .MuiAlert-icon': { color: '#ff6b6b' },
        },
        standardInfo: {
          background: 'rgba(91,154,255,0.12)',
          color: 'rgba(150,200,255,0.9)',
          '& .MuiAlert-icon': { color: '#5b9aff' },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: 'rgba(10,14,39,0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.8)',
          fontSize: '0.7rem',
          borderRadius: 6,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          background: 'rgba(10,14,39,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          borderRadius: 10,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.5)',
          '&.Mui-selected': {
            color: 'rgba(150,220,255,0.9)',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          background: 'linear-gradient(90deg, #5b9aff, #00dbb4)',
        },
      },
    },
  },
});

export default theme;
