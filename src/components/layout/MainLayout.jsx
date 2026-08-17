import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export const MainLayout = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="xl" disableGutters sx={{ flex: 1, display: 'flex', width: '100%' }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            pb: { xs: 10, lg: 4 },
            maxWidth: '100%',
            overflowX: 'hidden',
          }}
        >
          <Outlet />
        </Box>
      </Container>
      <MobileNav />
    </Box>
  );
};
