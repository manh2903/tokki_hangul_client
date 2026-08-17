import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ChatIcon from '@mui/icons-material/Chat';
import EditIcon from '@mui/icons-material/Edit';
import MicIcon from '@mui/icons-material/Mic';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const AI_TOOLS = [
  {
    id: 'voice-call',
    title: 'Gọi thoại trực tiếp với Tokki AI',
    desc: 'Luyện phản xạ đàm thoại 2 chiều qua micro, nghe giọng nói bản xứ chuẩn Seoul và nhận góp ý tức thì.',
    icon: PhoneInTalkIcon,
    badge: 'Live Voice Mode',
    color: '#e63946',
    route: '/ai-voice-call',
  },
  {
    id: 'chat',
    title: 'Chat với Gia sư Tokki AI',
    desc: 'Hỏi đáp mọi thắc mắc về ngữ pháp, phân biệt từ đồng nghĩa và cấu trúc câu khó.',
    icon: ChatIcon,
    badge: 'Real-time Chat',
    color: '#973f69',
    route: '/ai-tutor/chat',
  },
  {
    id: 'essay',
    title: 'Chấm bài viết & TOPIK 쓰기',
    desc: 'Dán bài viết tiếng Hàn, AI sẽ sửa lỗi chính tả, ngữ pháp và gợi ý cách diễn đạt tự nhiên.',
    icon: EditIcon,
    badge: 'TOPIK Câu 53 & 54',
    color: '#ff6b8b',
    route: '/ai-tutor/essay',
  },
  {
    id: 'pronunciation',
    title: 'Phòng luyện phát âm AI',
    desc: 'Thu âm câu bất kỳ, AI phân tích độ chính xác theo ngữ điệu và phát âm chuẩn Seoul.',
    icon: MicIcon,
    badge: 'Voice AI',
    color: '#2e7d32',
    route: '/conversation/roleplay',
  },
];

export const AiTutorHubPage = () => {
  const navigate = useNavigate();

  return (
    <Stack spacing={4}>
      <Box>
        <Chip label="Trợ lý AI đồng hành 24/7" color="primary" size="small" sx={{ mb: 1, fontWeight: 700 }} />
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Tokki AI Tutor Studio
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Ứng dụng mô hình ngôn ngữ lớn chuyên sâu tiếng Hàn giúp bạn học nhanh và chuẩn xác hơn.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {AI_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Grid item xs={12} md={4} key={tool.id}>
              <Card
                onClick={() => navigate(tool.route)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(151, 63, 105, 0.12)',
                    '& .arrow-icon': { transform: 'translateX(4px)', color: 'primary.main' },
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '16px',
                          bgcolor: `${tool.color}15`,
                          color: tool.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon fontSize="medium" />
                      </Box>
                      <Chip label={tool.badge} size="small" color="primary" variant="outlined" />
                    </Stack>

                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {tool.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, lineHeight: 1.6 }}>
                        {tool.desc}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>

                <Box sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Trải nghiệm ngay
                  </Typography>
                  <ArrowForwardIcon className="arrow-icon" sx={{ fontSize: 18, color: 'primary.main', transition: 'all 0.2s' }} />
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
};
