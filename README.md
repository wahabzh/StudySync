# StudySync 📚

A modern collaborative learning platform built with cutting-edge technologies:
- Next.js 15
- TypeScript 
- Tailwind CSS
- Supabase

## 🚀 Getting Started

### Prerequisites

- Node.js v18.17 or higher
- PNPM package manager

### Setup Instructions

1. **Install PNPM** (if not already installed)
   ```bash
   npm install -g pnpm
   ```

2. **Clone and Navigate**
   ```bash
   git clone https://github.com/wahabzh/StudySync.git
   cd StudySync
   ```

3. **Install Dependencies**
   ```bash
   pnpm install
   ```

4. **Configure Environment**
   
   Create a `.env.local` file in the root directory:
   ```bash
   # Supabase Configuration
   # Get these from: https://app.supabase.com/project/_/settings/api
   NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```

5. **Launch Development Server**
   ```bash
   pnpm dev
   ```

6. **Open the App**
   
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)