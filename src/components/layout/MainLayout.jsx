import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export const MainLayout = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {/* Full-height Sidebar on desktop */}
      <Sidebar />
      
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Navbar only spans the main content area */}
        <Navbar />
        
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
      
      {/* Mobile navigation remains at bottom for xs screens */}
      <MobileNav />
    </Box>
  );
};

export default MainLayout;
