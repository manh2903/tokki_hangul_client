# Tokki Hangul — FE Client (Material UI / MUI)

Dự án Frontend Client cho học viên hệ thống **Tokki Hangul**, được xây dựng đồng nhất công nghệ với **FE-Admin** bằng **Material UI (MUI v5)**.

## 🚀 Công nghệ sử dụng (Tech Stack)

- **Core**: React 18 + Vite (SPA)
- **UI Framework**: `@mui/material` (MUI v5) + `@mui/icons-material` + `@emotion/react` + `@emotion/styled`
- **Theme & Palette**: Hệ thống Theme Tokki Hangul đồng nhất với Admin (hỗ trợ Light / Dark mode, font `Plus Jakarta Sans` & `Noto Sans KR`)
- **Routing**: React Router DOM v6
- **Server State**: TanStack Query (React Query v5)
- **Networking**: Axios instance cấu hình sẵn JWT Interceptor, tự động Refresh Token và bộ Mock Data
- **Voice & Speech**: Web Speech API tích hợp trong các component MUI (`AudioPlayer`, `SpeechRecorder`)

---

## 📁 Cấu trúc thư mục (`src/`)

```text
src/
├── api/              # Axios client, interceptors, auth/learning endpoints
├── theme/
│   └── theme.js      # Cấu hình MUI Theme (palette, typography, component overrides)
├── contexts/
│   ├── AuthContext.jsx   # State xác thực, JWT, user streak & exp
│   └── ThemeContext.jsx  # MUI ThemeProvider & CssBaseline (Light / Dark mode)
├── components/
│   ├── common/       # AudioPlayer, SpeechRecorder, Card, Badge, ProgressBar, Button (MUI)
│   └── layout/       # Navbar (AppBar), Sidebar (Drawer/List), MobileNav (BottomNavigation), MainLayout, AuthLayout
├── pages/
│   ├── Home/         # Dashboard MUI Grid, Streak, AI Daily Recommendation
│   ├── Auth/         # LoginPage, RegisterPage (MUI TextField, Alert, Stack)
│   ├── Onboarding/   # GoalSelection, PlacementTest, PathPreview (MUI Stepper/Cards)
│   ├── Topik/        # TopikHub, TopikLesson (MUI LinearProgress, Cards, Exercises)
│   ├── Conversation/ # ConversationHub, DialoguePractice, RoleplayChat (MUI Paper, Avatar, Speech)
│   ├── Video/        # VideoHub, VideoWatch (MUI CardMedia, dual bilingual script)
│   ├── AiTutor/      # AiTutorHub, AiChat (MUI Message Stream), EssayCorrection
│   ├── Review/       # ReviewHub, FlashcardDeck (MUI 3D/Flip cards, SRS), Games
│   ├── Progress/     # ProgressReport (MUI Skill breakdown, AI periodic report)
│   └── Profile/      # ProfilePage (MUI Avatar, stats, account settings)
├── routes/
│   ├── AppRoutes.jsx      # Toàn bộ route tree
│   └── ProtectedRoute.jsx # Route guard cho trang học viên
└── utils/
    └── mockData.js        # Dữ liệu mẫu toàn diện cho tất cả các tính năng
```

---

## 🛠️ Hướng dẫn khởi chạy

1. **Cài đặt thư viện**:
   ```bash
   cd fe-client
   npm install
   ```

2. **Chạy Dev Server**:
   ```bash
   npm run dev
   ```
   Ứng dụng mở tại: `http://localhost:3000`
