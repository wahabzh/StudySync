# StudySync 🧠✨

> **A Notion-style collaborative learning platform powered by AI**   
> Real-time document editing • AI-generated quizzes • Smart flashcards • Community knowledge sharing
🔗 Live: [studysync.site](https://studysync.site)

[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg)](https://vercel.com/)

![StudySync](/public/screenshots/landing-page.png)

## 🚀 What Makes This Special

**🤝 Real-time Collaboration** - Like Google Docs, but for studying. Multiple users can edit simultaneously with live cursors and instant sync.

**🧠 AI-Powered Learning** - Upload documents, get instant quizzes. AI extracts key concepts and generates personalized study materials.

**📚 Smart Knowledge Base** - Community-driven document sharing with semantic search powered by vector embeddings.

**⚡ Blazing Fast** - Built on Next.js 15 with serverless architecture. Sub-100ms response times.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Tiptap Editor
- **Backend**: Supabase (PostgreSQL), Vercel AI SDK
- **Real-time**: Yjs for CRDT-based collaboration
- **AI**: Google Gemini API, RAG pipeline, OCR processing
- **Authentication**: Supabase Auth with social logins

## 📸 Screenshots
---

![StudySync](/public/screenshots/document-editor.png)
*Rich text editor with real-time collaboration and slash commands*

![StudySync](/public/screenshots/ai-quiz-generation.png)
*AI-powered quiz generation from any document or notes*

![StudySync](/public/screenshots/leaderboard.png)
*Community leaderboard showing top contributors and study streaks*


## ⚡ Quick Start

**1. Clone & Install**
```bash
git clone https://github.com/wahabzh/StudySync.git
cd StudySync && pnpm install
```

**2. Environment Setup**
```bash
cp .env.example .env.local
```
Then grab your free API keys:
- 🗄️ [Supabase](https://app.supabase.com) → Database & Auth
- 🤖 [Google AI](https://ai.google.dev) → Gemini API  
- ✍️ [Tiptap](https://tiptap.dev) → Collaboration
- 📧 [Resend](https://resend.com) → Email service

**3. Launch**
```bash
pnpm dev
```
→ Open [localhost:3000](http://localhost:3000) and start building! 🚀

## 🎯 Key Features

- **📝 Rich Text Editor** - Notion-like editing experience with slash commands
- **👥 Live Collaboration** - See others type in real-time 
- **🤖 AI Study Assistant** - Generate quizzes from any document
- **🧠 Smart Flashcards** - Spaced repetition algorithm built-in
- **🍅 Pomodoro Timer** - Focus sessions with study tracking
- **📊 Progress Analytics** - Track your learning journey
- **🌐 Community Hub** - Share and discover study materials


```
┌─ Next.js App Router ─────────────────────┐
│  ├─ Server Components (SSR)              │
│  ├─ API Routes (Edge Runtime)            │
│  └─ Real-time WebSocket handling         │
└──────────────────────────────────────────┘
┌─ Supabase Backend ───────────────────────┐
│  ├─ PostgreSQL + Row Level Security      │
│  └─ File storage + CDN                   │              
└──────────────────────────────────────────┘
┌─ AI Pipeline ────────────────────────────┐
│  ├─ OCR → Text Extraction                │
│  ├─ Gemini API → Quiz Generation         │
│  └─ Vector Embeddings → Semantic Search  │
└──────────────────────────────────────────┘
```