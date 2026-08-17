import React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export const Navbar = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
        {/* Brand Logo & Title */}
        <Box
          component={Link}
          to="/app"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <Box
            component="img"
            src="/tokki_hangul_logo.svg"
            alt="Tokki Hangul Logo"
            sx={{
              height: 40,
              width: 'auto',
              objectFit: 'contain',
            }}
          />
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.1 }}>
              Tokki Hangul
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              HỌC TIẾNG HÀN CÙNG AI
            </Typography>
          </Box>
        </Box>

        {/* Gamification Counters & Actions */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Streak Counter */}
          <Chip
            icon={<LocalFireDepartmentIcon sx={{ color: '#ff6b8b !important' }} />}
            label={`${user?.streakDays || 0} ngày`}
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fff0f3' : 'rgba(255, 107, 139, 0.15)'),
              color: 'secondary.main',
              border: 1,
              borderColor: 'secondary.light',
            }}
          />

          {/* EXP Badge */}
          <Chip
            icon={<AutoAwesomeIcon sx={{ color: '#973f69 !important' }} />}
            label={`${user?.expPoints || 0} EXP`}
            size="small"
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              fontWeight: 700,
              bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151, 63, 105, 0.15)'),
              color: 'primary.main',
              border: 1,
              borderColor: 'primary.light',
            }}
          />

          {/* Theme Toggle */}
          <Tooltip title={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}>
            <IconButton onClick={toggleTheme} size="small" color="inherit">
              {isDark ? <Brightness7Icon sx={{ color: '#ffb74d' }} /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          {/* User Avatar */}
          <Tooltip title="Trang cá nhân & Cài đặt">
            <IconButton onClick={() => navigate('/profile')} sx={{ p: 0.5 }}>
              <Avatar
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                sx={{ width: 34, height: 34, border: 2, borderColor: 'primary.main' }}
              />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
