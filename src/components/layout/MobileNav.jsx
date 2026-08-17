import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StyleIcon from '@mui/icons-material/Style';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';

const MOBILE_ITEMS = [
  { label: 'Trang chủ', path: '/', icon: <HomeIcon /> },
  { label: 'Live Call', path: '/ai-voice-call', icon: <PhoneInTalkIcon /> },
  { label: 'TOPIK', path: '/topik', icon: <SchoolIcon /> },
  { label: 'Hội thoại', path: '/conversation', icon: <RecordVoiceOverIcon /> },
  { label: 'Video', path: '/video', icon: <OndemandVideoIcon /> },
  { label: 'AI Tutor', path: '/ai-tutor', icon: <SmartToyIcon /> },
];

export const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath =
    MOBILE_ITEMS.find((item) =>
      item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
    )?.path || '/';

  return (
    <Paper
      elevation={4}
      sx={{
        display: { xs: 'block', lg: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        borderRadius: 0,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <BottomNavigation
        value={currentPath}
        onChange={(_, newValue) => navigate(newValue)}
        showLabels
        sx={{
          bgcolor: 'background.paper',
          '& .Mui-selected': {
            color: 'primary.main',
            fontWeight: 700,
          },
        }}
      >
        {MOBILE_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            value={item.path}
            icon={item.icon}
            sx={{ minWidth: 0, p: 0.5 }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};
