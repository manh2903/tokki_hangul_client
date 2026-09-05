import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Chip,
  Stack,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import {
  topikApi,
  videosApi,
  conversationApi,
  coursesApi,
  topicApi,
} from '@/api';
import { useNavigate } from 'react-router-dom';

// Icons
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import CategoryIcon from '@mui/icons-material/Category';

export const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch home data using TanStack Query with 5 minutes cache
  const { data: homeData, isLoading: loading } = useQuery({
    queryKey: ['homeData'],
    queryFn: async () => {
      const [levelsRes, dialoguesRes, videosRes, coursesRes, topicsRes] = await Promise.allSettled([
        topikApi.getTopikLevels(),
        conversationApi.getDialogues(),
        videosApi.getVideos(),
        coursesApi.getCourses(),
        topicApi.getTopics(),
      ]);

      const levels = levelsRes.status === 'fulfilled' ? (levelsRes.value?.data || levelsRes.value || []) : [];
      const dialogues = dialoguesRes.status === 'fulfilled' ? (dialoguesRes.value?.data || dialoguesRes.value || []) : [];
      const videos = videosRes.status === 'fulfilled' ? (videosRes.value?.data || videosRes.value || []) : [];
      const courses = coursesRes.status === 'fulfilled' ? (coursesRes.value?.data || coursesRes.value || []) : [];
      const topics = topicsRes.status === 'fulfilled' ? (topicsRes.value?.data || topicsRes.value || []) : [];

      const stats = {
        levelsCount: Array.isArray(levels) ? levels.length : 0,
        videosCount: Array.isArray(videos) ? videos.length : 0,
        coursesCount: Array.isArray(courses) ? courses.length : 0,
        topicsCount: Array.isArray(topics) ? topics.length : 0,
        dialoguesCount: Array.isArray(dialogues) ? dialogues.length : 0,
      };

      // Generate dynamic recommendations
      const dynamicRecs = [];

      // 1. Real Course from API
      if (Array.isArray(courses) && courses.length > 0) {
        const c = courses[0];
        dynamicRecs.push({
          id: `course_${c.id}`,
          type: 'course',
          title: c.titleVi,
          hangul: '정규 한국어 코스',
          duration: `${c.units?.length || 1} học phần`,
          level: c.levelCode ? c.levelCode.replace('_', ' ') : 'TOPIK I',
          route: '/topik',
          reason: c.descriptionVi || 'Lộ trình giáo trình bài bản từ bảng chữ cái đến giao tiếp lưu loát.',
          icon: <SchoolIcon sx={{ fontSize: 24, color: '#0288d1' }} />,
        });
      }

      // 2. Real Video Lesson from API
      if (Array.isArray(videos) && videos.length > 0) {
        const v = videos[0];
        const durStr = v.durationSeconds
          ? `${Math.floor(v.durationSeconds / 60)}:${(v.durationSeconds % 60).toString().padStart(2, '0')}`
          : '04:15';
        dynamicRecs.push({
          id: `vid_${v.id}`,
          type: 'video',
          title: v.title,
          hangul: v.koreanTitle || '한국어 영상 학습',
          duration: durStr,
          level: v.topikLevel ? `TOPIK ${v.topikLevel}` : 'Đa cấp độ',
          route: `/video/${v.id}`,
          reason: v.description || 'Luyện nghe phản xạ và tra từ vựng tương tác tức thì qua phụ đề song ngữ.',
          icon: <OndemandVideoIcon sx={{ fontSize: 24, color: '#ed6c02' }} />,
        });
      }

      // 3. Real TOPIK Level from API
      if (Array.isArray(levels) && levels.length > 0) {
        const l = levels[0];
        dynamicRecs.push({
          id: `topik_${l.id}`,
          type: 'topik',
          title: l.name,
          hangul: `TOPIK ${l.levelNumber || 'I'} 종합 연습`,
          duration: 'Luyện đề trắc nghiệm',
          level: `Nhóm ${l.levelGroup || 'TOPIK'}`,
          route: '/topik',
          reason: 'Luyện đề thi thử, rèn luyện kỹ năng đọc hiểu và hệ thống hóa ngữ pháp trọng tâm.',
          icon: <PsychologyIcon sx={{ fontSize: 24, color: '#9D446E' }} />,
        });
      }

      // 4. Real Dialogue from API
      if (Array.isArray(dialogues) && dialogues.length > 0) {
        const d = dialogues[0];
        dynamicRecs.push({
          id: `diag_${d.id}`,
          type: 'conversation',
          title: d.title,
          hangul: d.lines?.[0]?.koreanText || '한국어 대화 연습',
          duration: `${d.lines?.length || 5} câu bài học`,
          level: d.topikLevel ? `TOPIK ${d.topikLevel}` : 'Giao tiếp',
          route: `/conversation/dialogue/${d.id}`,
          reason: d.lines?.[0]?.vietnameseText || 'Tăng phản xạ giao tiếp theo ngữ cảnh đời sống thực tế.',
          icon: <LocalCafeIcon sx={{ fontSize: 24, color: '#ff6b8b' }} />,
        });
      }

      return {
        stats,
        topicsList: Array.isArray(topics) ? topics : [],
        recommendations: dynamicRecs,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const stats = homeData?.stats || {
    levelsCount: 0,
    videosCount: 0,
    coursesCount: 0,
    topicsCount: 0,
    dialoguesCount: 0,
  };
  const topicsList = homeData?.topicsList || [];
  const recommendations = homeData?.recommendations || [];

  // 100% Dynamic Hubs calculated directly from DB entity counts
  const learningHubs = useMemo(() => [
    {
      title: 'Luyện thi TOPIK',
      stat: stats.levelsCount > 0 ? `${stats.levelsCount} cấp độ chuẩn quốc tế` : 'Đang cập nhật',
      desc: 'Hệ thống đề luyện thi và kiểm tra năng lực đầy đủ từ TOPIK I đến TOPIK II.',
      icon: <SchoolIcon sx={{ color: '#0288d1', fontSize: 30 }} />,
      color: '#0288d1',
      route: '/topik',
    },
    {
      title: 'Học qua Video & Phim',
      stat: stats.videosCount > 0 ? `${stats.videosCount} bài học video` : 'Đang cập nhật',
      desc: 'Trích đoạn đời sống kèm phụ đề song ngữ, phiên âm và tra từ vựng tức thì.',
      icon: <OndemandVideoIcon sx={{ color: '#ed6c02', fontSize: 30 }} />,
      color: '#ed6c02',
      route: '/video',
    },
    {
      title: 'Giáo trình & Khóa học',
      stat: stats.coursesCount > 0 ? `${stats.coursesCount} lộ trình chuẩn hóa` : 'Đang cập nhật',
      desc: 'Giáo trình bài bản từng bước từ bảng chữ cái Hangul đến giao tiếp chuyên sâu.',
      icon: <MenuBookIcon sx={{ color: '#2e7d32', fontSize: 30 }} />,
      color: '#2e7d32',
      route: '/topik',
    },
    {
      title: 'Giao tiếp & Đóng vai AI',
      stat: stats.dialoguesCount > 0 ? `${stats.dialoguesCount} bài hội thoại` : 'Tương tác AI thông minh',
      desc: 'Rèn luyện phản xạ nói và phát âm cùng trợ lý gia sư AI theo ngữ cảnh tự nhiên.',
      icon: <LocalCafeIcon sx={{ color: '#ff6b8b', fontSize: 30 }} />,
      color: '#ff6b8b',
      route: '/conversation',
    },
  ], [stats]);

  return (
    <Stack spacing={4}>
      {/* 1. Lộ trình hôm nay của bạn (100% Dynamic from API) */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
            <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(157, 68, 110, 0.1)', color: '#9D446E', display: 'flex' }}>
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
            <CircularProgress sx={{ color: '#9D446E' }} />
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
                      <Chip
                        label={rec.level}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: (theme) => (theme.palette.mode === 'light' ? '#f5f3e9' : 'rgba(255, 255, 255, 0.1)'),
                          color: 'text.secondary',
                        }}
                      />
                    </Stack>

                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.3 }}>
                        {rec.title}
                      </Typography>
                      {rec.hangul && (
                        <Typography variant="body2" sx={{ color: '#9D446E', fontWeight: 700, mt: 0.5, fontFamily: 'Pretendard' }}>
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

                  <Box
                    sx={{
                      mt: 3,
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700 }}>
                      <AccessTimeIcon fontSize="small" /> {rec.duration}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      endIcon={<PlayArrowIcon />}
                      onClick={() => navigate(rec.route)}
                      sx={{
                        bgcolor: '#9D446E',
                        fontWeight: 700,
                        borderRadius: '10px',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#86365c' },
                      }}
                    >
                      Bắt đầu
                    </Button>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ bgcolor: 'background.paper', borderRadius: '24px', border: '1px solid', borderColor: 'divider', p: 5, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, fontWeight: 600 }}>
              Đang tải dữ liệu bài học...
            </Typography>
            <Button variant="contained" onClick={() => navigate('/topik')} sx={{ bgcolor: '#9D446E' }}>
              Khám phá bài học
            </Button>
          </Box>
        )}
      </Box>

      {/* 2. Khám phá các phân hệ học tập (Live Statistics from API) */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: 'text.primary' }}>
          Khám phá các phân hệ học tập
        </Typography>

        <Grid container spacing={3}>
          {learningHubs.map((hub, i) => (
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
                    borderColor: hub.color,
                  },
                  p: 2.5,
                  cursor: 'pointer',
                  borderTop: `4px solid ${hub.color}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'background.default' }}>
                      {hub.icon}
                    </Box>
                    <ArrowForwardIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                    {hub.title}
                  </Typography>
                  <Chip
                    label={hub.stat}
                    size="small"
                    sx={{
                      mb: 1.2,
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      bgcolor: `${hub.color}15`,
                      color: hub.color,
                      borderRadius: '8px',
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1.5, fontSize: '0.82rem' }}>
                    {hub.desc}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 3. Chủ đề học tập thực tế từ API (Real Topics from DB) */}
      {topicsList.length > 0 && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(157, 68, 110, 0.1)', color: '#9D446E', display: 'flex' }}>
                <CategoryIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  Chủ đề học tập thực tế ({topicsList.length})
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.84rem' }}>
                  Bấm vào bất kỳ chủ đề nào để xem video và từ vựng tương ứng
                </Typography>
              </Box>
            </Box>
            <Button
              size="small"
              onClick={() => navigate('/video')}
              sx={{ color: '#9D446E', fontWeight: 700, textTransform: 'none' }}
            >
              Tất cả video →
            </Button>
          </Stack>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2 }}>
            {topicsList.map((tp) => (
              <Chip
                key={tp.id}
                label={tp.name}
                onClick={() => navigate(`/video?topicId=${tp.id}`)}
                sx={{
                  py: 2,
                  px: 0.5,
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#FDF2F4',
                    borderColor: '#9D446E',
                    color: '#9D446E',
                    transform: 'translateY(-1px)',
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Stack>
  );
};

export default HomePage;
