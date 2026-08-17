import React from 'react';
import {
  Card as MuiCard,
  CardContent,
  Chip as MuiChip,
  LinearProgress,
  Box,
  Typography,
  Button as MuiButton,
  CircularProgress
} from '@mui/material';

export const Card = ({ children, hover = false, sx = {}, ...props }) => {
  return (
    <MuiCard
      sx={{
        transition: 'all 0.2s ease-in-out',
        ...(hover && {
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: (theme) =>
              theme.palette.mode === 'light'
                ? '0 8px 24px rgba(151, 63, 105, 0.1)'
                : '0 8px 24px rgba(0, 0, 0, 0.4)',
          },
        }),
        ...sx,
      }}
      {...props}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>{children}</CardContent>
    </MuiCard>
  );
};

export const Badge = ({ label, children, color = 'primary', variant = 'filled', size = 'small', sx = {} }) => {
  return (
    <MuiChip
      label={label || children}
      color={color}
      variant={variant}
      size={size}
      sx={{ fontWeight: 600, ...sx }}
    />
  );
};

export const ProgressBar = ({ value = 0, max = 100, color = 'primary', sx = {} }) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  return (
    <Box sx={{ width: '100%', ...sx }}>
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={color}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: (theme) => (theme.palette.mode === 'light' ? '#f0eee6' : '#2d2d2d'),
        }}
      />
    </Box>
  );
};

export const Button = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  loading = false,
  startIcon,
  endIcon,
  sx = {},
  ...props
}) => {
  return (
    <MuiButton
      variant={variant}
      color={color}
      size={size}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      endIcon={endIcon}
      disabled={loading || props.disabled}
      sx={sx}
      {...props}
    >
      {children}
    </MuiButton>
  );
};
