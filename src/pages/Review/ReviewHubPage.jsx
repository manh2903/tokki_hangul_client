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
import { reviewApi } from '@/api';
import { useNavigate } from 'react-router-dom';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LayersIcon from '@mui/icons-material/Layers';

export const ReviewHubPage = () => {
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewData = async () => {
      setLoading(true);
      try {
        const res = await reviewApi.getFlashcardDecks();
        const data = res?.data || res || [];
        if (Array.isArray(data)) {
          setFlashcards(data);
        }
      } catch (err) {
        console.warn('Failed to load flashcard decks from API:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
  }, []);

  const dueCardsCount = flashcards.filter((c) => c.due).length || flashcards.length;

  return (
    <Stack spacing={4}>
      <Box>
        <Chip label="Spaced Repetition System (SRS)" color="success" size="small" sx={{ mb: 1, fontWeight: 700 }} />
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Ôn Tập Thẻ Ghi Nhớ & Mini Games
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Thuật toán ngắt quãng giúp chuyển từ vựng từ trí nhớ ngắn hạn sang dài hạn vĩnh viễn.
        </Typography>
      </Box>

      {/* SRS Due Flashcards Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: '24px',
          bgcolor: '#2e7d32',
          color: '#ffffff',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ md: 'center' }}
          spacing={3}
        >
          <Stack spacing={1.5} sx={{ maxWidth: 600 }}>
            <Chip
              label="Đến hạn ôn tập hôm nay"
              size="small"
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', fontWeight: 700, width: 'fit-content' }}
            />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {dueCardsCount > 0
                ? `Bạn có ${dueCardsCount} thẻ từ vựng cần ôn lại theo chu kỳ nhớ quên!`
                : 'Các thẻ từ vựng đều đã được cập nhật chu kỳ ôn tập!'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
              Chỉ mất khoảng 5 phút để hoàn thành phiên ôn tập và bảo toàn chuỗi ghi nhớ đỉnh cao của bạn.
            </Typography>
          </Stack>

          <Button
            variant="contained"
            size="large"
            startIcon={<LayersIcon />}
            onClick={() => navigate('/review/flashcards')}
            sx={{
              bgcolor: '#ffffff',
              color: '#2e7d32',
              fontWeight: 800,
              px: 3,
              py: 1.2,
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
            }}
          >
            Bắt đầu lật thẻ ngay
          </Button>
        </Stack>
      </Paper>

      {/* Mini Games Grid */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SportsEsportsIcon color="success" /> Mini Games luyện trí nhớ & phản xạ từ vựng
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid #2e7d32' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '16px',
                        bgcolor: 'rgba(46, 125, 50, 0.1)',
                        color: '#2e7d32',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                      }}
                    >
                      🃏
                    </Box>
                    <Chip label="Game 1" color="success" size="small" />
                  </Stack>

                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Ghép thẻ từ vựng (Word Match)
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      Ghép cặp từ tiếng Hàn với nghĩa tiếng Việt tương ứng thật nhanh trước khi hết giờ.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>

              <Box sx={{ p: 3, pt: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="success"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/review/games')}
                  sx={{ fontWeight: 700 }}
                >
                  Chơi game ghép thẻ
                </Button>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid #0288d1' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '16px',
                        bgcolor: 'rgba(2, 136, 209, 0.1)',
                        color: '#0288d1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                      }}
                    >
                      🧩
                    </Box>
                    <Chip label="Game 2" color="primary" size="small" />
                  </Stack>

                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Sắp xếp câu hoàn chỉnh (Sentence Builder)
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      Kéo thả các khối từ thành câu chuẩn ngữ pháp tiếng Hàn (trợ từ, vị ngữ, bổ ngữ).
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>

              <Box sx={{ p: 3, pt: 0 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/review/games')}
                  sx={{ fontWeight: 700 }}
                >
                  Thử thách sắp xếp câu
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Stack>
  );
};
