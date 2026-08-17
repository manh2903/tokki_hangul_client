import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  Paper,
  LinearProgress,
  Grid,
  CircularProgress,
} from '@mui/material';
import { AudioPlayer } from '@/components/common/AudioPlayer';
import { reviewApi, vocabApi } from '@/api';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import confetti from 'canvas-confetti';

export const FlashcardDeckPage = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const res = await reviewApi.getFlashcardDecks();
        const data = res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          setCards(data);
        } else {
          // Fetch from vocabulary API if no dedicated deck is created
          const vocabRes = await vocabApi.getVocabularies({ limit: 10 });
          const vocabData = vocabRes?.data || vocabRes || [];
          const list = Array.isArray(vocabData) ? vocabData : vocabData.data || [];
          if (Array.isArray(list) && list.length > 0) {
            setCards(
              list.map((v) => ({
                id: v.id,
                korean: v.word || v.korean,
                vietnamese: v.meaning || v.vietnamese,
                example: v.example || (v.examples && v.examples[0]?.sentence) || '',
                srsLevel: v.srs_level || 1,
              }))
            );
          }
        }
      } catch (err) {
        console.warn('Failed to load flashcard decks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  const card = cards[currentIdx];
  const total = cards.length;

  const handleRate = () => {
    setIsFlipped(false);
    if (currentIdx < total - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsDone(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (cards.length === 0) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', py: 6, textAlign: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Không có thẻ ôn tập nào đến hạn! 🎉
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Bạn đã hoàn thành tất cả các mục từ vựng trong chu kỳ Spaced Repetition hôm nay.
          </Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/review')}>
            Quay lại trung tâm ôn tập
          </Button>
        </Stack>
      </Box>
    );
  }

  if (isDone) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', py: 6, textAlign: 'center' }}>
        <Stack spacing={3} alignItems="center">
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'success.light',
              color: 'success.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 48 }} />
          </Box>
          <Box>
            <Chip label="Xuất sắc!" color="success" size="small" sx={{ mb: 1, fontWeight: 700 }} />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Bạn đã hoàn thành phiên ôn tập hôm nay! 🎉
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Đã củng cố {total} từ vựng vào bộ nhớ dài hạn SRS.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={() => navigate('/review')}
            sx={{ fontWeight: 700 }}
          >
            Quay lại trung tâm ôn tập
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Stack spacing={4}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/review')}
            sx={{ color: 'text.secondary' }}
          >
            Quay lại
          </Button>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            Thẻ {currentIdx + 1}/{total}
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={((currentIdx + 1) / total) * 100}
          color="success"
          sx={{ height: 8, borderRadius: 4 }}
        />

        {/* Flip Flashcard */}
        <Paper
          onClick={() => setIsFlipped(!isFlipped)}
          elevation={0}
          sx={{
            height: 320,
            p: 4,
            borderRadius: '24px',
            cursor: 'pointer',
            border: 2,
            borderColor: isFlipped ? 'primary.main' : 'divider',
            bgcolor: isFlipped ? 'primary.main' : 'background.paper',
            color: isFlipped ? '#ffffff' : 'text.primary',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'center',
            transition: 'all 0.3s ease-in-out',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
          }}
        >
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip
              label={`Cấp độ nhớ: SRS ${card?.srsLevel || 1}`}
              size="small"
              sx={{
                bgcolor: isFlipped ? 'rgba(255, 255, 255, 0.2)' : 'rgba(151, 63, 105, 0.1)',
                color: isFlipped ? '#ffffff' : 'primary.main',
                fontWeight: 700,
              }}
            />
            <AudioPlayer text={isFlipped ? card?.example : card?.korean} />
          </Box>

          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'Pretendard', mb: 1 }}>
              {isFlipped ? (card?.vietnamese || card?.meaning) : (card?.korean || card?.word)}
            </Typography>
            {isFlipped && card?.example && (
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontFamily: 'Pretendard',
                  mt: 1,
                }}
              >
                <Typography variant="caption">"{card.example}"</Typography>
              </Paper>
            )}
            {!isFlipped && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Chạm vào thẻ để xem nghĩa & câu ví dụ
              </Typography>
            )}
          </Box>

          <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ReplayIcon fontSize="inherit" /> Lật mặt thẻ
          </Typography>
        </Paper>

        {/* Rating Buttons */}
        {isFlipped ? (
          <Grid container spacing={1.5}>
            <Grid item xs={3}>
              <Button fullWidth variant="outlined" color="error" onClick={() => handleRate(1)} sx={{ py: 1.2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Quên rồi 😅</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.7 }}>1 ngày</Typography>
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button fullWidth variant="outlined" color="warning" onClick={() => handleRate(2)} sx={{ py: 1.2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Hơi khó 🤔</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.7 }}>3 ngày</Typography>
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button fullWidth variant="outlined" color="success" onClick={() => handleRate(3)} sx={{ py: 1.2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Nhớ tốt 😊</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.7 }}>7 ngày</Typography>
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button fullWidth variant="contained" color="primary" onClick={() => handleRate(4)} sx={{ py: 1.2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Rất dễ ⚡</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.7 }}>15 ngày</Typography>
              </Button>
            </Grid>
          </Grid>
        ) : (
          <Button fullWidth variant="contained" color="primary" size="large" onClick={() => setIsFlipped(true)}>
            Xem đáp án
          </Button>
        )}
      </Stack>
  );
};
