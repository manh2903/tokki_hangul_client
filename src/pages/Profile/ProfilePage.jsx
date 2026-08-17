import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  Paper,
  Avatar,
  Divider,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/api';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import EmailIcon from '@mui/icons-material/Email';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export const ProfilePage = () => {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState(authUser || {});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await usersApi.getMe();
        const data = res?.data || res;
        if (data) {
          setProfile(data);
        }
      } catch (err) {
        console.warn('Failed to fetch profile:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const user = profile || authUser;

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Hồ sơ cá nhân & Cài đặt
        </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Quản lý tài khoản và tuỳ chỉnh mục tiêu học tập tiếng Hàn của bạn.
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2.5} alignItems="center">
                <Avatar
                  src={user?.avatar || user?.picture || ''}
                  sx={{ width: 68, height: 68, border: 2, borderColor: 'primary.main', bgcolor: 'primary.main', fontWeight: 800, fontSize: '1.5rem' }}
                >
                  {(user?.name || user?.email || 'U')[0].toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {user?.name || user?.fullName || 'Học viên'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                    <EmailIcon fontSize="inherit" /> {user?.email || 'Chưa cập nhật email'}
                  </Typography>
                  {user?.currentLevel && (
                    <Chip
                      label={user.currentLevel}
                      color="primary"
                      size="small"
                      sx={{ mt: 1, fontWeight: 700 }}
                    />
                  )}
                </Box>
              </Stack>

              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '14px',
                      bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fff0f3' : 'rgba(255, 107, 139, 0.15)'),
                      border: 1,
                      borderColor: 'secondary.light',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocalFireDepartmentIcon fontSize="inherit" /> Chuỗi học tập
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
                      {user?.streakDays || user?.streak_days || 0} ngày liên tục
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '14px',
                      bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151, 63, 105, 0.15)'),
                      border: 1,
                      borderColor: 'primary.light',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AutoAwesomeIcon fontSize="inherit" /> Điểm tích luỹ
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
                      {user?.expPoints || user?.points || 0} EXP
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Divider />

              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
              >
                Đăng xuất tài khoản
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
  );
};
