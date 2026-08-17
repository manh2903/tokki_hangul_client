import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  CircularProgress,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { coursesApi } from '@/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const PathPreviewPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPath = async () => {
      setLoading(true);
      try {
        const res = await coursesApi.getCourses();
        const data = res?.data || res || [];
        if (Array.isArray(data)) {
          setCourses(data);
        }
      } catch (err) {
        console.warn('Failed to load courses path:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPath();
  }, []);

  return (
    <Stack spacing={4}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
          <Box>
            <Chip label="Lộ trình AI cá nhân hoá" color="primary" size="small" sx={{ mb: 1, fontWeight: 700 }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Lộ trình Chinh phục Tiếng Hàn
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Dựa trên kết quả bài kiểm tra và mục tiêu học tập cá nhân.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/topik')}
            sx={{ fontWeight: 700, alignSelf: { xs: 'flex-start', sm: 'center' } }}
          >
            Bắt đầu học ngay
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : courses.length > 0 ? (
          <Stack spacing={4}>
            {courses.map((course, idx) => (
              <Box
                key={course.id || idx}
                sx={{
                  position: 'relative',
                  pl: 3.5,
                  borderLeft: '3px solid',
                  borderColor: 'primary.light',
                }}
              >
                {/* Dot */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: -8,
                    top: 0,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    border: '3px solid #ffffff',
                  }}
                />

                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {course.title || course.name}
                    </Typography>
                    {idx === 0 && <Chip label="Chặng 1" color="success" size="small" />}
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    {course.description || 'Chương trình học chuẩn hoá theo mục tiêu của bạn.'}
                  </Typography>
                </Box>

                {course.lessons && course.lessons.length > 0 && (
                  <Stack spacing={1.5}>
                    {course.lessons.map((item, iIdx) => (
                      <Card key={item.id || iIdx} sx={{ p: 0.5 }}>
                        <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            {item.status === 'completed' ? (
                              <CheckCircleIcon color="success" />
                            ) : item.status === 'in-progress' ? (
                              <HourglassTopIcon color="primary" />
                            ) : (
                              <RadioButtonUncheckedIcon sx={{ color: 'text.disabled' }} />
                            )}
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {item.title || item.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                                {item.type || 'Bài học'}
                              </Typography>
                            </Box>
                          </Stack>

                          <Button
                            size="small"
                            variant={item.status === 'completed' ? 'outlined' : 'contained'}
                            color={item.status === 'completed' ? 'inherit' : 'primary'}
                            onClick={() => navigate('/topik')}
                          >
                            {item.status === 'completed' ? 'Ôn lại' : 'Vào học'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: '16px' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Đang tải lộ trình học cá nhân hóa cho tài khoản của bạn.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/topik')}>
              Xem các khóa học TOPIK
            </Button>
          </Paper>
        )}
      </Stack>
  );
};
