import React from 'react';
import {
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Button,
  Drawer,
  IconButton,
} from '@mui/material';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import SchoolIcon from '@mui/icons-material/School';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StyleIcon from '@mui/icons-material/Style';
import InsightsIcon from '@mui/icons-material/Insights';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import SparklesIcon from '@mui/icons-material/AutoAwesome';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CloseIcon from '@mui/icons-material/Close';

const MENU_SECTIONS = [
  {
    title: 'Học tập',
    items: [
      { label: 'Trang chủ', path: '/app', icon: HomeIcon },
      { label: 'Kho Từ vựng', path: '/vocabulary', icon: MenuBookIcon },
      { label: 'Lộ trình AI', path: '/onboarding/path-preview', icon: ExploreIcon, badge: 'Smart' },
      { label: 'Luyện thi TOPIK', path: '/topik', icon: SchoolIcon },
      { label: 'Học qua Video', path: '/video', icon: OndemandVideoIcon },
    ],
  },
  {
    title: 'Kỹ năng & AI',
    items: [
      { label: 'Gọi thoại Live AI', path: '/ai-voice-call', icon: PhoneInTalkIcon, badge: 'Live' },
      { label: 'Giao tiếp & AI', path: '/conversation', icon: RecordVoiceOverIcon },
      { label: 'AI Tutor 24/7', path: '/ai-tutor', icon: SmartToyIcon, badge: 'AI' },
    ],
  },
  {
    title: 'Ôn luyện & Phân tích',
    items: [
      { label: 'Ôn tập SRS & Game', path: '/review', icon: StyleIcon },
      { label: 'Tiến độ học tập', path: '/progress', icon: InsightsIcon },
    ],
  },
];

export const Sidebar = ({ mobileOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) {
      onClose();
    }
  };

  const renderContent = (isMobile = false) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'transparent' },
        '&:hover::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: '10px' },
      }}
    >
      {/* Brand Logo & Title */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          pb: 1,
        }}
      >
        <Box
          component={Link}
          to="/app"
          onClick={() => handleNavigate('/app')}
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
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.1 }}>
              Tokki Hangul
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              HỌC TIẾNG HÀN CÙNG AI
            </Typography>
          </Box>
        </Box>

        {isMobile && (
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Menu Sections */}
      <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {MENU_SECTIONS.map((section, idx) => (
          <Box key={idx}>
            <Typography
              variant="caption"
              sx={{
                px: 1.5,
                pb: 1,
                display: 'block',
                fontWeight: 800,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.65rem',
              }}
            >
              {section.title}
            </Typography>

            <List component="nav" sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isSelected =
                  item.path === '/app'
                    ? location.pathname === '/app' || location.pathname === '/home'
                    : location.pathname.startsWith(item.path);

                return (
                  <ListItemButton
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    selected={isSelected}
                    sx={{
                      borderRadius: '12px',
                      py: 1,
                      px: 1.5,
                      color: isSelected ? 'primary.main' : 'text.primary',
                      bgcolor: isSelected ? (theme) => (theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151, 63, 105, 0.15)') : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: isSelected ? (theme) => (theme.palette.mode === 'light' ? '#f8e1ec' : 'rgba(151, 63, 105, 0.25)') : (theme) => (theme.palette.mode === 'light' ? '#f5f3e9' : 'action.hover'),
                      },
                      '&.Mui-selected': {
                        bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151, 63, 105, 0.15)'),
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: isSelected ? 'primary.main' : 'text.secondary' }}>
                      <Icon sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? 800 : 600,
                      }}
                    />
                    {item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          bgcolor: isSelected ? 'primary.main' : 'secondary.light',
                          color: isSelected ? '#ffffff' : 'secondary.dark',
                        }}
                      />
                    )}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Promo Card */}
      <Box sx={{ p: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151, 63, 105, 0.15)'),
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'primary.light',
            borderRadius: '24px'
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              mx: 'auto',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ff6b8b, #973f69)',
              color: 'white',
              boxShadow: '0 3px 0 0 #621c3f',
            }}
          >
            <SparklesIcon />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            Bắt đầu kiểm tra
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2, lineHeight: 1.4 }}>
            Test 10 phút để AI tự động tối ưu hoá lộ trình học cho riêng bạn.
          </Typography>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => handleNavigate('/onboarding/placement-test')}
            sx={{
              py: 1,
              fontSize: '0.8rem',
            }}
          >
            Làm bài Test ngay
          </Button>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Permanent Sidebar for desktop (lg and above) */}
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: 260,
          flexShrink: 0,
          height: '100vh',
          position: 'sticky',
          top: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
        }}
      >
        {renderContent(false)}
      </Box>

      {/* Temporary Mobile Drawer (below lg) */}
      <Drawer
        variant="temporary"
        open={Boolean(mobileOpen)}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {renderContent(true)}
      </Drawer>
    </>
  );
};

export default Sidebar;
