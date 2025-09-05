/**
 * Global Music Player Service
 * Provides persistent music playback across all pages
 */
class GlobalMusicPlayer {
  constructor() {
    this.currentTrack = null;
    this.currentPlaylist = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 1.0;
    this.player = null;
    this.playerContainer = null;
    
    this.initializeGlobalPlayer();
    this.loadState();
    this.setupEventListeners();
  }

  initializeGlobalPlayer() {
    // Create a fixed player widget that appears on all pages
    this.playerContainer = document.createElement('div');
    this.playerContainer.id = 'global-music-player';
    this.playerContainer.className = 'global-music-player hidden';
    
    this.playerContainer.innerHTML = `
      <div class="player-content">
        <div class="track-info">
          <img class="track-cover" src="" alt="Album Cover" id="global-track-cover">
          <div class="track-details">
            <div class="track-title" id="global-track-title">No track selected</div>
            <div class="track-artist" id="global-track-artist">Select music to start playing</div>
          </div>
        </div>
        
        <div class="player-controls">
          <button class="control-btn" id="global-prev-btn" title="Previous">⏮️</button>
          <button class="control-btn play-pause-btn" id="global-play-pause-btn" title="Play/Pause">▶️</button>
          <button class="control-btn" id="global-next-btn" title="Next">⏭️</button>
        </div>
        
        <div class="player-progress">
          <span class="time-current" id="global-current-time">0:00</span>
          <div class="progress-bar" id="global-progress-bar">
            <div class="progress-fill" id="global-progress-fill"></div>
          </div>
          <span class="time-total" id="global-total-time">0:00</span>
        </div>
        
        <div class="player-actions">
          <button class="control-btn" id="global-volume-btn" title="Volume">🔊</button>
          <button class="control-btn" id="global-minimize-btn" title="Minimize">−</button>
          <button class="control-btn" id="global-close-btn" title="Close">✕</button>
        </div>
      </div>
      
      <div class="player-iframe-container" id="global-player-iframe-container">
        <!-- Music iframe will be loaded here -->
      </div>
    `;
    
    document.body.appendChild(this.playerContainer);
    this.addPlayerStyles();
  }

  addPlayerStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .global-music-player {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--bg-secondary, #1a1a1a);
        border-top: 1px solid var(--border-primary, #333);
        z-index: 9999;
        transform: translateY(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
      }
      
      .global-music-player:not(.hidden) {
        transform: translateY(0);
      }
      
      .global-music-player.minimized .player-content {
        height: 60px;
      }
      
      .global-music-player.minimized .player-iframe-container {
        display: none;
      }
      
      .player-content {
        display: flex;
        align-items: center;
        padding: 12px 20px;
        gap: 20px;
        background: var(--bg-tertiary, #222);
        transition: height 0.3s ease;
      }
      
      .track-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
      }
      
      .track-cover {
        width: 48px;
        height: 48px;
        border-radius: 6px;
        object-fit: cover;
        background: var(--bg-primary, #333);
      }
      
      .track-details {
        min-width: 0;
        flex: 1;
      }
      
      .track-title {
        font-weight: 600;
        color: var(--text-primary, #fff);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 14px;
      }
      
      .track-artist {
        color: var(--text-secondary, #999);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 12px;
      }
      
      .player-controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .control-btn {
        background: none;
        border: none;
        color: var(--text-primary, #fff);
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        transition: all 0.2s ease;
        font-size: 16px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .control-btn:hover {
        background: var(--bg-primary, #333);
        transform: scale(1.1);
      }
      
      .play-pause-btn {
        background: var(--accent-primary, #667eea);
        font-size: 18px;
        width: 40px;
        height: 40px;
      }
      
      .player-progress {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        max-width: 300px;
      }
      
      .time-current, .time-total {
        font-size: 12px;
        color: var(--text-secondary, #999);
        min-width: 35px;
        text-align: center;
      }
      
      .progress-bar {
        flex: 1;
        height: 4px;
        background: var(--bg-primary, #333);
        border-radius: 2px;
        overflow: hidden;
        cursor: pointer;
      }
      
      .progress-fill {
        height: 100%;
        background: var(--accent-primary, #667eea);
        width: 0%;
        transition: width 0.1s ease;
      }
      
      .player-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .player-iframe-container {
        height: 300px;
        overflow: hidden;
        background: var(--bg-primary, #111);
      }
      
      .player-iframe-container iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
      
      /* Responsive design */
      @media (max-width: 768px) {
        .player-content {
          padding: 8px 12px;
          gap: 12px;
        }
        
        .player-progress {
          max-width: 200px;
        }
        
        .track-details {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  setupEventListeners() {
    // Play/Pause button
    document.getElementById('global-play-pause-btn').addEventListener('click', () => {
      this.togglePlayPause();
    });
    
    // Previous/Next buttons
    document.getElementById('global-prev-btn').addEventListener('click', () => {
      this.previousTrack();
    });
    
    document.getElementById('global-next-btn').addEventListener('click', () => {
      this.nextTrack();
    });
    
    // Minimize/Close buttons
    document.getElementById('global-minimize-btn').addEventListener('click', () => {
      this.toggleMinimize();
    });
    
    document.getElementById('global-close-btn').addEventListener('click', () => {
      this.stopAndHide();
    });
    
    // Progress bar interaction
    document.getElementById('global-progress-bar').addEventListener('click', (e) => {
      this.seekTo(e);
    });
    
    // Volume control
    document.getElementById('global-volume-btn').addEventListener('click', () => {
      this.toggleMute();
    });
    
    // Save state when page unloads
    window.addEventListener('beforeunload', () => {
      this.saveState();
    });
  }

  loadState() {
    const state = localStorage.getItem('sg-global-music-state');
    if (state) {
      try {
        const parsedState = JSON.parse(state);
        this.currentTrack = parsedState.currentTrack;
        this.currentPlaylist = parsedState.currentPlaylist;
        this.isPlaying = parsedState.isPlaying;
        this.currentTime = parsedState.currentTime || 0;
        this.volume = parsedState.volume || 1.0;
        
        if (this.currentTrack) {
          this.updateUI();
          if (this.isPlaying) {
            this.show();
          }
        }
      } catch (e) {
        console.warn('Failed to load music player state:', e);
      }
    }
  }

  saveState() {
    const state = {
      currentTrack: this.currentTrack,
      currentPlaylist: this.currentPlaylist,
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      volume: this.volume
    };
    localStorage.setItem('sg-global-music-state', JSON.stringify(state));
  }

  playPlaylist(playlist, trackIndex = 0) {
    this.currentPlaylist = playlist;
    this.currentTrack = playlist.tracks ? playlist.tracks[trackIndex] : playlist;
    this.isPlaying = true;
    
    this.updateUI();
    this.loadCurrentTrack();
    this.show();
    this.saveState();
  }

  playTrack(track) {
    this.currentTrack = track;
    this.isPlaying = true;
    
    this.updateUI();
    this.loadCurrentTrack();
    this.show();
    this.saveState();
  }

  loadCurrentTrack() {
    if (!this.currentTrack) return;
    
    const iframeContainer = document.getElementById('global-player-iframe-container');
    
    // Clear existing iframe
    iframeContainer.innerHTML = '';
    
    // Create new iframe for the track
    const iframe = document.createElement('iframe');
    iframe.src = this.currentTrack.embedUrl || this.currentTrack.url;
    iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    iframe.loading = 'lazy';
    
    iframeContainer.appendChild(iframe);
  }

  updateUI() {
    if (!this.currentTrack) return;
    
    document.getElementById('global-track-title').textContent = this.currentTrack.name || 'Unknown Track';
    document.getElementById('global-track-artist').textContent = this.currentTrack.platform || 'Unknown Artist';
    document.getElementById('global-track-cover').src = this.currentTrack.albumCover || this.createDefaultCover();
    
    const playPauseBtn = document.getElementById('global-play-pause-btn');
    playPauseBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
    playPauseBtn.title = this.isPlaying ? 'Pause' : 'Play';
  }

  createDefaultCover() {
    const svg = `
      <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" fill="#667eea"/>
        <text x="24" y="28" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="white" text-anchor="middle">♪</text>
      </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    this.updateUI();
    this.saveState();
    
    // In a real implementation, you would control the iframe player here
    // For now, we'll just update the UI state
  }

  previousTrack() {
    if (this.currentPlaylist && this.currentPlaylist.tracks) {
      const currentIndex = this.currentPlaylist.tracks.findIndex(t => t.id === this.currentTrack.id);
      if (currentIndex > 0) {
        this.playTrack(this.currentPlaylist.tracks[currentIndex - 1]);
      }
    }
  }

  nextTrack() {
    if (this.currentPlaylist && this.currentPlaylist.tracks) {
      const currentIndex = this.currentPlaylist.tracks.findIndex(t => t.id === this.currentTrack.id);
      if (currentIndex < this.currentPlaylist.tracks.length - 1) {
        this.playTrack(this.currentPlaylist.tracks[currentIndex + 1]);
      }
    }
  }

  seekTo(event) {
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    
    // Update progress bar visually
    document.getElementById('global-progress-fill').style.width = `${percentage * 100}%`;
    
    // In a real implementation, you would seek the iframe player here
  }

  toggleMute() {
    // In a real implementation, you would control iframe volume
    const volumeBtn = document.getElementById('global-volume-btn');
    volumeBtn.textContent = volumeBtn.textContent === '🔊' ? '🔇' : '🔊';
  }

  toggleMinimize() {
    this.playerContainer.classList.toggle('minimized');
  }

  show() {
    this.playerContainer.classList.remove('hidden');
  }

  hide() {
    this.playerContainer.classList.add('hidden');
  }

  stopAndHide() {
    this.isPlaying = false;
    this.currentTrack = null;
    this.currentPlaylist = null;
    this.hide();
    this.saveState();
  }
}

// Initialize global music player when page loads
document.addEventListener('DOMContentLoaded', () => {
  if (!window.globalMusicPlayer) {
    window.globalMusicPlayer = new GlobalMusicPlayer();
  }
});

// Make it available globally
window.GlobalMusicPlayer = GlobalMusicPlayer;