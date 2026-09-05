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
  Paper,
  CircularProgress,
} from '@mui/material';
import { conversationApi } from '@/api';
import { useNavigate } from 'react-router-dom';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MicIcon from '@mui/icons-material/Mic';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import { useQuery } from '@tanstack/react-query';

export const ConversationHubPage = () => {
  const navigate = useNavigate();

  const { data: dialogues = [], isLoading: loading } = useQuery({
    queryKey: ['dialogues'],
    queryFn: async () => {
      const res = await conversationApi.getDialogues();
      return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    },
    staleTime: 10 * 60 * 1000,
  });

  return (
    <Stack spacing={4}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <Box>
          <Chip label="Giao tiếp phản xạ & Đóng vai" color="secondary" size="small" sx={{ mb: 1, fontWeight: 700 }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Luyện Hội Thoại & Roleplay AI
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Rèn luyện phát âm chuẩn người bản xứ và tự tin giao tiếp qua các tình huống nhập vai.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<SmartToyIcon />}
          onClick={() => navigate('/conversation/roleplay')}
          sx={{ fontWeight: 700, alignSelf: { xs: 'flex-start', sm: 'center' } }}
        >
          Phòng Roleplay cùng AI
        </Button>
      </Stack>

      {/* Featured AI Roleplay Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: '24px',
          bgcolor: 'secondary.main',
          color: '#ffffff',
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 600 }}>
          <Chip
            label="Tính năng AI nổi bật"
            size="small"
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', fontWeight: 700, width: 'fit-content' }}
          />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Đóng vai cùng trợ lý AI: Thử thách phản xạ giao tiếp
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
            AI sẽ vào vai nhân vật thực tế, tương tác bằng giọng nói và chấm điểm độ tự nhiên của câu trả lời của bạn.
          </Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#ffffff',
              color: 'secondary.main',
              fontWeight: 800,
              width: 'fit-content',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
            }}
            startIcon={<PlayArrowIcon />}
            onClick={() => navigate('/conversation/roleplay')}
          >
            Bắt đầu phiên đóng vai
          </Button>
        </Stack>
      </Paper>

      {/* Dialogue Topics List */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <RecordVoiceOverIcon color="secondary" /> Hội thoại theo chủ đề thực tế
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : dialogues.length > 0 ? (
          <Grid container spacing={3}>
            {dialogues.map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={item.thumbnail || item.thumbnailUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500'}
                      alt={item.title}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        display: 'flex',
                        gap: 1,
                      }}
                    >
                      <Chip label={item.category || 'Giao tiếp'} size="small" sx={{ bgcolor: 'rgba(0, 0, 0, 0.6)', color: '#ffffff', fontWeight: 700 }} />
                      <Chip label={item.level ? `Cấp ${item.level}` : 'Sơ cấp'} color="success" size="small" sx={{ fontWeight: 700 }} />
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 800, fontFamily: 'Pretendard', display: 'block' }}>
                        {item.koreanTitle || item.korean_title}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {item.title}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {item.lines?.length || item.linesCount || 0} lượt thoại • Phân tích phát âm
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<MicIcon />}
                        onClick={() => navigate(`/conversation/dialogue/${item.id}`)}
                      >
                        Luyện đọc & nghe
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: '16px' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
              Chưa có dữ liệu bài hội thoại từ hệ thống.
            </Typography>
            <Button variant="outlined" color="secondary" onClick={() => navigate('/conversation/roleplay')}>
              Thử phòng Roleplay AI
            </Button>
          </Paper>
        )}
      </Box>
    </Stack>
  );
};
