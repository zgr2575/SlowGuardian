# Getting Started with SlowGuardian v9

Welcome to SlowGuardian v9! This guide will help you get up and running quickly.

## Installation

### System Requirements

- **Node.js** 18.0.0 or higher
- **npm** 7.0.0 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Quick Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/zgr2575/SlowGuardian.git
   cd SlowGuardian
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the server**

   ```bash
   npm start
   ```

4. **Open your browser** Navigate to `http://localhost:8080`

## First Use

### Accessing SlowGuardian

Once the server is running, you'll see the SlowGuardian homepage with:

- A beautiful starfield background
- Search bar for entering URLs
- Navigation to Games, Apps, and Settings

### Basic Navigation

- **Home** - Main search interface
- **Games** - Collection of unblocked games
- **Apps** - Web applications and tools
- **Settings** - Customization options

### Using the Proxy

1. Enter any URL in the search bar
2. Click search or press Enter
3. Browse securely through SlowGuardian's proxy

## Configuration

### Basic Settings

Edit `config.js` to customize your installation:

```javascript
const config = {
  port: 8080, // Server port
  challenge: false, // Password protection
  routes: true, // Enable frontend
  local: true, // Local asset serving
  plugins: true, // Plugin system
};
```

### Password Protection

To enable password protection:

1. Set `challenge: true` in config.js
2. Add users to the `users` object:
   ```javascript
   users: {
     "admin": "securepassword",
     "user": "password123"
   }
   ```

## Troubleshooting

### Common Issues

**Server won't start**

- Check if port 8080 is available
- Ensure Node.js version is 18.0.0+
- Run `npm install` again

**Sites won't load**

- Check your internet connection
- Try a different website
- Clear browser cache

**Performance issues**

- Check server resources
- Reduce concurrent connections
- Update to latest version

### Getting Help

- Check the [Troubleshooting Guide](troubleshooting.md)
- Visit [GitHub Issues](https://github.com/zgr2575/SlowGuardian/issues)
- Join our community discussions

## Next Steps

- Explore [Features Overview](features.md)
- Learn about [Themes & Customization](themes.md)
- Set up [Development Environment](../developer/setup.md)
