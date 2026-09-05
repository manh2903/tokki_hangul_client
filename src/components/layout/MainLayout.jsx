import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {/* Sidebar handles both desktop permanent and mobile drawer */}
      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />
      
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Navbar with hamburger menu button for mobile/tablet */}
        <Navbar onDrawerToggle={handleDrawerToggle} />
        
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            p: { xs: 2, sm: 3, md: 4 },
            pb: 4,
            width: '100%',
            overflowX: 'hidden',
          }}
        >
          <Box sx={{ maxWidth: 1400, mx: 'auto', width: '100%' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
