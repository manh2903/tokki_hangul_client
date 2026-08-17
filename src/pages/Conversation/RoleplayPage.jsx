import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  IconButton,
  Stack,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import { AudioPlayer, SpeechRecorder } from '@/components/common/AudioPlayer';
import { conversationApi, aiTutorApi } from '@/api';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

export const RoleplayPage = () => {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScenarios = async () => {
      setLoading(true);
      try {
        const res = await conversationApi.getScenarios();
        const data = res?.data || res || [];
        if (Array.isArray(data) && data.length > 0) {
          setScenarios(data);
          const first = data[0];
          setActiveScenario(first);
          if (first.initialMessage || first.initial_prompt) {
            setMessages([
              {
                sender: 'ai',
                role: first.aiRole || first.ai_role || 'AI Tutor',
                korean: first.initialMessage || first.initial_prompt,
                vietnamese: first.initialTranslation || first.initial_translation || '',
              },
            ]);
          }
        }
      } catch (err) {
        console.warn('Failed to load roleplay scenarios:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const newMsg = {
      sender: 'user',
      role: activeScenario?.userRole || activeScenario?.user_role || 'Bạn',
      korean: userText,
      vietnamese: '',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await aiTutorApi.sendMessage({
        message: userText,
        scenarioId: activeScenario?.id,
        context: 'roleplay',
      });
      const aiReply = res?.data || res;
      if (aiReply && (aiReply.reply || aiReply.text || aiReply.message)) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            role: activeScenario?.aiRole || activeScenario?.ai_role || 'AI Tutor',
            korean: aiReply.reply || aiReply.text || aiReply.message,
            vietnamese: aiReply.translation || '',
          },
        ]);
      }
    } catch (err) {
      console.warn('Failed to get AI roleplay response:', err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Stack spacing={4}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/conversation')}
            sx={{ color: 'text.secondary' }}
          >
            Quay lại
          </Button>
          <Chip label="🎭 Roleplay Session AI" color="secondary" size="small" sx={{ fontWeight: 700 }} />
        </Stack>

        {/* Persona Header */}
        {activeScenario ? (
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151, 63, 105, 0.15)'),
              border: 1,
              borderColor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar sx={{ bgcolor: 'secondary.main', width: 44, height: 44, fontSize: '1.25rem' }}>
              🎭
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Tình huống: {activeScenario.title || 'Đóng vai cùng AI'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Nhân vật AI: {activeScenario.aiRole || activeScenario.ai_role || 'Trợ lý AI'}
              </Typography>
            </Box>
          </Paper>
        ) : (
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: 1, borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Phòng đóng vai thoại trực tiếp với gia sư ảo AI. Hãy gửi lời chào để bắt đầu!
            </Typography>
          </Paper>
        )}

        {/* Chat Messages */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            minHeight: 380,
            maxHeight: 480,
            overflowY: 'auto',
            borderRadius: '20px',
            bgcolor: (theme) => (theme.palette.mode === 'light' ? '#f5f3eb' : '#1a1a1a'),
            border: 1,
            borderColor: 'divider',
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress color="secondary" />
            </Box>
          ) : messages.length > 0 ? (
            <Stack spacing={2.5}>
              {messages.map((m, idx) => (
                <Stack
                  key={idx}
                  direction="row"
                  spacing={1.5}
                  justifyContent={m.sender === 'user' ? 'flex-end' : 'flex-start'}
                  alignItems="flex-start"
                >
                  {m.sender === 'ai' && (
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                      <SmartToyIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      maxWidth: 520,
                      borderRadius: '16px',
                      bgcolor: m.sender === 'user' ? 'primary.main' : 'background.paper',
                      color: m.sender === 'user' ? '#ffffff' : 'text.primary',
                      border: 1,
                      borderColor: m.sender === 'user' ? 'primary.main' : 'divider',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: m.sender === 'user' ? 'rgba(255, 255, 255, 0.8)' : 'secondary.main',
                        }}
                      >
                        {m.role}
                      </Typography>
                      {m.sender === 'ai' && <AudioPlayer text={m.korean} size="small" />}
                    </Stack>

                    <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: 'Pretendard' }}>
                      {m.korean}
                    </Typography>

                    {m.vietnamese && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          color: m.sender === 'user' ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary',
                        }}
                      >
                        {m.vietnamese}
                      </Typography>
                    )}
                  </Paper>

                  {m.sender === 'user' && (
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <PersonIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}
                </Stack>
              ))}

              {isTyping && (
                <Typography variant="caption" sx={{ color: 'text.secondary', pl: 5, fontStyle: 'italic' }}>
                  AI đang suy nghĩ câu trả lời...
                </Typography>
              )}
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Bắt đầu nhập lời chào bằng tiếng Hàn hoặc bấm micro để nói câu đầu tiên!
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Input Box */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <SpeechRecorder onResult={(transcript) => setInput(transcript)} />
          <TextField
            fullWidth
            placeholder="Nhập câu tiếng Hàn hoặc bấm micro để nói..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            InputProps={{
              sx: { borderRadius: '16px', bgcolor: 'background.paper', fontFamily: 'Pretendard' },
            }}
          />
          <IconButton
            color="primary"
            disabled={!input.trim() || isTyping}
            onClick={handleSend}
            sx={{
              bgcolor: 'primary.main',
              color: '#ffffff',
              p: 1.5,
              '&:hover': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </Stack>
  );
};
