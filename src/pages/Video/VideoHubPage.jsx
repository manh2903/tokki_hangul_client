import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Button,
  Stack,
  CircularProgress,
  Paper,
} from '@mui/material';
import { videosApi } from '@/api';
import { useNavigate } from 'react-router-dom';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export const VideoHubPage = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const res = await videosApi.getVideos();
        const data = res?.data || res || [];
        if (Array.isArray(data)) {
          setVideos(data);
        }
      } catch (err) {
        console.warn('Failed to load videos from API:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <Stack spacing={4}>
      <Box>
        <Chip label="Học tiếng Hàn thực tế" color="primary" size="small" sx={{ mb: 1, fontWeight: 700 }} />
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Học Qua Video & Phụ Đề Song Ngữ
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Tra cứu từ vựng trực tiếp khi xem video bài giảng và giao tiếp thực tế.
        </Typography>
      </Box>

      {/* Video Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : videos.length > 0 ? (
        <Grid container spacing={3}>
          {videos.map((vid) => (
            <Grid item xs={12} sm={6} md={4} key={vid.id}>
              <Card
                onClick={() => navigate(`/video/${vid.id}`)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(151, 63, 105, 0.12)',
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="190"
                    image={vid.thumbnail || vid.thumbnailUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'}
                    alt={vid.title}
                  />
                  <Chip
                    icon={<AccessTimeIcon sx={{ color: '#ffffff !important', fontSize: 14 }} />}
                    label={vid.duration || `${vid.durationSeconds || 300}s`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      bgcolor: 'rgba(0, 0, 0, 0.75)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>

                <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Chip label={vid.level || (vid.topikLevel ? `TOPIK ${vid.topikLevel}` : 'Sơ cấp')} size="small" color="primary" variant="outlined" sx={{ mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      {vid.title}
                    </Typography>
                    {(vid.koreanTitle || vid.korean_title) && (
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, fontFamily: 'Pretendard', display: 'block', mt: 0.5 }}>
                        {vid.koreanTitle || vid.korean_title}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, mt: 1, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {vid.subtitles?.length || vid.subtitlesCount || 0} câu phụ đề tra cứu
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, display: 'flex', alignItems: 'center' }}>
                      Xem ngay →
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: '16px' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Chưa có video bài học nào từ hệ thống.
          </Typography>
        </Paper>
      )}
    </Stack>
  );
};
