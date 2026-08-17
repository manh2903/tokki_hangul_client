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
} from '@mui/material';
import { AudioPlayer } from '@/components/common/AudioPlayer';
import { aiTutorApi } from '@/api';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

export const AiChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Xin chào! Mình là Tokki AI Tutor. Bạn đang gặp khó khăn ở ngữ pháp, từ vựng hay muốn luyện viết câu tiếng Hàn nào không?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const SUGGESTED_PROMPTS = [
    'Phân biệt giúp mình -느라고 và -(으)로 인해',
    'Từ "뿌듯하다" khác "행복하다" ở điểm nào?',
    'Cách viết câu mở đoạn biểu đồ TOPIK câu 53',
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const res = await aiTutorApi.sendMessage({
        message: query,
        conversationId,
      });
      const data = res?.data || res;
      if (data) {
        if (data.conversationId) setConversationId(data.conversationId);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: data.reply || data.message || data.text || 'Cảm ơn câu hỏi của bạn!',
            korean: data.korean || data.koreanSample || '',
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: err.message || 'Xin lỗi, không thể kết nối tới trợ lý AI lúc này. Vui lòng thử lại.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Stack spacing={4}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/ai-tutor')}
            sx={{ color: 'text.secondary' }}
          >
            Quay lại AI Tutor Studio
          </Button>
          <Chip label="⚡ Trợ lý học tiếng Hàn 24/7" color="primary" size="small" sx={{ fontWeight: 700 }} />
        </Stack>

        {/* Suggested Quick Prompts */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {SUGGESTED_PROMPTS.map((p, idx) => (
            <Chip
              key={idx}
              icon={<LightbulbIcon sx={{ color: '#ed6c02 !important', fontSize: 16 }} />}
              label={p}
              onClick={() => handleSend(p)}
              clickable
              variant="outlined"
              sx={{
                bgcolor: 'background.paper',
                borderRadius: '20px',
                fontWeight: 600,
                fontSize: '0.8rem',
              }}
            />
          ))}
        </Stack>

        {/* Messages */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            minHeight: 420,
            maxHeight: 520,
            overflowY: 'auto',
            borderRadius: '20px',
            bgcolor: (theme) => (theme.palette.mode === 'light' ? '#f5f3eb' : '#1a1a1a'),
            border: 1,
            borderColor: 'divider',
          }}
        >
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
                  <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34 }}>
                    <SmartToyIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                )}

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    maxWidth: 580,
                    borderRadius: '16px',
                    bgcolor: m.sender === 'user' ? 'primary.main' : 'background.paper',
                    color: m.sender === 'user' ? '#ffffff' : 'text.primary',
                    border: 1,
                    borderColor: m.sender === 'user' ? 'primary.main' : 'divider',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                    {m.text}
                  </Typography>

                  {m.korean && (
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', fontFamily: 'Pretendard' }}>
                        {m.korean}
                      </Typography>
                      <AudioPlayer text={m.korean} size="small" />
                    </Box>
                  )}
                </Paper>

                {m.sender === 'user' && (
                  <Avatar sx={{ bgcolor: 'text.secondary', width: 34, height: 34 }}>
                    <PersonIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                )}
              </Stack>
            ))}

            {isTyping && (
              <Typography variant="caption" sx={{ color: 'text.secondary', pl: 5, fontStyle: 'italic' }}>
                Tokki AI đang viết câu trả lời...
              </Typography>
            )}
          </Stack>
        </Paper>

        {/* Input Box */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            fullWidth
            placeholder="Hỏi bất kỳ điều gì về tiếng Hàn hoặc gõ câu tiếng Hàn để AI kiểm tra..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            InputProps={{
              sx: { borderRadius: '16px', bgcolor: 'background.paper' },
            }}
          />
          <IconButton
            color="primary"
            disabled={!input.trim() || isTyping}
            onClick={() => handleSend()}
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
