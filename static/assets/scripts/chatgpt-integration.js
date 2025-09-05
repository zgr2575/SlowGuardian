/**
 * ChatGPT Integration for SlowGuardian v9
 * Provides AI assistance while browsing
 */

class ChatGPTIntegration {
  constructor() {
    this.isVisible = false;
    this.messages = [];
    this.apiKey = null;
    this.model = "gpt-3.5-turbo";
    this.init();
  }

  init() {
    this.loadSettings();
    this.setupEventListeners();
    this.addWelcomeMessage();
  }

  loadSettings() {
    const settings = JSON.parse(
      localStorage.getItem("chatgpt-settings") || "{}"
    );
    if (settings.apiKey) {
      this.apiKey = atob(settings.apiKey); // Decode from base64
    }
    if (settings.model) {
      this.model = settings.model;
    }
  }

  setupEventListeners() {
    // Toggle button
    const toggleBtn = document.getElementById("chatgpt-toggle-btn");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => this.togglePanel());
    }

    // Close button
    const closeBtn = document.getElementById("chatgpt-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.hidePanel());
    }

    // Chat form
    const chatForm = document.getElementById("chatgpt-form");
    if (chatForm) {
      chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.sendMessage();
      });
    }

    // Input shortcuts
    const chatInput = document.getElementById("chatgpt-input");
    if (chatInput) {
      chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }
  }

  addWelcomeMessage() {
    const welcomeMessage = {
      role: "assistant",
      content:
        "Hello! I'm your AI assistant. I can help you with web browsing, answer questions, or assist with any tasks. How can I help you today?",
      timestamp: Date.now(),
    };
    this.messages.push(welcomeMessage);
    this.renderMessages();
  }

  togglePanel() {
    if (this.isVisible) {
      this.hidePanel();
    } else {
      this.showPanel();
    }
  }

  showPanel() {
    const panel = document.getElementById("chatgpt-content");
    if (panel) {
      panel.style.display = "flex";
      this.isVisible = true;

      // Focus input
      const input = document.getElementById("chatgpt-input");
      if (input) {
        setTimeout(() => input.focus(), 100);
      }
    }
  }

  hidePanel() {
    const panel = document.getElementById("chatgpt-content");
    if (panel) {
      panel.style.display = "none";
      this.isVisible = false;
    }
  }

  async sendMessage() {
    const input = document.getElementById("chatgpt-input");
    const message = input?.value.trim();

    if (!message) return;

    // Clear input
    if (input) input.value = "";

    // Add user message
    const userMessage = {
      role: "user",
      content: message,
      timestamp: Date.now(),
    };
    this.messages.push(userMessage);
    this.renderMessages();

    // Check if API key is available
    if (!this.apiKey) {
      this.addErrorMessage(
        "API key not configured. Please set your OpenAI API key in Developer Mode settings."
      );
      return;
    }

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Get current page context if available
      const context = this.getCurrentPageContext();

      // Prepare messages for API
      const apiMessages = this.prepareMessagesForAPI(message, context);

      // Call OpenAI API
      const response = await this.callOpenAI(apiMessages);

      // Hide typing indicator
      this.hideTypingIndicator();

      // Add assistant response
      const assistantMessage = {
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };
      this.messages.push(assistantMessage);
      this.renderMessages();
    } catch (error) {
      this.hideTypingIndicator();
      this.addErrorMessage(`Error: ${error.message}`);
    }
  }

  getCurrentPageContext() {
    // Get context from current browsing session
    let context = {
      currentUrl: null,
      pageTitle: null,
      activeTab: null,
    };

    // Get current tab information if browser tabs are available
    if (window.browserTabs && window.browserTabs.activeTabId) {
      const activeTab = window.browserTabs.tabs.get(
        window.browserTabs.activeTabId
      );
      if (activeTab) {
        context.currentUrl = activeTab.originalUrl || activeTab.url;
        context.pageTitle = activeTab.title;
        context.activeTab = true;
      }
    }

    return context;
  }

  prepareMessagesForAPI(userMessage, context) {
    // System message with context
    let systemMessage =
      "You are a helpful AI assistant integrated into SlowGuardian, a web proxy browser. ";

    if (context.currentUrl) {
      systemMessage += `The user is currently browsing: ${context.currentUrl}. `;
    }
    if (context.pageTitle) {
      systemMessage += `Page title: "${context.pageTitle}". `;
    }

    systemMessage +=
      "Provide helpful, accurate, and concise responses. If the user asks about the current page, use the context provided.";

    const messages = [{ role: "system", content: systemMessage }];

    // Add recent conversation history (last 10 messages)
    const recentMessages = this.messages
      .slice(-10)
      .filter((msg) => msg.role !== "system");
    messages.push(
      ...recentMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))
    );

    return messages;
  }

  async callOpenAI(messages) {
    if (!this.apiKey) {
      throw new Error("API key not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "API request failed");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No response generated";
  }

  showTypingIndicator() {
    const typingMessage = {
      role: "typing",
      content: "...",
      timestamp: Date.now(),
    };
    this.messages.push(typingMessage);
    this.renderMessages();
  }

  hideTypingIndicator() {
    // Remove typing indicator
    this.messages = this.messages.filter((msg) => msg.role !== "typing");
    this.renderMessages();
  }

  addErrorMessage(errorText) {
    const errorMessage = {
      role: "error",
      content: errorText,
      timestamp: Date.now(),
    };
    this.messages.push(errorMessage);
    this.renderMessages();
  }

  renderMessages() {
    const messagesContainer = document.getElementById("chatgpt-messages");
    if (!messagesContainer) return;

    messagesContainer.innerHTML = "";

    this.messages.forEach((message) => {
      const messageElement = document.createElement("div");
      messageElement.className = `message ${message.role}`;

      if (message.role === "typing") {
        messageElement.innerHTML = `
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        `;
      } else if (message.role === "error") {
        messageElement.innerHTML = `
          <div class="message-content error">
            ⚠️ ${message.content}
          </div>
        `;
      } else {
        messageElement.innerHTML = `
          <div class="message-content">
            ${this.formatMessage(message.content)}
          </div>
        `;
      }

      messagesContainer.appendChild(messageElement);
    });

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  formatMessage(content) {
    // Basic markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>");
  }

  // Predefined helpful commands
  getQuickCommands() {
    return [
      {
        command: "What's on this page?",
        description: "Get information about the current page",
      },
      {
        command: "Summarize this content",
        description: "Get a summary of the current page",
      },
      {
        command: "Help me navigate",
        description: "Get navigation tips and shortcuts",
      },
      {
        command: "Translate this page",
        description: "Get translation options",
      },
      {
        command: "Security check",
        description: "Check if current site is safe",
      },
    ];
  }

  // Handle quick commands
  handleQuickCommand(command) {
    const input = document.getElementById("chatgpt-input");
    if (input) {
      input.value = command;
      this.sendMessage();
    }
  }

  // Clear conversation
  clearConversation() {
    this.messages = [];
    this.addWelcomeMessage();
  }

  // Export conversation
  exportConversation() {
    const conversation = {
      messages: this.messages,
      exported: new Date().toISOString(),
      context: this.getCurrentPageContext(),
    };

    const dataStr = JSON.stringify(conversation, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `chatgpt-conversation-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }
}

// Initialize ChatGPT integration
const chatGPTIntegration = new ChatGPTIntegration();

// Export for global access
window.chatGPTIntegration = chatGPTIntegration;

// Add some CSS for typing indicator if not already present
if (!document.getElementById("typing-indicator-styles")) {
  const style = document.createElement("style");
  style.id = "typing-indicator-styles";
  style.textContent = `
    .typing-indicator {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 8px 0;
    }
    
    .typing-indicator span {
      width: 8px;
      height: 8px;
      background: var(--text-secondary);
      border-radius: 50%;
      animation: typingPulse 1.4s infinite ease-in-out;
    }
    
    .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
    .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
    .typing-indicator span:nth-child(3) { animation-delay: 0s; }
    
    @keyframes typingPulse {
      0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    .message.error .message-content {
      background: var(--bg-danger, #ff4444);
      color: white;
      border-left: 4px solid #ff0000;
    }
    
    .message-content code {
      background: var(--bg-secondary);
      padding: 2px 4px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875em;
    }
  `;
  document.head.appendChild(style);
}
