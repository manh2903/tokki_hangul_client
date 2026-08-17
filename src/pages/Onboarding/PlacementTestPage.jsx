import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Paper,
  Stack,
  CircularProgress,
} from '@mui/material';
import { AudioPlayer } from '@/components/common/AudioPlayer';
import { topikApi, usersApi } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FastForwardIcon from '@mui/icons-material/FastForward';
import confetti from 'canvas-confetti';

export const PlacementTestPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [estimatedLevel, setEstimatedLevel] = useState('TOPIK I');

  const markOnboardingDone = async (level = 'TOPIK I') => {
    const userId = user?.id || 'guest';
    localStorage.setItem(`tokki_onboarding_completed_${userId}`, 'true');
    if (user?.id) {
      try {
        await usersApi.updateMe({ currentLevel: level });
        updateUser?.({ currentLevel: level, hasCompletedPlacement: true });
      } catch (err) {
        console.warn('Failed to update user level:', err);
      }
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await topikApi.getPlacementQuestions();
        const data = res?.data || res || [];
        if (Array.isArray(data) && data.length > 0) {
          setQuestions(data);
        } else {
          // Fallback check from general topik tests
          const testRes = await topikApi.getTopikTests({ type: 'placement' });
          const testData = testRes?.data || testRes || [];
          if (Array.isArray(testData) && testData[0]?.questions) {
            setQuestions(testData[0].questions);
          } else {
            setQuestions([]);
          }
        }
      } catch (err) {
        console.warn('Failed to load placement test questions:', err);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleSkip = async () => {
    await markOnboardingDone('TOPIK I');
    navigate('/app');
  };

  const total = questions.length;
  const q = questions[currentIdx];

  const handleSelect = (idx) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: idx }));
  };

  const handleNext = async () => {
    if (currentIdx < total - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      let correctCount = 0;
      questions.forEach((item, index) => {
        if (selectedAnswers[index] === item.correct || selectedAnswers[index] === item.correctIndex) {
          correctCount += 1;
        }
      });
      const levelResult = correctCount >= Math.ceil(total / 2) ? 'TOPIK II' : 'TOPIK I';
      setEstimatedLevel(levelResult);
      await markOnboardingDone(levelResult);
      setIsFinished(true);
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

  if (questions.length === 0) {
    return (
      <Box sx={{ maxWidth: 640, mx: 'auto', py: 6, textAlign: 'center' }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: 1, borderColor: 'divider' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Chào mừng bạn đến với Tokki Hangul! 🐰
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Hệ thống đang chuẩn bị bộ câu hỏi đánh giá cá nhân hoá từ AI. Bạn có thể vào học ngay hoặc bắt đầu từ cấp độ TOPIK I.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSkip}
            sx={{ px: 4, py: 1.2, fontWeight: 700 }}
          >
            Bắt đầu học ngay →
          </Button>
        </Paper>
      </Box>
    );
  }

  if (isFinished) {
    return (
      <Box sx={{ maxWidth: 640, mx: 'auto', py: 4, textAlign: 'center' }}>
        <Stack spacing={3} alignItems="center">
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

          <Box>
            <Chip label="Đánh giá hoàn tất" color="success" size="small" sx={{ mb: 1, fontWeight: 700 }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Trình độ ước tính: {estimatedLevel}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Tokki AI đã thiết lập lộ trình học tập cá nhân hóa phù hợp với năng lực hiện tại của bạn.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', pt: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/app')}
              sx={{ py: 1.2, fontWeight: 700 }}
            >
              Vào trang chủ học ngay
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/onboarding/path-preview')}
              sx={{ py: 1.2, fontWeight: 700 }}
            >
              Khám phá Lộ trình chi tiết
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  }

  return (
    <Stack spacing={4}>
      {/* Top Actions & Skip button */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Chip label="🎯 Kiểm tra định vị trình độ" color="primary" size="small" sx={{ fontWeight: 700 }} />
          <Button
            variant="text"
            color="inherit"
            endIcon={<FastForwardIcon />}
            onClick={handleSkip}
            sx={{ color: 'text.secondary', fontWeight: 700 }}
          >
            Bỏ qua bài test
          </Button>
        </Stack>

        {/* Progress header */}
        <Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Kiểm tra năng lực tiếng Hàn
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Câu {currentIdx + 1}/{total}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={((currentIdx + 1) / total) * 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Chip
                  icon={q?.type === 'listening' || q?.skill === 'listening' ? <HeadphonesIcon /> : <MenuBookIcon />}
                  label={q?.type === 'listening' || q?.skill === 'listening' ? 'Kỹ năng Nghe' : 'Kỹ năng Đọc & Ngữ pháp'}
                  size="small"
                  color="primary"
                  sx={{ mb: 1.5 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {q?.question || q?.title || 'Chọn đáp án chính xác:'}
                </Typography>
              </Box>

              {(q?.koreanText || q?.korean || q?.content) && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '14px',
                    bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151, 63, 105, 0.1)'),
                    border: 1,
                    borderColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'Pretendard' }}>
                    {q?.koreanText || q?.korean || q?.content}
                  </Typography>
                  <AudioPlayer text={q?.koreanText || q?.korean || q?.content} />
                </Paper>
              )}

              {/* Options */}
              {Array.isArray(q?.options) && (
                <Stack spacing={1.5}>
                  {q.options.map((opt, idx) => {
                    const isSelected = selectedAnswers[currentIdx] === idx;
                    const optText = typeof opt === 'object' ? opt.text || opt.label : opt;
                    return (
                      <Paper
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: 2,
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          bgcolor: isSelected
                            ? (theme) => (theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151, 63, 105, 0.15)')
                            : 'background.paper',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: isSelected ? 700 : 500 }}>
                          {optText}
                        </Typography>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            bgcolor: isSelected ? 'primary.main' : 'action.hover',
                            color: isSelected ? '#ffffff' : 'text.secondary',
                          }}
                        >
                          {String.fromCharCode(65 + idx)}
                        </Box>
                      </Paper>
                    );
                  })}
                </Stack>
              )}

              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1 }}>
                <Button variant="text" color="inherit" onClick={handleSkip} sx={{ color: 'text.secondary' }}>
                  Bỏ qua bài test
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={selectedAnswers[currentIdx] === undefined}
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNext}
                  sx={{ px: 3, fontWeight: 700 }}
                >
                  {currentIdx === total - 1 ? 'Hoàn thành đánh giá' : 'Câu tiếp theo'}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
    </Stack>
  );
};
