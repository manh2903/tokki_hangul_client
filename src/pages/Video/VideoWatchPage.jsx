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
  CircularProgress,
} from '@mui/material';
import { AudioPlayer } from '@/components/common/AudioPlayer';
import { videosApi } from '@/api';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export const VideoWatchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubtitle, setActiveSubtitle] = useState(0);
  const [showVietnamese, setShowVietnamese] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      try {
        const res = await videosApi.getVideoById(id);
        const data = res?.data || res;
        if (data && (data.title || data.videoUrl)) {
          setVideo(data);
        }
      } catch (err) {
        console.warn('Failed to load video details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!video) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', py: 6, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Không tìm thấy video bài học này.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/video')}>
          Quay lại danh sách video
        </Button>
      </Box>
    );
  }

  const subtitles = video.subtitles || [];
  const currentSub = subtitles[activeSubtitle] || subtitles[0];

  return (
    <Stack spacing={4}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/video')}
        sx={{ width: 'fit-content', color: 'text.secondary' }}
      >
        Quay lại danh sách video
      </Button>

        <Box>
          <Chip label={video.level || (video.topikLevel ? `TOPIK ${video.topikLevel}` : 'Video')} color="primary" size="small" sx={{ mb: 1, fontWeight: 700 }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {video.title} {video.koreanTitle || video.korean_title ? `(${video.koreanTitle || video.korean_title})` : ''}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Main Video Player */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={2.5}>
              <Paper
                elevation={0}
                sx={{
                  position: 'relative',
                  paddingTop: '56.25%',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  bgcolor: '#000000',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Box
                  component="iframe"
                  src={video.videoUrl || video.url}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 0,
                  }}
                />
              </Paper>

              {/* Active Subtitle Highlighting Card */}
              {currentSub && (
                <Card sx={{ border: 2, borderColor: 'primary.light', bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151, 63, 105, 0.12)') }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          Phụ đề hiện tại ({currentSub.startTime || currentSub.time || '00:00'})
                        </Typography>
                        <AudioPlayer text={currentSub.korean || currentSub.text_ko} />
                      </Stack>

                      <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Pretendard' }}>
                        {currentSub.korean || currentSub.text_ko}
                      </Typography>

                      {showVietnamese && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {currentSub.vietnamese || currentSub.text_vi}
                        </Typography>
                      )}

                      {currentSub.vocab?.length > 0 && (
                        <Box sx={{ pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
                            Từ vựng quan trọng:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {currentSub.vocab.map((v, i) => (
                              <Chip key={i} label={`📌 ${v}`} size="small" color="primary" sx={{ fontWeight: 600 }} />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>

          {/* Subtitles & Script List */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MenuBookIcon color="primary" fontSize="small" /> Kịch bản & Phụ đề
                  </Typography>
                  <Button
                    size="small"
                    startIcon={showVietnamese ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    onClick={() => setShowVietnamese(!showVietnamese)}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    {showVietnamese ? 'Ẩn nghĩa TV' : 'Hiện nghĩa TV'}
                  </Button>
                </Stack>

                {subtitles.length > 0 ? (
                  <Stack spacing={1.5} sx={{ maxHeight: 520, overflowY: 'auto', pr: 0.5 }}>
                    {subtitles.map((sub, idx) => {
                      const isSelected = activeSubtitle === idx;
                      return (
                        <Paper
                          key={idx}
                          onClick={() => setActiveSubtitle(idx)}
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            border: 1,
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            bgcolor: isSelected
                              ? (theme) => (theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151, 63, 105, 0.15)')
                              : 'background.paper',
                            transition: 'all 0.2s',
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                              {sub.startTime || sub.time || `00:${idx * 5}`}
                            </Typography>
                            <AudioPlayer text={sub.korean || sub.text_ko} size="small" />
                          </Stack>

                          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'Pretendard' }}>
                            {sub.korean || sub.text_ko}
                          </Typography>

                          {showVietnamese && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                              {sub.vietnamese || sub.text_vi}
                            </Typography>
                          )}
                        </Paper>
                      );
                    })}
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                    Chưa có phụ đề đồng bộ cho video này.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
  );
};
