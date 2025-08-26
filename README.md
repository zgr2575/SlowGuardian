# SlowGuardian v9

> **🚀 A powerful, modern web proxy with breathtaking UI and extensible plugin system**

[![Version](https://img.shields.io/badge/version-9.0.0-blue.svg)](https://github.com/zgr2575/SlowGuardian)
[![License](https://img.shields.io/badge/license-GPL--3.0-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

SlowGuardian v9 is a complete rewrite featuring improved readability, maintainability, modern UI design, and a powerful plugin system for ultimate customization.

![SlowGuardian Preview](https://github.com/zgr2575/SlowGuardian/assets/62474113/4b9ddea2-45b3-459c-b43f-64755f81547c)

## ✨ Features

### 🎨 **Modern UI/UX**
- **Breathtaking Design**: Completely redesigned interface with modern aesthetics
- **Responsive Layout**: Perfect experience across all devices
- **Multiple Themes**: Customizable appearance with built-in theme system
- **Accessibility**: WCAG compliant for inclusive web access

### 🛡️ **Privacy & Security**
- **About:Blank Cloaking**: Hide activity from prying eyes
- **Tab Cloaking**: Disguise as legitimate websites
- **Password Protection**: Optional authentication system
- **Secure Proxy**: Advanced Ultraviolet proxy technology

### 🎮 **Entertainment**
- **Extensive Game Library**: Wide collection of unblocked games
- **App Collection**: Popular web applications and tools
- **Cloud Gaming**: GeForce NOW and Now.gg support (fully compatible)
- **Emulators**: Retro gaming experience

### 🔧 **Developer Features**
- **Plugin System**: Extensible architecture for custom functionality
- **Modern Codebase**: Clean, maintainable TypeScript-ready code
- **API Endpoints**: RESTful API for integrations
- **Documentation**: Comprehensive guides for developers

### ⚡ **Performance**
- **Fast Speeds**: Optimized proxy performance
- **Built-in Tab System**: Efficient browsing experience
- **Caching**: Smart asset caching for faster load times
- **Production Ready**: Stable, scalable architecture

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18.0.0
- **npm** ≥ 7.0.0

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

The server will start on `http://localhost:8080` by default.

### Development Mode

```bash
# Start with auto-reload
npm run dev

# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Build project
npm run build
```

## 📖 Documentation

### 📚 **User Guides**
- [Getting Started](docs/user/getting-started.md)
- [Features Overview](docs/user/features.md)
- [Themes & Customization](docs/user/themes.md)
- [Troubleshooting](docs/user/troubleshooting.md)

### 🛠️ **Developer Guides**
- [Development Setup](docs/developer/setup.md)
- [Architecture Overview](docs/developer/architecture.md)
- [Plugin Development](docs/developer/plugins.md)
- [API Reference](docs/developer/api.md)
- [Contributing](docs/developer/contributing.md)

### 🔧 **Deployment**
- [Self-Hosting](docs/deployment/self-hosting.md)
- [Cloud Deployment](docs/deployment/cloud.md)
- [Docker Setup](docs/deployment/docker.md)
- [Environment Variables](docs/deployment/environment.md)

## ⚙️ Configuration

SlowGuardian can be configured through `config.js`:

```javascript
const config = {
  // Server Settings
  version: 9,
  port: process.env.PORT || 8080,
  
  // Security
  challenge: false,     // Enable password protection
  users: {
    admin: "password"   // Username: password pairs
  },
  
  // Features
  routes: true,         // Enable frontend routes
  local: true,          // Enable local assets
  plugins: true,        // Enable plugin system
  
  // Development
  debug: false,         // Debug mode
  logLevel: "info",     // Logging level
};
```

## 🔌 Plugin System

SlowGuardian v9 introduces a powerful plugin system for extending functionality:

```javascript
// Example plugin
export default {
  name: "example-plugin",
  version: "1.0.0",
  description: "Example plugin for SlowGuardian",
  
  onLoad(app, config) {
    // Plugin initialization
  },
  
  routes: [
    {
      path: "/plugin/example",
      handler: (req, res) => {
        res.json({ message: "Hello from plugin!" });
      }
    }
  ]
};
```

[Learn more about plugin development →](docs/developer/plugins.md)

## 🆕 What's New in v9

### **Complete Rewrite**
- Modern ES6+ JavaScript codebase
- Improved project structure and organization
- Enhanced error handling and logging

### **UI/UX Overhaul**
- Brand new interface design
- Mobile-first responsive layout
- Improved accessibility and performance

### **Plugin Architecture**
- Extensible plugin system
- Plugin marketplace ready
- Easy customization and development

### **Enhanced Compatibility**
- Fixed Now.gg compatibility issues
- Improved proxy stability
- Better cross-browser support

### **Developer Experience**
- Comprehensive documentation
- Modern development tooling
- TypeScript support ready

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/developer/contributing.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Run linting and formatting: `npm run build`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ultraviolet Team** - For the amazing proxy technology
- **Contributors** - For making SlowGuardian better
- **Community** - For feedback and support

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/zgr2575/SlowGuardian/issues)
- **Discussions**: [GitHub Discussions](https://github.com/zgr2575/SlowGuardian/discussions)

---

<div align="center">
  <strong>⭐ If SlowGuardian helps you, please consider giving it a star! ⭐</strong>
</div>
