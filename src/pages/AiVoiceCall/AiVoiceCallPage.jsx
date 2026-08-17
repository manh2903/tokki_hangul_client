import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  TextField,
  Fade,
  Avatar,
  Card,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { aiTutorApi } from '@/api';

// Personas & Scenarios
const SCENARIOS = [
  {
    id: 'freetalk',
    title: 'Tán gẫu tự do với Tokki',
    koreanTitle: '자유 대화',
    avatar: '🐰',
    role: 'Bạn học người Hàn Quốc (22 tuổi)',
    desc: 'Trò chuyện tự nhiên về cuộc sống, sở thích, K-pop và văn hóa Hàn Quốc.',
    initialPrompt: '안녕하세요! 오늘 기분은 어떠세요? 어떤 이야기를 나눠볼까요?',
    initialVi: 'Xin chào! Hôm nay tâm trạng bạn thế nào? Chúng ta cùng nói chuyện gì nhé?',
    color: '#973f69',
  },
  {
    id: 'cafe',
    title: 'Quán Cà Phê Hongdae',
    koreanTitle: '홍대 카페 주문',
    avatar: '☕',
    role: 'Nhân viên pha chế thân thiện',
    desc: 'Luyện tập gọi cafe, chọn size, độ ngọt, đá và thanh toán.',
    initialPrompt: '어서오세요! 홍대 토끼 카페입니다. 어떤 음료로 주문하시겠어요?',
    initialVi: 'Xin chào quý khách! Đây là Cafe Tokki Hongdae. Quý khách muốn gọi đồ uống gì ạ?',
    color: '#b0613a',
  },
  {
    id: 'interview',
    title: 'Phỏng vấn xin việc',
    koreanTitle: '한국 기업 면접',
    avatar: '💼',
    role: 'Trưởng phòng nhân sự Park',
    desc: 'Luyện tập giới thiệu bản thân, trả lời phỏng vấn bằng kính ngữ.',
    initialPrompt: '안녕하십니까. 면접에 참석해 주셔서 감사합니다. 먼저 간단히 자기소개를 부탁드립니다.',
    initialVi: 'Xin chào. Cảm ơn bạn đã tham gia phỏng vấn. Trước tiên xin mời bạn giới thiệu ngắn gọn về bản thân.',
    color: '#2a6f97',
  },
  {
    id: 'shopping',
    title: 'Mua sắm tại Myeongdong',
    koreanTitle: '명동 쇼핑하기',
    avatar: '🛍️',
    role: 'Nhân viên bán hàng thời trang',
    desc: 'Hỏi size quần áo, mặc thử đồ, hỏi giá và chương trình giảm giá.',
    initialPrompt: '안녕하세요 손님! 찾으시는 옷이나 스타일이 있으신가요?',
    initialVi: 'Xin chào quý khách! Quý khách đang tìm kiểu quần áo hay phong cách nào ạ?',
    color: '#6b3e75',
  },
  {
    id: 'airport',
    title: 'Thủ tục tại Sân bay',
    koreanTitle: '인천공항 수속 및 안내',
    avatar: '✈️',
    role: 'Nhân viên mặt đất sân bay',
    desc: 'Hỏi quầy check-in, gửi hành lý và tìm cổng khởi hành.',
    initialPrompt: '안녕하십니까! 인천국제공항입니다. 어떤 도움이 필요하신가요?',
    initialVi: 'Xin chào quý khách! Đây là Sân bay Quốc tế Incheon. Quý khách cần hỗ trợ gì ạ?',
    color: '#2d6a4f',
  },
];

export const AiVoiceCallPage = () => {
  // Call status: 'idle' | 'calling' | 'connected' | 'ended'
  const [callStatus, setCallStatus] = useState('idle');
  // AI State: 'listening' | 'thinking' | 'speaking' | 'idle'
  const [aiState, setAiState] = useState('idle');

  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [selectedLevel, setSelectedLevel] = useState('beginner');

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [showVietnamese, setShowVietnamese] = useState(true);

  // Live subtitles & feedback
  const [currentAiSubtitle, setCurrentAiSubtitle] = useState('');
  const [currentAiTranslation, setCurrentAiTranslation] = useState('');
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [currentUserSpeech, setCurrentUserSpeech] = useState('');

  // Conversation session tracking
  const [conversationId, setConversationId] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [callDuration, setCallDuration] = useState(0);
  const [openSummary, setOpenSummary] = useState(false);
  const [openDrawerHistory, setOpenDrawerHistory] = useState(false);
  const [pastSessions, setPastSessions] = useState([]);
  const [loadingPastSessions, setLoadingPastSessions] = useState(false);

  // Text input fallback
  const [textInput, setTextInput] = useState('');

  // Audio volume visualizer
  const [micVolume, setMicVolume] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);

  // Speech Recognition & Synthesis references
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const timerRef = useRef(null);

  // Format Call Duration: MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Timer counter when in call
  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // Load past voice call sessions from DB
  const loadPastSessions = async () => {
    try {
      setLoadingPastSessions(true);
      const res = await aiTutorApi.getConversations();
      const list = res?.data || res || [];
      const calls = Array.isArray(list) ? list.filter((c) => c.title?.includes('[Live Call]')) : [];
      setPastSessions(calls);
    } catch (err) {
      console.warn('Failed to load past sessions:', err);
    } finally {
      setLoadingPastSessions(false);
    }
  };

  useEffect(() => {
    loadPastSessions();
  }, []);

  // TTS: Speak Korean Text
  const speakKorean = useCallback((text, onFinish) => {
    if (!text || isSpeakerMuted) {
      if (onFinish) onFinish();
      return;
    }

    if (!('speechSynthesis' in window)) {
      if (onFinish) onFinish();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find(
      (v) => v.lang.startsWith('ko') || v.name.includes('Korean') || v.name.includes('Yuna') || v.name.includes('Heami')
    );
    if (koreanVoice) utterance.voice = koreanVoice;

    setAiState('speaking');

    utterance.onend = () => {
      setAiState('listening');
      if (onFinish) onFinish();
    };

    utterance.onerror = () => {
      setAiState('listening');
      if (onFinish) onFinish();
    };

    window.speechSynthesis.speak(utterance);
  }, [isSpeakerMuted]);

  // Microphone Audio Visualizer setup
  const startMicVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn('Microphone stream access error:', err);
    }
  };

  const stopMicVisualizer = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    setMicVolume(0);
  };

  // Send turn to backend + Save to DB
  const handleSendTurn = async (spokenText) => {
    const trimmed = (spokenText || '').trim();
    if (!trimmed) return;

    const userMsg = { role: 'user', text: trimmed, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setConversationHistory((prev) => [...prev, userMsg]);
    setCurrentUserSpeech(trimmed);
    setAiState('thinking');

    try {
      const res = await aiTutorApi.realtimeVoiceChat({
        conversationId,
        userMessage: trimmed,
        history: conversationHistory,
        scenario: selectedScenario.id,
        level: selectedLevel,
      });

      const data = res?.data || res;
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      const koreanReply = data.koreanReply || '네, 잘 들었습니다!';
      const vietnameseReply = data.vietnameseReply || 'Vâng, tôi đã nghe rõ!';
      const correctionTip = data.correctionTip || null;

      setCurrentAiSubtitle(koreanReply);
      setCurrentAiTranslation(vietnameseReply);
      setCurrentFeedback(correctionTip);

      const aiMsg = {
        role: 'model',
        koreanReply,
        vietnameseReply,
        correctionTip,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setConversationHistory((prev) => [...prev, aiMsg]);

      speakKorean(koreanReply);
    } catch (err) {
      console.error('Voice chat error:', err);
      const fallback = '죄송합니다, 다시 한번 말씀해 주시겠어요?';
      setCurrentAiSubtitle(fallback);
      setCurrentAiTranslation('Xin lỗi, bạn có thể nói lại một lần nữa được không?');
      speakKorean(fallback);
    }
  };

  // Setup Web Speech Recognition
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech Recognition not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        isRecognizingRef.current = true;
      };

      recognition.onresult = (event) => {
        let interim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setCurrentUserSpeech(interim);
        }

        if (finalTranscript.trim()) {
          setCurrentUserSpeech(finalTranscript.trim());
          handleSendTurn(finalTranscript.trim());
        }
      };

      recognition.onerror = (e) => {
        if (e.error !== 'no-speech') {
          console.warn('Speech recognition error:', e.error);
        }
      };

      recognition.onend = () => {
        isRecognizingRef.current = false;
        if (callStatus === 'connected' && !isMuted) {
          try {
            recognition.start();
          } catch (_) {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
    isRecognizingRef.current = false;
  };

  // Start Live Call
  const handleStartCall = async () => {
    setCallStatus('connected');
    setCallDuration(0);
    setConversationId(null);
    setConversationHistory([]);
    setCurrentUserSpeech('');
    setCurrentFeedback(null);

    const greetingKo = selectedScenario.initialPrompt;
    const greetingVi = selectedScenario.initialVi;

    setCurrentAiSubtitle(greetingKo);
    setCurrentAiTranslation(greetingVi);

    const initialAiMsg = {
      role: 'model',
      koreanReply: greetingKo,
      vietnameseReply: greetingVi,
      correctionTip: null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setConversationHistory([initialAiMsg]);

    await startMicVisualizer();
    startSpeechRecognition();
    speakKorean(greetingKo);
  };

  // End Live Call
  const handleEndCall = () => {
    window.speechSynthesis.cancel();
    stopMicVisualizer();
    stopSpeechRecognition();
    setCallStatus('ended');
    setAiState('idle');
    setOpenSummary(true);
    loadPastSessions();
  };

  // Toggle Mute Mic
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  // Text message submission fallback
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim() || aiState === 'thinking') return;
    const msg = textInput.trim();
    setTextInput('');
    handleSendTurn(msg);
  };

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      {/* Top Bar / Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              icon={<AutoAwesomeIcon sx={{ fontSize: 14, color: '#fff !important' }} />}
              label="Live Voice Call"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #e63946 0%, #ff6b6b 100%)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.7rem',
                boxShadow: '0 2px 10px rgba(230,57,70,0.35)',
              }}
            />
            {callStatus === 'connected' && (
              <Chip
                label={`Đang gọi • ${formatTimer(callDuration)}`}
                size="small"
                color="success"
                sx={{ fontWeight: 800 }}
              />
            )}
          </Stack>
          <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
            Luyện Nói Trực Tiếp Với Tokki AI
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Gọi điện thoại 2 chiều với gia sư tiếng Hàn bản xứ. Nhận diện giọng nói và lưu lại lịch sử học tập tự động.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="medium"
          startIcon={<HistoryIcon />}
          onClick={() => setOpenDrawerHistory(true)}
          sx={{ borderRadius: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}
        >
          Lịch sử cuộc gọi {pastSessions.length > 0 ? `(${pastSessions.length})` : ''}
        </Button>
      </Stack>

      {/* Main Interactive Call Container */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: callStatus === 'connected' ? 'primary.light' : 'divider',
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'radial-gradient(circle at 50% 30%, #ffffff 0%, #fdf8fa 60%, #f7edf2 100%)'
              : 'radial-gradient(circle at 50% 30%, #20131b 0%, #150c12 60%, #0c060a 100%)',
          boxShadow: callStatus === 'connected' ? '0 16px 50px rgba(151, 63, 105, 0.2)' : '0 8px 30px rgba(0,0,0,0.06)',
          p: { xs: 3, sm: 4, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: 520,
          position: 'relative',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Scenario Info Bar */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
          <Chip
            avatar={<Avatar sx={{ bgcolor: 'transparent', fontSize: '1.2rem !important' }}>{selectedScenario.avatar}</Avatar>}
            label={`${selectedScenario.title} (${selectedScenario.koreanTitle})`}
            variant="outlined"
            sx={{ fontWeight: 700, borderRadius: '20px', px: 1, py: 2, borderColor: 'primary.light' }}
          />
          <Chip
            label={selectedLevel === 'beginner' ? 'Sơ cấp' : selectedLevel === 'intermediate' ? 'Trung cấp' : 'Cao cấp'}
            size="small"
            color="primary"
            sx={{ fontWeight: 700 }}
          />
        </Stack>

        {/* 🌟 Glowing Audio Visualizer Orb */}
        <Box
          sx={{
            position: 'relative',
            width: { xs: 180, sm: 220 },
            height: { xs: 180, sm: 220 },
            my: { xs: 2, sm: 3 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Animated Glow Rings when Connected */}
          {callStatus === 'connected' && (
            <>
              <Box
                sx={{
                  position: 'absolute',
                  inset: -20,
                  borderRadius: '50%',
                  background:
                    aiState === 'speaking'
                      ? 'radial-gradient(circle, rgba(151,63,105,0.4) 0%, rgba(194,84,125,0) 70%)'
                      : aiState === 'thinking'
                      ? 'radial-gradient(circle, rgba(67,97,238,0.4) 0%, rgba(67,97,238,0) 70%)'
                      : 'radial-gradient(circle, rgba(46,196,182,0.4) 0%, rgba(46,196,182,0) 70%)',
                  transform: `scale(${1 + (aiState === 'speaking' ? 0.25 : micVolume * 0.004)})`,
                  transition: 'transform 0.15s ease-out',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: -6,
                  borderRadius: '50%',
                  background:
                    aiState === 'speaking'
                      ? 'linear-gradient(135deg, rgba(151,63,105,0.6) 0%, rgba(247,37,133,0.6) 100%)'
                      : aiState === 'thinking'
                      ? 'linear-gradient(135deg, rgba(67,97,238,0.6) 0%, rgba(114,9,183,0.6) 100%)'
                      : 'linear-gradient(135deg, rgba(46,196,182,0.6) 0%, rgba(42,157,143,0.6) 100%)',
                  filter: 'blur(12px)',
                  opacity: 0.8,
                }}
              />
            </>
          )}

          {/* Central 3D Styled Sphere */}
          <Box
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background:
                callStatus !== 'connected'
                  ? 'linear-gradient(135deg, #973f69 0%, #c2547d 100%)'
                  : aiState === 'speaking'
                  ? 'linear-gradient(135deg, #973f69 0%, #ff5d8f 100%)'
                  : aiState === 'thinking'
                  ? 'linear-gradient(135deg, #4361ee 0%, #7209b7 100%)'
                  : 'linear-gradient(135deg, #2ec4b6 0%, #208b81 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: 'inset 0 -10px 24px rgba(0,0,0,0.35), 0 12px 36px rgba(151,63,105,0.3)',
              position: 'relative',
              zIndex: 2,
              cursor: callStatus !== 'connected' ? 'pointer' : 'default',
              transition: 'all 0.4s ease',
              '&:hover': {
                transform: callStatus !== 'connected' ? 'scale(1.05)' : 'none',
              },
            }}
            onClick={callStatus !== 'connected' ? handleStartCall : undefined}
          >
            {callStatus !== 'connected' ? (
              <>
                <PhoneInTalkIcon sx={{ fontSize: { xs: 44, sm: 54 }, mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Bắt đầu gọi
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.7rem' }}>
                  Nhấn để bắt đầu
                </Typography>
              </>
            ) : (
              <>
                <Typography sx={{ fontSize: { xs: 36, sm: 44 }, mb: 0.5 }}>{selectedScenario.avatar}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.68rem' }}>
                  {aiState === 'speaking'
                    ? 'AI ĐANG NÓI...'
                    : aiState === 'thinking'
                    ? 'AI ĐANG NGHĨ...'
                    : 'ĐANG LẮNG NGHE...'}
                </Typography>
                {aiState === 'thinking' && <CircularProgress size={16} sx={{ color: '#fff', mt: 0.5 }} />}
              </>
            )}
          </Box>
        </Box>

        {/* Live Subtitle & Transcript Card */}
        {callStatus === 'connected' ? (
          <Fade in timeout={400}>
            <Box sx={{ width: '100%', maxWidth: 840, my: 2 }}>
              <Card
                sx={{
                  borderRadius: '20px',
                  border: '1.5px solid',
                  borderColor: 'primary.light',
                  bgcolor: (theme) => (theme.palette.mode === 'light' ? '#ffffff' : 'rgba(255,255,255,0.04)'),
                  boxShadow: '0 8px 24px rgba(151,63,105,0.08)',
                  p: { xs: 2.5, sm: 3 },
                  textAlign: 'center',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Chip
                    icon={<SmartToyIcon sx={{ fontSize: 14, color: 'primary.main !important' }} />}
                    label={selectedScenario.role}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                  />
                  <IconButton size="small" onClick={() => setShowVietnamese(!showVietnamese)} sx={{ color: 'text.secondary' }}>
                    {showVietnamese ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                  </IconButton>
                </Stack>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    fontFamily: 'Pretendard, sans-serif',
                    color: 'text.primary',
                    lineHeight: 1.6,
                  }}
                >
                  {currentAiSubtitle || '...'}
                </Typography>

                {showVietnamese && currentAiTranslation && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                    {currentAiTranslation}
                  </Typography>
                )}

                {currentFeedback && (
                  <Paper
                    elevation={0}
                    sx={{
                      mt: 2,
                      p: 1.5,
                      borderRadius: '12px',
                      bgcolor: 'rgba(255, 183, 3, 0.12)',
                      border: '1px solid rgba(255, 183, 3, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      textAlign: 'left',
                    }}
                  >
                    <LightbulbIcon sx={{ color: '#d48b00', fontSize: 18, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
                      <strong>Góp ý của Tokki:</strong> {currentFeedback}
                    </Typography>
                  </Paper>
                )}
              </Card>

              {currentUserSpeech && (
                <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    Bạn vừa nói: <strong>"{currentUserSpeech}"</strong>
                  </Typography>
                </Stack>
              )}
            </Box>
          </Fade>
        ) : (
          <Box sx={{ width: '100%', maxWidth: 1100, my: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, textAlign: 'center', color: 'text.secondary', letterSpacing: 0.5 }}>
              CHỌN TÌNH HUỐNG & VAI DIỄN MUỐN LUYỆN TẬP
            </Typography>

            <Grid container spacing={2}>
              {SCENARIOS.map((sc) => {
                const isSelected = selectedScenario.id === sc.id;
                return (
                  <Grid item xs={12} sm={6} md={4} key={sc.id}>
                    <Card
                      onClick={() => setSelectedScenario(sc)}
                      sx={{
                        p: 2,
                        height: '100%',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        border: 2,
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? (theme) => (theme.palette.mode === 'light' ? 'rgba(151,63,105,0.06)' : 'rgba(151,63,105,0.18)') : 'background.paper',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          borderColor: 'primary.light',
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography sx={{ fontSize: '2rem' }}>{sc.avatar}</Typography>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {sc.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.2 }}>
                            {sc.desc}
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* Call Action Bar / Controls */}
        <Box sx={{ mt: 'auto', pt: 3, width: '100%', maxWidth: 720 }}>
          {callStatus === 'connected' ? (
            <Stack spacing={2} alignItems="center">
              <Stack direction="row" spacing={3} alignItems="center" justifyContent="center">
                <Tooltip title={isMuted ? 'Bật lại Micro' : 'Tắt Micro'}>
                  <IconButton
                    id="toggle-mic-btn"
                    onClick={handleToggleMute}
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      bgcolor: isMuted ? 'error.light' : 'action.hover',
                      color: isMuted ? '#fff' : 'text.primary',
                      '&:hover': { bgcolor: isMuted ? 'error.main' : 'action.selected' },
                    }}
                  >
                    {isMuted ? <MicOffIcon /> : <MicIcon />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Kết thúc cuộc gọi">
                  <IconButton
                    id="end-call-btn"
                    onClick={handleEndCall}
                    sx={{
                      width: 68,
                      height: 68,
                      borderRadius: '50%',
                      bgcolor: '#e63946',
                      color: '#ffffff',
                      boxShadow: '0 8px 24px rgba(230, 57, 70, 0.45)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: '#c92a2a',
                        transform: 'scale(1.08)',
                      },
                    }}
                  >
                    <CallEndIcon sx={{ fontSize: 32 }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title={isSpeakerMuted ? 'Bật loa AI' : 'Tắt âm thanh AI'}>
                  <IconButton
                    onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      bgcolor: isSpeakerMuted ? 'warning.light' : 'action.hover',
                      color: isSpeakerMuted ? '#fff' : 'text.primary',
                    }}
                  >
                    {isSpeakerMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                  </IconButton>
                </Tooltip>
              </Stack>

              <Box component="form" onSubmit={handleTextSubmit} sx={{ width: '100%', display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Gõ tiếng Hàn nếu bạn không tiện nói qua micro..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={aiState === 'thinking'}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                />
                <IconButton
                  type="submit"
                  disabled={!textInput.trim() || aiState === 'thinking'}
                  sx={{
                    bgcolor: 'primary.main',
                    color: '#fff',
                    borderRadius: '16px',
                    width: 44,
                    height: 44,
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            </Stack>
          ) : (
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                id="start-live-voice-call-btn"
                variant="contained"
                size="large"
                startIcon={<PhoneInTalkIcon />}
                onClick={handleStartCall}
                sx={{
                  borderRadius: '16px',
                  fontWeight: 800,
                  px: 4,
                  py: 1.6,
                  fontSize: '1.05rem',
                  background: 'linear-gradient(135deg, #973f69 0%, #c2547d 100%)',
                  boxShadow: '0 8px 24px rgba(151,63,105,0.35)',
                  '&:hover': {
                    boxShadow: '0 12px 30px rgba(151,63,105,0.5)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Bắt Đầu Cuộc Gọi Thoại AI
              </Button>
            </Stack>
          )}
        </Box>
      </Paper>

      {/* 📊 Post-Call Summary & Feedback Dialog */}
      <Dialog
        open={openSummary}
        onClose={() => setOpenSummary(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <EmojiEmotionsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            Tổng Kết Buổi Luyện Nói
          </Typography>
          <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" sx={{ mt: 0.5 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>
              Cuộc gọi đã được lưu tự động vào Lịch sử học tập
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: '16px', bgcolor: 'action.hover' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {formatTimer(callDuration)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Thời lượng gọi
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: '16px', bgcolor: 'action.hover' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {conversationHistory.filter((m) => m.role === 'user').length}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Lượt câu đã nói
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: '16px', bgcolor: 'action.hover' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#2ec4b6' }}>
                  85/100
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Điểm phản xạ
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              bgcolor: (theme) => (theme.palette.mode === 'light' ? 'rgba(151,63,105,0.06)' : 'rgba(151,63,105,0.15)'),
              border: '1px solid',
              borderColor: 'primary.light',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon fontSize="small" /> Lời khuyên từ Tokki AI Tutor:
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              Bạn đã thể hiện sự tự tin tốt khi đàm thoại về chủ đề <strong>{selectedScenario.title}</strong>. Hãy tiếp tục duy trì luyện tập 5 - 10 phút mỗi ngày để phản xạ nói tiếng Hàn thêm tự nhiên và lưu loát nhé!
            </Typography>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenSummary(false)} sx={{ fontWeight: 700 }}>
            Đóng
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setOpenSummary(false);
              handleStartCall();
            }}
            sx={{ borderRadius: '12px', fontWeight: 800, px: 3 }}
          >
            Gọi Lại Cuộc Mới
          </Button>
        </DialogActions>
      </Dialog>

      {/* 📜 Full Call Transcript & Past Sessions Modal */}
      <Dialog
        open={openDrawerHistory}
        onClose={() => setOpenDrawerHistory(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Lịch Sử Cuộc Gọi Đã Lưu
          </Typography>
          <IconButton onClick={() => setOpenDrawerHistory(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: 460 }}>
          {conversationHistory.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                Cuộc gọi hiện tại ({conversationHistory.length} câu)
              </Typography>
              <Stack spacing={1.5}>
                {conversationHistory.map((msg, idx) => (
                  <Stack key={idx} direction="row" justifyContent={msg.role === 'user' ? 'flex-end' : 'flex-start'} spacing={1}>
                    {msg.role !== 'user' && (
                      <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                        {selectedScenario.avatar}
                      </Avatar>
                    )}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        maxWidth: '75%',
                        borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        bgcolor: msg.role === 'user' ? 'primary.main' : 'action.hover',
                        color: msg.role === 'user' ? '#fff' : 'text.primary',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'Pretendard' }}>
                        {msg.text || msg.koreanReply}
                      </Typography>
                      {msg.vietnameseReply && (
                        <Typography variant="caption" sx={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.85)' : 'text.secondary', display: 'block', mt: 0.3 }}>
                          {msg.vietnameseReply}
                        </Typography>
                      )}
                      {msg.correctionTip && (
                        <Typography variant="caption" sx={{ color: '#d48b00', display: 'block', mt: 0.5, fontWeight: 700 }}>
                          💡 {msg.correctionTip}
                        </Typography>
                      )}
                    </Paper>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

          {pastSessions.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1 }}>
                Các cuộc gọi trước đây ({pastSessions.length})
              </Typography>
              <List disablePadding>
                {pastSessions.map((session) => (
                  <ListItem
                    key={session.id}
                    sx={{
                      mb: 1,
                      borderRadius: '12px',
                      bgcolor: 'action.hover',
                      p: 1.5,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PhoneInTalkIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{session.title}</Typography>}
                      secondary={
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Bắt đầu: {new Date(session.started_at || session.createdAt).toLocaleString('vi-VN')}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {conversationHistory.length === 0 && pastSessions.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
              Chưa có lịch sử cuộc gọi nào. Hãy bấm "Bắt Đầu Cuộc Gọi Thoại AI" để luyện tập ngay nhé!
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

export default AiVoiceCallPage;
