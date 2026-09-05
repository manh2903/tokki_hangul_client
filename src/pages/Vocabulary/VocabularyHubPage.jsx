import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
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
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { vocabApi, grammarApi, topicApi, topikApi } from '@/api';
import { useAuth } from '@/contexts/AuthContext';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

const speakKorean = (text) => {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
};

export const VocabularyHubPage = ({ defaultTab }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine initial activeTab: searchParams > defaultTab > pathname
  const initialTab =
    searchParams.get('tab') ||
    defaultTab ||
    (location.pathname === '/grammar' ? 'grammar' : 'bank');

  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab state when URL changes
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (location.pathname === '/grammar') {
      setActiveTab('grammar');
    } else if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab'));
    }
  }, [defaultTab, location.pathname, searchParams]);

  const handleTabChange = (_, val) => {
    setActiveTab(val);
    setSearchTerm('');
    setPage(1);
    setGrammarPage(1);
    setSearchParams({ tab: val });
  };

  // Pagination & limits
  const [page, setPage] = useState(1);
  const [grammarPage, setGrammarPage] = useState(1);
  const limit = 18;

  // Filter states for Kho từ vựng & Ngữ pháp
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedPos, setSelectedPos] = useState('all');

  // Toast notifications
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
      setGrammarPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // --- 1. TANSTACK QUERY: Filter Metadata (Chủ đề, Cấp độ, Từ loại) ---
  const { data: filterMetadata = {} } = useQuery({
    queryKey: ['vocabFilterMetadata'],
    queryFn: async () => {
      const [tRes, lRes, posRes] = await Promise.allSettled([
        topicApi.getTopics(),
        topikApi.getTopikLevels(),
        vocabApi.getPartsOfSpeech(),
      ]);
      return {
        topics: tRes.status === 'fulfilled' ? (tRes.value?.data || tRes.value || []) : [],
        topikLevels: lRes.status === 'fulfilled' ? (lRes.value?.data || lRes.value || []) : [],
        partsOfSpeech: posRes.status === 'fulfilled' ? (posRes.value?.data || posRes.value || []) : [],
      };
    },
    staleTime: 10 * 60 * 1000,
  });
  const topics = filterMetadata.topics || [];
  const topikLevels = filterMetadata.topikLevels || [];
  const partsOfSpeech = filterMetadata.partsOfSpeech || [];

  // --- 2. TANSTACK QUERY: Danh sách ID các từ đã lưu vào sổ tay ---
  const { data: savedVocabIds = [] } = useQuery({
    queryKey: ['savedVocabIds', user?.id],
    queryFn: async () => {
      const res = await vocabApi.getSavedVocabIds();
      const payload = res?.data || res;
      return Array.isArray(payload?.ids) ? payload.ids : [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Local synced Set of saved IDs for instant O(1) bookmark rendering
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  useEffect(() => {
    if (savedVocabIds) {
      setBookmarkedIds(new Set(savedVocabIds));
    }
  }, [savedVocabIds]);

  // --- 3. TANSTACK QUERY: Kho Từ Vựng Hệ Thống ---
  const { data: bankData, isLoading: loading } = useQuery({
    queryKey: ['vocabBank', page, limit, debouncedSearch, selectedTopic, selectedLevel, selectedPos],
    queryFn: async () => {
      const params = {
        page,
        limit,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(selectedTopic !== 'all' && { topicId: selectedTopic }),
        ...(selectedLevel !== 'all' && { topikLevel: selectedLevel }),
        ...(selectedPos !== 'all' && { partOfSpeech: selectedPos }),
      };
      const res = await vocabApi.getVocabularies(params);
      return res?.data || res || { data: [], total: 0 };
    },
    staleTime: 5 * 60 * 1000,
  });
  const vocabularies = bankData?.data || [];
  const total = bankData?.total || 0;

  // --- 4. TANSTACK QUERY: Kho Ngữ Pháp Hệ Thống ---
  const { data: grammarData, isLoading: grammarLoading } = useQuery({
    queryKey: ['grammarBank', grammarPage, debouncedSearch, selectedTopic, selectedLevel],
    queryFn: async () => {
      const params = {
        page: grammarPage,
        limit: 12,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(selectedTopic !== 'all' && { topicId: selectedTopic }),
        ...(selectedLevel !== 'all' && { topikLevel: selectedLevel }),
      };
      const res = await grammarApi.getGrammarPoints(params);
      return res?.data || res || { data: [], total: 0 };
    },
    staleTime: 5 * 60 * 1000,
  });
  const grammarPoints = grammarData?.data || [];
  const grammarTotal = grammarData?.total || 0;


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
      queryClient.invalidateQueries({ queryKey: ['savedVocabIds', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userNotebook', user?.id] });
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

  const totalPages = Math.ceil(total / limit) || 1;
  const grammarTotalPages = Math.ceil(grammarTotal / 12) || 1;

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
              Kho Từ Vựng & Ngữ Pháp
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 650 }}>
            Tra cứu từ vựng và cấu trúc ngữ pháp TOPIK chuẩn mực, lưu vào sổ tay cá nhân và rèn luyện trí nhớ ngắt quãng Spaced Repetition (SRS).
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<BookmarkIcon />}
          onClick={() => navigate('/notebook')}
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
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: '#FFF5F7' },
          }}
        >
          Sổ tay của tôi ({bookmarkedIds.size}) ↗
        </Button>
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
            <MenuBookIcon />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Kho từ vựng TOPIK
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary' }}>
              {total || 538} từ
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
              bgcolor: 'rgba(157, 68, 110, 0.1)',
              color: '#9D446E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EditNoteIcon />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Kho ngữ pháp TOPIK
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary' }}>
              {grammarTotal || 31} cấu trúc
            </Typography>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          onClick={() => navigate('/notebook')}
          sx={{
            p: 2.5,
            borderRadius: '20px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#9D446E',
              boxShadow: '0 6px 20px rgba(157, 68, 110, 0.1)',
              transform: 'translateY(-2px)',
            },
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
              Sổ tay của bạn ↗
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#9D446E' }}>
              {bookmarkedIds.size} từ đã lưu
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Main Tab Navigation */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: { xs: 0.8, sm: 1 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              borderRadius: '14px',
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
            label={`Kho Từ Vựng (${total || 538})`}
          />
          <Tab
            value="grammar"
            icon={<EditNoteIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={`Kho Ngữ Pháp (${grammarTotal || 31})`}
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
              p: 2,
              borderRadius: '20px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: { xs: 'wrap', md: 'nowrap' },
                gap: 1.5,
              }}
            >
              <TextField
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
                sx={{ flex: { xs: '1 1 100%', md: 4 } }}
              />

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
                    sx={{ bgcolor: 'background.default', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                )}
                disableClearable
                sx={{ flex: { xs: '1 1 100%', sm: '1 1 180px', md: 3 } }}
              />

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
                    sx={{ bgcolor: 'background.default', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                )}
                disableClearable
                sx={{ flex: { xs: '1 1 calc(50% - 6px)', sm: '1 1 140px', md: 2.5 } }}
              />

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
                    sx={{ bgcolor: 'background.default', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                )}
                disableClearable
                sx={{ flex: { xs: '1 1 calc(50% - 6px)', sm: '1 1 140px', md: 2.5 } }}
              />
            </Box>
          </Paper>

          {/* Vocabulary Cards Grid */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress sx={{ color: '#9D446E' }} />
            </Box>
          ) : vocabularies.length === 0 ? (
            <Paper
              elevation={0}
              sx={{ p: 6, textAlign: 'center', borderRadius: '20px', border: '1px dashed', borderColor: 'divider', bgcolor: 'background.paper' }}
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
                sx={{ borderColor: '#9D446E', color: '#9D446E', borderRadius: '12px', fontWeight: 700, textTransform: 'none' }}
              >
                Đặt lại bộ lọc
              </Button>
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
                {vocabularies.map((vocab) => {
                  const isSaved = bookmarkedIds.has(vocab.id);
                  const example = vocab.examples?.[0];

                  return (
                    <Paper
                      key={vocab.id}
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
                            <Tooltip title="Phát âm tiếng Hàn">
                              <IconButton
                                size="small"
                                onClick={() => speakKorean(vocab.wordKorean)}
                                sx={{ color: '#9D446E', bgcolor: '#FDF2F4', '&:hover': { bgcolor: '#FCE7EB' } }}
                              >
                                <VolumeUpIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={isSaved ? 'Đã lưu vào Sổ tay' : 'Lưu vào Sổ tay'}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleBookmark(vocab)}
                                sx={{
                                  color: isSaved ? '#9D446E' : 'text.secondary',
                                  bgcolor: isSaved ? '#FDF2F4' : 'transparent',
                                  '&:hover': { color: '#9D446E', bgcolor: '#FDF2F4' },
                                }}
                              >
                                {isSaved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Box>

                        {/* Word in Korean */}
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 900,
                            color: 'text.primary',
                            fontFamily: 'Pretendard, sans-serif',
                            letterSpacing: '-0.5px',
                            mb: 0.5,
                          }}
                        >
                          {vocab.wordKorean}
                        </Typography>

                        {/* Hanja / Sino-Korean */}
                        {vocab.hanja && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                            Hán tự: {vocab.hanja}
                          </Typography>
                        )}

                        {/* Meaning in Vietnamese */}
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            fontSize: '1.02rem',
                            lineHeight: 1.4,
                            mb: 2,
                          }}
                        >
                          {vocab.meaningVi}
                        </Typography>

                        {/* Example sentence */}
                        {example && (
                          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', mb: 1.5 }}>
                            <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 700, display: 'block', fontFamily: 'Pretendard' }}>
                              • {example.sentenceKorean}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                              {example.sentenceVi}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {vocab.topic?.name && (
                        <Box sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.72rem' }}>
                            Chủ đề: <span style={{ color: '#9D446E', fontWeight: 700 }}>{vocab.topic.name}</span>
                          </Typography>
                        </Box>
                      )}
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
        </>
      )}

      {/* ================= VIEW 2: KHO NGỮ PHÁP ================= */}
      {activeTab === 'grammar' && (
        <>
          {/* Grammar Filter Toolbar */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '20px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: { xs: 'wrap', md: 'nowrap' },
                gap: 1.5,
              }}
            >
              <TextField
                size="small"
                placeholder="Tìm kiếm mẫu ngữ pháp, cấu trúc hoặc ý nghĩa..."
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
                sx={{ flex: { xs: '1 1 100%', md: 5 } }}
              />

              <Autocomplete
                size="small"
                options={topicOptions}
                value={currentTopicValue}
                onChange={(_, newValue) => {
                  setSelectedTopic(newValue ? newValue.id : 'all');
                  setGrammarPage(1);
                }}
                getOptionLabel={(option) => option.label || ''}
                isOptionEqualToValue={(option, val) => option.id === val?.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chủ đề ngữ pháp"
                    placeholder="Tìm chủ đề..."
                    sx={{ bgcolor: 'background.default', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                )}
                disableClearable
                sx={{ flex: { xs: '1 1 100%', sm: '1 1 200px', md: 3.5 } }}
              />

              <Autocomplete
                size="small"
                options={levelOptions}
                value={currentLevelValue}
                onChange={(_, newValue) => {
                  setSelectedLevel(newValue ? newValue.id : 'all');
                  setGrammarPage(1);
                }}
                getOptionLabel={(option) => option.label || ''}
                isOptionEqualToValue={(option, val) => String(option.id) === String(val?.id)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cấp độ TOPIK"
                    placeholder="Chọn cấp độ..."
                    sx={{ bgcolor: 'background.default', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                )}
                disableClearable
                sx={{ flex: { xs: '1 1 100%', sm: '1 1 200px', md: 3.5 } }}
              />
            </Box>
          </Paper>

          {/* Grammar Points Grid */}
          {grammarLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress sx={{ color: '#9D446E' }} />
            </Box>
          ) : grammarPoints.length === 0 ? (
            <Paper
              elevation={0}
              sx={{ p: 6, textAlign: 'center', borderRadius: '20px', border: '1px dashed', borderColor: 'divider', bgcolor: 'background.paper' }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#9D446E' }}>
                Không tìm thấy điểm ngữ pháp phù hợp
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
                  setGrammarPage(1);
                }}
                sx={{ borderColor: '#9D446E', color: '#9D446E', borderRadius: '12px', fontWeight: 700, textTransform: 'none' }}
              >
                Đặt lại bộ lọc
              </Button>
            </Paper>
          ) : (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 2.5,
                  width: '100%',
                }}
              >
                {grammarPoints.map((item) => (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        height: '100%',
                        borderRadius: '20px',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                        transition: 'all 0.25s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 10px 28px rgba(157, 68, 110, 0.1)',
                          borderColor: '#F8D7DA',
                        },
                      }}
                    >
                      <Box>
                        {/* Top Chips */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={`TOPIK ${item.topikLevel || 1}`}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.72rem',
                                bgcolor: '#FDF2F4',
                                color: '#9D446E',
                                border: '1px solid #F8D7DA',
                              }}
                            />
                            {item.topic?.name && (
                              <Chip
                                label={item.topic.name}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.7rem',
                                  bgcolor: (theme) => (theme.palette.mode === 'light' ? '#F1F5F9' : 'rgba(255,255,255,0.08)'),
                                  color: 'text.secondary',
                                }}
                              />
                            )}
                          </Stack>
                        </Box>

                        {/* Title & Structure */}
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 900,
                            color: 'primary.main',
                            fontFamily: 'Pretendard, sans-serif',
                            letterSpacing: '-0.5px',
                            mb: 1.5,
                          }}
                        >
                          {item.title}
                        </Typography>

                        {item.structure && (
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: '14px',
                              bgcolor: (theme) => (theme.palette.mode === 'light' ? '#FFF5F7' : 'rgba(151, 63, 105, 0.15)'),
                              border: '1px dashed #F8D7DA',
                              mb: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.2,
                            }}
                          >
                            <LightbulbOutlinedIcon sx={{ color: '#9D446E', fontSize: 20, shrink: 0 }} />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 800, color: '#9D446E', fontFamily: 'Pretendard' }}
                            >
                              Cấu trúc: {item.structure}
                            </Typography>
                          </Box>
                        )}

                        {/* Explanation in Vietnamese */}
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            lineHeight: 1.6,
                            mb: 2,
                            fontSize: '0.95rem',
                          }}
                        >
                          {item.explanationVi}
                        </Typography>

                        {/* Example sentences */}
                        {item.examples && item.examples.length > 0 && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 1 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Ví dụ mẫu câu:
                            </Typography>
                            {item.examples.slice(0, 2).map((ex, exIdx) => (
                              <Box
                                key={exIdx}
                                sx={{
                                  p: 1.5,
                                  borderRadius: '12px',
                                  bgcolor: 'background.default',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start',
                                  gap: 1,
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 700, color: 'text.primary', fontFamily: 'Pretendard' }}
                                  >
                                    {ex.sentenceKorean}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                                    {ex.sentenceVi}
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={() => speakKorean(ex.sentenceKorean)}
                                  sx={{ color: '#9D446E', bgcolor: '#FDF2F4', '&:hover': { bgcolor: '#FCE7EB' }, shrink: 0 }}
                                >
                                  <VolumeUpIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Paper>
                ))}
              </Box>

              {grammarTotalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={grammarTotalPages}
                    page={grammarPage}
                    onChange={(_, val) => {
                      setGrammarPage(val);
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
        </>
      )}

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

export default VocabularyHubPage;
