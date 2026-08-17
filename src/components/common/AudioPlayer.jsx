import React, { useState } from 'react';
import { IconButton, Tooltip, Box, CircularProgress } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

export const AudioPlayer = ({ text, audioUrl, size = 'small', color = 'primary' }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = (e) => {
    e.stopPropagation();
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      setIsPlaying(true);
      audio.play();
      audio.onended = () => setIsPlaying(false);
      return;
    }

    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.85;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Tooltip title="Nghe phát âm chuẩn">
      <IconButton
        size={size}
        color={color}
        onClick={handleSpeak}
        sx={{
          bgcolor: (theme) => (theme.palette.mode === 'light' ? 'rgba(151, 63, 105, 0.08)' : 'rgba(255, 107, 139, 0.15)'),
          transition: 'all 0.2s',
          ...(isPlaying && {
            animation: 'pulse 1s infinite',
            bgcolor: 'primary.light',
          }),
        }}
      >
        <VolumeUpIcon fontSize={size} />
      </IconButton>
    </Tooltip>
  );
};

export const SpeechRecorder = ({ onResult, size = 'medium' }) => {
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Google Chrome.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsRecording(false);
      if (onResult) onResult(transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  return (
    <Tooltip title={isRecording ? 'Đang lắng nghe... Bấm để dừng' : 'Ghi âm phát âm tiếng Hàn'}>
      <IconButton
        onClick={toggleRecording}
        size={size}
        sx={{
          bgcolor: isRecording ? 'error.main' : (theme) => theme.palette.mode === 'light' ? '#f0eee6' : '#2d2d2d',
          color: isRecording ? '#ffffff' : 'text.primary',
          '&:hover': {
            bgcolor: isRecording ? 'error.dark' : 'primary.light',
            color: isRecording ? '#ffffff' : 'primary.dark',
          },
          transition: 'all 0.2s',
        }}
      >
        {isRecording ? <MicOffIcon /> : <MicIcon />}
      </IconButton>
    </Tooltip>
  );
};
