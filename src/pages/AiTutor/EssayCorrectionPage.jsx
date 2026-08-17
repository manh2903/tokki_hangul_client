import React, { useState } from 'react';
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
  TextField,
  Alert,
} from '@mui/material';
import { aiTutorApi } from '@/api';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import confetti from 'canvas-confetti';

export const EssayCorrectionPage = () => {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCorrect = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await aiTutorApi.sendMessage({
        message: text,
        context: 'essay_correction',
      });
      const data = res?.data || res;
      if (data) {
        setResult({
          score: data.score || 85,
          corrected: data.corrected || data.reply || data.text,
          corrections: data.corrections || [],
        });
        confetti({ particleCount: 60, spread: 60 });
      }
    } catch (err) {
      setError(err.message || 'Không thể chấm bài vào lúc này, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={4}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/ai-tutor')}
        sx={{ width: 'fit-content', color: 'text.secondary' }}
      >
        Quay lại AI Tutor Studio
      </Button>

        <Box>
          <Chip label="AI Essay & Writing Corrector" color="secondary" size="small" sx={{ mb: 1, fontWeight: 700 }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Chấm & Sửa bài viết tiếng Hàn chuẩn TOPIK
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Dán đoạn văn của bạn để AI phân tích lỗi sai, nâng cấp từ vựng và chấm điểm theo tiêu chuẩn TOPIK.
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={3}>
          {/* Input Essay */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EditIcon color="secondary" fontSize="small" /> Bài viết của bạn
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {text.length} ký tự
                    </Typography>
                  </Stack>

                  <TextField
                    multiline
                    rows={8}
                    fullWidth
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Nhập hoặc dán đoạn văn tiếng Hàn của bạn vào đây..."
                    InputProps={{
                      sx: { fontFamily: 'Pretendard', lineHeight: 1.7 },
                    }}
                  />
                </Stack>

                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                  disabled={loading || !text.trim()}
                  startIcon={<AutoAwesomeIcon />}
                  onClick={handleCorrect}
                  sx={{ mt: 2, fontWeight: 700 }}
                >
                  {loading ? 'Đang phân tích...' : 'Chấm bài & Nhận xét chi tiết'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Result Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Kết quả phân tích từ Tokki AI
                    </Typography>
                    {result && <Chip label={`Điểm: ${result.score}/100`} color="success" size="small" sx={{ fontWeight: 700 }} />}
                  </Stack>

                  {!result && !loading && (
                    <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                      <AutoAwesomeIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                      <Typography variant="body2">
                        Nhập bài viết và bấm "Chấm bài" để xem gợi ý sửa lỗi chi tiết từ AI.
                      </Typography>
                    </Box>
                  )}

                  {result && (
                    <Stack spacing={2}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '14px',
                          bgcolor: (theme) => (theme.palette.mode === 'light' ? '#e8f5e9' : 'rgba(46, 125, 50, 0.15)'),
                          border: 1,
                          borderColor: 'success.light',
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main', display: 'block', mb: 0.5 }}>
                          Đoạn văn sau khi được tối ưu:
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Pretendard', fontWeight: 600, lineHeight: 1.7 }}>
                          {result.corrected}
                        </Typography>
                      </Paper>

                      {result.corrections?.length > 0 && (
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                            Chi tiết đề xuất ({result.corrections.length})
                          </Typography>

                          <Stack spacing={1}>
                            {result.corrections.map((c, idx) => (
                              <Paper
                                key={idx}
                                elevation={0}
                                sx={{
                                  p: 1.5,
                                  borderRadius: '10px',
                                  bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fbf9f1' : '#252525'),
                                  border: 1,
                                  borderColor: 'divider',
                                }}
                              >
                                <Typography variant="caption" sx={{ display: 'block', mb: 0.25 }}>
                                  <span style={{ textDecoration: 'line-through', color: '#ba1a1a', fontWeight: 600 }}>{c.original}</span>
                                  {' → '}
                                  <strong style={{ color: '#2e7d32' }}>{c.suggest}</strong>
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {c.reason}
                                </Typography>
                              </Paper>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
  );
};
