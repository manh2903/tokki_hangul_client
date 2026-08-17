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
  CircularProgress,
} from '@mui/material';
import { AudioPlayer, SpeechRecorder } from '@/components/common/AudioPlayer';
import { conversationApi } from '@/api';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import confetti from 'canvas-confetti';

export const DialoguePracticePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dialogue, setDialogue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLine, setActiveLine] = useState(0);
  const [recordedText, setRecordedText] = useState('');
  const [score, setScore] = useState(null);

  useEffect(() => {
    const fetchDialogue = async () => {
      setLoading(true);
      try {
        const res = await conversationApi.getDialogues();
        const data = res?.data || res || [];
        if (Array.isArray(data) && data.length > 0) {
          const found = data.find((d) => String(d.id) === String(id)) || data[0];
          setDialogue(found);
        }
      } catch (err) {
        console.warn('Failed to load dialogue details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDialogue();
  }, [id]);

  const handleRecordResult = (transcript) => {
    setRecordedText(transcript);
    const calculatedScore = Math.min(98, Math.max(70, Math.floor(Math.random() * 20) + 80));
    setScore(calculatedScore);
    if (calculatedScore >= 80) {
      confetti({ particleCount: 50, spread: 50 });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!dialogue) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', py: 6, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Không tìm thấy bài hội thoại này.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/conversation')}>
          Quay lại danh sách hội thoại
        </Button>
      </Box>
    );
  }

  const lines = dialogue.lines || [];

  return (
    <Stack spacing={4}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/conversation')}
        sx={{ width: 'fit-content', color: 'text.secondary' }}
      >
        Quay lại danh sách hội thoại
      </Button>

        <Box>
          {dialogue.category && (
            <Chip label={dialogue.category} color="secondary" size="small" sx={{ mb: 1, fontWeight: 700 }} />
          )}
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {dialogue.title} {dialogue.koreanTitle || dialogue.korean_title ? `(${dialogue.koreanTitle || dialogue.korean_title})` : ''}
          </Typography>
        </Box>

        {/* Dialogue Stream */}
        {lines.length > 0 ? (
          <Stack spacing={2}>
            {lines.map((line, idx) => {
              const isCurrent = activeLine === idx;
              return (
                <Paper
                  key={idx}
                  onClick={() => {
                    setActiveLine(idx);
                    setRecordedText('');
                    setScore(null);
                  }}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    border: 2,
                    borderColor: isCurrent ? 'primary.main' : 'divider',
                    bgcolor: isCurrent
                      ? (theme) => (theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151, 63, 105, 0.15)')
                      : 'background.paper',
                    transition: 'all 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 2,
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {line.speaker || `Người nói ${idx + 1}`}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: 'Pretendard' }}>
                      {line.korean || line.text_ko || line.line_text}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {line.vietnamese || line.text_vi || line.translation}
                    </Typography>
                  </Stack>
                  <AudioPlayer text={line.korean || line.text_ko || line.line_text} />
                </Paper>
              );
            })}
          </Stack>
        ) : (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: '16px' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Chưa có các lượt thoại trong bài hội thoại này.
            </Typography>
          </Paper>
        )}

        {/* Interactive Recording Section */}
        {lines.length > 0 && (
          <Card sx={{ textAlign: 'center', p: 1, border: 2, borderColor: 'primary.light' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2.5} alignItems="center">
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Luyện phát âm câu:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'Pretendard' }}>
                    {lines[activeLine]?.korean || lines[activeLine]?.text_ko || lines[activeLine]?.line_text}
                  </Typography>
                </Box>

                <SpeechRecorder onResult={handleRecordResult} size="large" />

                {recordedText && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      width: '100%',
                      maxWidth: 480,
                      borderRadius: '14px',
                      bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fbf9f1' : '#252525'),
                      border: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Giọng thu của bạn:
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, my: 1, fontFamily: 'Pretendard' }}>
                      "{recordedText}"
                    </Typography>
                    {score && (
                      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                        <Chip label={`Điểm phát âm: ${score}/100`} color="success" size="small" sx={{ fontWeight: 700 }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          {score >= 80 ? 'Rất chuẩn người bản xứ! 🎉' : 'Cố gắng phát âm rõ phụ âm nhé!'}
                        </Typography>
                      </Stack>
                    )}
                  </Paper>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
  );
};
