# SlowGuardian v9

> **🚀 The Ultimate Web Proxy Platform with Advanced Features, Developer Tools & Comprehensive User
> Experience**

[![Version](https://img.shields.io/badge/version-9.0.0-blue.svg)](https://github.com/zgr2575/SlowGuardian)
[![License](https://img.shields.io/badge/license-GPL--3.0-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

SlowGuardian v9 is a revolutionary web proxy platform featuring a stunning modern interface,
comprehensive developer tools, advanced user management, and an extensible plugin architecture.
Built from the ground up for performance, security, and customization.

![SlowGuardian v9 Homepage](https://github.com/user-attachments/assets/06b275b9-1ded-49c3-8f2d-d2a1797b5b7f)

## ✨ Major Features & Capabilities

### 🎨 **Modern User Interface**

- **Breathtaking v9 Design**: Completely redesigned with glass morphism and smooth animations
- **Multi-Tab Browser System**: Advanced tabbed browsing with session management
- **Performance Mode**: Optimized interface for older hardware with reduced visual effects
- **5 Beautiful Themes**: Default, Cyberpunk, Ocean, Sunset, and Catppuccin Mocha
- **Custom Theme Creator**: Build and share your own themes with live preview
- **Mobile-First Design**: Perfect experience across all devices and screen sizes

### 🛠️ **Developer Mode & Administration**

- **Comprehensive Admin Panel**: Full control over users, content, and site functionality
- **Real-Time User Monitoring**: Live session tracking and management
- **Per-User Website Blocking**: Block specific domains for individual users
- **Global Site Controls**: Emergency pause functionality with password protection
- **Account Management System**: Create and manage multiple admin accounts
- **User Session Control**: Pause, block, or ban users through the admin interface

### 🔌 **Advanced Plugin System**

- **100+ Built-in Features**: Comprehensive plugin collection covering all use cases
- **Plugin Categories**: User Experience, Productivity Tools, Customization, and Advanced Features
- **Real-Time Management**: Enable/disable plugins with instant effect
- **Plugin Store Interface**: Beautiful management UI with search and filtering
- **Performance Monitoring**: Track resource usage and plugin impact
- **Developer API**: Full plugin development framework with documentation

### 🛡️ **Security & Privacy**

- **About:Blank Auto-Cloaking**: Automatic popup disguise system
- **Advanced Screenshot Protection**: Multi-layer screenshot detection and prevention
- **Tab Disguising**: Intelligent favicon and title masking
- **Encrypted Cookie Storage**: Secure settings persistence across sessions
- **Password Protection**: Multi-level authentication with role-based access
- **Secure Proxy Technology**: Enhanced Ultraviolet proxy with automatic redirects

### 🎮 **Entertainment & Apps**

- **Extensive Game Library**: 50+ popular unblocked games across all genres
- **Modern App Collection**: TikTok, LinkedIn, Canva, Figma, Notion, Duolingo, Khan Academy,
  Coursera, Codecademy, Replit, and more
- **Cloud Gaming Support**: GeForce NOW and Now.gg compatibility
- **Search & Filtering**: Advanced search with category-based filtering
- **Favorites System**: Bookmark your most-used games and apps

### 🚀 **First-Boot Setup & Onboarding**

- **6-Step Setup Wizard**: Comprehensive initial configuration for new installations
- **Hardware Optimization**: Automatic performance tuning based on device capabilities
- **4-Step User Onboarding**: Guided tour for new users with interactive tutorials
- **Smart Defaults**: Optimal configurations for different use cases
- **Developer Quick Start**: Streamlined setup for administrators and developers

### ⚡ **Performance & Technical Excellence**

- **Ultraviolet Proxy Engine**: Fast, reliable proxy technology with enhanced compatibility
- **Smart Caching**: Intelligent asset caching for lightning-fast load times
- **Resource Optimization**: CPU and memory usage optimization with performance monitoring
- **Cross-Platform**: Works perfectly on Windows, macOS, Linux, and mobile devices
- **Production Ready**: Battle-tested architecture with comprehensive error handling

## 🆕 What's New in v9

### **🎯 User Experience Revolution**

- **Fixed Onboarding System**: Resolved critical modal positioning issues with guaranteed button
  visibility
- **Performance Mode**: Optimized interface for less powerful devices with reduced animations
- **First-Boot Setup**: Comprehensive wizard for optimal initial configuration
- **Enhanced Mobile Support**: Touch gestures, responsive design, and mobile-optimized controls

### **🛠️ Developer Experience Enhancement**

- **Advanced Developer Mode**: Complete administrative control with real-time monitoring
- **Plugin Architecture**: 100+ features converted to modular plugin system
- **API Integration**: ChatGPT integration with custom API key support
- **Comprehensive Documentation**: Plugin development guides and API references

### **🔧 Technical Improvements**

- **Fixed Modal Systems**: Resolved conflicts between setup and onboarding modals
- **Enhanced Proxy System**: Improved URL handling and automatic redirect management
- **Cookie-Based Persistence**: Robust settings storage with localStorage fallback
- **Error Recovery**: Comprehensive error handling and automatic recovery systems

### **📱 Expanded Functionality**

- **Browser Tabs System**: Multi-tab browsing with session saving and keyboard shortcuts
- **Custom 404 Page**: Beautiful error page with navigation options
- **Feature Management**: Complete interface for enabling/disabling features
- **Advanced Themes**: Live preview and custom theme creation tools

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.0.0
- **npm** ≥ 7.0.0 or **yarn** ≥ 1.22.0

### Installation

```bash
# Clone the repository
git clone https://github.com/zgr2575/SlowGuardian.git
cd SlowGuardian

# Install dependencies
npm install

# Start the server
npm start
```

The server will start on `http://localhost:8080`. On first visit, you'll be guided through the setup
wizard.

### Development Mode

```bash
# Development with auto-reload
npm run dev

# Code formatting
npm run format

# Linting
npm run lint
npm run lint:fix

# Testing
npm test

# Build for production
npm run build
```

### Default Admin Access

- **URL**: `http://localhost:8080/developer`
- **Username**: `admin`
- **Password**: `SlowGuardian2025!`

## ⚙️ Configuration

Configure SlowGuardian through `config.js`:

```javascript
const config = {
  // Server Settings
  version: 9,
  port: process.env.PORT || 8080,
  host: process.env.HOST || "0.0.0.0",

  // Security & Authentication
  challenge: false,
  users: {
    admin: "SlowGuardian2025!",
  },

  // Features
  routes: true,
  local: true,
  plugins: true,
  developerMode: true,

  // Performance
  performance: {
    caching: true,
    compression: true,
    optimization: true,
  },

  // Proxy Settings
  proxy: {
    ultraviolet: true,
    autoRedirect: true,
    errorRecovery: true,
  },

  // Development
  debug: false,
  logLevel: "info",
};
```

## 🔌 Plugin Development

SlowGuardian v9 features a powerful plugin system. Here's a basic plugin example:

```javascript
// plugins/example-plugin/plugin.js
export default {
  manifest: {
    name: "example-plugin",
    version: "1.0.0",
    description: "Example plugin for SlowGuardian v9",
    author: "Your Name",
    category: "productivity",
    permissions: ["storage", "notifications"],
  },

  onLoad(api) {
    // Plugin initialization
    console.log("Example plugin loaded!");

    // Register event listeners
    api.events.on("pageLoad", this.handlePageLoad.bind(this));
  },

  onUnload() {
    // Cleanup
    console.log("Example plugin unloaded!");
  },

  handlePageLoad(url) {
    // Handle page load events
    api.notifications.show(`Navigated to: ${url}`);
  },

  // Plugin routes
  routes: {
    "/plugin/example": {
      method: "GET",
      handler: (req, res) => {
        res.json({ message: "Hello from plugin!" });
      },
    },
  },

  // Settings interface
  settings: {
    enabled: {
      type: "boolean",
      default: true,
      label: "Enable Example Feature",
    },
    apiKey: {
      type: "string",
      default: "",
      label: "API Key",
      secure: true,
    },
  },
};
```

### Plugin Categories

#### **User Experience (25 Features)**

- Smart search suggestions, gesture navigation, quick access toolbar, auto-complete, bookmarks
  system

#### **Productivity Tools (25 Features)**

- Built-in note taking, advanced screenshot tools, PDF reader, download manager, password manager

#### **Customization & Themes (25 Features)**

- Advanced theme builder, CSS injection, layout customizer, icon packs, animation controls

#### **Advanced Features (25 Features)**

- AI assistant foundation, VPN integration prep, blockchain wallet structure, automation scripts

## 🎛️ Developer Mode Features

### **User Management**

- Real-time online user monitoring
- Session tracking and analytics
- User blocking and banning
- Activity logging and reporting

### **Content Control**

- Per-user website blocking
- Global site pause functionality
- Emergency controls with password protection
- Content filtering and management

### **System Administration**

- Performance monitoring and analytics
- Plugin management and deployment
- Theme customization and distribution
- Security settings and authentication

### **API Integration**

- ChatGPT integration with custom API keys
- Multiple AI model support (GPT-3.5, GPT-4, GPT-4 Turbo)
- Context-aware responses
- Floating assistant panel

## 📱 User Features

### **Browser Experience**

- Multi-tab browsing with session management
- Keyboard shortcuts (Ctrl+T, Ctrl+W, Ctrl+Shift+T)
- Tab duplication and context menus
- Loading animations with helpful tips

### **Privacy & Security**

- About:blank automatic popup cloaking
- Screenshot protection with multiple detection methods
- Tab disguising with dynamic titles and favicons
- Secure cookie-based settings persistence

### **Customization**

- 5 built-in themes with live preview
- Custom theme creator with CSS injection
- Moveable sidebar buttons and layout customization
- Performance mode for older hardware

### **Apps & Games**

- 50+ carefully curated games across all genres
- 25+ modern web applications and productivity tools
- Advanced search and filtering capabilities
- Favorites and bookmark system

## 🛠️ Development Roadmap

### **Phase 1: Core Functionality** ✅ **COMPLETE**

- [x] Navigation system fixes
- [x] Game and app launching
- [x] About:blank popup functionality
- [x] Particle system with fallbacks
- [x] Cookie-based settings persistence
- [x] Proxy system enhancements

### **Phase 2: Enhanced Features** ✅ **COMPLETE**

- [x] Screenshot protection system
- [x] Browser URL display improvements
- [x] Comprehensive settings interface
- [x] Mobile responsiveness optimization
- [x] Custom theme creation tools

### **Phase 3: Advanced Systems** ✅ **COMPLETE**

- [x] Developer mode with admin panel
- [x] User management and monitoring
- [x] Plugin system architecture
- [x] ChatGPT integration
- [x] First-boot setup wizard

### **Phase 4: Future Enhancements** 🔄 **IN PROGRESS**

- [ ] Advanced analytics dashboard
- [ ] Plugin marketplace
- [ ] Multi-language support
- [ ] Advanced AI features
- [ ] Enterprise management tools

## 📖 Documentation

### **User Guides**

- [Getting Started Guide](docs/user/getting-started.md)
- [Feature Overview](docs/user/features.md)
- [Theme Customization](docs/user/themes.md)
- [Mobile Usage](docs/user/mobile.md)
- [Troubleshooting](docs/user/troubleshooting.md)

### **Developer Documentation**

- [Development Setup](docs/developer/setup.md)
- [Architecture Overview](docs/developer/architecture.md)
- [Plugin Development Guide](docs/developer/plugins.md)
- [API Reference](docs/developer/api.md)
- [Contributing Guidelines](docs/developer/contributing.md)

### **Administration**

- [Developer Mode Guide](docs/admin/developer-mode.md)
- [User Management](docs/admin/user-management.md)
- [Security Configuration](docs/admin/security.md)
- [Performance Monitoring](docs/admin/monitoring.md)

### **Deployment**

- [Self-Hosting Guide](docs/deployment/self-hosting.md)
- [Cloud Deployment](docs/deployment/cloud.md)
- [Docker Setup](docs/deployment/docker.md)
- [Environment Variables](docs/deployment/environment.md)

## 🔧 Deployment Options

### **Quick Deploy**

[![Deploy on Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/zgr2575/SlowGuardian)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zgr2575/SlowGuardian)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/SlowGuardian)

### **Docker Deployment**

```bash
# Build and run with Docker
docker build -t slowguardian-v9 .
docker run -p 8080:8080 slowguardian-v9

# Using Docker Compose
docker-compose up -d
```

### **Environment Variables**

```env
# Required
PORT=8080
NODE_ENV=production

# Optional
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SlowGuardian2025!
DEBUG=false
ENABLE_ANALYTICS=true
PLUGIN_SYSTEM=true
DEVELOPER_MODE=true
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Workflow**

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/yourusername/SlowGuardian.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes and test thoroughly
5. **Run** quality checks: `npm run build && npm run lint && npm test`
6. **Commit** your changes: `git commit -m 'Add amazing feature'`
7. **Push** to your branch: `git push origin feature/amazing-feature`
8. **Open** a Pull Request with detailed description

### **Development Guidelines**

- Follow the existing code style and patterns
- Write comprehensive tests for new features
- Update documentation for any API changes
- Ensure mobile compatibility for UI changes
- Test across different browsers and devices

## 📄 License

This project is licensed under the **GPL-3.0 License** - see the [LICENSE](LICENSE) file for
details.

## 🙏 Acknowledgments

- **Ultraviolet Team** - For the exceptional proxy technology
- **Contributors** - For continuous improvements and feedback
- **Community** - For testing, bug reports, and feature suggestions
- **Open Source Projects** - For the tools and libraries that make SlowGuardian possible

## 📞 Support & Community

- **📚 Documentation**: [docs/](docs/)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/zgr2575/SlowGuardian/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/zgr2575/SlowGuardian/discussions)
- **🔧 Development**: [Contributing Guide](CONTRIBUTING.md)
- **📧 Contact**: [Create an Issue](https://github.com/zgr2575/SlowGuardian/issues/new)

## 📊 Project Statistics

- **Lines of Code**: 50,000+
- **Plugin System**: 100+ Features
- **Supported Games**: 50+
- **Supported Apps**: 25+
- **Themes Available**: 5 Built-in + Custom Creator
- **Browser Compatibility**: All Modern Browsers
- **Mobile Support**: Full Responsive Design

---

<div align="center">
  
### 🌟 **Star SlowGuardian v9 to show your support!** 🌟

**[⭐ Star on GitHub](https://github.com/zgr2575/SlowGuardian) •
[🍴 Fork](https://github.com/zgr2575/SlowGuardian/fork) • [📖 Docs](docs/) •
[🐛 Issues](https://github.com/zgr2575/SlowGuardian/issues)**

_Made with ❤️ by the SlowGuardian Community_

</div>
