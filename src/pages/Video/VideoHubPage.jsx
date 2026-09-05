import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Button,
  Stack,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import { videosApi, topicApi, topikApi } from '@/api';
import { useNavigate } from 'react-router-dom';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import SearchIcon from '@mui/icons-material/Search';
import YouTubeIcon from '@mui/icons-material/YouTube';
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';

export const VideoHubPage = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [topics, setTopics] = useState([]);
  const [topikLevels, setTopikLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [selectedTopicId, setSelectedTopicId] = useState('all');

  // Import Dialog State
  const [openModal, setOpenModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [topicId, setTopicId] = useState('');
  const [topikLevel, setTopikLevel] = useState(1);
  const [autoGenSub, setAutoGenSub] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [videosRes, topicsRes, levelsRes] = await Promise.allSettled([
        videosApi.getVideos(),
        topicApi.getTopics(),
        topikApi.getTopikLevels(),
      ]);

      if (videosRes.status === 'fulfilled') {
        const data = videosRes.value?.data || videosRes.value || [];
        if (Array.isArray(data)) setVideos(data);
      }

      if (topicsRes.status === 'fulfilled') {
        const tData = topicsRes.value?.data || topicsRes.value || [];
        if (Array.isArray(tData)) setTopics(tData);
      }

      if (levelsRes.status === 'fulfilled') {
        const lData = levelsRes.value?.data || levelsRes.value || [];
        if (Array.isArray(lData)) setTopikLevels(lData);
      }
    } catch (err) {
      console.warn('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleOpenModal = () => {
    setVideoUrl('');
    setTitle('');
    setTopicId(topics[0]?.id || '');
    setTopikLevel(1);
    setAutoGenSub(true);
    setErrorMsg(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setOpenModal(false);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      setErrorMsg('Vui lòng nhập link video YouTube hoặc TikTok');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await videosApi.importVideo({
        videoUrl: videoUrl.trim(),
        title: title.trim(),
        topicId: topicId || undefined,
        topikLevel: Number(topikLevel),
        autoGenerateSubtitles: autoGenSub,
      });

      const created = res?.data || res;
      if (created?.id) {
        setOpenModal(false);
        navigate(`/video/${created.id}`);
      } else {
        const refreshed = await videosApi.getVideos();
        const data = refreshed?.data || refreshed || [];
        if (Array.isArray(data)) setVideos(data);
        setOpenModal(false);
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Không thể nhập video, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered videos based on real search, level & topic
  const filteredVideos = videos.filter((v) => {
    const matchSearch =
      !searchTerm ||
      v.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.koreanTitle || v.korean_title || '')?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchLevel =
      levelFilter === 'all'
        ? true
        : levelFilter === 'my_videos'
        ? Boolean(v.cuser)
        : String(v.topikLevel || 1) === String(levelFilter);

    const matchTopic =
      selectedTopicId === 'all'
        ? true
        : String(v.topicId) === String(selectedTopicId) || String(v.topic?.id) === String(selectedTopicId);

    return matchSearch && matchLevel && matchTopic;
  });

  return (
    <Stack spacing={3.5}>
      {/* Header Banner */}
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(157,68,110,0.08) 0%, rgba(248,215,218,0.3) 100%)',
          border: '1px solid #F8D7DA',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 3,
        }}
      >
        <Box>
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: 16, color: '#9D446E !important' }} />}
            label="Học tiếng Hàn qua video thông minh"
            size="small"
            sx={{
              mb: 1.5,
              fontWeight: 800,
              bgcolor: '#FDF2F4',
              color: '#9D446E',
              border: '1px solid #F8D7DA',
            }}
          />
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.5px', color: '#1E1E24' }}>
            Học Qua Video & Phụ Đề Song Ngữ
          </Typography>
          <Typography variant="body2" sx={{ color: '#686B74', mt: 0.8, maxWidth: 640 }}>
            Luyện nghe, đọc phụ đề song ngữ Hàn - Việt, tra cứu từ vựng và đàm thoại cùng AI Tutor từ bất kỳ video YouTube hoặc bài học nào.
          </Typography>
        </Box>

        <Button
          id="open-import-video-modal-btn"
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
          sx={{
            borderRadius: '14px',
            fontWeight: 800,
            px: 3,
            py: 1.4,
            bgcolor: '#9D446E',
            boxShadow: '0 6px 20px rgba(157, 68, 110, 0.3)',
            whiteSpace: 'nowrap',
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#86365c',
              boxShadow: '0 8px 24px rgba(157, 68, 110, 0.45)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Thêm Video Tự Học (YouTube / TikTok)
        </Button>
      </Box>

      {/* Filter & Search Bar */}
      <Stack spacing={2}>
        {/* Dynamic TOPIK Level Tabs from API */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
          <Tabs
            value={levelFilter}
            onChange={(e, val) => setLevelFilter(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              width: { xs: '100%', md: 'auto' },
              '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', minWidth: 80, fontSize: '0.85rem' },
              '& .Mui-selected': { color: '#9D446E !important' },
              '& .MuiTabs-indicator': { bgcolor: '#9D446E' },
            }}
          >
            <Tab label="Tất cả bài học" value="all" />
            <Tab label="Video của tôi" value="my_videos" />
            {topikLevels.length > 0 ? (
              topikLevels.map((lvl) => (
                <Tab
                  key={lvl.id || lvl.levelNumber}
                  label={`TOPIK ${lvl.levelNumber} (${lvl.name || lvl.levelGroup || 'Cấp độ'})`}
                  value={String(lvl.levelNumber)}
                />
              ))
            ) : (
              [1, 2, 3, 4, 5, 6].map((num) => (
                <Tab key={num} label={`TOPIK ${num}`} value={String(num)} />
              ))
            )}
          </Tabs>

          <TextField
            size="small"
            placeholder="Tìm kiếm video bài học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: '100%', md: 280 },
              bgcolor: '#fff',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                borderColor: '#E2E8F0',
                '&:hover fieldset': { borderColor: '#9D446E' },
                '&.Mui-focused fieldset': { borderColor: '#9D446E' },
              },
            }}
          />
        </Stack>

        {/* Dynamic Topic Chips from API */}
        {topics.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', pb: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap', mr: 0.5 }}>
              Chủ đề:
            </Typography>
            <Chip
              label="Tất cả chủ đề"
              clickable
              onClick={() => setSelectedTopicId('all')}
              size="small"
              sx={{
                fontWeight: selectedTopicId === 'all' ? 800 : 500,
                bgcolor: selectedTopicId === 'all' ? '#9D446E' : '#fff',
                color: selectedTopicId === 'all' ? '#fff' : '#64748B',
                border: selectedTopicId === 'all' ? 'none' : '1px solid #E2E8F0',
                borderRadius: '16px',
                px: 0.5,
                fontSize: '0.78rem',
                '&:hover': { bgcolor: selectedTopicId === 'all' ? '#86365c' : '#F8FAFC' },
              }}
            />
            {topics.map((t) => {
              const active = String(selectedTopicId) === String(t.id);
              return (
                <Chip
                  key={t.id}
                  label={t.name}
                  clickable
                  onClick={() => setSelectedTopicId(t.id)}
                  size="small"
                  sx={{
                    fontWeight: active ? 800 : 500,
                    bgcolor: active ? '#9D446E' : '#fff',
                    color: active ? '#fff' : '#64748B',
                    border: active ? 'none' : '1px solid #E2E8F0',
                    borderRadius: '16px',
                    px: 0.5,
                    fontSize: '0.78rem',
                    '&:hover': { bgcolor: active ? '#86365c' : '#F8FAFC' },
                  }}
                />
              );
            })}
          </Box>
        )}
      </Stack>

      {/* Video Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: '#9D446E' }} />
        </Box>
      ) : filteredVideos.length > 0 ? (
        <Grid container spacing={3}>
          {filteredVideos.map((vid) => {
            const topicLabel = vid.topic?.name;
            return (
              <Grid item xs={12} sm={6} md={4} key={vid.id}>
                <Card
                  id={`video-card-${vid.id}`}
                  onClick={() => navigate(`/video/${vid.id}`)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    borderRadius: '18px',
                    border: '1px solid #F0E6E8',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      borderColor: '#F8D7DA',
                      boxShadow: '0 12px 30px rgba(157, 68, 110, 0.12)',
                    },
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="190"
                      image={
                        vid.thumbnailUrl ||
                        vid.thumbnail ||
                        (vid.videoUrl?.includes('youtube.com/watch?v=')
                          ? `https://img.youtube.com/vi/${vid.videoUrl.split('watch?v=')[1].split('&')[0]}/hqdefault.jpg`
                          : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500')
                      }
                      alt={vid.title}
                      sx={{ bgcolor: '#0f172a', objectFit: 'cover' }}
                    />
                    <Chip
                      icon={<AccessTimeIcon sx={{ color: '#ffffff !important', fontSize: 13 }} />}
                      label={
                        vid.durationSeconds
                          ? `${Math.floor(vid.durationSeconds / 60)}:${(vid.durationSeconds % 60).toString().padStart(2, '0')}`
                          : vid.duration || '04:15'
                      }
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        bgcolor: 'rgba(0, 0, 0, 0.75)',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        backdropFilter: 'blur(4px)',
                      }}
                    />
                  </Box>

                  <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.2, flexWrap: 'wrap', gap: 0.5 }}>
                        <Chip
                          label={vid.topikLevel ? `TOPIK ${vid.topikLevel}` : 'TOPIK 1'}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            height: 22,
                            bgcolor: '#FDF2F4',
                            color: '#9D446E',
                          }}
                        />
                        {topicLabel && (
                          <Chip
                            label={topicLabel}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              bgcolor: '#F1F5F9',
                              color: '#475569',
                            }}
                          />
                        )}
                        {vid.videoUrl?.includes('youtube') && (
                          <Chip
                            icon={<YouTubeIcon sx={{ color: '#ff0000 !important', fontSize: 14 }} />}
                            label="YouTube"
                            size="small"
                            variant="outlined"
                            sx={{ height: 22, fontSize: '0.7rem', borderColor: '#E2E8F0' }}
                          />
                        )}
                        {vid.cuser && (
                          <Chip
                            label="Tự thêm"
                            size="small"
                            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#FEF3C7', color: '#D97706' }}
                          />
                        )}
                      </Stack>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.4, color: '#1E1E24' }}>
                        {vid.title}
                      </Typography>
                      {vid.koreanTitle && (
                        <Typography
                          variant="caption"
                          sx={{ color: '#9D446E', fontWeight: 700, fontFamily: 'Pretendard', display: 'block', mt: 0.5 }}
                        >
                          {vid.koreanTitle}
                        </Typography>
                      )}
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        pt: 2,
                        mt: 2,
                        borderTop: 1,
                        borderColor: '#F1F5F9',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                        {vid.subtitles?.length || vid.subtitlesCount || 15} câu phụ đề song ngữ
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: '#9D446E', fontWeight: 800, display: 'flex', alignItems: 'center' }}
                      >
                        Bắt đầu học →
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            border: '1.5px dashed #F8D7DA',
            borderRadius: '20px',
            bgcolor: '#fff',
          }}
        >
          <SmartDisplayIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#1E1E24' }}>
            Không tìm thấy video nào
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
            Hãy thử chọn bộ lọc khác hoặc nhập video học tiếng Hàn yêu thích từ link YouTube / TikTok!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={{
              borderRadius: '12px',
              fontWeight: 800,
              bgcolor: '#9D446E',
              textTransform: 'none',
              '&:hover': { bgcolor: '#86365c' },
            }}
          >
            Thêm Video Học Tập Ngay
          </Button>
        </Paper>
      )}

      {/* Student Video Import Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            overflow: 'hidden',
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #9D446E 0%, #F5B5BC 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <AutoAwesomeIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Thêm Video Học Tập
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Hỗ trợ link YouTube, TikTok hoặc liên kết video trực tiếp
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={handleCloseModal} disabled={submitting}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleImportSubmit}>
          <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {errorMsg && (
              <Alert severity="error" sx={{ borderRadius: '12px' }}>
                {errorMsg}
              </Alert>
            )}

            {/* Video URL Input */}
            <TextField
              id="import-video-url-input"
              label="Link Video (YouTube / TikTok)"
              required
              fullWidth
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... hoặc https://www.tiktok.com/@..."
              disabled={submitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon sx={{ color: '#9D446E' }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Title Input */}
            <TextField
              id="import-video-title-input"
              label="Tên bài học / Tiêu đề video (Tùy chọn)"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Để trống AI sẽ tự đặt tên theo video"
              disabled={submitting}
            />

            {/* Topic Select from API */}
            {topics.length > 0 && (
              <FormControl fullWidth>
                <InputLabel id="topic-select-label">Chủ đề bài học</InputLabel>
                <Select
                  labelId="topic-select-label"
                  id="import-video-topic-select"
                  value={topicId}
                  label="Chủ đề bài học"
                  onChange={(e) => setTopicId(e.target.value)}
                  disabled={submitting}
                >
                  {topics.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* TOPIK Level Select from API */}
            <FormControl fullWidth>
              <InputLabel id="topik-level-select-label">Trình độ TOPIK</InputLabel>
              <Select
                labelId="topik-level-select-label"
                id="import-video-level-select"
                value={topikLevel}
                label="Trình độ TOPIK"
                onChange={(e) => setTopikLevel(e.target.value)}
                disabled={submitting}
              >
                {topikLevels.length > 0 ? (
                  topikLevels.map((lvl) => (
                    <MenuItem key={lvl.id || lvl.levelNumber} value={lvl.levelNumber}>
                      TOPIK {lvl.levelNumber} - {lvl.name || lvl.levelGroup}
                    </MenuItem>
                  ))
                ) : (
                  <>
                    <MenuItem value={1}>TOPIK 1 - Sơ cấp nhập môn</MenuItem>
                    <MenuItem value={2}>TOPIK 2 - Sơ cấp giao tiếp</MenuItem>
                    <MenuItem value={3}>TOPIK 3 - Trung cấp thực hành</MenuItem>
                    <MenuItem value={4}>TOPIK 4 - Trung cấp nâng cao</MenuItem>
                    <MenuItem value={5}>TOPIK 5 - Cao cấp</MenuItem>
                    <MenuItem value={6}>TOPIK 6 - Thành thạo</MenuItem>
                  </>
                )}
              </Select>
            </FormControl>

            {/* AI Auto-generate Subtitles Switch */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: '#FDF2F4',
                border: '1px solid #F8D7DA',
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={autoGenSub}
                    onChange={(e) => setAutoGenSub(e.target.checked)}
                    color="primary"
                    disabled={submitting}
                  />
                }
                label={
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 800, color: '#9D446E', display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 16 }} /> Tự động tạo phụ đề AI song ngữ (Hàn - Việt)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#686B74', display: 'block', mt: 0.3 }}>
                      AI sẽ tự động dịch, phân tích ngữ pháp, từ vựng và chuẩn bị sẵn trợ lý AI Tutor cho video này.
                    </Typography>
                  </Box>
                }
              />
            </Paper>

            {submitting && (
              <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#FAF8F5', borderRadius: '14px' }}>
                <CircularProgress size={24} sx={{ color: '#9D446E', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Đang tải video & khởi tạo kịch bản học tập AI...
                </Typography>
                <Typography variant="caption" sx={{ color: '#686B74' }}>
                  Quá trình này có thể mất khoảng 5 - 10 giây.
                </Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button onClick={handleCloseModal} disabled={submitting} sx={{ fontWeight: 700, textTransform: 'none' }}>
              Hủy
            </Button>
            <Button
              id="submit-import-video-btn"
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? null : <AutoAwesomeIcon />}
              sx={{
                borderRadius: '12px',
                fontWeight: 800,
                px: 3,
                py: 1,
                bgcolor: '#9D446E',
                textTransform: 'none',
                '&:hover': { bgcolor: '#86365c' },
              }}
            >
              {submitting ? 'Đang xử lý...' : 'Bắt đầu học ngay với AI'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  );
};

export default VideoHubPage;
