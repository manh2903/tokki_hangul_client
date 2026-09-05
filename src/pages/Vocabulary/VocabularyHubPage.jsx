import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Autocomplete,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  LinearProgress,
} from '@mui/material';
import { vocabApi, topicApi, topikApi } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AlarmIcon from '@mui/icons-material/Alarm';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import CloseIcon from '@mui/icons-material/Close';

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

export const VocabularyHubPage = () => {
  const { user } = useAuth();

  // Active Tab: 'bank' (Kho từ vựng) vs 'notebook' (Sổ tay cá nhân)
  const [activeTab, setActiveTab] = useState('bank');

  // --- KHO TỪ VỰNG STATES ---
  const [vocabularies, setVocabularies] = useState([]);
  const [topics, setTopics] = useState([]);
  const [topikLevels, setTopikLevels] = useState([]);
  const [partsOfSpeech, setPartsOfSpeech] = useState([]);

  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 18;

  // Filter states for Kho từ vựng
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedPos, setSelectedPos] = useState('all');

  // Set of saved vocab IDs in DB
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  // --- SỔ TAY TỪ VỰNG STATES ---
  const [notebookVocabs, setNotebookVocabs] = useState([]);
  const [notebookLoading, setNotebookLoading] = useState(false);
  const [notebookTotal, setNotebookTotal] = useState(0);
  const [notebookPage, setNotebookPage] = useState(1);
  const [notebookFilter, setNotebookFilter] = useState('all'); // 'all', 'due', 'mastered'
  const [notebookStats, setNotebookStats] = useState({
    totalSaved: 0,
    dueCount: 0,
    masteredCount: 0,
    learningCount: 0,
  });

  // Modal thêm từ thủ công
  const [openAddModal, setOpenAddModal] = useState(false);
  const [customWordKr, setCustomWordKr] = useState('');
  const [customMeaningVi, setCustomMeaningVi] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
      setNotebookPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load saved vocab IDs on mount
  const loadSavedIds = useCallback(async () => {
    if (!user) return;
    try {
      const res = await vocabApi.getSavedVocabIds();
      const payload = res?.data || res;
      if (payload?.ids && Array.isArray(payload.ids)) {
        setBookmarkedIds(new Set(payload.ids));
      }
    } catch (err) {
      console.warn('Could not load saved vocab IDs:', err);
    }
  }, [user]);

  useEffect(() => {
    loadSavedIds();
  }, [loadSavedIds]);

  // Load filter metadata
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [tRes, lRes, posRes] = await Promise.allSettled([
          topicApi.getTopics(),
          topikApi.getTopikLevels(),
          vocabApi.getPartsOfSpeech(),
        ]);
        if (tRes.status === 'fulfilled') {
          const tData = tRes.value?.data || tRes.value || [];
          if (Array.isArray(tData)) setTopics(tData);
        }
        if (lRes.status === 'fulfilled') {
          const lData = lRes.value?.data || lRes.value || [];
          if (Array.isArray(lData)) setTopikLevels(lData);
        }
        if (posRes.status === 'fulfilled') {
          const pData = posRes.value?.data || posRes.value || [];
          if (Array.isArray(pData)) setPartsOfSpeech(pData);
        }
      } catch (err) {
        console.warn('Failed to load filter metadata:', err);
      }
    };
    loadMetadata();
  }, []);

  // Fetch vocabularies for 'bank' tab
  useEffect(() => {
    if (activeTab !== 'bank') return;

    const fetchVocabularies = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(selectedTopic !== 'all' && { topicId: selectedTopic }),
          ...(selectedLevel !== 'all' && { topikLevel: selectedLevel }),
          ...(selectedPos !== 'all' && { partOfSpeech: selectedPos }),
        };

        const res = await vocabApi.getVocabularies(params);
        const dataPayload = res?.data || res;

        if (dataPayload) {
          setVocabularies(dataPayload.data || []);
          setTotal(dataPayload.total || 0);
        }
      } catch (err) {
        console.warn('Failed to load vocabularies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVocabularies();
  }, [activeTab, page, debouncedSearch, selectedTopic, selectedLevel, selectedPos]);

  // Fetch user notebook for 'notebook' tab
  const fetchNotebook = useCallback(async () => {
    if (!user) return;
    setNotebookLoading(true);
    try {
      const params = {
        page: notebookPage,
        limit,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(notebookFilter === 'due' && { dueOnly: true }),
        ...(notebookFilter === 'mastered' && { srsStage: 5 }),
      };

      const res = await vocabApi.getUserVocabs(params);
      const payload = res?.data || res;

      if (payload) {
        setNotebookVocabs(payload.data || []);
        setNotebookTotal(payload.total || 0);
        if (payload.stats) {
          setNotebookStats(payload.stats);
        }
      }
    } catch (err) {
      console.warn('Failed to load notebook:', err);
    } finally {
      setNotebookLoading(false);
    }
  }, [user, notebookPage, debouncedSearch, notebookFilter]);

  useEffect(() => {
    if (activeTab === 'notebook') {
      fetchNotebook();
    }
  }, [activeTab, fetchNotebook]);

  // Toggle bookmark in Kho Từ Vựng
  const handleToggleBookmark = async (vocab) => {
    if (!user) {
      setToast({
        open: true,
        message: 'Vui lòng đăng nhập để lưu từ vựng vào sổ tay!',
        severity: 'warning',
      });
      return;
    }

    const vocabId = vocab.id;
    const isCurrentlySaved = bookmarkedIds.has(vocabId);

    // Optimistic UI update
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) next.delete(vocabId);
      else next.add(vocabId);
      return next;
    });

    try {
      const res = await vocabApi.toggleSaveVocab({
        vocabularyId: vocabId,
        wordKr: vocab.wordKorean,
        meaningVi: vocab.meaningVi,
        source: 'vocab_bank',
      });

      const payload = res?.data || res;
      if (payload?.isSaved) {
        setToast({
          open: true,
          message: `Đã thêm "${vocab.wordKorean}" vào Sổ tay (+5 EXP) ✨`,
          severity: 'success',
        });
      } else {
        setToast({
          open: true,
          message: `Đã xóa "${vocab.wordKorean}" khỏi Sổ tay`,
          severity: 'info',
        });
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      // Revert optimistic update
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlySaved) next.add(vocabId);
        else next.delete(vocabId);
        return next;
      });
      setToast({
        open: true,
        message: 'Không thể cập nhật sổ tay. Vui lòng thử lại!',
        severity: 'error',
      });
    }
  };

  // Delete word from Sổ tay
  const handleDeleteNotebookItem = async (item) => {
    try {
      await vocabApi.deleteUserVocab(item.id);
      setNotebookVocabs((prev) => prev.filter((v) => v.id !== item.id));
      if (item.vocabularyId) {
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(item.vocabularyId);
          return next;
        });
      }
      setNotebookStats((prev) => ({
        ...prev,
        totalSaved: Math.max(0, prev.totalSaved - 1),
      }));
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
    try {
      const res = await vocabApi.reviewUserVocab(item.id, rating);
      const payload = res?.data || res;
      const newStage = payload?.srsStage ?? item.srsStage;

      setNotebookVocabs((prev) =>
        prev.map((v) => (v.id === item.id ? { ...v, srsStage: newStage, nextReviewAt: payload?.nextReviewAt } : v))
      );

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
      setNotebookVocabs((prev) => [newWord, ...prev]);
      setNotebookStats((prev) => ({
        ...prev,
        totalSaved: prev.totalSaved + 1,
        learningCount: prev.learningCount + 1,
      }));

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

  const totalPages = Math.ceil(total / limit) || 1;
  const notebookTotalPages = Math.ceil(notebookTotal / limit) || 1;

  // Memoized Autocomplete options
  const topicOptions = useMemo(
    () => [
      { id: 'all', label: `Tất cả chủ đề (${topics.length})` },
      ...topics.map((tp) => ({ id: tp.id, label: tp.name })),
    ],
    [topics]
  );

  const currentTopicValue = useMemo(() => {
    return topicOptions.find((o) => o.id === selectedTopic) || topicOptions[0];
  }, [topicOptions, selectedTopic]);

  const levelOptions = useMemo(
    () => [
      { id: 'all', label: 'Tất cả cấp độ' },
      ...topikLevels.map((lvl) => ({ id: lvl.levelNumber, label: lvl.name })),
    ],
    [topikLevels]
  );

  const currentLevelValue = useMemo(() => {
    return (
      levelOptions.find((o) => String(o.id) === String(selectedLevel)) ||
      levelOptions[0]
    );
  }, [levelOptions, selectedLevel]);

  const posOptions = useMemo(
    () => [
      { id: 'all', label: 'Tất cả từ loại' },
      ...partsOfSpeech.map((pos) => ({ id: pos, label: pos })),
    ],
    [partsOfSpeech]
  );

  const currentPosValue = useMemo(() => {
    return posOptions.find((o) => o.id === selectedPos) || posOptions[0];
  }, [posOptions, selectedPos]);

  return (
    <Stack spacing={3.5}>
      {/* Header Banner */}
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #9D446E 0%, #6E2B4B 100%)',
          color: '#fff',
          boxShadow: '0 10px 30px rgba(157, 68, 110, 0.25)',
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
              <MenuBookIcon sx={{ fontSize: 28, color: '#fff' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff' }}>
              Kho & Sổ Tay Từ Vựng
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 650 }}>
            Tra cứu từ vựng TOPIK I - II, lưu vào sổ tay cá nhân và rèn luyện trí nhớ vĩnh viễn với phương pháp ngắt quãng Spaced Repetition (SRS).
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              px: 2.5,
              py: 1.5,
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', fontWeight: 600 }}>
              Tổng từ hệ thống
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff' }}>
              {total || 538} từ
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              px: 2.5,
              py: 1.5,
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', fontWeight: 600 }}>
              Sổ tay của bạn
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#FFDFE7' }}>
              {notebookStats.totalSaved || bookmarkedIds.size} từ
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Tab Navigation */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 0.8,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            setActiveTab(val);
            setSearchTerm('');
            setPage(1);
            setNotebookPage(1);
          }}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              borderRadius: '12px',
              minHeight: 44,
              px: 3,
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                bgcolor: '#FDF2F4',
                color: '#9D446E',
              },
            },
          }}
        >
          <Tab
            value="bank"
            icon={<MenuBookIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={`Kho từ vựng (${total || 538})`}
          />
          <Tab
            value="notebook"
            icon={<BookmarkIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={`Sổ tay của tôi (${notebookStats.totalSaved || bookmarkedIds.size})`}
          />
        </Tabs>
      </Paper>

      {/* ================= VIEW 1: KHO TỪ VỰNG ================= */}
      {activeTab === 'bank' && (
        <>
          {/* Filter Toolbar */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '20px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <Grid container spacing={2} alignItems="center">
              {/* Search Box */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Tra từ tiếng Hàn hoặc nghĩa tiếng Việt..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#9D446E' }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '12px', bgcolor: 'background.default' },
                  }}
                />
              </Grid>

              {/* Topic Autocomplete */}
              <Grid item xs={12} sm={4} md={2.8}>
                <Autocomplete
                  size="small"
                  options={topicOptions}
                  value={currentTopicValue}
                  onChange={(_, newValue) => {
                    setSelectedTopic(newValue ? newValue.id : 'all');
                    setPage(1);
                  }}
                  getOptionLabel={(option) => option.label || ''}
                  isOptionEqualToValue={(option, val) => option.id === val?.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Chủ đề"
                      placeholder="Tìm chủ đề..."
                      sx={{
                        bgcolor: 'background.default',
                        '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                      }}
                    />
                  )}
                  disableClearable
                />
              </Grid>

              {/* TOPIK Level Autocomplete */}
              <Grid item xs={6} sm={4} md={2.6}>
                <Autocomplete
                  size="small"
                  options={levelOptions}
                  value={currentLevelValue}
                  onChange={(_, newValue) => {
                    setSelectedLevel(newValue ? newValue.id : 'all');
                    setPage(1);
                  }}
                  getOptionLabel={(option) => option.label || ''}
                  isOptionEqualToValue={(option, val) => String(option.id) === String(val?.id)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cấp độ TOPIK"
                      placeholder="Chọn cấp độ..."
                      sx={{
                        bgcolor: 'background.default',
                        '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                      }}
                    />
                  )}
                  disableClearable
                />
              </Grid>

              {/* Part of Speech Autocomplete */}
              <Grid item xs={6} sm={4} md={2.6}>
                <Autocomplete
                  size="small"
                  options={posOptions}
                  value={currentPosValue}
                  onChange={(_, newValue) => {
                    setSelectedPos(newValue ? newValue.id : 'all');
                    setPage(1);
                  }}
                  getOptionLabel={(option) => option.label || ''}
                  isOptionEqualToValue={(option, val) => option.id === val?.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Từ loại"
                      placeholder="Chọn từ loại..."
                      sx={{
                        bgcolor: 'background.default',
                        '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                      }}
                    />
                  )}
                  disableClearable
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Vocabulary Cards Grid */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress sx={{ color: '#9D446E' }} />
            </Box>
          ) : vocabularies.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: '20px',
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#9D446E' }}>
                Không tìm thấy từ vựng phù hợp
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Vui lòng thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc chủ đề/cấp độ.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTopic('all');
                  setSelectedLevel('all');
                  setSelectedPos('all');
                  setPage(1);
                }}
                sx={{
                  borderColor: '#9D446E',
                  color: '#9D446E',
                  borderRadius: '12px',
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:hover': { borderColor: '#86365c', bgcolor: '#FDF2F4' },
                }}
              >
                Đặt lại bộ lọc
              </Button>
            </Paper>
          ) : (
            <>
              <Grid container spacing={2.5}>
                {vocabularies.map((vocab) => {
                  const isSaved = bookmarkedIds.has(vocab.id);
                  const example = vocab.examples?.[0];

                  return (
                    <Grid item xs={12} sm={6} md={4} key={vocab.id}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          height: '100%',
                          borderRadius: '20px',
                          border: '1px solid',
                          borderColor: isSaved ? '#F8D7DA' : 'divider',
                          bgcolor: 'background.paper',
                          boxShadow: isSaved ? '0 4px 16px rgba(157,68,110,0.08)' : '0 4px 14px rgba(0,0,0,0.03)',
                          transition: 'all 0.25s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 8px 24px rgba(157, 68, 110, 0.12)',
                            borderColor: '#F8D7DA',
                          },
                        }}
                      >
                        <Box>
                          {/* Badges & Actions */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              {vocab.topikLevel && (
                                <Chip
                                  label={`TOPIK ${vocab.topikLevel}`}
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontWeight: 800,
                                    fontSize: '0.7rem',
                                    bgcolor: '#FDF2F4',
                                    color: '#9D446E',
                                    border: '1px solid #F8D7DA',
                                  }}
                                />
                              )}
                              {vocab.partOfSpeech && (
                                <Chip
                                  label={vocab.partOfSpeech}
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontWeight: 700,
                                    fontSize: '0.68rem',
                                    bgcolor: (theme) => (theme.palette.mode === 'light' ? '#F1F5F9' : 'rgba(255,255,255,0.08)'),
                                    color: 'text.secondary',
                                  }}
                                />
                              )}
                            </Stack>

                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="Phát âm chuẩn tiếng Hàn">
                                <IconButton
                                  size="small"
                                  onClick={() => speakKorean(vocab.wordKorean)}
                                  sx={{
                                    color: '#9D446E',
                                    bgcolor: '#FDF2F4',
                                    '&:hover': { bgcolor: '#FCE7EB' },
                                  }}
                                >
                                  <VolumeUpIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title={isSaved ? 'Đã lưu vào Sổ tay' : 'Lưu vào Sổ tay'}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleBookmark(vocab)}
                                  sx={{
                                    color: isSaved ? '#9D446E' : 'text.disabled',
                                    bgcolor: isSaved ? '#FDF2F4' : 'transparent',
                                    '&:hover': { color: '#9D446E', bgcolor: '#FDF2F4' },
                                  }}
                                >
                                  {isSaved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Box>

                          {/* Korean Word & Pronunciation */}
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 900,
                              color: 'text.primary',
                              fontFamily: 'Pretendard, sans-serif',
                              letterSpacing: '-0.5px',
                            }}
                          >
                            {vocab.wordKorean}
                          </Typography>

                          {vocab.pronunciation && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#9D446E',
                                fontWeight: 700,
                                fontStyle: 'italic',
                                display: 'block',
                                mb: 1,
                              }}
                            >
                              [{vocab.pronunciation}]
                            </Typography>
                          )}

                          {/* Vietnamese Meaning */}
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 700,
                              color: 'text.primary',
                              fontSize: '0.98rem',
                              lineHeight: 1.4,
                              mb: 1.5,
                            }}
                          >
                            {vocab.meaningVi}
                          </Typography>

                          {/* Example sentence if available */}
                          {example && (
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: '12px',
                                bgcolor: 'background.default',
                                border: '1px solid',
                                borderColor: 'divider',
                                mb: 1.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.primary',
                                  fontWeight: 700,
                                  display: 'block',
                                  fontFamily: 'Pretendard',
                                }}
                              >
                                • {example.sentenceKorean}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.secondary',
                                  display: 'block',
                                  mt: 0.3,
                                }}
                              >
                                {example.sentenceVi}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Topic Badge at footer */}
                        {vocab.topic?.name && (
                          <Box sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.72rem' }}>
                              Chủ đề: <span style={{ color: '#9D446E', fontWeight: 700 }}>{vocab.topic.name}</span>
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Pagination */}
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
                    sx={{
                      '& .Mui-selected': {
                        bgcolor: '#9D446E !important',
                        color: '#fff',
                        fontWeight: 700,
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}

      {/* ================= VIEW 2: SỔ TAY TỪ VỰNG CÁ NHÂN ================= */}
      {activeTab === 'notebook' && (
        <Stack spacing={3}>
          {/* Quick Stats & Action bar */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
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
                    {notebookStats.totalSaved} từ
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: notebookStats.dueCount > 0 ? '#ffb74d' : 'divider',
                  bgcolor: notebookStats.dueCount > 0 ? 'rgba(255, 183, 77, 0.08)' : 'background.paper',
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
                    {notebookStats.dueCount} từ
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={6} sm={4}>
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
                    {notebookStats.masteredCount} từ
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Notebook Filter Toolbar & Add Button */}
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
                label={`Tất cả (${notebookStats.totalSaved})`}
                clickable
                onClick={() => {
                  setNotebookFilter('all');
                  setNotebookPage(1);
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
                label={`Cần ôn tập (${notebookStats.dueCount})`}
                clickable
                onClick={() => {
                  setNotebookFilter('due');
                  setNotebookPage(1);
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
                label={`Đã thành thạo (${notebookStats.masteredCount})`}
                clickable
                onClick={() => {
                  setNotebookFilter('mastered');
                  setNotebookPage(1);
                }}
                sx={{
                  fontWeight: 700,
                  bgcolor: notebookFilter === 'mastered' ? '#2e7d32' : 'background.default',
                  color: notebookFilter === 'mastered' ? '#fff' : 'text.primary',
                  '&:hover': { bgcolor: notebookFilter === 'mastered' ? '#236027' : 'action.hover' },
                }}
              />
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
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
                  sx: { borderRadius: '12px', bgcolor: 'background.default', width: { xs: '100%', sm: 220 } },
                }}
              />

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenAddModal(true)}
                sx={{
                  bgcolor: '#9D446E',
                  borderRadius: '12px',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2.5,
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: '#86365c' },
                }}
              >
                Thêm từ mới
              </Button>
            </Stack>
          </Paper>

          {/* Notebook Word Cards Grid */}
          {notebookLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress sx={{ color: '#9D446E' }} />
            </Box>
          ) : notebookVocabs.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: '20px',
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
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
                <BookmarkBorderIcon sx={{ fontSize: 36 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Sổ tay của bạn đang trống
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 450, mx: 'auto', mb: 3 }}>
                Hãy duyệt qua Kho Từ Vựng và nhấn biểu tượng bookmark 🔖 để lưu các từ bạn muốn ghi nhớ, hoặc tự thêm từ mới vào sổ tay!
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  onClick={() => setActiveTab('bank')}
                  sx={{
                    borderRadius: '12px',
                    borderColor: '#9D446E',
                    color: '#9D446E',
                    fontWeight: 700,
                    textTransform: 'none',
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
                    '&:hover': { bgcolor: '#86365c' },
                  }}
                >
                  Tự thêm từ mới
                </Button>
              </Stack>
            </Paper>
          ) : (
            <>
              <Grid container spacing={2.5}>
                {notebookVocabs.map((item) => {
                  const stageInfo = getSrsStageInfo(item.srsStage);
                  const isDue = new Date(item.nextReviewAt) <= new Date();

                  return (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                      <Paper
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
                          {/* Top row: Stage badge + Delete */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={`${stageInfo.icon} Cấp ${item.srsStage}: ${stageInfo.label}`}
                                size="small"
                                sx={{
                                  height: 24,
                                  fontWeight: 800,
                                  fontSize: '0.68rem',
                                  bgcolor: stageInfo.bgcolor,
                                  color: stageInfo.color,
                                }}
                              />
                              {isDue && (
                                <Chip
                                  label="Cần ôn"
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontWeight: 800,
                                    fontSize: '0.65rem',
                                    bgcolor: '#fff3e0',
                                    color: '#e65100',
                                    border: '1px solid #ffe0b2',
                                  }}
                                />
                              )}
                            </Stack>

                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="Phát âm tiếng Hàn">
                                <IconButton
                                  size="small"
                                  onClick={() => speakKorean(item.wordKr)}
                                  sx={{
                                    color: '#9D446E',
                                    bgcolor: '#FDF2F4',
                                    '&:hover': { bgcolor: '#FCE7EB' },
                                  }}
                                >
                                  <VolumeUpIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Xóa khỏi sổ tay">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteNotebookItem(item)}
                                  sx={{
                                    color: 'text.secondary',
                                    '&:hover': { color: 'error.main', bgcolor: '#fef2f2' },
                                  }}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Box>

                          {/* Word in Korean */}
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 900,
                              color: 'text.primary',
                              fontFamily: 'Pretendard, sans-serif',
                              letterSpacing: '-0.5px',
                              mb: 0.5,
                            }}
                          >
                            {item.wordKr}
                          </Typography>

                          {/* Meaning in Vietnamese */}
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 700,
                              color: 'text.primary',
                              fontSize: '0.98rem',
                              lineHeight: 1.4,
                              mb: 2,
                            }}
                          >
                            {item.meaningVi}
                          </Typography>
                        </Box>

                        {/* SRS Review Quick Rating */}
                        <Box sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 700 }}>
                            Đánh giá ghi nhớ:
                          </Typography>
                          <Grid container spacing={0.8}>
                            <Grid item xs={3}>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleReviewWord(item, 'again')}
                                sx={{ py: 0.4, fontSize: '0.7rem', fontWeight: 700, borderRadius: '8px', textTransform: 'none' }}
                              >
                                Quên
                              </Button>
                            </Grid>
                            <Grid item xs={3}>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                color="warning"
                                onClick={() => handleReviewWord(item, 'hard')}
                                sx={{ py: 0.4, fontSize: '0.7rem', fontWeight: 700, borderRadius: '8px', textTransform: 'none' }}
                              >
                                Khó
                              </Button>
                            </Grid>
                            <Grid item xs={3}>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                color="primary"
                                onClick={() => handleReviewWord(item, 'good')}
                                sx={{ py: 0.4, fontSize: '0.7rem', fontWeight: 700, borderRadius: '8px', textTransform: 'none' }}
                              >
                                Nhớ
                              </Button>
                            </Grid>
                            <Grid item xs={3}>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                color="success"
                                onClick={() => handleReviewWord(item, 'easy')}
                                sx={{ py: 0.4, fontSize: '0.7rem', fontWeight: 700, borderRadius: '8px', textTransform: 'none' }}
                              >
                                Dễ
                              </Button>
                            </Grid>
                          </Grid>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Notebook Pagination */}
              {notebookTotalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={notebookTotalPages}
                    page={notebookPage}
                    onChange={(_, val) => {
                      setNotebookPage(val);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    color="primary"
                    shape="rounded"
                    sx={{
                      '& .Mui-selected': {
                        bgcolor: '#9D446E !important',
                        color: '#fff',
                        fontWeight: 700,
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Stack>
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
              InputProps={{
                sx: { borderRadius: '12px' },
              }}
            />

            <TextField
              label="Nghĩa tiếng Việt"
              placeholder="Ví dụ: Quả táo, Học bài..."
              fullWidth
              value={customMeaningVi}
              onChange={(e) => setCustomMeaningVi(e.target.value)}
              InputProps={{
                sx: { borderRadius: '12px' },
              }}
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
          sx={{
            borderRadius: '14px',
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default VocabularyHubPage;
