import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  Paper,
  CircularProgress,
  IconButton,
  TextField,
  Divider,
  Collapse,
  Tooltip,
  Avatar,
  Fade,
} from '@mui/material';
import { AudioPlayer } from '@/components/common/AudioPlayer';
import { videosApi, aiTutorApi } from '@/api';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import TranslateIcon from '@mui/icons-material/Translate';

/**
 * Normalize subtitle fields from DB (startTimeMs / koreanText / vietnameseText)
 * to the display format the UI uses (startTime / korean / vietnamese).
 */
const msToTime = (ms) => {
  if (!ms && ms !== 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const normalizeSubtitle = (sub) => ({
  ...sub,
  startTime: sub.startTime || sub.time || msToTime(sub.startTimeMs),
  endTime:   sub.endTime   || msToTime(sub.endTimeMs),
  korean:    sub.korean    || sub.text_ko     || sub.koreanText     || '',
  vietnamese:sub.vietnamese|| sub.text_vi     || sub.vietnameseText || '',
  vocab:     sub.vocab     || [],
});

const toEmbedUrl = (url) => {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    // YouTube
    if (parsed.hostname === 'youtu.be') {
      const videoId = parsed.pathname.slice(1);
      if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`;
    } else if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) return url;
      const videoId = parsed.searchParams.get('v');
      if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }

    // TikTok
    if (parsed.hostname.includes('tiktok.com')) {
      if (parsed.pathname.includes('/embed/')) return url;
      const match = parsed.pathname.match(/\/video\/(\d+)/);
      if (match && match[1]) {
        return `https://www.tiktok.com/embed/v2/${match[1]}`;
      }
    }
  } catch (_) {}
  return url;
};


// AI Subtitle Explanation Panel
const AiExplainPanel = ({ subtitle, videoTitle, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [error, setError] = useState(null);
  const text = subtitle?.korean || subtitle?.text_ko || '';
  const meaning = subtitle?.vietnamese || subtitle?.text_vi || '';

  useEffect(() => {
    if (!text) return;
    const explain = async () => {
      setLoading(true);
      setError(null);
      setExplanation(null);
      try {
        const prompt = `Bạn là giáo viên tiếng Hàn. Phân tích ngắn gọn câu sau từ video "${videoTitle}":\n\nCâu: "${text}"\nNghĩa: "${meaning}"\n\nTrả lời theo:\n1. **Từ vựng chính**: 2-3 từ quan trọng (Hán - phiên âm - nghĩa)\n2. **Ngữ pháp**: cấu trúc nổi bật\n3. **Mẹo học**: 1 câu ví dụ tương tự`;
        const res = await aiTutorApi.sendMessage({ message: prompt, context: 'video_subtitle' });
        const content = res?.data?.message || res?.message || res?.data?.content || res?.content || (typeof res === 'string' ? res : null);
        setExplanation(content || 'Không nhận được phản hồi từ AI.');
      } catch (_) {
        setError('Không thể phân tích câu này. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    explain();
  }, [text]);

  return (
    <Fade in>
      <Card sx={{ border: '1.5px solid', borderColor: 'primary.main', borderRadius: '16px', bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(151,63,105,0.04)' : 'rgba(151,63,105,0.1)', boxShadow: '0 4px 20px rgba(151,63,105,0.15)' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 18 }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>AI Phân Tích Câu</Typography>
            </Stack>
            <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
          </Stack>
          <Paper elevation={0} sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'background.paper', border: 1, borderColor: 'divider', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'Pretendard' }}>{text}</Typography>
            {meaning && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{meaning}</Typography>}
          </Paper>
          {loading ? (
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 1 }}>
              <CircularProgress size={16} color="primary" />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>AI đang phân tích câu...</Typography>
            </Stack>
          ) : error ? (
            <Typography variant="caption" sx={{ color: 'error.main' }}>{error}</Typography>
          ) : explanation ? (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: explanation.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#973f69">$1</strong>').replace(/\n/g, '<br/>') }}
            />
          ) : null}
        </CardContent>
      </Card>
    </Fade>
  );
};

// Floating AI Chat Panel
const AiChatPanel = ({ video }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!open || conversationId || messages.length > 0) return;
    const init = async () => {
      try {
        const subtitleCtx = (video.subtitles || []).slice(0, 20).map((s, i) => `[${i + 1}] ${s.korean || s.text_ko || ''}: ${s.vietnamese || s.text_vi || ''}`).join('\n');
        const res = await aiTutorApi.createConversation({ title: `Hỏi đáp video: ${video.title}`, context: `Video học tiếng Hàn "${video.title}".\nPhụ đề:\n${subtitleCtx}` });
        const cid = res?.data?.id || res?.id;
        if (cid) setConversationId(cid);
      } catch (_) {}
      setMessages([{ role: 'ai', text: `Xin chào! Tôi là **AI Tutor** 🤖\n\nBạn đang xem video **"${video.title}"**.\nHỏi tôi bất cứ điều gì về từ vựng, ngữ pháp hoặc nội dung video nhé!` }]);
    };
    init();
  }, [open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setSending(true);
    try {
      const subtitleCtx = (video.subtitles || []).slice(0, 15).map((s) => `${s.korean || s.text_ko || ''} = ${s.vietnamese || s.text_vi || ''}`).join(' | ');
      const res = await aiTutorApi.sendMessage({ message: text, conversationId, context: `Video: "${video.title}". Phụ đề: ${subtitleCtx}` });
      const reply = res?.data?.message || res?.message || res?.data?.content || res?.content || (typeof res === 'string' ? res : 'Tôi không thể trả lời câu hỏi này.');
      setMessages((prev) => [...prev, { role: 'ai', text: reply }]);
    } catch (_) {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Có lỗi xảy ra, vui lòng thử lại.' }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <>
      <Tooltip title={open ? 'Đóng AI Chat' : 'Hỏi AI về video này'} placement="left">
        <Box id="ai-chat-toggle-btn" onClick={() => setOpen((v) => !v)}
          sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1300, width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #973f69 0%, #c2547d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 20px rgba(151,63,105,0.5)', transition: 'all 0.25s ease', '&:hover': { transform: 'scale(1.1)', boxShadow: '0 6px 28px rgba(151,63,105,0.65)' } }}>
          {open ? <CloseIcon sx={{ color: '#fff' }} /> : <SmartToyIcon sx={{ color: '#fff' }} />}
        </Box>
      </Tooltip>
      <Collapse in={open} timeout={300}>
        <Paper elevation={0} sx={{ position: 'fixed', bottom: 100, right: 32, zIndex: 1299, width: 360, maxHeight: 520, display: 'flex', flexDirection: 'column', borderRadius: '20px', border: '1.5px solid', borderColor: 'primary.light', boxShadow: '0 12px 40px rgba(151,63,105,0.2)', overflow: 'hidden', bgcolor: 'background.paper' }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, background: 'linear-gradient(135deg, #973f69 0%, #c2547d 100%)' }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}><SmartToyIcon sx={{ fontSize: 18, color: '#fff' }} /></Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1.2 }}>AI Tutor</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Hỏi đáp về video này</Typography>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'rgba(255,255,255,0.8)' }}><CloseIcon fontSize="small" /></IconButton>
          </Box>
          <Stack spacing={1.5} sx={{ flex: 1, overflowY: 'auto', p: 2, maxHeight: 360 }}>
            {messages.map((msg, i) => (
              <Stack key={i} direction="row" justifyContent={msg.role === 'user' ? 'flex-end' : 'flex-start'} alignItems="flex-end" spacing={1}>
                {msg.role === 'ai' && (<Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', flexShrink: 0 }}><SmartToyIcon sx={{ fontSize: 14, color: '#fff' }} /></Avatar>)}
                <Paper elevation={0} sx={{ p: 1.5, maxWidth: '78%', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', bgcolor: msg.role === 'user' ? 'primary.main' : 'action.hover', border: msg.role === 'ai' ? 1 : 0, borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: msg.role === 'user' ? '#fff' : 'text.primary', whiteSpace: 'pre-wrap', lineHeight: 1.6, display: 'block' }}
                    dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                </Paper>
              </Stack>
            ))}
            {sending && (
              <Stack direction="row" alignItems="flex-end" spacing={1}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}><SmartToyIcon sx={{ fontSize: 14, color: '#fff' }} /></Avatar>
                <Paper elevation={0} sx={{ p: 1.5, borderRadius: '16px 16px 16px 4px', bgcolor: 'action.hover', border: 1, borderColor: 'divider' }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {[0, 1, 2].map((d) => (<Box key={d} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', animation: 'dotPulse 1.2s ease-in-out infinite', animationDelay: `${d * 0.2}s`, '@keyframes dotPulse': { '0%, 100%': { opacity: 0.3, transform: 'scale(0.8)' }, '50%': { opacity: 1, transform: 'scale(1)' } } }} />))}
                  </Stack>
                </Paper>
              </Stack>
            )}
            <Box ref={bottomRef} />
          </Stack>
          <Divider />
          <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1.5 }}>
            <TextField fullWidth size="small" placeholder="Nhập câu hỏi... (Enter để gửi)" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} multiline maxRows={3} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '0.8rem' } }} />
            <IconButton id="ai-chat-send-btn" onClick={handleSend} disabled={!input.trim() || sending} sx={{ bgcolor: 'primary.main', color: '#fff', borderRadius: '12px', width: 36, height: 36, flexShrink: 0, '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}>
              <SendIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        </Paper>
      </Collapse>
    </>
  );
};

// Main Page
export const VideoWatchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubtitle, setActiveSubtitle] = useState(0);
  const [showVietnamese, setShowVietnamese] = useState(true);
  const [explainSubtitle, setExplainSubtitle] = useState(null);
  const [generatingSubtitles, setGeneratingSubtitles] = useState(false);
  const [generateError, setGenerateError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      try {
        const res = await videosApi.getVideoById(id);
        const data = res?.data || res;
        if (data && (data.title || data.videoUrl)) setVideo(data);
      } catch (err) { console.warn('Failed to load video details:', err); }
      finally { setLoading(false); }
    };
    fetchVideo();
  }, [id]);

  if (loading) return (<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress color="primary" /></Box>);
  if (!video) return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 6, textAlign: 'center' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Không tìm thấy video bài học này.</Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/video')}>Quay lại danh sách video</Button>
    </Box>
  );

  const subtitles = (video.subtitles || []).map(normalizeSubtitle);
  const currentSub = subtitles[activeSubtitle] || subtitles[0];

  const handleSubtitleClick = (sub, idx) => {
    setActiveSubtitle(idx);
    const isSame = explainSubtitle && (explainSubtitle.korean || explainSubtitle.text_ko) === (sub.korean || sub.text_ko);
    setExplainSubtitle(isSame ? null : sub);
  };

  const handleGenerateSubtitles = async () => {
    setGeneratingSubtitles(true);
    setGenerateError(null);
    try {
      const res = await videosApi.generateSubtitles(video.id, 15);
      const updated = res?.data || res;
      if (updated && (updated.subtitles || updated.id)) {
        setVideo(updated);
        setActiveSubtitle(0);
      }
    } catch (err) {
      setGenerateError(err?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setGeneratingSubtitles(false);
    }
  };

  return (
    <Stack spacing={4}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/video')} sx={{ width: 'fit-content', color: 'text.secondary' }}>
        Quay lại danh sách video
      </Button>
      <Box>
        <Chip label={video.level || (video.topikLevel ? `TOPIK ${video.topikLevel}` : 'Video')} color="primary" size="small" sx={{ mb: 1, fontWeight: 700 }} />
        <Typography variant="h4" sx={{ fontWeight: 800 }}>{video.title} {video.koreanTitle || video.korean_title ? `(${video.koreanTitle || video.korean_title})` : ''}</Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Stack spacing={2.5}>
            <Paper elevation={0} sx={{ position: 'relative', paddingTop: '56.25%', borderRadius: '20px', overflow: 'hidden', bgcolor: '#000', border: 1, borderColor: 'divider' }}>
              <Box component="iframe" src={toEmbedUrl(video.videoUrl || video.url)} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} />
            </Paper>
            {currentSub && (
              <Card sx={{ border: 2, borderColor: 'primary.light', bgcolor: (theme) => theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151,63,105,0.12)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>Phụ đề hiện tại ({currentSub.startTime || currentSub.time || '00:00'})</Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Button id="ai-explain-current-btn" size="small" startIcon={<AutoAwesomeIcon sx={{ fontSize: 15 }} />} onClick={() => handleSubtitleClick(currentSub, activeSubtitle)} variant={explainSubtitle && (explainSubtitle.korean || explainSubtitle.text_ko) === (currentSub.korean || currentSub.text_ko) ? 'contained' : 'outlined'} color="primary" sx={{ borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, py: 0.3 }}>
                          AI phân tích
                        </Button>
                        <AudioPlayer text={currentSub.korean || currentSub.text_ko} />
                      </Stack>
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Pretendard' }}>{currentSub.korean || currentSub.text_ko}</Typography>
                    {showVietnamese && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{currentSub.vietnamese || currentSub.text_vi}</Typography>}
                    {currentSub.vocab?.length > 0 && (
                      <Box sx={{ pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>Từ vựng quan trọng:</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {currentSub.vocab.map((v, i) => (<Chip key={i} label={`📌 ${v}`} size="small" color="primary" sx={{ fontWeight: 600 }} />))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}
            {explainSubtitle && <AiExplainPanel subtitle={explainSubtitle} videoTitle={video.title} onClose={() => setExplainSubtitle(null)} />}
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}><MenuBookIcon color="primary" fontSize="small" /> Kịch bản & Phụ đề</Typography>
                <Button size="small" startIcon={showVietnamese ? <VisibilityOffIcon /> : <VisibilityIcon />} onClick={() => setShowVietnamese(!showVietnamese)} sx={{ fontSize: '0.75rem' }}>
                  {showVietnamese ? 'Ẩn nghĩa TV' : 'Hiện nghĩa TV'}
                </Button>
              </Stack>
              <Paper elevation={0} sx={{ p: 1.5, mb: 2, borderRadius: '10px', bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(151,63,105,0.06)' : 'rgba(151,63,105,0.12)', border: '1px dashed', borderColor: 'primary.light', display: 'flex', alignItems: 'center', gap: 1 }}>
                <LightbulbIcon sx={{ color: 'primary.main', fontSize: 16, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>Click vào câu để <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>AI phân tích ngữ pháp & từ vựng</Box></Typography>
              </Paper>
              {subtitles.length > 0 ? (
                <Stack spacing={1.5} sx={{ maxHeight: 480, overflowY: 'auto', pr: 0.5 }}>
                  {subtitles.map((sub, idx) => {
                    const isActive = activeSubtitle === idx;
                    const isExplaining = explainSubtitle && (explainSubtitle.korean || explainSubtitle.text_ko) === (sub.korean || sub.text_ko);
                    return (
                      <Paper key={idx} onClick={() => handleSubtitleClick(sub, idx)} elevation={0}
                        sx={{ p: 2, borderRadius: '12px', cursor: 'pointer', border: 1.5, borderColor: isExplaining ? 'primary.main' : isActive ? 'primary.light' : 'divider', bgcolor: isExplaining ? (theme) => theme.palette.mode === 'light' ? 'rgba(151,63,105,0.08)' : 'rgba(151,63,105,0.2)' : isActive ? (theme) => theme.palette.mode === 'light' ? '#fbf1f5' : 'rgba(151,63,105,0.15)' : 'background.paper', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.light', bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(151,63,105,0.04)' : 'rgba(151,63,105,0.1)' } }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>{sub.startTime || sub.time || `00:${String(idx * 5).padStart(2, '0')}`}</Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            {isExplaining && <Chip label="AI đang phân tích" size="small" color="primary" icon={<AutoAwesomeIcon sx={{ fontSize: '12px !important' }} />} sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />}
                            <AudioPlayer text={sub.korean || sub.text_ko} size="small" />
                          </Stack>
                        </Stack>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'Pretendard' }}>{sub.korean || sub.text_ko}</Typography>
                        {showVietnamese && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>{sub.vietnamese || sub.text_vi}</Typography>}
                      </Paper>
                    );
                  })}
                </Stack>
              ) : (
                <Stack spacing={2} sx={{ py: 2 }}>
                  {/* Hero banner */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3, borderRadius: '16px', textAlign: 'center',
                      background: (theme) => theme.palette.mode === 'light'
                        ? 'linear-gradient(135deg, rgba(151,63,105,0.06) 0%, rgba(194,84,125,0.06) 100%)'
                        : 'linear-gradient(135deg, rgba(151,63,105,0.15) 0%, rgba(194,84,125,0.15) 100%)',
                      border: '1.5px dashed', borderColor: 'primary.light',
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: 36, color: 'primary.main', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                      Chưa có phụ đề cho video này
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2, lineHeight: 1.6 }}>
                      Dùng <strong>Gemini AI</strong> để tự động tạo phụ đề song ngữ Hàn-Việt
                    </Typography>

                    {/* Feature bullets */}
                    <Stack spacing={1} sx={{ mb: 2.5, textAlign: 'left' }}>
                      {[
                        { icon: <GraphicEqIcon sx={{ fontSize: 15, color: 'primary.main' }} />, text: 'Phụ đề tiếng Hàn tự nhiên, đúng ngữ pháp' },
                        { icon: <TranslateIcon sx={{ fontSize: 15, color: 'primary.main' }} />, text: 'Dịch sang tiếng Việt chính xác' },
                        { icon: <LightbulbIcon sx={{ fontSize: 15, color: 'primary.main' }} />, text: 'Kèm từ vựng quan trọng trong từng câu' },
                      ].map((item, i) => (
                        <Stack key={i} direction="row" alignItems="center" spacing={1}>
                          {item.icon}
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.text}</Typography>
                        </Stack>
                      ))}
                    </Stack>

                    {/* Generate button */}
                    <Button
                      id="generate-subtitles-btn"
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={generatingSubtitles ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <AutoAwesomeIcon />}
                      onClick={handleGenerateSubtitles}
                      disabled={generatingSubtitles}
                      sx={{
                        borderRadius: '12px', fontWeight: 800, py: 1.2,
                        background: 'linear-gradient(135deg, #973f69 0%, #c2547d 100%)',
                        boxShadow: '0 4px 14px rgba(151,63,105,0.35)',
                        '&:hover': { boxShadow: '0 6px 20px rgba(151,63,105,0.5)' },
                        '&.Mui-disabled': { background: 'action.disabledBackground' },
                      }}
                    >
                      {generatingSubtitles ? 'AI đang tạo phụ đề...' : 'Tạo phụ đề AI (Hàn-Việt)'}
                    </Button>

                    {generateError && (
                      <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 1.5 }}>
                        {generateError}
                      </Typography>
                    )}
                  </Paper>

                  {/* Disclaimer */}
                  <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center', display: 'block', lineHeight: 1.5 }}>
                    Phụ đề được tạo bởi AI dựa trên tiêu đề và nội dung video.
                    Có thể không khớp 100% với âm thanh thực tế.
                  </Typography>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <AiChatPanel video={video} />
    </Stack>
  );
};
