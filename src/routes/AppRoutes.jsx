import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { LandingPage } from '@/pages/Landing/LandingPage';
import { HomePage } from '@/pages/Home/HomePage';
import { LoginPage } from '@/pages/Auth/LoginPage';
import { RegisterPage } from '@/pages/Auth/RegisterPage';
import { GoalSelectionPage } from '@/pages/Onboarding/GoalSelectionPage';
import { PlacementTestPage } from '@/pages/Onboarding/PlacementTestPage';
import { PathPreviewPage } from '@/pages/Onboarding/PathPreviewPage';
import { TopikHubPage } from '@/pages/Topik/TopikHubPage';
import { TopikLessonPage } from '@/pages/Topik/TopikLessonPage';
import { ConversationHubPage } from '@/pages/Conversation/ConversationHubPage';
import { DialoguePracticePage } from '@/pages/Conversation/DialoguePracticePage';
import { RoleplayPage } from '@/pages/Conversation/RoleplayPage';
import { VideoHubPage } from '@/pages/Video/VideoHubPage';
import { VideoWatchPage } from '@/pages/Video/VideoWatchPage';
import { AiTutorHubPage } from '@/pages/AiTutor/AiTutorHubPage';
import { AiChatPage } from '@/pages/AiTutor/AiChatPage';
import { EssayCorrectionPage } from '@/pages/AiTutor/EssayCorrectionPage';
import { ReviewHubPage } from '@/pages/Review/ReviewHubPage';
import { FlashcardDeckPage } from '@/pages/Review/FlashcardDeckPage';
import { GamesPage } from '@/pages/Review/GamesPage';
import { ProgressReportPage } from '@/pages/Progress/ProgressReportPage';
import { ProfilePage } from '@/pages/Profile/ProfilePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 3. Main Application with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/app" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        
        {/* Onboarding & AI Path */}
        <Route path="/onboarding/goal" element={<GoalSelectionPage />} />
        <Route path="/onboarding/placement-test" element={<PlacementTestPage />} />
        <Route path="/onboarding/path-preview" element={<PathPreviewPage />} />

        {/* TOPIK */}
        <Route path="/topik" element={<TopikHubPage />} />
        <Route path="/topik/lesson/:id" element={<TopikLessonPage />} />

        {/* Conversation & Roleplay */}
        <Route path="/conversation" element={<ConversationHubPage />} />
        <Route path="/conversation/dialogue/:id" element={<DialoguePracticePage />} />
        <Route path="/conversation/roleplay" element={<RoleplayPage />} />

        {/* Video Learning */}
        <Route path="/video" element={<VideoHubPage />} />
        <Route path="/video/:id" element={<VideoWatchPage />} />

        {/* AI Tutor */}
        <Route path="/ai-tutor" element={<AiTutorHubPage />} />
        <Route path="/ai-tutor/chat" element={<AiChatPage />} />
        <Route path="/ai-tutor/essay" element={<EssayCorrectionPage />} />

        {/* Review & SRS Games */}
        <Route path="/review" element={<ReviewHubPage />} />
        <Route path="/review/flashcards" element={<FlashcardDeckPage />} />
        <Route path="/review/games" element={<GamesPage />} />

        {/* Progress & Profile */}
        <Route path="/progress" element={<ProgressReportPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
