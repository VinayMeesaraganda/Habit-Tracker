# Professional Habit Tracker

A modern, mobile-first habit tracking application built with **React**, **TypeScript**, **Vite**, and **Supabase**. This application is designed to be a complete replacement for Excel-based habit trackers, offering robust analytics, secure cloud sync, and a premium user experience.

## ✨ Features

-   **Mobile-First Design**: Fully responsive interface with a dense, app-like feel on mobile devices.
-   **Cross-Platform**: Works seamlessly on Desktop (Matrix View) and Mobile (Card View).
-   **Authentication**: Secure Sign-up, Sign-in, and Password Management via Supabase Auth.
-   **Real-time Sync**: Habits and logs are synced instantly across all your devices.
-   **Analytics**:
    -   Combined Weekly/Monthly performance cards.
    -   Interactive charts (Completion consistency, Category breakdown).
    -   Visual progress rings.
-   **Offline Capable**: (PWA ready architecture).

---

## 🛠 Tech Stack

-   **Frontend**: React 18, TypeScript, Vite
-   **Styling**: Tailwind CSS (Custom Design System, no external UI component libraries)
-   **Icons**: Lucide React
-   **Charts**: Recharts
-   ** Backend**: Supabase (PostgreSQL, Auth, Realtime)

---

## 🚀 Getting Started

### Prerequisites

1.  **Node.js**: v16 or higher (`node -v` to check).
2.  **Supabase Account**: Create a free project at [supabase.com](https://supabase.com).

### 1. Clone the Repository

```bash
git clone https://github.com/VinayMeesaraganda/Habit-Tracker.git
cd Habit-Tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory. You can use the example file:

```bash
cp .env.example .env
```

Open `.env` and paste your Supabase keys (Found in Project Settings -> API):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Database Setup

1.  Go to your **Supabase Dashboard** -> **SQL Editor**.
2.  Copy the content of [supabase_security_schema.sql](./supabase_security_schema.sql).
3.  Run the query. This one-click script will:
    -   Create the `habits` and `habit_logs` tables (if they don't exist).
    -   Enable **Row Level Security (RLS)**.
    -   Create policies ensuring users can only access their own data.

### 5. Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

The output will be in the `dist/` directory, ready to be deployed to Vercel, Netlify, or any static host.

### Deployment Checklist

Refer to [PRODUCTION_checklist.md](./production_checklist.md) found in the docs (artifacts) for a detailed pre-flight check.

---

## 🤝 Contributing

1.  Fork the repo
2.  Create your feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add some amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License.
