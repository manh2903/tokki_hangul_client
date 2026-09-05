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
        bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(18, 18, 18, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        pt: 2,
        pb: 1,
        color: 'text.primary',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 }, alignItems: 'flex-start' }}>
        {/* Greeting on the left side (fills the empty space) */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            Chào buổi sáng, {user?.name || user?.email || 'bạn'}! <span style={{ fontSize: '1.5rem' }}>👋</span>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label="Học viên Cấp 2 • TOPIK I Sơ cấp" 
              size="small" 
              sx={{ bgcolor: 'rgba(151, 63, 105, 0.1)', color: 'primary.main', fontWeight: 700, fontSize: '0.7rem' }} 
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Hôm nay là thời điểm lý tưởng để nạp từ vựng mới!
            </Typography>
          </Box>
        </Box>

        {/* Gamification Counters & Actions */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Streak Counter */}
          <Tooltip title={`Chuỗi học tập: ${user?.streakDays || 0} ngày liên tục. Học mỗi ngày để duy trì chuỗi!`}>
            <Chip
              icon={<LocalFireDepartmentIcon sx={{ color: '#ff6b8b !important' }} />}
              label={`${user?.streakDays || 0} ngày`}
              size="small"
              sx={{
                cursor: 'pointer',
                fontWeight: 700,
                bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fff0f3' : 'rgba(255, 107, 139, 0.15)'),
                color: 'secondary.main',
                border: 1,
                borderColor: 'secondary.light',
              }}
            />
          </Tooltip>

          {/* EXP Badge */}
          <Tooltip title="Điểm kinh nghiệm: Tích lũy để thăng hạng và leo bảng xếp hạng Tokki">
            <Chip
              icon={<AutoAwesomeIcon sx={{ color: '#973f69 !important' }} />}
              label={`${user?.expPoints || 0} EXP`}
              size="small"
              sx={{
                cursor: 'pointer',
                display: { xs: 'none', sm: 'inline-flex' },
                fontWeight: 700,
                bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151, 63, 105, 0.15)'),
                color: 'primary.main',
                border: 1,
                borderColor: 'primary.light',
              }}
            />
          </Tooltip>

          {/* Carrot Badge */}
          <Tooltip title="Cà rốt Tokki: Tiền tệ dùng để bảo vệ chuỗi ngày & mở khóa tính năng trong Cửa hàng">
            <Chip
              label={`🥕 ${user?.carrots || 0}`}
              size="small"
              sx={{
                cursor: 'pointer',
                display: { xs: 'none', md: 'inline-flex' },
                fontWeight: 700,
                bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fff7ed' : 'rgba(249, 115, 22, 0.15)'),
                color: '#ea580c',
                border: 1,
                borderColor: '#fdba74',
              }}
            />
          </Tooltip>

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
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                sx={{ width: 34, height: 34, border: 2, borderColor: 'primary.main' }}
              />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
