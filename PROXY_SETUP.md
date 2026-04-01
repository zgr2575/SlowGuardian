# SlowGuardian Dual Proxy System

SlowGuardian now supports two proxy systems for different user tiers:

## Proxy Systems

### 1. Ultraviolet (All Users)
- **URL Prefix**: `/a/`
- **Access**: Available to all users
- **Repository**: https://github.com/titaniumnetwork-dev/Ultraviolet
- **Status**: ✅ Always enabled

### 2. Scramjet (Premium Users Only)
- **URL Prefix**: `/scram/`
- **Access**: Premium users only (requires `sg_premium=1` cookie)
- **Repository**: https://github.com/MercuryWorkshop/scramjet
- **Status**: ✅ Enabled for premium users

## Setup

### Automatic Setup (Recommended)
When you run `npm install`, the Scramjet files are automatically set up via the `postinstall` script.

### Manual Setup
If you need to manually set up Scramjet:

```bash
npm run setup:scramjet
```

This copies the necessary Scramjet files from `node_modules/@mercuryworkshop/scramjet` to `static/scram/`.

## Premium User Detection

The service worker checks for the `sg_premium` cookie to determine if a user has premium access:

- **Premium users** (`sg_premium=1`): Can access both `/scram/` and `/a/` proxies
- **Non-premium users**: Can only access `/a/` proxy
- If a non-premium user tries to access `/scram/`, they are automatically redirected to `/a/`

## Service Worker Architecture

The service worker (`static/sw.js`) handles routing for all proxy systems:

1. **Dynamic** (`/dy/`) - Base proxy system
2. **Scramjet** (`/scram/`) - Premium only, loaded conditionally
3. **Ultraviolet** (`/a/`) - Available to all users

```javascript
// Premium detection
function isPremiumUser(request) {
  const cookies = request.headers.get('cookie') || '';
  return cookies.includes('sg_premium=1');
}
```

## File Structure

```
static/
├── scram/                    # Scramjet files (gitignored, built on install)
│   ├── config.js
│   ├── scramjet.worker.js
│   ├── scramjet.client.js
│   └── scramjet.codecs.js
├── m/                        # Ultraviolet files
│   ├── config.js
│   ├── bundle.js
│   ├── handler.js
│   └── sw.js
└── sw.js                     # Main service worker with dual proxy support
```

## External Scripts

The service worker is configured to NOT intercept external scripts (AdSense, Analytics, Cookie Consent):

```javascript
// Don't intercept external requests - let browser handle them
if (url.origin !== location.origin) {
  return; // Browser handles it naturally
}
```

## Testing

To verify both proxies are working:

1. **Test Ultraviolet** (all users):
   - Navigate to: `http://localhost:8080/a/hvtrs8%2F-gmoelg.aoo%2F`

2. **Test Scramjet** (premium only):
   - Set cookie: `sg_premium=1`
   - Navigate to: `http://localhost:8080/scram/[encoded-url]`

## Troubleshooting

### Scramjet files not found
Run the setup script manually:
```bash
npm run setup:scramjet
```

### Service worker not loading Scramjet
Check browser console for errors. Scramjet will log:
- `✓ Scramjet loaded for premium users` - Success
- `⚠ Scramjet not available` - Failed to load (will fallback to UV only)

### Non-premium user trying to access Scramjet
Users without `sg_premium=1` cookie will be automatically redirected to Ultraviolet.

## Development

When developing, ensure:
1. Run `npm install` to set up all dependencies
2. The `static/scram/` directory is automatically created
3. Check that all proxy files are accessible (should return 200):
   - `/sw.js`
   - `/m/config.js`
   - `/scram/config.js`
   - `/scram/scramjet.worker.js`

## Production Deployment

For production:
1. Ensure `npm install` runs during deployment
2. The postinstall script will automatically set up Scramjet
3. Verify both proxies are accessible
4. Configure premium user authentication as needed
