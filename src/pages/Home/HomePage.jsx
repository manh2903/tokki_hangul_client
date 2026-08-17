import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Paper,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { topikApi, videosApi, conversationApi, progressApi } from '@/api';
import { useNavigate } from 'react-router-dom';

// Icons
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import PsychologyIcon from '@mui/icons-material/Psychology';
import StyleIcon from '@mui/icons-material/Style';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';

export const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState([]);
  const [topikLevels, setTopikLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [levelsRes, dialoguesRes, videosRes] = await Promise.allSettled([
          topikApi.getTopikLevels(),
          conversationApi.getDialogues(),
          videosApi.getVideos(),
        ]);

        const levels = levelsRes.status === 'fulfilled' ? (levelsRes.value?.data || levelsRes.value || []) : [];
        const dialogues = dialoguesRes.status === 'fulfilled' ? (dialoguesRes.value?.data || dialoguesRes.value || []) : [];
        const videos = videosRes.status === 'fulfilled' ? (videosRes.value?.data || videosRes.value || []) : [];

        if (Array.isArray(levels)) {
          setTopikLevels(levels);
        }

        // Generate dynamic recommendations from backend content
        const dynamicRecs = [];

        if (Array.isArray(dialogues) && dialogues.length > 0) {
          const d = dialogues[0];
          dynamicRecs.push({
            id: `diag_${d.id}`,
            type: 'conversation',
            title: d.title || 'Luyện phản xạ hội thoại',
            hangul: d.koreanTitle || d.korean_title || '한국어 대화 연습',
            duration: '10 phút',
            level: d.level || 'Sơ cấp',
            route: `/conversation/dialogue/${d.id}`,
            reason: 'Tăng phản xạ giao tiếp & luyện phát âm theo ngữ cảnh thực tế',
          });
        }

        if (Array.isArray(levels) && levels.length > 0) {
          const l = levels[0];
          dynamicRecs.push({
            id: `topik_${l.id}`,
            type: 'topik',
            title: `Luyện đề & Ngữ pháp ${l.level_name || l.name || 'TOPIK'}`,
            hangul: `${l.level_name || l.name || 'TOPIK'} 핵심 문법`,
            duration: '15 phút',
            level: l.level_name || 'TOPIK',
            route: '/topik',
            reason: 'Bổ sung cấu trúc ngữ pháp trọng tâm và bài tập trắc nghiệm',
          });
        }

        if (Array.isArray(videos) && videos.length > 0) {
          const v = videos[0];
          dynamicRecs.push({
            id: `vid_${v.id}`,
            type: 'video',
            title: v.title || 'Học tiếng Hàn qua video',
            hangul: v.koreanTitle || v.korean_title || '영상으로 배우는 한국어',
            duration: v.duration || '5 phút',
            level: v.level || 'Mọi trình độ',
            route: `/video/${v.id}`,
            reason: 'Luyện nghe tự nhiên và tra từ vựng qua phụ đề song ngữ',
          });
        }

        setRecommendations(dynamicRecs);
      } catch (err) {
        console.warn('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const dailyGoalMinutes = user?.dailyGoalMinutes || 30;
  const todayStudiedMinutes = user?.todayStudiedMinutes || 0;
  const dailyProgress = Math.min(100, Math.round((todayStudiedMinutes / dailyGoalMinutes) * 100));

  return (
    <Stack spacing={4}>
      {/* 1. Welcome & Daily Goal Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: '24px',
          bgcolor: 'primary.main',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={3} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} md={7}>
            <Stack spacing={1.5}>
              <Chip
                icon={<AutoAwesomeIcon sx={{ color: '#ffffff !important', fontSize: 16 }} />}
                label="Học tiếng Hàn thông minh"
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontWeight: 700,
                  width: 'fit-content',
                }}
              />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                안녕하세요, {user?.name || user?.email || 'Học viên'}! 👋
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                Chào mừng bạn quay trở lại. Hãy tiếp tục chuỗi bài học hôm nay để đạt mục tiêu chứng chỉ và giao tiếp tự tin.
              </Typography>
            </Stack>
          </Grid>

          {/* Daily Goal Gauge */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                bgcolor: 'rgba(0, 0, 0, 0.2)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon fontSize="inherit" /> Mục tiêu hôm nay
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {todayStudiedMinutes}/{dailyGoalMinutes} phút
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={dailyProgress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'secondary.light',
                  },
                  mb: 1,
                }}
              />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {dailyProgress}% hoàn thành
                </Typography>
                <Chip
                  icon={<LocalFireDepartmentIcon sx={{ color: '#ffb74d !important', fontSize: 14 }} />}
                  label={`Streak ${user?.streakDays || 0} ngày`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    height: 22,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                />
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* 2. AI Daily Smart Recommendations */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon color="primary" /> Gợi ý bài học hôm nay
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/topik')}
            sx={{ fontWeight: 700 }}
          >
            Xem tất cả bài học
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : recommendations.length > 0 ? (
          <Grid container spacing={3}>
            {recommendations.map((rec) => (
              <Grid item xs={12} md={4} key={rec.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(151, 63, 105, 0.12)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            bgcolor: 'primary.light',
                            color: 'primary.dark',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {rec.type === 'conversation' ? (
                            <LocalCafeIcon fontSize="small" />
                          ) : rec.type === 'video' ? (
                            <OndemandVideoIcon fontSize="small" />
                          ) : (
                            <MenuBookIcon fontSize="small" />
                          )}
                        </Box>
                        <Chip label={rec.level} size="small" color="primary" variant="outlined" />
                      </Stack>

                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                          {rec.title}
                        </Typography>
                        {rec.hangul && (
                          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700, mt: 0.25 }}>
                            {rec.hangul}
                          </Typography>
                        )}
                      </Box>

                      {rec.reason && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fbf9f1' : '#252525'),
                            border: 1,
                            borderColor: 'divider',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            💡 {rec.reason}
                          </Typography>
                        </Paper>
                      )}
                    </Stack>
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon fontSize="inherit" /> {rec.duration}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => navigate(rec.route)}
                    >
                      Học ngay
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: '16px' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
              Chưa có dữ liệu bài học gợi ý. Bạn có thể chọn các chương trình học bên dưới để bắt đầu ngay!
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/topik')}>
              Khám phá khóa học TOPIK
            </Button>
          </Paper>
        )}
      </Box>

      {/* 3. Key Learning Hubs Grid */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          Chương trình học tập trọng tâm
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              onClick={() => navigate('/topik')}
              sx={{
                p: 1,
                cursor: 'pointer',
                borderLeft: '4px solid #973f69',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <CardContent>
                <SchoolIcon sx={{ color: 'primary.main', fontSize: 32, mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Luyện thi TOPIK I & II
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Lộ trình các kỹ năng: Nghe, Đọc, Viết & Ngữ pháp bám sát đề thi.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              onClick={() => navigate('/conversation')}
              sx={{
                p: 1,
                cursor: 'pointer',
                borderLeft: '4px solid #ff6b8b',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <CardContent>
                <LocalCafeIcon sx={{ color: 'secondary.main', fontSize: 32, mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Giao tiếp & Đóng vai AI
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Luyện nói phản xạ với AI theo các tình huống thực tế tại Hàn Quốc.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              onClick={() => navigate('/video')}
              sx={{
                p: 1,
                cursor: 'pointer',
                borderLeft: '4px solid #0288d1',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <CardContent>
                <OndemandVideoIcon sx={{ color: '#0288d1', fontSize: 32, mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Học qua Video Song ngữ
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Video phụ đề song ngữ tương tác tra từ vựng trực tiếp khi xem.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              onClick={() => navigate('/review')}
              sx={{
                p: 1,
                cursor: 'pointer',
                borderLeft: '4px solid #2e7d32',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <CardContent>
                <StyleIcon sx={{ color: '#2e7d32', fontSize: 32, mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Ôn tập SRS & Game
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Ghi nhớ từ vựng lâu dài qua Spaced Repetition và mini game.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Stack>
  );
};
