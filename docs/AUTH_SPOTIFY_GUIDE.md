# SlowGuardian Authentication & Spotify Integration

This document covers the new MongoDB-based authentication system and Spotify API integration added to SlowGuardian v9.

## 🔐 MongoDB Authentication System

### Overview

SlowGuardian now includes a comprehensive authentication system using MongoDB for user management, session handling, and premium activation.

### Features

- **User Registration & Login**: Secure user account creation and authentication
- **Session Management**: JWT-based sessions with MongoDB storage
- **Premium Activation**: Premium key system with database tracking
- **Password Security**: Bcrypt hashing with salt rounds
- **Account Lockout**: Protection against brute force attacks
- **Multi-Device Management**: Track and manage sessions across devices

### Setup

1. **Install MongoDB** (Required for authentication features):
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # macOS with Homebrew
   brew install mongodb/brew/mongodb-community
   
   # Or use MongoDB Atlas cloud service
   ```

2. **Configure Environment Variables**:
   ```bash
   # Copy .env.example to .env and configure:
   MONGODB_URI=mongodb://localhost:27017
   JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production
   ```

3. **Start SlowGuardian**:
   ```bash
   npm start
   ```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout current session
- `POST /api/auth/logout-all` - Logout from all devices
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

#### Premium Management
- `POST /api/auth/activate-premium` - Activate premium with key
- `GET /api/auth/premium-status` - Check premium status

#### Session Management
- `GET /api/auth/sessions` - List user sessions
- `DELETE /api/auth/sessions/:id` - Remove specific session
- `POST /api/auth/validate` - Validate token

### Database Schema

#### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String, // bcrypt hashed
  firstName: String,
  lastName: String,
  role: String, // 'user', 'premium', 'admin'
  premiumStatus: {
    isPremium: Boolean,
    premiumKey: String,
    activatedAt: Date,
    expiresAt: Date
  },
  preferences: Object,
  loginAttempts: Number,
  lockUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Sessions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  username: String,
  email: String,
  role: String,
  isPremium: Boolean,
  createdAt: Date,
  expiresAt: Date,
  lastActivity: Date,
  ipAddress: String,
  userAgent: String
}
```

### Premium Keys

Default premium keys for testing:
- `TESTPREM` - 1 month premium access
- `PREMIUM1M` - 1 month premium access
- `PREMIUM1Y` - 12 months premium access

## 🎵 Spotify API Integration

### Overview

Integrated Spotify Web API allows users to connect their Spotify accounts and access playlists, saved music, and playback controls within SlowGuardian.

### Features

- **OAuth2 Authentication**: Secure Spotify account connection
- **Playlist Management**: Import and manage Spotify playlists
- **Music Search**: Search Spotify's music catalog
- **Current Track Info**: See what's currently playing
- **Saved Music**: Access user's saved tracks
- **Playlist Creation**: Create new playlists on Spotify

### Setup

1. **Create Spotify App** at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard):
   - Create new app
   - Note down Client ID and Client Secret
   - Add redirect URI: `http://localhost:8080/api/spotify/callback`

2. **Configure Environment Variables**:
   ```bash
   SPOTIFY_CLIENT_ID=your-spotify-client-id
   SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
   SPOTIFY_REDIRECT_URI=http://localhost:8080/api/spotify/callback
   ```

3. **Required Scopes**:
   - `user-read-private`
   - `user-read-email`
   - `playlist-read-private`
   - `playlist-read-collaborative`
   - `playlist-modify-public`
   - `playlist-modify-private`
   - `user-read-playback-state`
   - `user-modify-playback-state`
   - `user-read-currently-playing`
   - `user-library-read`
   - `user-library-modify`
   - `streaming`

### API Endpoints

#### Authentication
- `GET /api/spotify/auth` - Get authorization URL
- `GET /api/spotify/callback` - OAuth callback handler
- `GET /api/spotify/status` - Check connection status
- `POST /api/spotify/disconnect` - Disconnect Spotify

#### Music Data
- `GET /api/spotify/playlists` - Get user playlists
- `GET /api/spotify/playlists/:id/tracks` - Get playlist tracks
- `GET /api/spotify/search` - Search tracks
- `GET /api/spotify/saved-tracks` - Get saved tracks
- `GET /api/spotify/current-track` - Get current playing track

#### Playlist Management
- `POST /api/spotify/playlists` - Create new playlist
- `POST /api/spotify/playlists/:id/tracks` - Add tracks to playlist

### Usage in Frontend

```javascript
// Check if user is authenticated
const token = localStorage.getItem('authToken');

// Connect to Spotify
const response = await fetch('/api/spotify/auth', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { authUrl } = await response.json();
window.location.href = authUrl;

// Get user playlists
const playlists = await fetch('/api/spotify/playlists', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Database Storage

#### Spotify Tokens Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  accessToken: String,
  refreshToken: String,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 User Interface Integration

### Settings Page

The settings page now includes:

1. **Account Management Section**:
   - View user profile information
   - Manage active sessions
   - Logout from all devices
   - Change password (future feature)

2. **Premium Key Activation**:
   - Enter premium keys
   - View premium status and expiry
   - Animated activation feedback

3. **Spotify Integration**:
   - Connect/disconnect Spotify account
   - View connected account info
   - Access music features

### Login Page

- Clean, modern login/registration interface
- Form validation with helpful error messages
- Automatic redirection after successful authentication
- Token storage in localStorage

## 🔒 Security Features

### Authentication Security
- Password hashing with bcrypt (12 salt rounds)
- JWT tokens with expiration
- Rate limiting on authentication endpoints
- Account lockout after failed attempts
- Session invalidation on logout

### API Security
- Bearer token authentication
- Request validation with express-validator
- CORS configuration
- Helmet security headers
- Input sanitization

### Database Security
- MongoDB connection with authentication
- Indexed collections for performance
- Automatic session cleanup
- Encrypted token storage

## 🚀 Getting Started

1. **Clone and Install**:
   ```bash
   git clone https://github.com/zgr2575/SlowGuardian.git
   cd SlowGuardian
   npm install
   ```

2. **Setup Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB and Spotify credentials
   ```

3. **Start MongoDB** (if running locally):
   ```bash
   mongod --dbpath /path/to/your/db
   ```

4. **Start SlowGuardian**:
   ```bash
   npm start
   ```

5. **Access Application**:
   - Main app: http://localhost:8080
   - Login: http://localhost:8080/login
   - Settings: http://localhost:8080/settings

## 📚 Development

### Adding New Features

1. **Database Models**: Add to `src/models/`
2. **API Routes**: Add to `src/routes/`
3. **Middleware**: Add to `src/middleware/` or `src/auth/`
4. **Frontend**: Update HTML files in `static/`

### Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**:
   - Ensure MongoDB is running
   - Check connection string in .env
   - Verify network connectivity

2. **Spotify API Errors**:
   - Verify client credentials
   - Check redirect URI matches exactly
   - Ensure all required scopes are granted

3. **Authentication Not Working**:
   - Check JWT_SECRET is set
   - Verify token expiration
   - Clear localStorage and re-login

### Debug Mode

Set `NODE_ENV=development` for detailed logging and error messages.

## 📞 Support

For issues or questions:
- Create an issue on GitHub (https://github.com/SlowGuardian/SlowGuardian/issues)
- Documentation: Coming soon

---

**Note**: This system requires MongoDB and optionally Spotify API credentials. The application will function with limited features if these services are unavailable.