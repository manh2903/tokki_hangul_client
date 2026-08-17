import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Chip,
  Stack,
  Card,
  CardContent,
  Avatar,
  AvatarGroup,
  Rating,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

// Icons
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StarsIcon from '@mui/icons-material/Stars';
import SchoolIcon from '@mui/icons-material/School';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* 1. Header with Glassmorphism */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          backdropFilter: 'blur(16px)',
          bgcolor: (theme) =>
            theme.palette.mode === 'light' ? 'rgba(251, 249, 241, 0.85)' : 'rgba(26, 26, 26, 0.85)',
          borderBottom: 1,
          borderColor: 'divider',
          py: 2,
          px: { xs: 2, md: 6 },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1280, mx: 'auto' }}>
          {/* Brand Logo */}
          <Box
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
            }}
          >
            <Box
              component="img"
              src="/tokki_hangul_logo.svg"
              alt="Tokki Hangul Logo"
              sx={{ height: 42, width: 'auto', objectFit: 'contain' }}
            />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.1 }}>
                Tokki Hangul
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.5 }}>
                HỌC TIẾNG HÀN CÙNG AI
              </Typography>
            </Box>
          </Box>

          {/* Nav Actions */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Tooltip title={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}>
              <IconButton onClick={toggleTheme} size="small">
                {isDark ? <Brightness7Icon sx={{ color: '#ffb74d' }} /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {isAuthenticated ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate('/app')}
                sx={{ borderRadius: '9999px', px: 3, fontWeight: 700 }}
              >
                Vào học ngay →
              </Button>
            ) : (
              <>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => navigate('/login')}
                  sx={{ fontWeight: 700 }}
                >
                  Đăng nhập
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => navigate('/register')}
                  sx={{ borderRadius: '9999px', px: 3, fontWeight: 700 }}
                >
                  Bắt đầu học
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Box>

      {/* 2. Hero Section */}
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 2, md: 6 },
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, rgba(248, 215, 218, 0.4) 0%, #fbf9f1 50%, #fbf9f1 100%)'
              : 'linear-gradient(135deg, rgba(151, 63, 105, 0.15) 0%, #1a1a1a 50%, #1a1a1a 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            {/* Left Content */}
            <Grid item xs={12} md={7}>
              <Stack spacing={3} alignItems="flex-start">
                <Chip
                  icon={<StarsIcon sx={{ color: '#973f69 !important' }} />}
                  label="Ứng dụng học tiếng Hàn #1 cùng AI"
                  sx={{
                    bgcolor: (theme) =>
                      theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.1)',
                    color: 'secondary.main',
                    fontWeight: 700,
                    border: 1,
                    borderColor: 'secondary.light',
                    px: 1,
                    py: 2.2,
                  }}
                />

                <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.15 }}>
                  Học tiếng Hàn <br />
                  <Box component="span" sx={{ color: 'secondary.main' }}>
                    dễ dàng cùng
                  </Box>
                  <br />
                  <Box component="span" sx={{ color: 'primary.main' }}>
                    Tokki Hangul
                  </Box>
                </Typography>

                <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.125rem', lineHeight: 1.8, maxWidth: 560 }}>
                  Trải nghiệm phương pháp học tương tác kết hợp trí tuệ nhân tạo (AI): Luyện thi TOPIK chuẩn mực, đóng vai hội thoại phản xạ, xem video phụ đề song ngữ và ghi nhớ từ vựng vĩnh viễn.
                </Typography>

                {/* CTA Buttons */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' }, pt: 1 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate(isAuthenticated ? '/app' : '/register')}
                    sx={{
                      borderRadius: '9999px',
                      px: 4,
                      py: 1.5,
                      fontWeight: 800,
                      fontSize: '1rem',
                      boxShadow: '0 8px 24px rgba(151, 63, 105, 0.25)',
                    }}
                  >
                    Bắt đầu miễn phí
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PlayCircleOutlineIcon />}
                    onClick={() => navigate('/video')}
                    sx={{
                      borderRadius: '9999px',
                      px: 3.5,
                      py: 1.5,
                      fontWeight: 700,
                      color: 'text.primary',
                      borderColor: 'divider',
                      bgcolor: (theme) => (theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'transparent'),
                    }}
                  >
                    Xem video bài học
                  </Button>
                </Stack>

                {/* Social Proof */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ pt: 3, borderTop: 1, borderColor: 'divider', width: '100%' }}>
                  <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 36, height: 36, fontSize: '0.8rem', fontWeight: 700 } }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>H</Avatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>K</Avatar>
                    <Avatar sx={{ bgcolor: '#0288d1' }}>M</Avatar>
                    <Avatar sx={{ bgcolor: '#2e7d32' }}>+10k</Avatar>
                  </AvatarGroup>

                  <Box>
                    <Rating value={5} readOnly size="small" />
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: 'text.secondary' }}>
                      <strong>4.9/5</strong> từ hơn 10,000 học viên
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Grid>

            {/* Right Graphic with Mascot & Badges */}
            <Grid item xs={12} md={5}>
              <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: { xs: 280, sm: 360, md: 400 },
                    height: { xs: 280, sm: 360, md: 400 },
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    background: 'linear-gradient(135deg, rgba(248, 215, 218, 0.8), rgba(255, 255, 255, 0.9))',
                    p: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 20px 50px rgba(151, 63, 105, 0.15)',
                    border: '8px solid rgba(255, 255, 255, 0.7)',
                  }}
                >
                  <Box
                    component="img"
                    src="/tokki_hangul_logo.svg"
                    alt="Tokki Hangul Mascot"
                    sx={{
                      width: '80%',
                      height: '80%',
                      objectFit: 'contain',
                      animation: 'bounce 4s ease-in-out infinite',
                      '@keyframes bounce': {
                        '0%, 100%': { transform: 'translateY(0)' },
                        '50%': { transform: 'translateY(-12px)' },
                      },
                    }}
                  />
                </Box>

                {/* Floating Badge 1 */}
                <Paper
                  elevation={4}
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: { xs: 0, md: -20 },
                    p: 1.5,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'primary.main', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SchoolIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>Luyện thi TOPIK</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>+50 dạng bài chuẩn</Typography>
                  </Box>
                </Paper>

                {/* Floating Badge 2 */}
                <Paper
                  elevation={4}
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    left: { xs: 0, md: -20 },
                    p: 1.5,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'secondary.main', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SmartToyIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>Gia sư AI 24/7</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Sửa lỗi phát âm tức thì</Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 3. Features Section */}
      <Box component="section" sx={{ py: 12, px: { xs: 2, md: 6 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
              Tính năng vượt trội
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, mb: 2 }}>
              Mọi thứ bạn cần để thành thạo tiếng Hàn
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 640, mx: 'auto' }}>
              Hệ sinh thái học tập toàn diện kết hợp công nghệ hiện đại và phương pháp sư phạm chuẩn hóa.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Feature 1 */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  p: 2,
                  borderRadius: '24px',
                  border: 1,
                  borderColor: 'divider',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 32px rgba(151, 63, 105, 0.1)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ width: 56, height: 56, borderRadius: '16px', bgcolor: 'rgba(2, 136, 209, 0.1)', color: '#0288d1', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                    <OndemandVideoIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                    Học qua Video Song Ngữ
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                    Bài giảng sinh động, K-Drama, Vlog đời sống kèm phụ đề tương tác giúp bạn tra cứu từ vựng trực tiếp khi đang xem.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Feature 2 */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  p: 2,
                  borderRadius: '24px',
                  border: 1,
                  borderColor: 'divider',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 32px rgba(151, 63, 105, 0.1)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ width: 56, height: 56, borderRadius: '16px', bgcolor: 'rgba(151, 63, 105, 0.1)', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                    <PsychologyIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                    Gia sư AI & Roleplay
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                    Luyện nói phản xạ với AI qua các ngữ cảnh thực tế (gọi món, mua sắm, phỏng vấn) và nhận phản hồi chỉnh sửa tức thì.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Feature 3 */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  p: 2,
                  borderRadius: '24px',
                  border: 1,
                  borderColor: 'divider',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 32px rgba(151, 63, 105, 0.1)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ width: 56, height: 56, borderRadius: '16px', bgcolor: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                    <MenuBookIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                    Sổ Tay Từ Vựng SRS
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                    Thuật toán ngắt quãng Spaced Repetition cùng các mini games ghép thẻ giúp lưu giữ từ vựng vào trí nhớ dài hạn vĩnh viễn.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 4. 3-Step Process Section */}
      <Box component="section" sx={{ py: 12, px: { xs: 2, md: 6 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5 }}>
              Lộ trình 3 bước dễ dàng
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Bắt đầu hành trình chinh phục tiếng Hàn khoa học và bài bản.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '24px', border: 1, borderColor: 'divider' }}>
                <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'primary.light', color: 'primary.dark', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, fontWeight: 800, fontSize: '1.25rem' }}>
                  1
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Đăng ký & Đánh giá</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Làm bài kiểm tra ngắn để Tokki AI định vị năng lực hiện tại và gợi ý lộ trình phù hợp.</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '24px', border: 1, borderColor: 'divider' }}>
                <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'secondary.light', color: 'secondary.dark', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, fontWeight: 800, fontSize: '1.25rem' }}>
                  2
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Học cùng AI & Video</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Tiếp thu kiến thức qua bài giảng trực quan và luyện nói trực tiếp cùng gia sư Tokki AI.</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '24px', border: 1, borderColor: 'divider' }}>
                <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'rgba(46, 125, 50, 0.2)', color: '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, fontWeight: 800, fontSize: '1.25rem' }}>
                  3
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Luyện tập & Đạt mục tiêu</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Ôn tập ngắt quãng mỗi ngày, theo dõi báo cáo kỹ năng và tự tin đạt điểm cao trong kỳ thi TOPIK.</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 5. Call to Action Banner */}
      <Box component="section" sx={{ py: 10, px: { xs: 2, md: 6 } }}>
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: '32px',
              bgcolor: 'primary.main',
              color: '#ffffff',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(151, 63, 105, 0.25)',
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
              Sẵn sàng chinh phục tiếng Hàn?
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 4, maxWidth: 500, mx: 'auto' }}>
              Bắt đầu tạo tài khoản học miễn phí ngay hôm nay cùng cộng đồng người học Tokki Hangul.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: '#ffffff',
                color: 'primary.main',
                borderRadius: '9999px',
                px: 5,
                py: 1.8,
                fontWeight: 800,
                fontSize: '1.1rem',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
              }}
            >
              Tạo tài khoản miễn phí
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* 6. Footer */}
      <Box
        component="footer"
        sx={{
          mt: 'auto',
          py: 6,
          px: { xs: 2, md: 6 },
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Box
            component="img"
            src="/tokki_hangul_logo.svg"
            alt="Tokki Hangul Logo"
            sx={{ height: 48, width: 'auto', objectFit: 'contain', mx: 'auto', mb: 3 }}
          />
          <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
              Về chúng tôi
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
              Lộ trình TOPIK
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
              Hỗ trợ
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
              Chính sách bảo mật
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            © {new Date().getFullYear()} Tokki Hangul Learning Platform. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};
