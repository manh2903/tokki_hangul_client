import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  Divider,
  Link as MuiLink,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export const RegisterPage = () => {
  const { register, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password);
      navigate('/onboarding/goal');
    } catch (err) {
      setError(err?.message || 'Đăng ký không thành công');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('Không nhận được thông tin xác thực từ Google');
      return;
    }
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/onboarding/goal');
    } catch (err) {
      setError(err?.message || 'Đăng ký bằng Google thất bại');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Đăng nhập/Đăng ký Google không thành công. Vui lòng thử lại.');
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Đăng ký tài khoản
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Bắt đầu học tiếng Hàn chuẩn TOPIK cùng trợ lý ảo Tokki
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {/* Google Sign-in */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 1 }}>
        {googleLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
            <CircularProgress size={22} color="primary" />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Đang xác thực tài khoản Google...
            </Typography>
          </Box>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="outline"
            size="large"
            width="320"
            text="signup_with"
          />
        )}
      </Box>

      <Divider sx={{ my: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', px: 1 }}>
          HOẶC BẰNG EMAIL
        </Typography>
      </Divider>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          <TextField
            label="Họ và tên"
            type="text"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Mật khẩu"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={loading || googleLoading}
            startIcon={<AutoAwesomeIcon />}
            sx={{ py: 1.2, fontWeight: 700 }}
          >
            Tạo tài khoản & Bắt đầu
          </Button>
        </Stack>
      </Box>

      <Box sx={{ textAlign: 'center', pt: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Đã có tài khoản?{' '}
          <MuiLink component={RouterLink} to="/login" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Đăng nhập
          </MuiLink>
        </Typography>
      </Box>
    </Stack>
  );
};
