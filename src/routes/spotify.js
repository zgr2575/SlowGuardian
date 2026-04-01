/**
 * Spotify API Routes for SlowGuardian
 * Handles Spotify OAuth, playlist management, and music integration
 */

import { Router } from "express";
import spotifyManager from "../auth/spotify.js";
import { authenticateToken, optionalAuth } from "../auth/middleware.js";
import { Logger } from "../utils/logger.js";

const router = Router();
const logger = new Logger("SpotifyRoutes");

/**
 * Get Spotify authorization URL
 */
router.get("/auth", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { state } = req.query;

    if (!spotifyManager.clientId) {
      return res.status(503).json({
        success: false,
        error: "Spotify integration not configured",
      });
    }

    const authUrl = spotifyManager.getAuthUrl(userId, state);

    res.json({
      success: true,
      authUrl,
      message: "Redirect user to this URL to authorize Spotify access",
    });
  } catch (error) {
    logger.error("Spotify auth URL error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate authorization URL",
    });
  }
});

/**
 * Handle Spotify OAuth callback
 */
router.get("/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      logger.warn(`Spotify OAuth error: ${error}`);
      return res.redirect(`/music?error=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      return res.redirect("/music?error=missing_parameters");
    }

    const result = await spotifyManager.handleCallback(code, state);

    if (result.success) {
      logger.info(`Spotify connected for user: ${result.userId}`);
      res.redirect("/music?spotify_connected=true");
    } else {
      res.redirect("/music?error=oauth_failed");
    }
  } catch (error) {
    logger.error("Spotify callback error:", error);
    res.redirect("/music?error=oauth_failed");
  }
});

/**
 * Check Spotify connection status
 */
router.get("/status", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const isConnected = await spotifyManager.isConnected(userId);

    let profile = null;
    if (isConnected) {
      try {
        const api = await spotifyManager.getAuthenticatedApi(userId);
        if (api) {
          const userProfile = await api.getMe();
          profile = {
            id: userProfile.body.id,
            displayName: userProfile.body.display_name,
            email: userProfile.body.email,
            followers: userProfile.body.followers.total,
            country: userProfile.body.country,
            images: userProfile.body.images,
          };
        }
      } catch (error) {
        logger.warn("Failed to get Spotify profile:", error);
      }
    }

    res.json({
      success: true,
      connected: isConnected,
      profile,
    });
  } catch (error) {
    logger.error("Spotify status error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check Spotify status",
    });
  }
});

/**
 * Disconnect Spotify
 */
router.post("/disconnect", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const disconnected = await spotifyManager.disconnect(userId);

    if (disconnected) {
      res.json({
        success: true,
        message: "Spotify disconnected successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to disconnect Spotify",
      });
    }
  } catch (error) {
    logger.error("Spotify disconnect error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to disconnect Spotify",
    });
  }
});

/**
 * Get user's playlists
 */
router.get("/playlists", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await spotifyManager.getUserPlaylists(userId, limit, offset);

    res.json(result);
  } catch (error) {
    logger.error("Get playlists error:", error);
    
    if (error.message.includes("not connected")) {
      return res.status(401).json({
        success: false,
        error: "Spotify not connected",
        needsAuth: true,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to get playlists",
    });
  }
});

/**
 * Get playlist tracks
 */
router.get("/playlists/:playlistId/tracks", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { playlistId } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const result = await spotifyManager.getPlaylistTracks(userId, playlistId, limit, offset);

    res.json(result);
  } catch (error) {
    logger.error("Get playlist tracks error:", error);
    
    if (error.message.includes("not connected")) {
      return res.status(401).json({
        success: false,
        error: "Spotify not connected",
        needsAuth: true,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to get playlist tracks",
    });
  }
});

/**
 * Search tracks
 */
router.get("/search", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { q: query } = req.query;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    const result = await spotifyManager.searchTracks(userId, query, limit, offset);

    res.json(result);
  } catch (error) {
    logger.error("Search tracks error:", error);
    
    if (error.message.includes("not connected")) {
      return res.status(401).json({
        success: false,
        error: "Spotify not connected",
        needsAuth: true,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to search tracks",
    });
  }
});

/**
 * Create playlist
 */
router.post("/playlists", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, description = "", isPublic = false } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Playlist name is required",
      });
    }

    const result = await spotifyManager.createPlaylist(userId, name, description, isPublic);

    res.json(result);
  } catch (error) {
    logger.error("Create playlist error:", error);
    
    if (error.message.includes("not connected")) {
      return res.status(401).json({
        success: false,
        error: "Spotify not connected",
        needsAuth: true,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create playlist",
    });
  }
});

/**
 * Add tracks to playlist
 */
router.post("/playlists/:playlistId/tracks", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { playlistId } = req.params;
    const { trackUris } = req.body;

    if (!trackUris || !Array.isArray(trackUris)) {
      return res.status(400).json({
        success: false,
        error: "Track URIs array is required",
      });
    }

    const result = await spotifyManager.addTracksToPlaylist(userId, playlistId, trackUris);

    res.json(result);
  } catch (error) {
    logger.error("Add tracks to playlist error:", error);
    
    if (error.message.includes("not connected")) {
      return res.status(401).json({
        success: false,
        error: "Spotify not connected",
        needsAuth: true,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to add tracks to playlist",
    });
  }
});

/**
 * Get current playing track
 */
router.get("/current-track", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await spotifyManager.getCurrentTrack(userId);

    res.json(result);
  } catch (error) {
    logger.error("Get current track error:", error);
    
    if (error.message.includes("not connected")) {
      return res.status(401).json({
        success: false,
        error: "Spotify not connected",
        needsAuth: true,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to get current track",
    });
  }
});

/**
 * Get user's saved tracks
 */
router.get("/saved-tracks", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await spotifyManager.getSavedTracks(userId, limit, offset);

    res.json(result);
  } catch (error) {
    logger.error("Get saved tracks error:", error);
    
    if (error.message.includes("not connected")) {
      return res.status(401).json({
        success: false,
        error: "Spotify not connected",
        needsAuth: true,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to get saved tracks",
    });
  }
});

/**
 * Get Spotify configuration info (no auth required)
 */
router.get("/config", optionalAuth, (req, res) => {
  res.json({
    success: true,
    configured: !!spotifyManager.clientId,
    scopes: spotifyManager.scopes,
    features: {
      playlists: true,
      search: true,
      currentTrack: true,
      savedTracks: true,
      createPlaylists: true,
    },
  });
});

/**
 * Health check for Spotify API
 */
router.get("/health", (req, res) => {
  const isConfigured = spotifyManager.initialize();
  
  res.json({
    success: true,
    status: isConfigured ? "configured" : "not_configured",
    message: isConfigured 
      ? "Spotify API is properly configured" 
      : "Spotify API credentials not configured",
  });
});

export default router;