# Habit Tracker - Project Documentation

## Overview
A modern, mobile-first Progressive Web App (PWA) for tracking daily and weekly habits with comprehensive analytics.

## Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts
- **Icons**: Lucide React
- **PWA**: vite-plugin-pwa

## Project Structure
```
habit-tracker/
├── src/
│   ├── components/        # React components
│   ├── context/          # State management (HabitContext)
│   ├── lib/              # Supabase client & utilities
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Analytics & helper functions
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── .env                  # Environment variables (Supabase keys)
└── index.html            # HTML entry point
```

## Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Installation
```bash
npm install
```

## Development
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

## Build for Production
```bash
npm run build
npm run preview  # Preview production build
```

## Database Setup
See `supabase_setup.md` for complete Supabase configuration instructions.

## Features
- ✅ Daily & Weekly habit tracking
- ✅ Category-based organization
- ✅ Monthly goal setting
- ✅ Real-time analytics & charts
- ✅ Calendar view with completion indicators
- ✅ Cross-device sync via Supabase
- ✅ Secure authentication
- ✅ Mobile-first responsive design
- ✅ PWA support (installable on mobile)

## Architecture
- **Authentication**: Supabase Auth (email/password, OAuth)
- **Database**: PostgreSQL with Row Level Security
- **State Management**: React Context API
- **Real-time Sync**: Supabase real-time subscriptions
- **Analytics**: Client-side computation matching Excel formulas

## Security
- Row Level Security (RLS) ensures users only access their own data
- Environment variables for API keys
- HTTPS enforced in production
- SQL injection prevention via Supabase client

## Performance
- Code splitting with React.lazy
- Optimized re-renders with useMemo/useCallback
- Database indexes on user_id, habit_id, date
- PWA caching for offline support

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License
Private project

## Maintenance
- Update dependencies: `npm update`
- Check for security issues: `npm audit`
- Database backups: Automatic via Supabase
