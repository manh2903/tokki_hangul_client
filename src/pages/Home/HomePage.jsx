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
  Tooltip,
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

        // Generate dynamic recommendations from backend content
        const dynamicRecs = [];

        if (Array.isArray(dialogues) && dialogues.length > 0) {
          const d = dialogues[0];
          dynamicRecs.push({
            id: `diag_${d.id}`,
            type: 'conversation',
            title: d.title || 'Luyện phản xạ hội thoại',
            hangul: '한국어 대화 연습', // Default since model doesn't have koreanTitle
            duration: '10 phút',
            level: d.topikLevel ? `TOPIK ${d.topikLevel}` : 'Sơ cấp',
            route: `/conversation/dialogue/${d.id}`,
            reason: 'Tăng phản xạ giao tiếp & luyện phát âm theo ngữ cảnh thực tế',
            icon: <LocalCafeIcon sx={{ fontSize: 24, color: 'primary.main' }} />
          });
        }

        if (Array.isArray(levels) && levels.length > 0) {
          const l = levels[0];
          dynamicRecs.push({
            id: `topik_${l.id}`,
            type: 'topik',
            title: `Luyện đề & Ngữ pháp ${l.name || 'TOPIK'}`,
            hangul: `${l.name || 'TOPIK'} 핵심 문법`,
            duration: '15 phút',
            level: l.levelGroup || 'TOPIK',
            route: '/topik',
            reason: 'Bổ sung cấu trúc ngữ pháp trọng tâm và bài tập trắc nghiệm',
            icon: <SchoolIcon sx={{ fontSize: 24, color: '#0288d1' }} />
          });
        }

        if (Array.isArray(videos) && videos.length > 0) {
          const v = videos[0];
          const durStr = v.durationSeconds ? `${Math.floor(v.durationSeconds / 60)} phút` : '5 phút';
          dynamicRecs.push({
            id: `vid_${v.id}`,
            type: 'video',
            title: v.title || 'Học tiếng Hàn qua video',
            hangul: '영상으로 배우는 한국어',
            duration: durStr,
            level: v.topikLevel ? `TOPIK ${v.topikLevel}` : 'Mọi trình độ',
            route: `/video/${v.id}`,
            reason: 'Luyện nghe tự nhiên và tra từ vựng qua phụ đề song ngữ',
            icon: <OndemandVideoIcon sx={{ fontSize: 24, color: '#2e7d32' }} />
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
      {/* Daily Streak & Gamification Banner */}
      <Box
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #9D446E 0%, #762D50 100%)',
          color: '#fff',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2.5,
          boxShadow: '0 10px 25px rgba(157, 68, 110, 0.25)',
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            안녕하세요, {user?.name || 'bạn học'}! 👋
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Duy trì chuỗi học tập mỗi ngày để ghi nhớ tiếng Hàn bền vững cùng Tokki Hangul.
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
          <Tooltip title="Chuỗi học tập mỗi ngày: Giữ lửa liên tục để nâng cao hiệu quả ghi nhớ">
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(8px)',
                px: 2,
                py: 1.2,
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', fontWeight: 600 }}>
                Chuỗi ngày học 🔥
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {user?.streakDays || 0} ngày
              </Typography>
            </Box>
          </Tooltip>

          <Tooltip title="Điểm kinh nghiệm: Tích lũy qua bài học để thăng hạng và đua top học tập">
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(8px)',
                px: 2,
                py: 1.2,
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', fontWeight: 600 }}>
                Kinh nghiệm ✨
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {user?.expPoints || 0} EXP
              </Typography>
            </Box>
          </Tooltip>

          <Tooltip title="Cà rốt Tokki: Đơn vị tích lũy dùng để mua bảo vệ chuỗi ngày và đổi vật phẩm">
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(8px)',
                px: 2,
                py: 1.2,
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', fontWeight: 600 }}>
                Cà rốt tích luỹ 🥕
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {user?.carrots || 0} củ
              </Typography>
            </Box>
          </Tooltip>
        </Stack>
      </Box>

      {/* 2. AI Daily Smart Recommendations (moved up) */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
            <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(151, 63, 105, 0.1)', color: 'primary.main', display: 'flex' }}>
              <PsychologyIcon />
            </Box>
            Lộ trình hôm nay của bạn
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/topik')}
            sx={{ fontWeight: 700, color: 'text.secondary' }}
          >
            Xem tất cả
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
                <Box
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: '24px',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 4px 0 0 rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 0 0 rgba(0,0,0,0.05)',
                    },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: 2.5,
                  }}
                >
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '16px',
                          bgcolor: 'background.default',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        {rec.icon}
                      </Box>
                      <Chip label={rec.level} size="small" sx={{ fontWeight: 700, bgcolor: (theme) => (theme.palette.mode === 'light' ? '#f5f3e9' : 'rgba(255, 255, 255, 0.1)'), color: 'text.secondary' }} />
                    </Stack>

                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.3 }}>
                        {rec.title}
                      </Typography>
                      {rec.hangul && (
                        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700, mt: 0.5 }}>
                          {rec.hangul}
                        </Typography>
                      )}
                    </Box>

                    {rec.reason && (
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: '16px',
                          bgcolor: 'background.default',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                          💡 {rec.reason}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700 }}>
                      <AccessTimeIcon fontSize="small" /> {rec.duration}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      endIcon={<PlayArrowIcon />}
                      onClick={() => navigate(rec.route)}
                    >
                      Bắt đầu
                    </Button>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ bgcolor: 'background.paper', borderRadius: '24px', border: '1px solid', borderColor: 'divider', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', p: 5, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, fontWeight: 600 }}>
              Chưa có dữ liệu bài học gợi ý. Bạn có thể chọn các chương trình học bên dưới để bắt đầu ngay!
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/topik')}>
              Khám phá khóa học TOPIK
            </Button>
          </Box>
        )}
      </Box>

      {/* 3. Key Learning Hubs Grid */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: 'text.primary' }}>
          Khám phá thêm
        </Typography>

        <Grid container spacing={3}>
          {[
            {
              title: 'Luyện thi TOPIK',
              desc: 'Lộ trình các kỹ năng: Nghe, Đọc, Viết & Ngữ pháp.',
              icon: <SchoolIcon sx={{ color: '#0288d1', fontSize: 32 }} />,
              color: '#0288d1',
              route: '/topik',
            },
            {
              title: 'Giao tiếp & Đóng vai AI',
              desc: 'Luyện nói phản xạ với AI theo các tình huống thực tế.',
              icon: <LocalCafeIcon sx={{ color: '#ff6b8b', fontSize: 32 }} />,
              color: '#ff6b8b',
              route: '/conversation',
            },
            {
              title: 'Học qua Video',
              desc: 'Video phụ đề song ngữ tương tác tra từ vựng trực tiếp.',
              icon: <OndemandVideoIcon sx={{ color: '#ed6c02', fontSize: 32 }} />,
              color: '#ed6c02',
              route: '/video',
            },
            {
              title: 'Ôn tập SRS',
              desc: 'Ghi nhớ từ vựng lâu dài qua Spaced Repetition.',
              icon: <StyleIcon sx={{ color: '#2e7d32', fontSize: 32 }} />,
              color: '#2e7d32',
              route: '/review',
            },
          ].map((hub, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Box
                onClick={() => navigate(hub.route)}
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: '24px',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 4px 0 0 rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 0 0 rgba(0,0,0,0.05)',
                  },
                  p: 2.5,
                  cursor: 'pointer',
                  borderTop: `4px solid ${hub.color}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'background.default' }}>
                    {hub.icon}
                  </Box>
                  <ArrowForwardIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
                  {hub.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1.5 }}>
                  {hub.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  );
};

