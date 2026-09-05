import React, { useMemo } from 'react';
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
  Button,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MenuIcon from '@mui/icons-material/Menu';

const MOTIVATIONAL_QUOTES = [
  'Hôm nay là thời điểm lý tưởng để nạp từ vựng mới! ✨',
  'Mỗi ngày một chút, tiếng Hàn sẽ sớm thành phản xạ! 🚀',
  'Kiên trì học tập hôm nay, tự tin giao tiếp ngày mai! 🎯',
  'Thỏ Tokki đang đồng hành cùng bạn trên hành trình này! 🐰',
  'Luyện nghe và nói mỗi ngày để phản xạ thật tự nhiên! 🎧',
  'Tích lũy cà rốt và giữ vững ngọn lửa chuỗi học tập nhé! 🔥',
  'Đừng quên ôn lại các mẫu câu giao tiếp đời sống hôm nay! 💬',
  'Một chút nỗ lực mỗi ngày tạo nên sự thay đổi kỳ diệu! 🌸',
  'Học tiếng Hàn vui vẻ, tiến bộ không ngừng cùng Tokki! 🥕',
  'Hãy hoàn thành 1 bài học nhỏ để nhận thêm EXP ngay nào! ⚡',
  'Nghe nhiều, lặp lại nhiều là chìa khóa nói tiếng Hàn lưu loát! 🗣️',
  'Thành công bắt đầu từ những thói quen học tập nhỏ mỗi ngày! 🌟',
];

export const Navbar = ({ onDrawerToggle }) => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Greeting based on actual time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  }, []);

  // Random inspirational quote per session / page visit
  const randomQuote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[randomIndex];
  }, []);

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
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 2, md: 4 }, alignItems: 'center' }}>
        {/* Hamburger Menu button for mobile / tablet (< lg) */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{
            mr: { xs: 1, sm: 2 },
            display: { xs: 'inline-flex', lg: 'none' },
            p: 1,
            borderRadius: '12px',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Greeting on the left side (fills the empty space) */}
        <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
          <Typography
            variant="h5"
            noWrap
            sx={{
              fontWeight: 800,
              mb: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
            }}
          >
            {greeting}, {user?.name || user?.email?.split('@')?.[0] || 'bạn'}! <span style={{ fontSize: '1.2rem' }}>👋</span>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
            <Chip 
              label="Học viên Cấp 2 • TOPIK I Sơ cấp" 
              size="small" 
              sx={{
                bgcolor: 'rgba(151, 63, 105, 0.1)',
                color: 'primary.main',
                fontWeight: 700,
                fontSize: '0.7rem',
                display: { xs: 'none', sm: 'inline-flex' },
              }} 
            />
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontStyle: 'italic',
                display: { xs: 'none', md: 'inline' },
              }}
            >
              {randomQuote}
            </Typography>
          </Box>
        </Box>

        {/* Navigation Tab: Từ vựng */}
        <Stack direction="row" spacing={1} sx={{ mr: { xs: 1, sm: 2 }, alignItems: 'center', display: { xs: 'none', sm: 'flex' } }}>
          <Button
            component={Link}
            to="/vocabulary"
            startIcon={<MenuBookIcon sx={{ color: '#9D446E' }} />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: location.pathname.startsWith('/vocabulary') ? '#9D446E' : 'text.primary',
              bgcolor: location.pathname.startsWith('/vocabulary') ? '#FDF2F4' : 'background.paper',
              borderRadius: '12px',
              px: 1.8,
              py: 0.7,
              border: 1,
              borderColor: location.pathname.startsWith('/vocabulary') ? '#9D446E' : 'divider',
              boxShadow: location.pathname.startsWith('/vocabulary') ? '0 2px 8px rgba(157,68,110,0.15)' : 'none',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: '#FDF2F4', borderColor: '#9D446E', color: '#9D446E' },
            }}
          >
            Từ vựng
          </Button>
        </Stack>

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
