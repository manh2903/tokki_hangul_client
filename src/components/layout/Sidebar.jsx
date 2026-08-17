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
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import SchoolIcon from '@mui/icons-material/School';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StyleIcon from '@mui/icons-material/Style';
import InsightsIcon from '@mui/icons-material/Insights';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

const NAV_ITEMS = [
  { label: 'Trang chủ', path: '/app', icon: HomeIcon },
  { label: 'Lộ trình AI', path: '/onboarding/path-preview', icon: ExploreIcon, badge: 'Smart' },
  { label: 'Luyện thi TOPIK', path: '/topik', icon: SchoolIcon },
  { label: 'Giao tiếp & AI', path: '/conversation', icon: RecordVoiceOverIcon },
  { label: 'Học qua Video', path: '/video', icon: OndemandVideoIcon },
  { label: 'AI Tutor 24/7', path: '/ai-tutor', icon: SmartToyIcon, badge: 'AI' },
  { label: 'Ôn tập SRS & Game', path: '/review', icon: StyleIcon },
  { label: 'Tiến độ học tập', path: '/progress', icon: InsightsIcon },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Paper
      elevation={0}
      sx={{
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: 250,
        flexShrink: 0,
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        top: 64,
        borderRight: 1,
        borderColor: 'divider',
        p: 2,
        borderRadius: 0,
        bgcolor: 'background.paper',
      }}
    >
      <Box>
        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            py: 1,
            display: 'block',
            fontWeight: 800,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Chương trình học
        </Typography>

        <List component="nav" sx={{ p: 0 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isSelected =
              item.path === '/app'
                ? location.pathname === '/app' || location.pathname === '/home'
                : location.pathname.startsWith(item.path);

            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                selected={isSelected}
                sx={{
                  borderRadius: '12px',
                  mb: 0.5,
                  py: 1,
                  px: 1.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: '#ffffff',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#ffffff',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: isSelected ? '#ffffff' : 'text.secondary' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isSelected ? 700 : 500,
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
                      bgcolor: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'secondary.light',
                      color: isSelected ? '#ffffff' : 'secondary.dark',
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Placement Test Promo Card */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '16px',
          bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151, 63, 105, 0.15)'),
          border: 1,
          borderColor: 'primary.light',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <AssignmentTurnedInIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Kiểm tra trình độ
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
          Test 10 phút để AI tự động tối ưu hoá lộ trình học cho riêng bạn.
        </Typography>
        <Button
          fullWidth
          variant="contained"
          size="small"
          onClick={() => navigate('/onboarding/placement-test')}
          sx={{ fontSize: '0.75rem', py: 0.75 }}
        >
          Làm bài Test ngay
        </Button>
      </Paper>
    </Paper>
  );
};
