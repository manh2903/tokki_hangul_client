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
  LinearProgress,
  CircularProgress,
  Paper,
} from '@mui/material';
import { topikApi } from '@/api';
import { useNavigate } from 'react-router-dom';

import SchoolIcon from '@mui/icons-material/School';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EditNoteIcon from '@mui/icons-material/EditNote';
import MicIcon from '@mui/icons-material/Mic';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const SKILLS = [
  { id: 'listening', name: 'Luyện Nghe (듣기)', icon: HeadphonesIcon, count: 'Kỹ năng nghe', color: '#0288d1' },
  { id: 'reading', name: 'Luyện Đọc (읽기)', icon: MenuBookIcon, count: 'Kỹ năng đọc', color: '#2e7d32' },
  { id: 'writing', name: 'Luyện Viết (쓰기)', icon: EditNoteIcon, count: 'Kỹ năng viết', color: '#973f69' },
  { id: 'speaking', name: 'Luyện Nói & Phát âm', icon: MicIcon, count: 'Kỹ năng nói', color: '#ff6b8b' },
  { id: 'mock-test', name: 'Đề Thi Thử TOPIK', icon: AssignmentIcon, count: 'Đề thi chuẩn', color: '#ed6c02' },
];

import { useQuery } from '@tanstack/react-query';

export const TopikHubPage = () => {
  const navigate = useNavigate();

  const { data: levels = [], isLoading: loading } = useQuery({
    queryKey: ['topikLevels'],
    queryFn: async () => {
      const res = await topikApi.getTopikLevels();
      return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const [selectedLevelId, setSelectedLevelId] = useState(null);

  useEffect(() => {
    if (levels.length > 0 && !selectedLevelId) {
      setSelectedLevelId(levels[0].id);
    }
  }, [levels, selectedLevelId]);

  return (
    <Stack spacing={4}>
      <Box>
        <Chip label="Hệ thống luyện thi chuẩn TOPIK" color="primary" size="small" sx={{ mb: 1, fontWeight: 700 }} />
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Luyện thi TOPIK I & TOPIK II
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Học theo từng kỹ năng, phân tích lỗi sai và làm quen với cấu trúc đề thi thực tế.
        </Typography>
      </Box>

      {/* Level Selection Cards */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : levels.length > 0 ? (
        <Grid container spacing={3}>
          {levels.map((lvl) => {
            const isSelected = selectedLevelId === lvl.id;
            const displayName = lvl.level_name || lvl.name || `TOPIK ${lvl.level_number || ''}`;
            return (
              <Grid item xs={12} md={6} key={lvl.id}>
                <Card
                  onClick={() => setSelectedLevelId(lvl.id)}
                  sx={{
                    p: 1,
                    cursor: 'pointer',
                    border: 2,
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    bgcolor: isSelected
                      ? (theme) => (theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151, 63, 105, 0.12)')
                      : 'background.paper',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '16px',
                              bgcolor: 'primary.main',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1.1rem',
                            }}
                          >
                            {String(displayName).includes('I') && !String(displayName).includes('II') ? 'T1' : 'T2'}
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              {displayName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                              {lvl.subTitle || lvl.description || 'Cấp độ học thuật'}
                            </Typography>
                          </Box>
                        </Stack>
                        <Chip label={lvl.badge || lvl.levelGroup || 'TOPIK'} color={isSelected ? 'primary' : 'default'} size="small" />
                      </Stack>

                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                        {lvl.description || 'Chương trình học toàn diện các kỹ năng ngữ pháp, từ vựng và bài tập.'}
                      </Typography>

                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                            Tiến độ hoàn thành
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {lvl.progress || 0}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={lvl.progress || 0}
                          color={isSelected ? 'primary' : 'inherit'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: '16px' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Chưa có danh sách cấp độ TOPIK từ hệ thống.
          </Typography>
        </Paper>
      )}

      {/* Skills Grid */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon color="primary" /> Kỹ năng ôn luyện trọng tâm
        </Typography>

        <Grid container spacing={3}>
          {SKILLS.map((skill) => {
            const Icon = skill.icon;
            return (
              <Grid item xs={12} sm={6} md={4} key={skill.id}>
                <Card
                  onClick={() => navigate('/topik/lesson/1')}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 24px rgba(151, 63, 105, 0.1)',
                      '& .chevron-icon': { transform: 'translateX(4px)', color: 'primary.main' },
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '14px',
                          bgcolor: `${skill.color}15`,
                          color: skill.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon fontSize="medium" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          {skill.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {skill.count}
                        </Typography>
                      </Box>
                    </Stack>
                    <ChevronRightIcon className="chevron-icon" sx={{ color: 'text.secondary', transition: 'all 0.2s' }} />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Stack>
  );
};
