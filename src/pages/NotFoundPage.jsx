import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Stack spacing={2.5} alignItems="center">
        <Typography variant="h1" sx={{ fontSize: '4rem' }}>
          🐰❓
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          404 — Trang không tồn tại
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400 }}>
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang địa chỉ khác.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{ fontWeight: 700 }}
        >
          Quay lại Trang chủ
        </Button>
      </Stack>
    </Box>
  );
};
