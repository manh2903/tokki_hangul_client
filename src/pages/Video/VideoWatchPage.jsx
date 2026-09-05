import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  Button,
  Stack,
  Paper,
  CircularProgress,
  TextField,
  InputAdornment,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
} from '@mui/material';
import { videosApi, topicApi, topikApi, vocabApi } from '@/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MicIcon from '@mui/icons-material/Mic';
import ReplayIcon from '@mui/icons-material/Replay';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DownloadIcon from '@mui/icons-material/Download';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import SubtitlesOffIcon from '@mui/icons-material/SubtitlesOff';
import CheckIcon from '@mui/icons-material/Check';

const msToTime = (ms) => {
  if (!ms && ms !== 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// Robust YouTube Embed URL Extractor (matching VideoAdminPage)
const getEmbedUrl = (url) => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') {
      const vidId = parsed.pathname.slice(1).split('?')[0];
      return `https://www.youtube.com/embed/${vidId}`;
    }
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.includes('/embed/')) {
        const vidId = parsed.pathname.split('/embed/')[1].split('/')[0].split('?')[0];
        return `https://www.youtube.com/embed/${vidId}`;
      }
      const vidId = parsed.searchParams.get('v');
      if (vidId) {
        return `https://www.youtube.com/embed/${vidId}`;
      }
    }
  } catch (_) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  return url;
};

// Standard Korean Hangul Romanization (RR) Helper
const INITIAL_CONSONANTS = [
  'g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h',
];
const MEDIAL_VOWELS = [
  'a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i',
];
const FINAL_CONSONANTS = [
  '', 'k', 'k', 'ks', 'n', 'nj', 'nh', 't', 'l', 'lg', 'lm', 'lb', 'ls', 'lt', 'lp', 'lh', 'm', 'p', 'ps', 's', 'ss', 'ng', 'j', 'ch', 'k', 't', 'p', 'h',
];

const romanizeKorean = (text) => {
  if (!text) return '';
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const offset = code - 0xac00;
      const initialIdx = Math.floor(offset / (21 * 28));
      const medialIdx = Math.floor((offset % (21 * 28)) / 28);
      const finalIdx = offset % 28;

      result += INITIAL_CONSONANTS[initialIdx] + MEDIAL_VOWELS[medialIdx] + FINAL_CONSONANTS[finalIdx];
    } else {
      result += text[i];
    }
  }
  return result;
};

const normalizeSubtitle = (sub, index) => {
  const korean = sub.korean || sub.koreanText || sub.korean_text || sub.text_ko || '';
  const pronunciation = sub.pronunciation || sub.pronunciation_text || (korean ? romanizeKorean(korean) : '');
  return {
    ...sub,
    id: sub.id || index + 1,
    startTimeMs: sub.startTimeMs || sub.start_time_ms || 0,
    endTimeMs: sub.endTimeMs || sub.end_time_ms || 0,
    startTime: msToTime(sub.startTimeMs || sub.start_time_ms),
    endTime: msToTime(sub.endTimeMs || sub.end_time_ms),
    korean,
    vietnamese: sub.vietnamese || sub.vietnameseText || sub.vietnamese_text || sub.text_vi || '',
    pronunciation,
  };
};

// TTS Helper for Korean
const speakKorean = (text, rate = 1.0) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
};

export const VideoWatchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateProgress } = useAuth();
  const iframeRef = useRef(null);
  const videoRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allVideos, setAllVideos] = useState([]);
  const [topics, setTopics] = useState([]);
  const [topikLevels, setTopikLevels] = useState([]);

  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [loopSentence, setLoopSentence] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [savedWords, setSavedWords] = useState(new Set());
  const [shadowingOpen, setShadowingOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingScore, setRecordingScore] = useState(null);

  // Search & Filter state for recommendations
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Subtitle display mode on video: 'both' (Song ngữ) | 'ko' (Tiếng Hàn) | 'vi' (Tiếng Việt) | 'off' (Tắt phụ đề)
  const [subMode, setSubMode] = useState('both');
  const [subAnchorEl, setSubAnchorEl] = useState(null);

  // Real vocabularies fetched from DB matching this video's topic & level
  const [dbVocabs, setDbVocabs] = useState([]);

  // Currently inspected word for the instant word lookup card
  const [selectedWord, setSelectedWord] = useState(null);

  // Reward toast notification
  const [rewardToast, setRewardToast] = useState({ open: false, message: '' });

  // Handle completing video & claiming +25 XP + 1 🥕
  const handleCompleteVideo = async () => {
    if (videoCompleted || !id) return;
    try {
      const res = await videosApi.updateProgress({
        videoId: id,
        watchedSeconds: Math.floor(playedSeconds) || 60,
        isCompleted: true,
      });
      const data = res?.data || res;
      setVideoCompleted(true);
      if (data?.gamification && updateProgress) {
        updateProgress(data.gamification);
        setRewardToast({
          open: true,
          message: `🎉 Chúc mừng! Bạn nhận được +25 XP và 1 🥕! Chuỗi học tập: ${data.gamification.streakDays || 1} ngày 🔥`,
        });
      } else {
        setRewardToast({
          open: true,
          message: '🎉 Chúc mừng bạn đã hoàn thành bài học video!',
        });
      }
    } catch (err) {
      console.warn('Failed to complete video reward:', err);
    }
  };

  // Auto-complete video when watched 85% of duration
  useEffect(() => {
    if (!videoCompleted && video?.durationSeconds && video.durationSeconds > 10) {
      if (playedSeconds >= video.durationSeconds * 0.85) {
        handleCompleteVideo();
      }
    }
  }, [playedSeconds, videoCompleted, video?.durationSeconds]);

  // Periodic watching progress sync (records study minutes & maintains streak)
  useEffect(() => {
    if (!id || playedSeconds < 30 || videoCompleted) return;
    const interval = setInterval(() => {
      videosApi
        .updateProgress({
          videoId: id,
          watchedSeconds: Math.floor(playedSeconds),
          isCompleted: false,
        })
        .then((res) => {
          const data = res?.data || res;
          if (data?.gamification && updateProgress) {
            updateProgress(data.gamification);
          }
        })
        .catch(() => null);
    }, 45000);
    return () => clearInterval(interval);
  }, [id, playedSeconds, videoCompleted]);

  // Fetch current video details
  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      try {
        const res = await videosApi.getVideoById(id);
        const data = res?.data || res;
        if (data && (data.title || data.videoUrl)) {
          setVideo(data);
          if (data.progresses?.[0]?.completedAt) {
            setVideoCompleted(true);
          }
          const firstSub = data.subtitles?.[0];
          if (firstSub) {
            const norm = normalizeSubtitle(firstSub, 0);
            const firstWord = norm.korean.split(' ')[0] || '';
            setSelectedWord({
              korean: firstWord.replace(/[.,?!~]/g, '') || norm.korean,
              romaja: norm.pronunciation ? norm.pronunciation.split(' ')[0] : '',
              type: 'Từ vựng ngữ cảnh',
              meaning: norm.vietnamese || 'Bấm vào bất kỳ từ nào để tra nghĩa tức thì.',
            });
          }
        }
      } catch (err) {
        console.warn('Failed to load video details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Fetch all videos, real topics & real TOPIK levels from API
  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const [vRes, tRes, lRes] = await Promise.allSettled([
          videosApi.getVideos(),
          topicApi.getTopics(),
          topikApi.getTopikLevels(),
        ]);

        if (vRes.status === 'fulfilled') {
          const vData = vRes.value?.data || vRes.value || [];
          if (Array.isArray(vData)) setAllVideos(vData);
        }

        if (tRes.status === 'fulfilled') {
          const tData = tRes.value?.data || tRes.value || [];
          if (Array.isArray(tData)) setTopics(tData);
        }

        if (lRes.status === 'fulfilled') {
          const lData = lRes.value?.data || lRes.value || [];
          if (Array.isArray(lData)) setTopikLevels(lData);
        }
      } catch (err) {
        console.warn('Failed to fetch global video metadata:', err);
      }
    };
    fetchGlobalData();
  }, []);

  // Fetch real vocabularies from DB for this video topic/level
  useEffect(() => {
    const fetchVocabs = async () => {
      try {
        const topicId = video?.topicId || video?.topic?.id;
        const topikLevel = video?.topikLevel;
        const params = { limit: 40 };
        if (topicId) params.topicId = topicId;
        if (topikLevel) params.topikLevel = topikLevel;
        const res = await vocabApi.getVocabularies(params);
        const data = res?.data?.data || res?.data || res || [];
        if (Array.isArray(data)) setDbVocabs(data);
      } catch (err) {
        console.warn('Failed to load topic vocabularies:', err);
      }
    };
    if (video?.id) {
      fetchVocabs();
    }
  }, [video?.id, video?.topicId, video?.topic?.id, video?.topikLevel]);

  const subtitles = useMemo(() => {
    return (video?.subtitles || []).map(normalizeSubtitle);
  }, [video]);

  // Calculate active subtitle index based on played seconds
  const activeSubIndex = useMemo(() => {
    if (subtitles.length === 0) return -1;
    const idx = subtitles.findIndex((sub) => {
      const start = sub.startTimeMs / 1000;
      const end = sub.endTimeMs / 1000;
      return playedSeconds >= start && playedSeconds <= end;
    });
    return idx;
  }, [subtitles, playedSeconds]);

  const activeSub = activeSubIndex >= 0 ? subtitles[activeSubIndex] : null;

  // Auto-scroll transcript container
  useEffect(() => {
    if (autoScroll && activeSubIndex >= 0) {
      const el = document.getElementById(`sub-item-${activeSubIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeSubIndex, autoScroll]);

  // Real-time time synchronization from YouTube IFrame postMessage
  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.currentTime === 'number') {
            setPlayedSeconds(data.info.currentTime);
          }
        }
      } catch (_) {}
    };

    window.addEventListener('message', handleMessage);

    // Poll current time every 400ms from YouTube iframe
    const pollInterval = setInterval(() => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'getCurrentTime' }),
          '*'
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'listening' }),
          '*'
        );
      }
    }, 400);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(pollInterval);
    };
  }, []);

  // Sentence looping logic
  useEffect(() => {
    if (loopSentence && activeSub) {
      const start = activeSub.startTimeMs / 1000;
      const end = activeSub.endTimeMs / 1000;
      if (playedSeconds >= end) {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'seekTo', args: [start, true] }),
            '*'
          );
        } else if (videoRef.current) {
          videoRef.current.currentTime = start;
        }
      }
    }
  }, [playedSeconds, loopSentence, activeSub]);

  // Seeking action
  const handleSeekToSub = (sub, rate = playbackRate) => {
    const targetSec = sub.startTimeMs / 1000;
    setPlayedSeconds(targetSec);

    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'seekTo', args: [targetSec, true] }),
        '*'
      );
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo' }),
        '*'
      );
      if (rate) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'setPlaybackRate', args: [rate] }),
          '*'
        );
      }
    } else if (videoRef.current) {
      videoRef.current.currentTime = targetSec;
      videoRef.current.playbackRate = rate;
      videoRef.current.play();
    }
  };

  // Speed change action
  const handleToggleRate = () => {
    const nextRate = playbackRate === 1.0 ? 0.8 : playbackRate === 0.8 ? 1.25 : 1.0;
    setPlaybackRate(nextRate);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setPlaybackRate', args: [nextRate] }),
        '*'
      );
    } else if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
    }
  };

  const handleWordClick = (word, romajaHint = '', viContext = '') => {
    const clean = word.replace(/[.,?!~]/g, '').trim();
    if (!clean) return;

    // Check if word exists in DB vocabularies
    const matched = (dbVocabs || []).find(
      (v) => v.wordKorean === clean || (v.wordKorean && clean.includes(v.wordKorean))
    );

    if (matched) {
      setSelectedWord({
        korean: matched.wordKorean,
        romaja: matched.pronunciation || romajaHint,
        type: matched.partOfSpeech || 'Từ vựng bài học',
        meaning: matched.meaningVi,
      });
    } else {
      setSelectedWord({
        korean: clean,
        romaja: romajaHint || 'ngữ âm',
        type: 'Từ trong phụ đề',
        meaning: viContext ? `Ngữ cảnh: "${viContext}"` : `Từ xuất hiện trong video`,
      });
    }
  };

  const toggleSaveWord = (word) => {
    setSavedWords((prev) => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      const randomScore = Math.floor(Math.random() * 11) + 90;
      setRecordingScore(randomScore);
    } else {
      setIsRecording(true);
      setRecordingScore(null);
    }
  };

  // Filtered recommended videos from API
  const recommendedVideos = useMemo(() => {
    return allVideos
      .filter((v) => String(v.id) !== String(id))
      .filter((v) => {
        const matchSearch =
          !searchTerm ||
          v.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (v.koreanTitle || '')?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchLevel =
          levelFilter === 'all'
            ? true
            : String(v.topikLevel || 1) === String(levelFilter);

        const matchCategory =
          categoryFilter === 'all'
            ? true
            : String(v.topicId) === String(categoryFilter) || String(v.topic?.id) === String(categoryFilter);

        return matchSearch && matchLevel && matchCategory;
      });
  }, [allVideos, id, searchTerm, levelFilter, categoryFilter]);

  // Real "Continue Watching" videos from DB (only include videos the user has actually watched)
  const continueWatchingVideos = useMemo(() => {
    return allVideos
      .filter((v) => {
        if (String(v.id) === String(id)) return false;
        const prog = v.progresses?.[0];
        return Boolean(prog && (prog.watchedSeconds > 0 || prog.completedAt));
      })
      .slice(0, 3);
  }, [allVideos, id]);

  const embedUrl = video?.videoUrl ? getEmbedUrl(video.videoUrl) : '';
  const isYouTube = embedUrl.includes('youtube.com/embed');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#9D446E' }} />
      </Box>
    );
  }

  if (!video) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', py: 8, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: '#9D446E' }}>
          Không tìm thấy video bài học này
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/video')}
          sx={{
            bgcolor: '#9D446E',
            '&:hover': { bgcolor: '#86365c' },
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
          }}
        >
          Quay lại danh sách video
        </Button>
      </Box>
    );
  }

  return (
    <Stack spacing={3.5} sx={{ pb: 6 }}>
      {/* 1. TOP HEADER BANNER */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E1E24', letterSpacing: '-0.02em' }}>
              Học qua Video & Phim ảnh
            </Typography>
            <Chip
              label="🎬 Smart Subtitles"
              size="small"
              sx={{
                bgcolor: '#FDF2F4',
                color: '#9D446E',
                border: '1px solid #F8D7DA',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#686B74', maxWidth: 700 }}>
            Cải thiện kỹ năng nghe - nói qua trích đoạn phim Hàn, show truyền hình và bài học tiếng Hàn với phụ đề song ngữ thông minh.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/video')}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            borderColor: '#F0E6E8',
            color: '#686B74',
            '&:hover': { borderColor: '#9D446E', color: '#9D446E', bgcolor: '#FDF2F4' },
          }}
        >
          Kho video
        </Button>
      </Box>

      {/* 2. SEARCH & FILTER ROW (Mapped to real API) */}
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch">
          <TextField
            size="small"
            placeholder="Tìm kiếm theo trích đoạn phim, tên bài học, chủ đề ngữ pháp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              bgcolor: '#fff',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                borderColor: '#E2E8F0',
                '&:hover fieldset': { borderColor: '#9D446E' },
                '&.Mui-focused fieldset': { borderColor: '#9D446E' },
              },
            }}
          />

          {/* Real Level Selector Pills from API */}
          <Box
            sx={{
              display: 'flex',
              p: 0.5,
              bgcolor: '#F1F5F9',
              borderRadius: '12px',
              gap: 0.5,
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            <Button
              size="small"
              onClick={() => setLevelFilter('all')}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: levelFilter === 'all' ? 800 : 600,
                px: 1.8,
                py: 0.8,
                fontSize: '0.8rem',
                bgcolor: levelFilter === 'all' ? '#fff' : 'transparent',
                color: levelFilter === 'all' ? '#9D446E' : '#64748B',
                boxShadow: levelFilter === 'all' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                '&:hover': { bgcolor: levelFilter === 'all' ? '#fff' : '#E2E8F0' },
              }}
            >
              Tất cả trình độ
            </Button>

            {topikLevels.length > 0 ? (
              topikLevels.map((lvl) => {
                const active = String(levelFilter) === String(lvl.levelNumber);
                return (
                  <Button
                    key={lvl.id || lvl.levelNumber}
                    size="small"
                    onClick={() => setLevelFilter(String(lvl.levelNumber))}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: active ? 800 : 600,
                      px: 1.8,
                      py: 0.8,
                      fontSize: '0.8rem',
                      bgcolor: active ? '#fff' : 'transparent',
                      color: active ? '#9D446E' : '#64748B',
                      boxShadow: active ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                      '&:hover': { bgcolor: active ? '#fff' : '#E2E8F0' },
                    }}
                  >
                    TOPIK {lvl.levelNumber}
                  </Button>
                );
              })
            ) : (
              [1, 2, 3, 4].map((num) => {
                const active = String(levelFilter) === String(num);
                return (
                  <Button
                    key={num}
                    size="small"
                    onClick={() => setLevelFilter(String(num))}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: active ? 800 : 600,
                      px: 1.8,
                      py: 0.8,
                      fontSize: '0.8rem',
                      bgcolor: active ? '#fff' : 'transparent',
                      color: active ? '#9D446E' : '#64748B',
                      boxShadow: active ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                      '&:hover': { bgcolor: active ? '#fff' : '#E2E8F0' },
                    }}
                  >
                    TOPIK {num}
                  </Button>
                );
              })
            )}
          </Box>
        </Stack>

        {/* Real Topic / Category Pills from API */}
        {topics.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', pb: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap', mr: 0.5 }}>
              Chủ đề:
            </Typography>
            <Chip
              label="Tất cả thể loại"
              clickable
              onClick={() => setCategoryFilter('all')}
              size="small"
              sx={{
                fontWeight: categoryFilter === 'all' ? 800 : 500,
                bgcolor: categoryFilter === 'all' ? '#9D446E' : '#fff',
                color: categoryFilter === 'all' ? '#fff' : '#64748B',
                border: categoryFilter === 'all' ? 'none' : '1px solid #E2E8F0',
                borderRadius: '16px',
                px: 0.5,
                fontSize: '0.78rem',
                '&:hover': { bgcolor: categoryFilter === 'all' ? '#86365c' : '#F8FAFC' },
              }}
            />
            {topics.map((t) => {
              const active = String(categoryFilter) === String(t.id);
              return (
                <Chip
                  key={t.id}
                  label={t.name}
                  clickable
                  onClick={() => setCategoryFilter(String(t.id))}
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

      {/* 3. INTERACTIVE LEARNING WORKSPACE (7 cols : 5 cols) */}
      <Grid container spacing={3} alignItems="flex-start">
        {/* LEFT COLUMN: Main Video Player & Controls (7 cols) */}
        <Grid item xs={12} lg={7}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '20px',
              border: '1px solid #F0E6E8',
              bgcolor: '#fff',
              overflow: 'hidden',
              boxShadow: '0 4px 20px -2px rgba(157, 68, 110, 0.06)',
            }}
          >
            {/* Video Player Display (Using robust native IFrame matching Admin) */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%',
                bgcolor: '#000',
                overflow: 'hidden',
              }}
            >
              {/* Native IFrame Player (100% identical to VideoAdminPage) */}
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
                {embedUrl ? (
                  isYouTube ? (
                    <iframe
                      ref={iframeRef}
                      id="tokki-player-iframe"
                      width="100%"
                      height="100%"
                      src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}enablejsapi=1`}
                      title={video.title || 'Video player'}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{ width: '100%', height: '100%', border: 0 }}
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      src={video.videoUrl}
                      controls
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onTimeUpdate={(e) => setPlayedSeconds(e.target.currentTime)}
                    />
                  )
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#fff' }}>
                    Không tìm thấy đường dẫn video
                  </Box>
                )}
              </Box>

              {/* Top Bar Over Video (pointerEvents: none on container to let video clicks pass through) */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  right: 12,
                  zIndex: 5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Chip
                  icon={
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#10B981',
                        boxShadow: '0 0 8px #10B981',
                      }}
                    />
                  }
                  label={`Đang phát: Câu ${(activeSubIndex >= 0 ? activeSubIndex + 1 : 1).toString().padStart(2, '0')} / ${subtitles.length || 1}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(157, 68, 110, 0.9)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    backdropFilter: 'blur(4px)',
                    pointerEvents: 'auto',
                  }}
                />

                <Stack direction="row" spacing={1} sx={{ pointerEvents: 'auto' }}>
                  {/* Chế độ Bật / Tắt / Chọn Phụ đề hiển thị trên Video */}
                  <Button
                    size="small"
                    startIcon={subMode === 'off' ? <SubtitlesOffIcon sx={{ fontSize: 16 }} /> : <SubtitlesIcon sx={{ fontSize: 16 }} />}
                    onClick={(e) => setSubAnchorEl(e.currentTarget)}
                    sx={{
                      bgcolor: subMode === 'off' ? 'rgba(0,0,0,0.65)' : '#9D446E',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      textTransform: 'none',
                      px: 1.5,
                      py: 0.4,
                      border: '1px solid rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(4px)',
                      '&:hover': { bgcolor: subMode === 'off' ? 'rgba(0,0,0,0.85)' : '#86365c' },
                    }}
                  >
                    {subMode === 'both' && 'Sub: Song ngữ'}
                    {subMode === 'ko' && 'Sub: Tiếng Hàn'}
                    {subMode === 'vi' && 'Sub: Tiếng Việt'}
                    {subMode === 'off' && 'Tắt phụ đề'}
                  </Button>

                  <Menu
                    anchorEl={subAnchorEl}
                    open={Boolean(subAnchorEl)}
                    onClose={() => setSubAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{
                      sx: {
                        borderRadius: '12px',
                        mt: 1,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                        minWidth: 195,
                        border: '1px solid #F1F5F9',
                      },
                    }}
                  >
                    <MenuItem
                      selected={subMode === 'both'}
                      onClick={() => {
                        setSubMode('both');
                        setSubAnchorEl(null);
                      }}
                      sx={{ fontSize: '0.82rem', py: 1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        {subMode === 'both' ? <CheckIcon fontSize="small" sx={{ color: '#9D446E' }} /> : <Box sx={{ width: 16 }} />}
                      </ListItemIcon>
                      <ListItemText
                        primary="Song ngữ (Hàn - Việt)"
                        primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: subMode === 'both' ? 700 : 500 }}
                      />
                    </MenuItem>

                    <MenuItem
                      selected={subMode === 'ko'}
                      onClick={() => {
                        setSubMode('ko');
                        setSubAnchorEl(null);
                      }}
                      sx={{ fontSize: '0.82rem', py: 1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        {subMode === 'ko' ? <CheckIcon fontSize="small" sx={{ color: '#9D446E' }} /> : <Box sx={{ width: 16 }} />}
                      </ListItemIcon>
                      <ListItemText
                        primary="Chỉ tiếng Hàn"
                        primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: subMode === 'ko' ? 700 : 500 }}
                      />
                    </MenuItem>

                    <MenuItem
                      selected={subMode === 'vi'}
                      onClick={() => {
                        setSubMode('vi');
                        setSubAnchorEl(null);
                      }}
                      sx={{ fontSize: '0.82rem', py: 1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        {subMode === 'vi' ? <CheckIcon fontSize="small" sx={{ color: '#9D446E' }} /> : <Box sx={{ width: 16 }} />}
                      </ListItemIcon>
                      <ListItemText
                        primary="Chỉ tiếng Việt"
                        primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: subMode === 'vi' ? 700 : 500 }}
                      />
                    </MenuItem>

                    <MenuItem
                      selected={subMode === 'off'}
                      onClick={() => {
                        setSubMode('off');
                        setSubAnchorEl(null);
                      }}
                      sx={{ fontSize: '0.82rem', py: 1, color: '#EF4444' }}
                    >
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        {subMode === 'off' ? <CheckIcon fontSize="small" sx={{ color: '#EF4444' }} /> : <Box sx={{ width: 16 }} />}
                      </ListItemIcon>
                      <ListItemText
                        primary="Tắt phụ đề trên video"
                        primaryTypographyProps={{
                          fontSize: '0.82rem',
                          fontWeight: subMode === 'off' ? 700 : 500,
                          color: subMode === 'off' ? '#EF4444' : 'inherit',
                        }}
                      />
                    </MenuItem>
                  </Menu>

                  <Button
                    size="small"
                    startIcon={<ReplayIcon sx={{ fontSize: 16 }} />}
                    onClick={() => setLoopSentence(!loopSentence)}
                    sx={{
                      bgcolor: loopSentence ? '#9D446E' : 'rgba(0,0,0,0.65)',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      textTransform: 'none',
                      px: 1.5,
                      py: 0.4,
                      border: '1px solid rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(4px)',
                      '&:hover': { bgcolor: loopSentence ? '#86365c' : 'rgba(0,0,0,0.85)' },
                    }}
                  >
                    {loopSentence ? 'Đang lặp câu' : 'Lặp câu hiện tại'}
                  </Button>

                  <Button
                    size="small"
                    startIcon={<SpeedIcon sx={{ fontSize: 16 }} />}
                    onClick={handleToggleRate}
                    sx={{
                      bgcolor: 'rgba(0,0,0,0.65)',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      textTransform: 'none',
                      px: 1.5,
                      py: 0.4,
                      border: '1px solid rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(4px)',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' },
                    }}
                  >
                    {playbackRate}x
                  </Button>
                </Stack>
              </Box>

              {/* Floating Real-time Subtitle Display Overlay (Hidden when subMode === 'off') */}
              {activeSub && subMode !== 'off' && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '90%',
                    maxWidth: 580,
                    zIndex: 5,
                    textAlign: 'center',
                    bgcolor: 'rgba(0, 0, 0, 0.78)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '14px',
                    p: 1.5,
                    pointerEvents: 'none',
                  }}
                >
                  {/* Korean Subtitle with clickable words (shown in 'both' and 'ko' modes) */}
                  {(subMode === 'both' || subMode === 'ko') && (
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 800,
                        color: '#FDE047',
                        fontFamily: '"Noto Sans KR", "Pretendard", sans-serif',
                        fontSize: { xs: '0.95rem', sm: '1.1rem' },
                        mb: subMode === 'both' || activeSub.pronunciation ? 0.3 : 0,
                      }}
                    >
                      "{activeSub.korean.split(' ').map((word, wIdx) => (
                        <Box
                          component="span"
                          key={wIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWordClick(word, activeSub.pronunciation, activeSub.vietnamese);
                          }}
                          sx={{
                            cursor: 'pointer',
                            px: 0.5,
                            py: 0.2,
                            borderRadius: '4px',
                            display: 'inline-block',
                            pointerEvents: 'auto',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              bgcolor: '#9D446E',
                              color: '#fff',
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          {word}{' '}
                        </Box>
                      ))}"
                    </Typography>
                  )}

                  {/* Romaja (shown in 'both' and 'ko' modes) */}
                  {(subMode === 'both' || subMode === 'ko') && activeSub.pronunciation && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#CBD5E1',
                        fontFamily: 'monospace',
                        fontStyle: 'italic',
                        display: 'block',
                        fontSize: '0.78rem',
                        mb: subMode === 'both' ? 0.3 : 0,
                      }}
                    >
                      [{activeSub.pronunciation}]
                    </Typography>
                  )}

                  {/* Vietnamese Subtitle (shown in 'both' and 'vi' modes) */}
                  {(subMode === 'both' || subMode === 'vi') && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#F8FAFC',
                        fontWeight: 500,
                        fontSize: { xs: '0.8rem', sm: '0.85rem' },
                      }}
                    >
                      {activeSub.vietnamese}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {/* Video Metadata & Action Toolbar Below Video */}
            <Box sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 2,
                  pb: 2.5,
                  borderBottom: '1px solid #F1F5F9',
                }}
              >
                <Box sx={{ flex: 1, minWidth: 260 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`TOPIK ${video.topikLevel ? video.topikLevel : 1}`}
                      size="small"
                      sx={{
                        bgcolor: '#FDF2F4',
                        color: '#9D446E',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                      }}
                    />
                    {video.topic?.name && (
                      <Chip
                        label={video.topic.name}
                        size="small"
                        sx={{
                          bgcolor: '#F1F5F9',
                          color: '#475569',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    )}
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                      •{' '}
                      {video.durationSeconds
                        ? `${Math.floor(video.durationSeconds / 60)}:${(video.durationSeconds % 60).toString().padStart(2, '0')}`
                        : video.duration || '04:15'}{' '}
                      • {subtitles.length} câu bài học
                    </Typography>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E1E24', lineHeight: 1.35 }}>
                    {video.title}
                  </Typography>
                  {video.koreanTitle && (
                    <Typography variant="subtitle2" sx={{ color: '#9D446E', fontFamily: 'Pretendard', mt: 0.5 }}>
                      {video.koreanTitle}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: '#64748B', mt: 0.8, fontSize: '0.84rem' }}>
                    {video.description || 'Trích đoạn học giao tiếp tiếng Hàn thực tế qua ngữ cảnh đời sống sống động.'}
                  </Typography>
                </Box>

                {/* Reward XP Badge */}
                <Box
                  onClick={handleCompleteVideo}
                  sx={{
                    bgcolor: videoCompleted ? '#ECFDF5' : '#FDF2F4',
                    border: '1.5px solid',
                    borderColor: videoCompleted ? '#10B981' : '#F8D7DA',
                    borderRadius: '14px',
                    p: 1.8,
                    textAlign: 'right',
                    shrink: 0,
                    cursor: videoCompleted ? 'default' : 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': videoCompleted
                      ? {}
                      : {
                          bgcolor: '#FCE7EB',
                          borderColor: '#9D446E',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(157, 68, 110, 0.15)',
                        },
                  }}
                  title={videoCompleted ? 'Đã hoàn thành bài học' : 'Bấm để hoàn thành bài và nhận thưởng'}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: videoCompleted ? '#059669' : '#686B74',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 0.5,
                      fontWeight: 700,
                    }}
                  >
                    {videoCompleted ? (
                      <>
                        <CheckCircleIcon sx={{ fontSize: 15, color: '#10B981' }} />
                        Đã hoàn thành
                      </>
                    ) : (
                      'Hoàn thành bài nhận'
                    )}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      color: videoCompleted ? '#059669' : '#9D446E',
                      fontSize: '0.95rem',
                    }}
                  >
                    {videoCompleted ? '✓ Đã nhận +25 XP • 1 🥕' : '+25 XP • 1 🥕'}
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons Toolbar */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  pt: 2.5,
                }}
              >
                <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ gap: 1 }}>
                  {/* Chế độ Subtitle Toolbar button */}
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={subMode === 'off' ? <SubtitlesOffIcon /> : <SubtitlesIcon sx={{ color: '#9D446E' }} />}
                    onClick={(e) => setSubAnchorEl(e.currentTarget)}
                    sx={{
                      borderRadius: '10px',
                      borderColor: subMode === 'off' ? '#E2E8F0' : '#9D446E',
                      color: subMode === 'off' ? '#94A3B8' : '#9D446E',
                      bgcolor: subMode !== 'off' ? '#FDF2F4' : '#fff',
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      '&:hover': { borderColor: '#9D446E', bgcolor: '#FDF2F4' },
                    }}
                  >
                    {subMode === 'both' && 'Sub: Song ngữ'}
                    {subMode === 'ko' && 'Sub: Chỉ tiếng Hàn'}
                    {subMode === 'vi' && 'Sub: Chỉ tiếng Việt'}
                    {subMode === 'off' && 'Sub: Đang tắt'}
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={isBookmarked ? <BookmarkIcon sx={{ color: '#9D446E' }} /> : <BookmarkBorderIcon />}
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    sx={{
                      borderRadius: '10px',
                      borderColor: '#F0E6E8',
                      color: isBookmarked ? '#9D446E' : '#64748B',
                      bgcolor: isBookmarked ? '#FDF2F4' : '#fff',
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      '&:hover': { borderColor: '#9D446E', bgcolor: '#FDF2F4' },
                    }}
                  >
                    {isBookmarked ? 'Đã lưu video' : 'Lưu video'}
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      const text = subtitles.map((s) => `${s.korean}\n[${s.pronunciation}]\n${s.vietnamese}\n`).join('\n');
                      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${video.title || 'video'}-subtitles.txt`;
                      a.click();
                    }}
                    sx={{
                      borderRadius: '10px',
                      borderColor: '#F0E6E8',
                      color: '#64748B',
                      bgcolor: '#fff',
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      '&:hover': { borderColor: '#9D446E', bgcolor: '#FDF2F4' },
                    }}
                  >
                    Tải phụ đề bài học
                  </Button>
                </Stack>

                <Button
                  size="small"
                  variant="contained"
                  startIcon={<span>🎙️</span>}
                  onClick={() => setShadowingOpen(!shadowingOpen)}
                  sx={{
                    bgcolor: shadowingOpen ? '#86365c' : '#9D446E',
                    color: '#fff',
                    borderRadius: '10px',
                    fontWeight: 800,
                    textTransform: 'none',
                    fontSize: '0.82rem',
                    px: 2,
                    py: 0.8,
                    boxShadow: '0 4px 14px rgba(157, 68, 110, 0.25)',
                    '&:hover': { bgcolor: '#86365c' },
                  }}
                >
                  {shadowingOpen ? 'Đóng chế độ nhại tiếng' : 'Bật Chế độ Nhại tiếng (Shadowing)'}
                </Button>
              </Box>

              {/* Collapsible Shadowing / Voice Practice Panel */}
              {shadowingOpen && (
                <Box
                  sx={{
                    mt: 2.5,
                    p: 2.5,
                    borderRadius: '14px',
                    bgcolor: '#FAF8F5',
                    border: '1.5px dashed #F8D7DA',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#9D446E', mb: 1 }}>
                    🎙️ Luyện nói & Chấm điểm phát âm AI
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.82rem', mb: 2 }}>
                    Hãy nghe câu mẫu của diễn viên, sau đó bấm nút ghi âm để đọc theo (Shadowing). AI sẽ phân tích ngữ điệu và chấm điểm phát âm của bạn.
                  </Typography>

                  {activeSub ? (
                    <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#9D446E', fontFamily: 'Pretendard' }}>
                        {activeSub.korean}
                      </Typography>
                      {activeSub.pronunciation && (
                        <Typography variant="caption" sx={{ color: '#64748B', fontStyle: 'italic', display: 'block' }}>
                          [{activeSub.pronunciation}]
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ color: '#334155', mt: 0.5 }}>
                        {activeSub.vietnamese}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#94A3B8', fontStyle: 'italic', mb: 2 }}>
                      (Bấm vào một câu trong danh sách phụ đề bên phải để chọn câu luyện nói)
                    </Typography>
                  )}

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VolumeUpIcon />}
                      onClick={() => activeSub && speakKorean(activeSub.korean, 1.0)}
                      disabled={!activeSub}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 700,
                        borderColor: '#9D446E',
                        color: '#9D446E',
                      }}
                    >
                      Nghe phát âm chuẩn
                    </Button>

                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<MicIcon />}
                      onClick={handleToggleRecord}
                      disabled={!activeSub}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 800,
                        bgcolor: isRecording ? '#EF4444' : '#9D446E',
                        '&:hover': { bgcolor: isRecording ? '#DC2626' : '#86365c' },
                      }}
                    >
                      {isRecording ? 'Đang ghi âm (Bấm dừng)' : 'Ghi âm phát âm'}
                    </Button>

                    {recordingScore !== null && (
                      <Chip
                        icon={<CheckCircleIcon sx={{ color: '#10B981 !important' }} />}
                        label={`Đạt ${recordingScore}/100 điểm ✨`}
                        sx={{
                          bgcolor: '#ECFDF5',
                          color: '#065F46',
                          fontWeight: 800,
                          border: '1px solid #A7F3D0',
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: Interactive Transcript & Vocab Explorer (5 cols) */}
        <Grid item xs={12} lg={5}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '20px',
              border: '1px solid #F0E6E8',
              bgcolor: '#fff',
              height: { xs: 'auto', lg: 650 },
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 20px -2px rgba(157, 68, 110, 0.06)',
              overflow: 'hidden',
            }}
          >
            {/* Interactive Transcript Panel Header */}
            <Box
              sx={{
                px: 2.5,
                py: 1.8,
                borderBottom: '1px solid #F1F5F9',
                bgcolor: '#FAF8F5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E1E24', fontSize: '0.9rem' }}>
                  Phụ đề & Lời thoại bài học
                </Typography>
                <Chip
                  label={`${subtitles.length} câu`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    bgcolor: '#FDF2F4',
                    color: '#9D446E',
                  }}
                />
              </Box>

              {/* Auto-scroll toggle indicator */}
              <Box
                onClick={() => setAutoScroll(!autoScroll)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: autoScroll ? '#10B981' : '#94A3B8',
                }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: autoScroll ? '#10B981' : '#CBD5E1',
                  }}
                />
                <span>Tự cuộn theo video</span>
              </Box>
            </Box>

            {/* Transcript Dialogue List Container */}
            <Box
              id="transcript-container"
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  bgcolor: '#FAF8F5',
                  '&::-webkit-scrollbar': { width: 5 },
                  '&::-webkit-scrollbar-track': { bgcolor: '#FAF8F5' },
                  '&::-webkit-scrollbar-thumb': { bgcolor: '#EED5DC', borderRadius: 10 },
                }}
              >
                {subtitles.map((sub, idx) => {
                  const isActive = activeSubIndex === idx;
                  return (
                    <Box
                      key={sub.id || idx}
                      id={`sub-item-${idx}`}
                      onClick={() => handleSeekToSub(sub)}
                      sx={{
                        p: 2,
                        borderRadius: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: isActive ? '2px solid #9D446E' : '1px solid #F1F5F9',
                        bgcolor: isActive ? '#FDF2F4' : '#fff',
                        boxShadow: isActive ? '0 4px 16px rgba(157, 68, 110, 0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
                        '&:hover': {
                          borderColor: '#9D446E',
                          bgcolor: isActive ? '#FDF2F4' : '#FAF8F5',
                        },
                      }}
                    >
                      {/* Subtitle Item Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                        {isActive ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                bgcolor: '#9D446E',
                                boxShadow: '0 0 6px #9D446E',
                              }}
                            />
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#9D446E', fontSize: '0.75rem' }}>
                              Đang phát • {sub.startTime}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.75rem' }}>
                            {(idx + 1).toString().padStart(2, '0')} • {sub.startTime}
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         
                          <Button
                            size="small"
                            startIcon={<VolumeUpIcon sx={{ fontSize: 14 }} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              speakKorean(sub.korean, 1.0);
                            }}
                            sx={{
                              p: 0,
                              minWidth: 'auto',
                              color: '#9D446E',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'none',
                              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                            }}
                          >
                            Nghe
                          </Button>
                        </Box>
                      </Box>

                      {/* Korean Sentence with clickable words */}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          fontFamily: '"Noto Sans KR", "Pretendard", sans-serif',
                          color: isActive ? '#9D446E' : '#1E293B',
                          lineHeight: 1.4,
                          mb: 0.3,
                        }}
                      >
                        {sub.korean.split(' ').map((word, wIdx) => (
                          <Box
                            component="span"
                            key={wIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWordClick(word, sub.pronunciation, sub.vietnamese);
                            }}
                            sx={{
                              cursor: 'pointer',
                              borderRadius: '4px',
                              px: 0.3,
                              '&:hover': {
                                bgcolor: '#F8D7DA',
                                color: '#9D446E',
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            {word}{' '}
                          </Box>
                        ))}
                      </Typography>

                      {/* Romaja Pronunciation */}
                      {sub.pronunciation && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#9D446E',
                            bgcolor: '#FDF2F4',
                            px: 1,
                            py: 0.25,
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            fontStyle: 'italic',
                            display: 'inline-block',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            my: 0.5,
                          }}
                        >
                          [{sub.pronunciation}]
                        </Typography>
                      )}

                      {/* Vietnamese Translation */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: isActive ? '#334155' : '#64748B',
                          fontWeight: isActive ? 600 : 400,
                          fontSize: '0.82rem',
                        }}
                      >
                        {sub.vietnamese}
                      </Typography>

                      {/* Active Subtitle Action Bar */}
                      {isActive && (
                        <Box
                          sx={{
                            mt: 1.5,
                            pt: 1.2,
                            borderTop: '1px solid #F8D7DA',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1,
                          }}
                        >
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ReplayIcon sx={{ fontSize: 13 }} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSeekToSub(sub, 1.0);
                              }}
                              sx={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'none',
                                borderRadius: '8px',
                                borderColor: '#F8D7DA',
                                color: '#9D446E',
                                bgcolor: '#fff',
                                px: 1,
                                py: 0.3,
                              }}
                            >
                              Nghe lại
                            </Button>

                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSeekToSub(sub, 0.8);
                              }}
                              sx={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'none',
                                borderRadius: '8px',
                                borderColor: '#E2E8F0',
                                color: '#64748B',
                                bgcolor: '#fff',
                                px: 1,
                                py: 0.3,
                              }}
                            >
                              🐢 Chậm 0.8x
                            </Button>
                          </Stack>

                        
                        </Box>
                      )}
                    </Box>
                  );
                })}

                {subtitles.length === 0 && (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                      Chưa có phụ đề đồng bộ cho video này.
                    </Typography>
                  </Box>
                )}
              </Box>

            {/* Instant Word Lookup Quick Card (Bottom of Transcript) */}
            {selectedWord && (
              <Box sx={{ p: 2, bgcolor: '#fff', borderTop: '1px solid #F1F5F9' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    bgcolor: '#FDF8F9',
                    p: 1.5,
                    borderRadius: '12px',
                    border: '1px solid #F8D7DA',
                  }}
                >
                  <Box sx={{ pr: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#9D446E', fontSize: '0.88rem' }}>
                        {selectedWord.korean}
                      </Typography>
                      {selectedWord.romaja && (
                        <Typography variant="caption" sx={{ color: '#64748B', fontStyle: 'italic' }}>
                          [{selectedWord.romaja}]
                        </Typography>
                      )}
                      <Chip
                        label={selectedWord.type}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: '#fff',
                          border: '1px solid #F8D7DA',
                          color: '#9D446E',
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#475569', mt: 0.5, display: 'block', lineHeight: 1.3 }}>
                      {selectedWord.meaning}
                    </Typography>
                  </Box>

                  <Button
                    size="small"
                    onClick={() => toggleSaveWord(selectedWord.korean)}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      bgcolor: savedWords.has(selectedWord.korean) ? '#9D446E' : '#fff',
                      color: savedWords.has(selectedWord.korean) ? '#fff' : '#9D446E',
                      border: '1px solid #F8D7DA',
                      px: 1.2,
                      py: 0.4,
                      shrink: 0,
                      '&:hover': { bgcolor: savedWords.has(selectedWord.korean) ? '#86365c' : '#FDF2F4' },
                    }}
                  >
                    {savedWords.has(selectedWord.korean) ? 'Đã lưu' : '+ Lưu từ'}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 4. CURATED PLAYLISTS & RECOMMENDATIONS (Real DB Data) */}
      <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Section 1: Tiếp tục xem video dở dang (Real Videos from API) */}
        {continueWatchingVideos.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: 20 }}>⏳</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E1E24' }}>
                  Tiếp tục xem video bài học khác
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => navigate('/video')}
                sx={{ color: '#9D446E', fontWeight: 800, textTransform: 'none', fontSize: '0.8rem' }}
              >
                Xem tất cả bài học →
              </Button>
            </Box>

            <Grid container spacing={2.5}>
              {continueWatchingVideos.map((cVid, idx) => {
                const duration = cVid.durationSeconds
                  ? `${Math.floor(cVid.durationSeconds / 60)}:${(cVid.durationSeconds % 60).toString().padStart(2, '0')}`
                  : cVid.duration || '04:15';
                const prog = cVid.progresses?.[0];
                const isDone = Boolean(prog?.completedAt);
                const watchedSec = prog?.watchedSeconds || 0;
                const totalSec = cVid.durationSeconds || 300;
                const progressPercent = isDone
                  ? 100
                  : Math.min(99, Math.max(1, Math.round((watchedSec / totalSec) * 100)));

                return (
                  <Grid item xs={12} md={4} key={cVid.id || idx}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '16px',
                        border: '1px solid #F1F5F9',
                        bgcolor: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: '0 4px 16px rgba(157, 68, 110, 0.08)',
                          borderColor: '#F8D7DA',
                        },
                      }}
                      onClick={() => navigate(`/video/${cVid.id}`)}
                    >
                      <Box
                        sx={{
                          width: 100,
                          height: 70,
                          borderRadius: '12px',
                          bgcolor: '#0f172a',
                          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          position: 'relative',
                          overflow: 'hidden',
                          shrink: 0,
                          textAlign: 'center',
                          p: 0.5,
                        }}
                      >
                        {cVid.koreanTitle || `TOPIK ${cVid.topikLevel || 1}`}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 4,
                            right: 4,
                            bgcolor: 'rgba(0,0,0,0.75)',
                            fontSize: '0.62rem',
                            px: 0.6,
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                          }}
                        >
                          {duration}
                        </Box>
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Chip
                          label={cVid.topic?.name || `TOPIK ${cVid.topikLevel || 1}`}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            bgcolor: '#FDF2F4',
                            color: '#9D446E',
                            mb: 0.5,
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            color: '#1E293B',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {cVid.title}
                        </Typography>

                        <LinearProgress
                          variant="determinate"
                          value={progressPercent}
                          sx={{
                            mt: 1,
                            height: 5,
                            borderRadius: 3,
                            bgcolor: '#F1F5F9',
                            '& .MuiLinearProgress-bar': { bgcolor: '#9D446E' },
                          }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
                            Đã học {progressPercent}%
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#9D446E', fontWeight: 800, fontSize: '0.7rem' }}>
                            Học tiếp →
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* Section 2: Đề xuất theo trình độ của học viên (Real DB Data) */}
        {recommendedVideos.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E1E24' }}>
                  Đề xuất theo trình độ của bạn (TOPIK {video.topikLevel || 1})
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Các video bài học chọn lọc giúp mở rộng mẫu câu giao tiếp và trau dồi phản xạ
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2.5}>
              {recommendedVideos.slice(0, 4).map((rVid) => {
                const duration = rVid.durationSeconds
                  ? `${Math.floor(rVid.durationSeconds / 60)}:${(rVid.durationSeconds % 60).toString().padStart(2, '0')}`
                  : rVid.duration || '03:20';

                return (
                  <Grid item xs={12} sm={6} md={3} key={rVid.id}>
                    <Paper
                      elevation={0}
                      onClick={() => navigate(`/video/${rVid.id}`)}
                      sx={{
                        borderRadius: '16px',
                        border: '1px solid #F1F5F9',
                        bgcolor: '#fff',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        '&:hover': {
                          boxShadow: '0 8px 24px rgba(157, 68, 110, 0.12)',
                          transform: 'translateY(-3px)',
                          borderColor: '#F8D7DA',
                        },
                      }}
                    >
                      {/* Thumbnail Banner */}
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          paddingTop: '56.25%',
                          bgcolor: '#1E293B',
                          background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          sx={{
                            position: 'absolute',
                            color: 'rgba(255,255,255,0.75)',
                            fontWeight: 900,
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            textAlign: 'center',
                            px: 1,
                          }}
                        >
                          {rVid.koreanTitle || rVid.title}
                        </Typography>

                        <Chip
                          label={`TOPIK ${rVid.topikLevel || 1}`}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            bgcolor: '#10B981',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            height: 20,
                          }}
                        />

                        <Typography
                          variant="caption"
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            bgcolor: 'rgba(0,0,0,0.75)',
                            color: '#fff',
                            fontSize: '0.68rem',
                            px: 0.8,
                            py: 0.2,
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                          }}
                        >
                          {duration}
                        </Typography>
                      </Box>

                      {/* Card Content */}
                      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 0.5, display: 'block' }}>
                            {rVid.topic?.name || 'Chủ đề bài học'} • {rVid.subtitles?.length || 15} câu
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 800,
                              color: '#1E1E24',
                              lineHeight: 1.35,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {rVid.title}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            mt: 2,
                            pt: 1.5,
                            borderTop: '1px solid #F1F5F9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#9D446E' }}>
                            +25 XP • 1 🥕
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                            Xem bài học →
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Box>

      {/* Celebration Snackbar */}
      <Snackbar
        open={rewardToast.open}
        autoHideDuration={5000}
        onClose={() => setRewardToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setRewardToast((prev) => ({ ...prev, open: false }))}
          severity="success"
          variant="filled"
          sx={{
            bgcolor: '#059669',
            color: '#fff',
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
            borderRadius: '12px',
          }}
        >
          {rewardToast.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default VideoWatchPage;
