import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const contentRef = useRef(null);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  // Automatically scroll content to top on route change & ensure body is not locked
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
    document.body.style.overflow = '';
  }, [location.pathname]);

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar: Independent scroll on desktop, drawer on mobile */}
      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />

      {/* Main Content Area: Independent scroll container */}
      <Box
        ref={contentRef}
        id="main-content-scroll-container"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          minWidth: 0,
          position: 'relative',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Sticky Navbar at top of main content */}
        <Navbar onDrawerToggle={handleDrawerToggle} />

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            p: { xs: 2, sm: 3, md: 4 },
            pb: 6,
            width: '100%',
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

