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
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { AudioPlayer } from '@/components/common/AudioPlayer';
import { grammarApi, coursesApi } from '@/api';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import confetti from 'canvas-confetti';

export const TopikLessonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const res = await grammarApi.getGrammarPoints({ id });
        const data = res?.data || res || [];
        if (Array.isArray(data) && data.length > 0) {
          const found = data.find((g) => String(g.id) === String(id)) || data[0];
          setLesson(found);
        } else if (data && data.title) {
          setLesson(data);
        }
      } catch (err) {
        console.warn('Failed to load lesson data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  const handleCheck = () => {
    setIsSubmitted(true);
    if (lesson?.exercise && selectedOption === lesson.exercise.correct) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', py: 6, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Không tìm thấy bài học này trong hệ thống.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/topik')}>
          Quay lại danh sách TOPIK
        </Button>
      </Box>
    );
  }

  const examples = lesson.examples || [];
  const exercise = lesson.exercise;

  return (
    <Stack spacing={4}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/topik')}
        sx={{ width: 'fit-content', color: 'text.secondary' }}
      >
        Quay lại danh sách bài học TOPIK
      </Button>

        <Box>
          <Chip label={lesson.level || lesson.topik_level || 'TOPIK'} color="primary" size="small" sx={{ mb: 1, fontWeight: 700 }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {lesson.title || lesson.name || lesson.pattern}
          </Typography>
        </Box>

        {/* Grammar Explanation */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MenuBookIcon color="primary" /> Ý nghĩa & Cấu trúc ngữ pháp
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '14px',
                  bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fbf9f1' : '#252525'),
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  {lesson.explanation || lesson.description || lesson.meaning || 'Nội dung giải thích chi tiết cấu trúc ngữ pháp.'}
                </Typography>
              </Paper>

              {examples.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', display: 'block', mb: 1.5 }}>
                    Ví dụ minh họa
                  </Typography>
                  <Stack spacing={1.5}>
                    {examples.map((ex, idx) => (
                      <Paper
                        key={idx}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: 1,
                          borderColor: 'divider',
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontFamily: 'Pretendard' }}>
                            {ex.korean || ex.sentence_ko || ex.example}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                            {ex.vietnamese || ex.sentence_vi || ex.translation}
                          </Typography>
                        </Box>
                        <AudioPlayer text={ex.korean || ex.sentence_ko || ex.example} />
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Practice Question */}
        {exercise && (
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HelpOutlineIcon color="secondary" /> Bài tập áp dụng nhanh
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {exercise.question || 'Chọn đáp án chính xác điền vào chỗ trống:'}
                </Typography>

                {exercise.korean && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: '14px',
                      bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151, 63, 105, 0.1)'),
                      border: 1,
                      borderColor: 'primary.light',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'Pretendard' }}>
                      {exercise.korean}
                    </Typography>
                  </Paper>
                )}

                {exercise.options && (
                  <Grid container spacing={2}>
                    {exercise.options.map((opt, idx) => {
                      const isSelected = selectedOption === idx;
                      return (
                        <Grid item xs={12} sm={6} key={idx}>
                          <Paper
                            onClick={() => setSelectedOption(idx)}
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: '12px',
                              cursor: 'pointer',
                              textAlign: 'center',
                              border: 2,
                              borderColor: isSelected ? 'primary.main' : 'divider',
                              bgcolor: isSelected
                                ? (theme) => (theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151, 63, 105, 0.15)')
                                : 'background.paper',
                              fontWeight: isSelected ? 700 : 500,
                              transition: 'all 0.2s',
                              '&:hover': { borderColor: 'primary.main' },
                            }}
                          >
                            <Typography variant="body2">{opt}</Typography>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}

                {isSubmitted && (
                  <Alert severity={selectedOption === exercise.correct ? 'success' : 'error'}>
                    <strong>{selectedOption === exercise.correct ? '🎉 Chính xác!' : '❌ Chưa chính xác!'}</strong>{' '}
                    {exercise.note || ''}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={selectedOption === null}
                    onClick={handleCheck}
                  >
                    {isSubmitted ? 'Hoàn thành bài học' : 'Kiểm tra đáp án'}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
  );
};
