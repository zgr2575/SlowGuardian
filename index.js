/**
 * SlowGuardian v9 - Legacy Entry Point
 * Maintains backward compatibility while using new server architecture
 */

import { startServer } from "./server.js";

// Start the server using the new architecture
startServer().catch((error) => {
  console.error("Failed to start SlowGuardian:", error);
  process.exit(1);
});
