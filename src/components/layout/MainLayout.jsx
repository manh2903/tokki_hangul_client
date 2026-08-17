import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export const MainLayout = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Navbar />
      <Box sx={{ flex: 1, display: 'flex', width: '100%', minWidth: 0 }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            p: { xs: 2, sm: 3, md: 4 },
            pb: { xs: 10, lg: 4 },
            width: '100%',
            overflowX: 'hidden',
          }}
        >
          <Box sx={{ maxWidth: 1400, mx: 'auto', width: '100%' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
      <MobileNav />
    </Box>
  );
};

export default MainLayout;
