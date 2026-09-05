import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  Button,
  Stack,
  TextField,
  InputAdornment,
  CircularProgress,
  Pagination,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { vocabApi } from '@/api';
import { useAuth } from '@/contexts/AuthContext';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AlarmIcon from '@mui/icons-material/Alarm';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const speakKorean = (text) => {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
};

// Stage info helper for SRS
const getSrsStageInfo = (stage = 0) => {
  if (stage === 0) return { label: 'Mới thêm', color: '#64748B', bgcolor: '#F1F5F9', icon: '🐣' };
  if (stage <= 2) return { label: 'Đang ghi nhớ', color: '#0284C7', bgcolor: '#E0F2FE', icon: '🧠' };
  if (stage <= 4) return { label: 'Khá quen thuộc', color: '#D97706', bgcolor: '#FEF3C7', icon: '✨' };
  return { label: 'Đã thành thạo', color: '#16A34A', bgcolor: '#DCFCE7', icon: '🏆' };
};

export const NotebookPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const limit = 18;

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [notebookFilter, setNotebookFilter] = useState('all'); // 'all', 'due', 'mastered'

  // Modal thêm từ thủ công
  const [openAddModal, setOpenAddModal] = useState(false);
  const [customWordKr, setCustomWordKr] = useState('');
  const [customMeaningVi, setCustomMeaningVi] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Track item IDs đã đánh giá trong session hiện tại để tránh spam điểm
  const [reviewedIds, setReviewedIds] = useState(new Set());

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // --- TANSTACK QUERY: Sổ Tay Từ Vựng Cá Nhân ---
  const { data: notebookData, isLoading } = useQuery({
    queryKey: ['userNotebook', user?.id, page, limit, debouncedSearch, notebookFilter],
    queryFn: async () => {
      const params = {
        page,
        limit,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(notebookFilter === 'due' && { dueOnly: true }),
        ...(notebookFilter === 'mastered' && { srsStage: 5 }),
      };
      const res = await vocabApi.getUserVocabs(params);
      return res?.data || res || { data: [], total: 0, stats: null };
    },
    enabled: !!user,
    staleTime: 3 * 60 * 1000,
  });

  const notebookVocabs = notebookData?.data || [];
  const total = notebookData?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const stats = notebookData?.stats || {
    totalSaved: 0,
    dueCount: 0,
    masteredCount: 0,
    learningCount: 0,
  };

  // Delete word from Sổ tay
  const handleDeleteNotebookItem = async (item) => {
    try {
      await vocabApi.deleteUserVocab(item.id);
      queryClient.invalidateQueries({ queryKey: ['savedVocabIds', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userNotebook', user?.id] });
      setToast({
        open: true,
        message: `Đã xóa "${item.wordKr}" khỏi sổ tay`,
        severity: 'info',
      });
    } catch (err) {
      console.error('Error deleting vocab:', err);
      setToast({
        open: true,
        message: 'Không thể xóa từ này. Vui lòng thử lại!',
        severity: 'error',
      });
    }
  };

  // Review word SRS (Again / Hard / Good / Easy)
  const handleReviewWord = async (item, rating) => {
    // Chặn spam: đã đánh giá rồi thì không cho đánh lại trong session
    if (reviewedIds.has(item.id)) return;

    // Đánh dấu ngay để disable buttons trước khi await
    setReviewedIds((prev) => new Set(prev).add(item.id));

    try {
      await vocabApi.reviewUserVocab(item.id, rating);
      queryClient.invalidateQueries({ queryKey: ['userNotebook', user?.id] });

      const ratingTexts = {
        again: 'Quên (Ôn lại sau 10 phút)',
        hard: 'Khó (Ôn lại sau 12h)',
        good: 'Đã nhớ (+10 EXP)',
        easy: 'Rất dễ (+10 EXP)',
      };

      setToast({
        open: true,
        message: `Đã đánh giá "${item.wordKr}": ${ratingTexts[rating]} ✨`,
        severity: 'success',
      });
    } catch (err) {
      console.error('Error reviewing vocab:', err);
      // Rollback nếu API lỗi để user có thể thử lại
      setReviewedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  // Handle Add Custom Vocab
  const handleAddCustom = async () => {
    if (!customWordKr.trim() || !customMeaningVi.trim()) {
      setToast({
        open: true,
        message: 'Vui lòng nhập đầy đủ từ tiếng Hàn và nghĩa tiếng Việt!',
        severity: 'warning',
      });
      return;
    }

    setAddLoading(true);
    try {
      const res = await vocabApi.addCustomVocab({
        wordKr: customWordKr.trim(),
        meaningVi: customMeaningVi.trim(),
      });

      const newWord = res?.data || res;
      queryClient.invalidateQueries({ queryKey: ['savedVocabIds', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userNotebook', user?.id] });

      setCustomWordKr('');
      setCustomMeaningVi('');
      setOpenAddModal(false);

      setToast({
        open: true,
        message: `Đã thêm từ "${newWord.wordKr}" vào Sổ tay (+5 EXP)! 🎉`,
        severity: 'success',
      });
    } catch (err) {
      console.error('Error adding custom vocab:', err);
      setToast({
        open: true,
        message: 'Không thể thêm từ. Vui lòng kiểm tra lại!',
        severity: 'error',
      });
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <Stack spacing={3.5}>
      {/* Header Banner */}
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #FF6B8B 0%, #973F69 100%)',
          color: '#fff',
          boxShadow: '0 10px 30px rgba(255, 107, 139, 0.25)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2.5,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: '12px',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
              }}
            >
              <BookmarkIcon sx={{ fontSize: 28, color: '#fff' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff' }}>
              Sổ Tay Từ Vựng Cá Nhân
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.95, maxWidth: 650 }}>
            Kho từ vựng yêu thích của bạn được tối ưu hóa với thuật toán ngắt quãng Spaced Repetition (SRS), giúp chuyển từ vựng vào trí nhớ dài hạn vĩnh viễn.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<MenuBookIcon />}
            onClick={() => navigate('/vocabulary')}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              color: '#fff',
              borderColor: 'rgba(255, 255, 255, 0.4)',
              fontWeight: 800,
              borderRadius: '14px',
              px: 2.5,
              py: 1.2,
              backdropFilter: 'blur(8px)',
              textTransform: 'none',
              fontSize: '0.92rem',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.25)',
                borderColor: '#fff',
              },
            }}
          >
            Kho Từ Vựng ↗
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddModal(true)}
            sx={{
              bgcolor: '#fff',
              color: '#973F69',
              fontWeight: 800,
              borderRadius: '14px',
              px: 3,
              py: 1.2,
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              textTransform: 'none',
              fontSize: '0.92rem',
              '&:hover': { bgcolor: '#FFF5F7' },
            }}
          >
            Thêm từ mới
          </Button>
        </Stack>
      </Box>

      {/* Quick Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
          width: '100%',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '20px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              bgcolor: '#FDF2F4',
              color: '#9D446E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookmarkIcon />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Tổng số từ đã lưu
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary' }}>
              {stats.totalSaved} từ
            </Typography>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '20px',
            border: '1px solid',
            borderColor: stats.dueCount > 0 ? '#ffb74d' : 'divider',
            bgcolor: stats.dueCount > 0 ? 'rgba(255, 183, 77, 0.08)' : 'background.paper',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              bgcolor: 'rgba(237, 108, 2, 0.12)',
              color: '#ed6c02',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlarmIcon />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Cần ôn tập hôm nay
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#ed6c02' }}>
              {stats.dueCount} từ
            </Typography>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '20px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              bgcolor: 'rgba(46, 125, 50, 0.12)',
              color: '#2e7d32',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EmojiEventsIcon />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Đã thành thạo (SRS 5+)
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#2e7d32' }}>
              {stats.masteredCount} từ
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Filter Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label={`Tất cả (${stats.totalSaved})`}
            clickable
            onClick={() => {
              setNotebookFilter('all');
              setPage(1);
            }}
            sx={{
              fontWeight: 700,
              bgcolor: notebookFilter === 'all' ? '#9D446E' : 'background.default',
              color: notebookFilter === 'all' ? '#fff' : 'text.primary',
              '&:hover': { bgcolor: notebookFilter === 'all' ? '#86365c' : 'action.hover' },
            }}
          />
          <Chip
            icon={<AlarmIcon sx={{ fontSize: 16 }} />}
            label={`Cần ôn tập (${stats.dueCount})`}
            clickable
            onClick={() => {
              setNotebookFilter('due');
              setPage(1);
            }}
            sx={{
              fontWeight: 700,
              bgcolor: notebookFilter === 'due' ? '#ed6c02' : 'background.default',
              color: notebookFilter === 'due' ? '#fff' : 'text.primary',
              '&:hover': { bgcolor: notebookFilter === 'due' ? '#c75900' : 'action.hover' },
            }}
          />
          <Chip
            icon={<EmojiEventsIcon sx={{ fontSize: 16 }} />}
            label={`Đã thành thạo (${stats.masteredCount})`}
            clickable
            onClick={() => {
              setNotebookFilter('mastered');
              setPage(1);
            }}
            sx={{
              fontWeight: 700,
              bgcolor: notebookFilter === 'mastered' ? '#2e7d32' : 'background.default',
              color: notebookFilter === 'mastered' ? '#fff' : 'text.primary',
              '&:hover': { bgcolor: notebookFilter === 'mastered' ? '#236027' : 'action.hover' },
            }}
          />
        </Stack>

        <TextField
          size="small"
          placeholder="Tìm trong sổ tay..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: '#9D446E' }} />
              </InputAdornment>
            ),
            sx: { borderRadius: '12px', bgcolor: 'background.default', width: { xs: '100%', sm: 260 } },
          }}
        />
      </Paper>

      {/* Word Cards Grid */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: '#9D446E' }} />
        </Box>
      ) : notebookVocabs.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: '24px',
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              width: 68,
              height: 68,
              mx: 'auto',
              mb: 2,
              borderRadius: '20px',
              bgcolor: '#FDF2F4',
              color: '#9D446E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookmarkBorderIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Sổ tay của bạn đang trống
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 450, mx: 'auto', mb: 3 }}>
            Hãy ghé thăm Kho Từ Vựng & Ngữ Pháp để lưu lại các từ bạn muốn ghi nhớ, hoặc tự thêm từ mới vào sổ tay ngay bây giờ!
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<MenuBookIcon />}
              onClick={() => navigate('/vocabulary')}
              sx={{
                borderRadius: '12px',
                borderColor: '#9D446E',
                color: '#9D446E',
                fontWeight: 700,
                textTransform: 'none',
                px: 2.5,
              }}
            >
              Khám phá Kho Từ Vựng
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddModal(true)}
              sx={{
                borderRadius: '12px',
                bgcolor: '#9D446E',
                fontWeight: 700,
                textTransform: 'none',
                px: 2.5,
                '&:hover': { bgcolor: '#86365c' },
              }}
            >
              Tự thêm từ mới
            </Button>
          </Stack>
        </Paper>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 2.5,
              width: '100%',
            }}
          >
            {notebookVocabs.map((item) => {
              const stageInfo = getSrsStageInfo(item.srsStage);
              const isDue = new Date(item.nextReviewAt) <= new Date();

              return (
                <Paper
                  key={item.id}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      height: '100%',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: isDue ? '#ffb74d' : 'divider',
                      bgcolor: 'background.paper',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 24px rgba(157, 68, 110, 0.1)',
                      },
                    }}
                  >
                    <Box>
                      {/* Top row */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={`${stageInfo.icon} Cấp ${item.srsStage}: ${stageInfo.label}`}
                            size="small"
                            sx={{ height: 24, fontWeight: 800, fontSize: '0.68rem', bgcolor: stageInfo.bgcolor, color: stageInfo.color }}
                          />
                          {isDue && (
                            <Chip
                              label="Cần ôn"
                              size="small"
                              sx={{ height: 22, fontWeight: 800, fontSize: '0.65rem', bgcolor: '#fff3e0', color: '#e65100', border: '1px solid #ffe0b2' }}
                            />
                          )}
                        </Stack>

                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Phát âm tiếng Hàn">
                            <IconButton
                              size="small"
                              onClick={() => speakKorean(item.wordKr)}
                              sx={{ color: '#9D446E', bgcolor: '#FDF2F4', '&:hover': { bgcolor: '#FCE7EB' } }}
                            >
                              <VolumeUpIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Xóa khỏi sổ tay">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteNotebookItem(item)}
                              sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: '#fef2f2' } }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Box>

                      {/* Word in Korean */}
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 900, color: 'text.primary', fontFamily: 'Pretendard, sans-serif', letterSpacing: '-0.5px', mb: 0.5 }}
                      >
                        {item.wordKr}
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.98rem', lineHeight: 1.4, mb: 2 }}
                      >
                        {item.meaningVi}
                      </Typography>
                    </Box>

                    {/* SRS Review Quick Rating */}
                    <Box sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          Đánh giá ghi nhớ:
                        </Typography>
                        {reviewedIds.has(item.id) && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#16A34A',
                              fontWeight: 700,
                              fontSize: '0.68rem',
                              bgcolor: '#DCFCE7',
                              px: 1,
                              py: 0.3,
                              borderRadius: '6px',
                            }}
                          >
                            ✓ Đã đánh giá
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.8 }}>
                        {[
                          { rating: 'again', label: 'Quên', color: 'error' },
                          { rating: 'hard',  label: 'Khó',  color: 'warning' },
                          { rating: 'good',  label: 'Nhớ',  color: 'primary' },
                          { rating: 'easy',  label: 'Dễ',   color: 'success' },
                        ].map(({ rating, label, color }) => (
                          <Button
                            key={rating}
                            fullWidth
                            size="small"
                            variant="outlined"
                            color={color}
                            disabled={reviewedIds.has(item.id)}
                            onClick={() => handleReviewWord(item, rating)}
                            sx={{
                              py: 0.4,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              borderRadius: '8px',
                              textTransform: 'none',
                              '&.Mui-disabled': {
                                opacity: 0.4,
                              },
                            }}
                          >
                            {label}
                          </Button>
                        ))}
                      </Box>
                    </Box>
                  </Paper>
              );
            })}
          </Box>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, val) => {
                  setPage(val);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                color="primary"
                shape="rounded"
                sx={{ '& .Mui-selected': { bgcolor: '#9D446E !important', color: '#fff', fontWeight: 700 } }}
              />
            </Box>
          )}
        </>
      )}

      {/* Dialog: Thêm từ mới thủ công vào Sổ tay */}
      <Dialog
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Thêm từ mới vào Sổ tay ✍️
          </Typography>
          <IconButton size="small" onClick={() => setOpenAddModal(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: 'divider' }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Từ tiếng Hàn (Hangul)"
              placeholder="Ví dụ: 사과, 공부하다..."
              fullWidth
              value={customWordKr}
              onChange={(e) => setCustomWordKr(e.target.value)}
              InputProps={{ sx: { borderRadius: '12px' } }}
            />

            <TextField
              label="Nghĩa tiếng Việt"
              placeholder="Ví dụ: Quả táo, Học bài..."
              fullWidth
              value={customMeaningVi}
              onChange={(e) => setCustomMeaningVi(e.target.value)}
              InputProps={{ sx: { borderRadius: '12px' } }}
            />

            <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              💡 Từ mới sẽ bắt đầu ở Cấp độ SRS 0 và tự động nhắc bạn ôn tập theo chu kỳ ghi nhớ!
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setOpenAddModal(false)}
            sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', color: 'text.secondary' }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleAddCustom}
            disabled={addLoading}
            sx={{
              borderRadius: '12px',
              bgcolor: '#9D446E',
              fontWeight: 700,
              textTransform: 'none',
              px: 3,
              '&:hover': { bgcolor: '#86365c' },
            }}
          >
            {addLoading ? <CircularProgress size={20} color="inherit" /> : 'Lưu vào sổ tay'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global Snackbar Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3200}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ borderRadius: '14px', fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default NotebookPage;
