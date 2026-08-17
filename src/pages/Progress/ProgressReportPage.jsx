import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  Paper,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import { progressApi } from '@/api';
import InsightsIcon from '@mui/icons-material/Insights';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export const ProgressReportPage = () => {
  const [skills, setSkills] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const [skillsRes, reportsRes] = await Promise.allSettled([
          progressApi.getSkillScores(),
          progressApi.getProgressReports(),
        ]);

        const skillsData = skillsRes.status === 'fulfilled' ? (skillsRes.value?.data || skillsRes.value || []) : [];
        const reportsData = reportsRes.status === 'fulfilled' ? (reportsRes.value?.data || reportsRes.value || []) : [];

        if (Array.isArray(skillsData)) {
          setSkills(skillsData);
        }
        if (Array.isArray(reportsData)) {
          setReports(reportsData);
        }
      } catch (err) {
        console.warn('Failed to load progress data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  return (
    <Stack spacing={4}>
      <Box>
        <Chip label="Báo cáo năng lực học tập" color="primary" size="small" sx={{ mb: 1, fontWeight: 700 }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Tiến Độ Học Tập & Báo Cáo AI
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Theo dõi mức độ thành thạo các kỹ năng cốt lõi và nhận xét định kỳ từ trợ lý ảo Tokki.
          </Typography>
        </Box>

        {/* AI Performance Evaluation Box */}
        {reports.length > 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151, 63, 105, 0.15)'),
              border: 1,
              borderColor: 'primary.light',
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <PsychologyIcon /> {reports[0].title || 'Nhận xét định kỳ từ Tokki AI'}
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                {reports[0].summary || reports[0].comment || 'Tiến độ học tập của bạn đang được ghi nhận tích cực.'}
              </Typography>
            </Stack>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              bgcolor: (theme) => (theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151, 63, 105, 0.15)'),
              border: 1,
              borderColor: 'primary.light',
            }}
          >
            <Stack spacing={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <PsychologyIcon /> Nhận xét định kỳ từ Tokki AI
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Sau khi hoàn thành các bài học và bài kiểm tra đánh giá kỹ năng, AI sẽ tổng hợp và xuất báo cáo phân tích chi tiết tại đây.
              </Typography>
            </Stack>
          </Paper>
        )}

        {/* Skill Breakdown */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="primary" /> Đánh giá chi tiết kỹ năng
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : skills.length > 0 ? (
            <Grid container spacing={3}>
              {skills.map((s, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <Card>
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {s.skill || s.skill_name || s.name || 'Kỹ năng'}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                            {s.score || s.current_score || 0}/{s.max || 100}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, (s.score || s.current_score || 0))}
                          color={(s.score || 0) >= 80 ? 'success' : (s.score || 0) >= 70 ? 'primary' : 'warning'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: '16px' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Chưa có dữ liệu điểm số kỹ năng. Hãy hoàn thành các bài học và bài kiểm tra để hệ thống ghi nhận.
              </Typography>
            </Paper>
          )}
        </Box>
      </Stack>
  );
};
