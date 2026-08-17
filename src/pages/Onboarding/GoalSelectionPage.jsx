import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Button,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const GOALS = [
  {
    id: 'topik',
    title: 'Luyện thi lấy chứng chỉ TOPIK',
    desc: 'Mục tiêu TOPIK 3 - TOPIK 5 phục vụ xét tốt nghiệp, du học hoặc định cư.',
    icon: SchoolIcon,
    color: '#973f69',
  },
  {
    id: 'career',
    title: 'Giao tiếp công sở & Doanh nghiệp Hàn',
    desc: 'Viết email thương mại, phỏng vấn, đàm phán hợp đồng với sếp Hàn.',
    icon: WorkIcon,
    color: '#0288d1',
  },
  {
    id: 'travel',
    title: 'Du học, Du lịch & Đời sống Hàn Quốc',
    desc: 'Tự tin du lịch bụi, hỏi đường, mua sắm, gọi món và kết bạn bản xứ.',
    icon: FlightTakeoffIcon,
    color: '#2e7d32',
  },
  {
    id: 'kpop',
    title: 'Đu Idol K-Pop & Xem K-Drama không cần Sub',
    desc: 'Hiểu trọn vẹn lời bài hát, xem livestream idol và trích đoạn phim hay.',
    icon: FavoriteIcon,
    color: '#ff6b8b',
  },
];

export const GoalSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState('topik');

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Mục tiêu học tiếng Hàn của bạn là gì? 🎯
        </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Tokki AI sẽ điều chỉnh nội dung bài học, từ vựng và ngữ pháp bám sát mục tiêu của bạn.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {GOALS.map((g) => {
            const isSelected = selectedGoal === g.id;
            const Icon = g.icon;
            return (
              <Grid item xs={12} sm={6} key={g.id}>
                <Card
                  sx={{
                    height: '100%',
                    border: 2,
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    bgcolor: isSelected
                      ? (theme) => (theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151, 63, 105, 0.15)')
                      : 'background.paper',
                    transition: 'all 0.2s',
                  }}
                >
                  <CardActionArea
                    onClick={() => setSelectedGoal(g.id)}
                    sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '14px',
                        bgcolor: `${g.color}15`,
                        color: g.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      <Icon fontSize="medium" />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                      {g.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                      {g.desc}
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Button
            variant="text"
            color="inherit"
            onClick={() => navigate('/app')}
            sx={{ color: 'text.secondary', fontWeight: 700, px: 3 }}
          >
            Bỏ qua & Vào học ngay
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/onboarding/placement-test')}
            sx={{ px: 4, py: 1.2, fontWeight: 700 }}
          >
            Tiếp tục kiểm tra trình độ
          </Button>
        </Stack>
      </Stack>
  );
};
