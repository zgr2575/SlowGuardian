/**
 * Spotify API Integration for SlowGuardian
 * Handles Spotify OAuth, playlist management, and music data
 */

import SpotifyWebApi from "spotify-web-api-node";
import { ObjectId } from "mongodb";
import dbConnection from "../database/connection.js";
import { Logger } from "../utils/logger.js";

const logger = new Logger("SpotifyAPI");

class SpotifyManager {
  constructor() {
    // Lazily evaluate env so dotenv.config() can run first
    this.scopes = [
      "user-read-private",
      "user-read-email",
      "playlist-read-private",
      "playlist-read-collaborative",
      "playlist-modify-public",
      "playlist-modify-private",
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "user-library-read",
      "user-library-modify",
      "streaming",
    ];

    // Will be created on demand after env is loaded
    this.spotifyApi = null;
  }

  // Live env getters ensure values are read after dotenv is loaded
  get clientId() {
    return process.env.SPOTIFY_CLIENT_ID;
  }

  get clientSecret() {
    return process.env.SPOTIFY_CLIENT_SECRET;
  }

  get redirectUri() {
    return (
      process.env.SPOTIFY_REDIRECT_URI ||
      "http://localhost:8080/api/spotify/callback"
    );
  }

  getClient() {
    if (!this.spotifyApi) {
      this.spotifyApi = new SpotifyWebApi({
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        redirectUri: this.redirectUri,
      });
    }
    return this.spotifyApi;
  }

  /**
   * Initialize Spotify API configuration
   */
  initialize() {
    if (!this.clientId || !this.clientSecret) {
      logger.warn("Spotify API credentials not configured");
      return false;
    }

    // Ensure client is initialized with current env values
    this.spotifyApi = new SpotifyWebApi({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: this.redirectUri,
    });

    logger.info("Spotify API initialized");
    return true;
  }

  /**
   * Get authorization URL for OAuth flow
   */
  getAuthUrl(userId, state = null) {
    try {
      const stateData = JSON.stringify({ 
        userId: userId.toString(),
        timestamp: Date.now(),
        custom: state 
      });
      
      const encodedState = Buffer.from(stateData).toString("base64");

      const authUrl = this.getClient().createAuthorizeURL(
        this.scopes,
        encodedState
      );
      
      logger.info(`Generated Spotify auth URL for user: ${userId}`);
      return authUrl;
    } catch (error) {
      logger.error("Failed to generate auth URL:", error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback and get access tokens
   */
  async handleCallback(code, state) {
    try {
      // Decode and validate state
      const stateData = JSON.parse(Buffer.from(state, "base64").toString());
      const userId = stateData.userId;

      // Exchange code for tokens
  const tokenData = await this.getClient().authorizationCodeGrant(code);
      
      const accessToken = tokenData.body.access_token;
      const refreshToken = tokenData.body.refresh_token;
      const expiresIn = tokenData.body.expires_in;

      // Store tokens in database
      await this.storeUserTokens(userId, accessToken, refreshToken, expiresIn);

      // Get user profile info
  const client = this.getClient();
  client.setAccessToken(accessToken);
  const userProfile = await client.getMe();

      logger.info(`Spotify OAuth completed for user: ${userId}`);

      return {
        success: true,
        userId,
        profile: userProfile.body,
        accessToken,
      };
    } catch (error) {
      logger.error("Spotify OAuth callback error:", error);
      throw error;
    }
  }

  /**
   * Store user tokens in database
   */
  async storeUserTokens(userId, accessToken, refreshToken, expiresIn) {
    try {
      const collection = dbConnection.getCollection("spotify_tokens");
      const expiresAt = new Date(Date.now() + (expiresIn * 1000));

      await collection.updateOne(
        { userId: new ObjectId(userId) },
        {
          $set: {
            userId: new ObjectId(userId),
            accessToken,
            refreshToken,
            expiresAt,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      logger.info(`Stored Spotify tokens for user: ${userId}`);
    } catch (error) {
      logger.error("Failed to store Spotify tokens:", error);
      throw error;
    }
  }

  /**
   * Get user tokens from database
   */
  async getUserTokens(userId) {
    try {
      const collection = dbConnection.getCollection("spotify_tokens");
      const tokenData = await collection.findOne({ userId: new ObjectId(userId) });

      if (!tokenData) {
        return null;
      }

      // Check if token is expired
      if (new Date() >= tokenData.expiresAt) {
        // Try to refresh token
        const refreshed = await this.refreshUserTokens(userId, tokenData.refreshToken);
        if (refreshed) {
          return await this.getUserTokens(userId); // Get updated tokens
        }
        return null;
      }

      return tokenData;
    } catch (error) {
      logger.error("Failed to get user tokens:", error);
      return null;
    }
  }

  /**
   * Refresh access token
   */
  async refreshUserTokens(userId, refreshToken) {
    try {
  const client = this.getClient();
  client.setRefreshToken(refreshToken);
  const tokenData = await client.refreshAccessToken();

      const newAccessToken = tokenData.body.access_token;
      const expiresIn = tokenData.body.expires_in;
      const newRefreshToken = tokenData.body.refresh_token || refreshToken;

      await this.storeUserTokens(userId, newAccessToken, newRefreshToken, expiresIn);

      logger.info(`Refreshed Spotify tokens for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error("Failed to refresh Spotify tokens:", error);
      
      // If refresh fails, remove invalid tokens
      await this.removeUserTokens(userId);
      return false;
    }
  }

  /**
   * Remove user tokens from database
   */
  async removeUserTokens(userId) {
    try {
      const collection = dbConnection.getCollection("spotify_tokens");
      await collection.deleteOne({ userId: new ObjectId(userId) });
      
      logger.info(`Removed Spotify tokens for user: ${userId}`);
    } catch (error) {
      logger.error("Failed to remove Spotify tokens:", error);
    }
  }

  /**
   * Get authenticated Spotify API instance for user
   */
  async getAuthenticatedApi(userId) {
    try {
      const tokens = await this.getUserTokens(userId);
      if (!tokens) {
        return null;
      }

      const api = new SpotifyWebApi({
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        redirectUri: this.redirectUri,
      });

      api.setAccessToken(tokens.accessToken);
      api.setRefreshToken(tokens.refreshToken);

      return api;
    } catch (error) {
      logger.error("Failed to get authenticated API:", error);
      return null;
    }
  }

  /**
   * Get user's Spotify playlists
   */
  async getUserPlaylists(userId, limit = 50, offset = 0) {
    try {
      const api = await this.getAuthenticatedApi(userId);
      if (!api) {
        throw new Error("Spotify not connected for this user");
      }

      const playlists = await api.getUserPlaylists({ limit, offset });
      
      return {
        success: true,
        playlists: playlists.body.items.map(playlist => ({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          trackCount: playlist.tracks.total,
          images: playlist.images,
          owner: playlist.owner.display_name,
          public: playlist.public,
          collaborative: playlist.collaborative,
          externalUrl: playlist.external_urls.spotify,
        })),
        total: playlists.body.total,
        hasMore: playlists.body.next !== null,
      };
    } catch (error) {
      logger.error("Failed to get user playlists:", error);
      throw error;
    }
  }

  /**
   * Get playlist tracks
   */
  async getPlaylistTracks(userId, playlistId, limit = 100, offset = 0) {
    try {
      const api = await this.getAuthenticatedApi(userId);
      if (!api) {
        throw new Error("Spotify not connected for this user");
      }

      const tracks = await api.getPlaylistTracks(playlistId, { limit, offset });

      return {
        success: true,
        tracks: tracks.body.items.map(item => ({
          id: item.track.id,
          name: item.track.name,
          artists: item.track.artists.map(artist => artist.name),
          album: item.track.album.name,
          duration: item.track.duration_ms,
          preview: item.track.preview_url,
          images: item.track.album.images,
          externalUrl: item.track.external_urls.spotify,
          addedAt: item.added_at,
        })),
        total: tracks.body.total,
        hasMore: tracks.body.next !== null,
      };
    } catch (error) {
      logger.error("Failed to get playlist tracks:", error);
      throw error;
    }
  }

  /**
   * Search for tracks
   */
  async searchTracks(userId, query, limit = 20, offset = 0) {
    try {
      const api = await this.getAuthenticatedApi(userId);
      if (!api) {
        throw new Error("Spotify not connected for this user");
      }

      const results = await api.searchTracks(query, { limit, offset });

      return {
        success: true,
        tracks: results.body.tracks.items.map(track => ({
          id: track.id,
          name: track.name,
          artists: track.artists.map(artist => artist.name),
          album: track.album.name,
          duration: track.duration_ms,
          preview: track.preview_url,
          images: track.album.images,
          externalUrl: track.external_urls.spotify,
          popularity: track.popularity,
        })),
        total: results.body.tracks.total,
        hasMore: results.body.tracks.next !== null,
      };
    } catch (error) {
      logger.error("Failed to search tracks:", error);
      throw error;
    }
  }

  /**
   * Create playlist for user
   */
  async createPlaylist(userId, name, description = "", isPublic = false) {
    try {
      const api = await this.getAuthenticatedApi(userId);
      if (!api) {
        throw new Error("Spotify not connected for this user");
      }

      // Get user profile to create playlist
      const userProfile = await api.getMe();
      const playlist = await api.createPlaylist(userProfile.body.id, name, {
        description,
        public: isPublic,
      });

      logger.info(`Created Spotify playlist: ${name} for user: ${userId}`);

      return {
        success: true,
        playlist: {
          id: playlist.body.id,
          name: playlist.body.name,
          description: playlist.body.description,
          externalUrl: playlist.body.external_urls.spotify,
        },
      };
    } catch (error) {
      logger.error("Failed to create playlist:", error);
      throw error;
    }
  }

  /**
   * Add tracks to playlist
   */
  async addTracksToPlaylist(userId, playlistId, trackUris) {
    try {
      const api = await this.getAuthenticatedApi(userId);
      if (!api) {
        throw new Error("Spotify not connected for this user");
      }

      await api.addTracksToPlaylist(playlistId, trackUris);

      logger.info(`Added ${trackUris.length} tracks to playlist: ${playlistId}`);

      return { success: true };
    } catch (error) {
      logger.error("Failed to add tracks to playlist:", error);
      throw error;
    }
  }

  /**
   * Get current playing track
   */
  async getCurrentTrack(userId) {
    try {
      const api = await this.getAuthenticatedApi(userId);
      if (!api) {
        throw new Error("Spotify not connected for this user");
      }

      const currentTrack = await api.getMyCurrentPlayingTrack();

      if (!currentTrack.body || !currentTrack.body.item) {
        return { success: true, playing: false };
      }

      return {
        success: true,
        playing: true,
        track: {
          id: currentTrack.body.item.id,
          name: currentTrack.body.item.name,
          artists: currentTrack.body.item.artists.map(artist => artist.name),
          album: currentTrack.body.item.album.name,
          images: currentTrack.body.item.album.images,
          duration: currentTrack.body.item.duration_ms,
          progress: currentTrack.body.progress_ms,
          isPlaying: currentTrack.body.is_playing,
        },
      };
    } catch (error) {
      logger.error("Failed to get current track:", error);
      throw error;
    }
  }

  /**
   * Get user's saved tracks
   */
  async getSavedTracks(userId, limit = 50, offset = 0) {
    try {
      const api = await this.getAuthenticatedApi(userId);
      if (!api) {
        throw new Error("Spotify not connected for this user");
      }

      const savedTracks = await api.getMySavedTracks({ limit, offset });

      return {
        success: true,
        tracks: savedTracks.body.items.map(item => ({
          id: item.track.id,
          name: item.track.name,
          artists: item.track.artists.map(artist => artist.name),
          album: item.track.album.name,
          duration: item.track.duration_ms,
          preview: item.track.preview_url,
          images: item.track.album.images,
          externalUrl: item.track.external_urls.spotify,
          addedAt: item.added_at,
        })),
        total: savedTracks.body.total,
        hasMore: savedTracks.body.next !== null,
      };
    } catch (error) {
      logger.error("Failed to get saved tracks:", error);
      throw error;
    }
  }

  /**
   * Check if user has Spotify connected
   */
  async isConnected(userId) {
    try {
      const tokens = await this.getUserTokens(userId);
      return tokens !== null;
    } catch (error) {
      logger.error("Failed to check Spotify connection:", error);
      return false;
    }
  }

  /**
   * Disconnect Spotify for user
   */
  async disconnect(userId) {
    try {
      await this.removeUserTokens(userId);
      logger.info(`Disconnected Spotify for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error("Failed to disconnect Spotify:", error);
      return false;
    }
  }
}

// Create singleton instance
const spotifyManager = new SpotifyManager();

export default spotifyManager;
export { SpotifyManager };