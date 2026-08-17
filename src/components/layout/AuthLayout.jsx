import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';

export const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              mb: 1,
            }}
          >
            <Box
              component="img"
              src="/tokki_hangul_logo.svg"
              alt="Tokki Hangul Logo"
              sx={{ height: 48, width: 'auto', objectFit: 'contain' }}
            />
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.1 }}>
                Tokki Hangul
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                HỌC TIẾNG HÀN CÙNG AI
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Nền tảng học tiếng Hàn thông minh cùng trợ lý ảo AI
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, border: 1, borderColor: 'divider', borderRadius: '24px' }}>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
};
