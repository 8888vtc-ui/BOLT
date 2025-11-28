# GuruGammon Frontend

A stunning black and gold backgammon frontend that connects to the GuruGammon backend.

## Design

- **Pure Black Background (#000000)**: Elegant and modern dark theme
- **Pure Gold Accents (#FFD700)**: Premium feel with golden highlights
- **Subtle Backgammon Pattern**: Sophisticated background effects
- **Responsive**: Mobile-first design that works on all devices

## Features

### Authentication
- **Google OAuth**: One-click login via backend integration
- **Guest Mode**: Play instantly without registration
- **Auto Token Detection**: Seamlessly handles OAuth callback with token in URL
- **Secure Storage**: JWT tokens stored in localStorage

### Pages

#### Login Page (/)
- Massive "GuruGammon" title in gold
- "Continue with Google" button → redirects to `https://gurugammon.onrender.com/api/auth/google`
- "Play as Guest" button → creates guest account via backend
- Beautiful animated UI with dice icons and patterns

#### Dashboard (/dashboard)
- Welcome message with username
- User avatar (if available) or default icon
- Three action cards:
  - **New Game**: Start a backgammon match
  - **Join Tournament**: Enter competitive play
  - **My Profile**: View stats and settings
- Logout functionality
- Getting started guide

### API Integration

Connects directly to: `https://gurugammon.onrender.com`

Endpoints used:
- `POST /api/auth/guest` - Guest login
- `GET /api/user/profile` - Fetch user data
- `POST /api/auth/refresh` - Refresh JWT tokens

## Tech Stack

- **React 18** with TypeScript
- **Vite** for blazing fast builds
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment

Deployed on Vercel with automatic builds.

### Deploy to Vercel

1. Push to GitHub
2. Connect repo to Vercel
3. Deploy automatically

Or use Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Environment

No environment variables needed! The backend URL is hardcoded to production.

## Authentication Flow

### Google OAuth
1. User clicks "Continue with Google"
2. Redirects to `https://gurugammon.onrender.com/api/auth/google`
3. Backend handles Google OAuth
4. Backend redirects back with `?token=<jwt>` in URL
5. Frontend detects token, stores it, and navigates to dashboard

### Guest Mode
1. User clicks "Play as Guest"
2. Frontend calls `POST /api/auth/guest`
3. Backend creates temporary user and returns JWT
4. Frontend stores token and navigates to dashboard

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT
