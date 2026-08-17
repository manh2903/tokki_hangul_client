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
import { vocabApi, reviewApi } from '@/api';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import confetti from 'canvas-confetti';

export const GamesPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);

  const fetchGamePairs = async () => {
    setLoading(true);
    setMatched([]);
    setSelected([]);
    setScore(0);

    try {
      const res = await vocabApi.getVocabularies({ limit: 4 });
      const data = res?.data || res || [];
      const list = Array.isArray(data) ? data : data.data || [];

      if (Array.isArray(list) && list.length > 0) {
        const generatedPairs = [];
        list.forEach((item, idx) => {
          generatedPairs.push({
            id: `ko_${item.id || idx}`,
            text: item.word || item.korean,
            matchId: item.id || idx,
            type: 'ko',
          });
          generatedPairs.push({
            id: `vi_${item.id || idx}`,
            text: item.meaning || item.vietnamese,
            matchId: item.id || idx,
            type: 'vi',
          });
        });
        setItems(generatedPairs.sort(() => Math.random() - 0.5));
      }
    } catch (err) {
      console.warn('Failed to load vocabulary for matching game:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamePairs();
  }, []);

  const handleClick = (item) => {
    if (matched.includes(item.matchId) || selected.some((s) => s.id === item.id)) return;

    const newSelected = [...selected, item];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (first.matchId === second.matchId && first.type !== second.type) {
        const nextMatched = [...matched, first.matchId];
        setMatched(nextMatched);
        const newScore = score + 100;
        setScore(newScore);

        if (nextMatched.length === items.length / 2) {
          confetti({ particleCount: 80, spread: 60 });
          // Submit game session to backend
          reviewApi.submitGameSession({ score: newScore, gameType: 'word_match' }).catch(() => null);
        }
      }
      setTimeout(() => setSelected([]), 600);
    }
  };

  const isCompleted = items.length > 0 && matched.length === items.length / 2;

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
          <Chip label={`Điểm số: ${score} EXP`} color="success" size="small" sx={{ fontWeight: 700 }} />
        </Stack>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            🃏 Game Ghép Thẻ Từ Vựng
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Chọn một thẻ tiếng Hàn và ghép nối với thẻ tiếng Việt tương ứng!
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : isCompleted ? (
          <Card sx={{ textAlign: 'center', p: 4 }}>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: 'success.light',
                    color: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Bạn đã hoàn thành màn chơi xuất sắc!
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Nhận được +{score} điểm kinh nghiệm EXP
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ReplayIcon />}
                  onClick={fetchGamePairs}
                  sx={{ fontWeight: 700 }}
                >
                  Chơi lại ván mới
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {items.map((item) => {
              const isSelected = selected.some((s) => s.id === item.id);
              const isMatched = matched.includes(item.matchId);

              return (
                <Grid item xs={6} sm={3} key={item.id}>
                  <Paper
                    onClick={() => handleClick(item)}
                    elevation={0}
                    sx={{
                      height: 100,
                      p: 2,
                      borderRadius: '16px',
                      cursor: isMatched ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      border: 2,
                      borderColor: isMatched ? 'success.main' : isSelected ? 'primary.main' : 'divider',
                      bgcolor: isMatched
                        ? 'success.main'
                        : isSelected
                        ? 'primary.main'
                        : 'background.paper',
                      color: isMatched || isSelected ? '#ffffff' : 'text.primary',
                      opacity: isMatched ? 0.8 : 1,
                      transform: isSelected ? 'scale(1.03)' : 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: isMatched ? 'success.main' : 'primary.main',
                      },
                    }}
                  >
                    <Typography
                      variant={item.type === 'ko' ? 'h6' : 'body2'}
                      sx={{
                        fontWeight: 700,
                        fontFamily: item.type === 'ko' ? 'Pretendard' : 'inherit',
                      }}
                    >
                      {item.text}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Stack>
  );
};
