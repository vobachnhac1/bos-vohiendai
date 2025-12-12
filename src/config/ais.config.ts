import { registerAs } from '@nestjs/config';

/**
 * Parse AIS_HOST_GROUPS from environment variable
 * Returns array of host groups or default configuration
 */
function parseHostGroups() {
  const envHostGroups = process.env.AIS_HOST_GROUPS;

  if (envHostGroups) {
    try {
      const parsed = JSON.parse(envHostGroups);
      if (Array.isArray(parsed)) {
        console.log(`✅ Loaded ${parsed.length} AIS host groups from environment variable`);
        return parsed;
      }
    } catch (error) {
      console.error('❌ Failed to parse AIS_HOST_GROUPS from environment:', error);
    }
  }

  // Default configuration
  console.log('⚠️  Using default AIS host groups (AIS_HOST_GROUPS not set in environment)');
  return [
    { group: "VT_01", ip: "113.161.130.154", port: "8030", description: "AIS Base Vũng Tàu 1", status: true },
    { group: "VT_02", ip: "113.161.130.154", port: "8000", description: "AIS Base Vũng Tàu 2", status: true },
  ];
}

export default registerAs('ais', () => ({
  // Host Groups Configuration
  hostGroups: parseHostGroups(),

  // TCP Server Configuration
  tcp: {
    enabled: process.env.AIS_TCP_ENABLED === 'true',
    port: parseInt(process.env.AIS_TCP_PORT || '4001', 10),
    host: process.env.AIS_TCP_HOST || '0.0.0.0',
  },
  
  // UDP Server Configuration
  udp: {
    enabled: process.env.AIS_UDP_ENABLED === 'true',
    port: parseInt(process.env.AIS_UDP_PORT || '4002', 10),
    host: process.env.AIS_UDP_HOST || '0.0.0.0',
  },
  
  // Client Configuration (for connecting to external AIS sources)
  client: {
    enabled: process.env.AIS_CLIENT_ENABLED === 'true' || process.env.AIS_HOST !== undefined,
    host: process.env.AIS_HOST || process.env.AIS_CLIENT_HOST || 'localhost',
    port: parseInt(process.env.AIS_PORT || process.env.AIS_CLIENT_PORT || '4001', 10),
    protocol: process.env.AIS_CLIENT_PROTOCOL || 'tcp', // 'tcp' or 'udp'
    reconnectInterval: parseInt(process.env.AIS_CLIENT_RECONNECT_INTERVAL || '5000', 10),
  },
  
  // Processing Configuration
  processing: {
    // Maximum age of position reports to consider for vessel updates (in minutes)
    maxPositionAge: parseInt(process.env.AIS_MAX_POSITION_AGE || '60', 10),
    
    // Whether to broadcast all AIS messages via WebSocket or only position reports
    broadcastAllMessages: process.env.AIS_BROADCAST_ALL === 'true',
    
    // Whether to validate coordinates before storing
    validateCoordinates: process.env.AIS_VALIDATE_COORDINATES !== 'false',
    
    // Whether to store invalid messages for debugging
    storeInvalidMessages: process.env.AIS_STORE_INVALID === 'true',
  },
  
  // Database Configuration
  database: {
    // Whether to partition vessel_logs table by date
    partitionLogs: process.env.AIS_PARTITION_LOGS === 'true',
    
    // How long to keep vessel logs (in days, 0 = keep forever)
    logRetentionDays: parseInt(process.env.AIS_LOG_RETENTION_DAYS || '0', 10),
    
    // Batch size for bulk inserts
    batchSize: parseInt(process.env.AIS_BATCH_SIZE || '100', 10),
  },
  
  // Security Configuration
  security: {
    // Whether to require authentication for AIS API endpoints
    requireAuth: process.env.AIS_REQUIRE_AUTH !== 'false',
    
    // Rate limiting for AIS message processing (messages per minute)
    rateLimit: parseInt(process.env.AIS_RATE_LIMIT || '1000', 10),
    
    // Allowed source IPs for network connections (comma-separated, empty = allow all)
    allowedIps: process.env.AIS_ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [],
  },
  
  // Logging Configuration
  logging: {
    // Log level for AIS processing (debug, info, warn, error)
    level: process.env.AIS_LOG_LEVEL || 'info',
    
    // Whether to log all received messages (can be very verbose)
    logAllMessages: process.env.AIS_LOG_ALL_MESSAGES === 'true',
    
    // Whether to log invalid messages
    logInvalidMessages: process.env.AIS_LOG_INVALID !== 'false',
  },
}));
