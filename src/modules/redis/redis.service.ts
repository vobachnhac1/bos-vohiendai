import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.client = createClient({
        socket: {
          host: this.configService.get<string>('redis.host', 'localhost'),
          port: this.configService.get<number>('redis.port', 6379),
        },
        password: this.configService.get<string>('redis.password'),
        database: this.configService.get<number>('redis.db', 0),
      });

      this.client.on('error', (err) => {
        this.logger.error('Redis Client Error:', err);
      });

      this.client.on('connect', () => {
        this.logger.log('Redis Client Connected');
      });

      this.client.on('ready', () => {
        this.logger.log('Redis Client Ready');
      });

      this.client.on('end', () => {
        this.logger.log('Redis Client Connection Ended');
      });

      await this.client.connect();
      this.logger.log('Redis service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Redis service:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis client disconnected');
    }
  }

  /**
   * Set a key-value pair with optional TTL
   * @param key - Redis key
   * @param value - Value to store (will be JSON stringified)
   * @param ttlSeconds - TTL in seconds (optional)
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }

      this.logger.debug(`Set Redis key: ${key}`);
    } catch (error) {
      // Check if it's a read-only replica error
      if (error.message && error.message.includes('READONLY')) {
        this.logger.warn(`Redis is in read-only mode. Skipping write operation for key: ${key}`);
        // Gracefully handle read-only mode - don't throw error
        return;
      }

      this.logger.error(`Redis SET error for key ${key}:`, error);
      // Don't throw error to prevent application crash in production
      // throw error;
    }
  }

  /**
   * Get a value by key
   * @param key - Redis key
   * @returns Parsed JSON value or null if not found
   */
  async get(key: string): Promise<any> {
    try {
      const value = await this.client.get(key);
      if (!value) {
        return null;
      }
      
      try {
        return JSON.parse(value as string);
      } catch {
        // Return as string if not valid JSON
        return value;
      }
    } catch (error) {
      this.logger.error(`Redis GET error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a key
   * @param key - Redis key to delete
   */
  async del(key: string): Promise<number> {
    try {
      const result = await this.client.del(key);
      this.logger.debug(`Deleted Redis key: ${key}`);
      return result;
    } catch (error) {
      this.logger.error(`Redis DEL error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if key exists
   * @param key - Redis key
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis EXISTS error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set TTL for existing key
   * @param key - Redis key
   * @param ttlSeconds - TTL in seconds
   */
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, ttlSeconds);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis EXPIRE error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get TTL for a key
   * @param key - Redis key
   * @returns TTL in seconds, -1 if no TTL, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Redis TTL error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get all keys matching pattern
   * @param pattern - Redis key pattern (e.g., "vessel:*")
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.error(`Redis KEYS error for pattern ${pattern}:`, error);
      throw error;
    }
  }

  /**
   * Clear all keys in current database
   */
  async flushDb(): Promise<void> {
    try {
      await this.client.flushDb();
      this.logger.log('Redis database flushed');
    } catch (error) {
      this.logger.error('Redis FLUSHDB error:', error);
      throw error;
    }
  }

  /**
   * Get Redis client for advanced operations
   */
  getClient(): RedisClientType {
    return this.client;
  }

  /**
   * Get Redis server info
   */
  async getServerInfo(): Promise<{ role: string; info: any; isReadOnly: boolean }> {
    try {
      const info = await this.client.info('replication');
      const lines = info.split('\r\n');
      const replicationInfo: any = {};

      lines.forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          replicationInfo[key] = value;
        }
      });

      const role = replicationInfo.role || 'unknown';
      const isReadOnly = role === 'slave';

      return {
        role,
        info: replicationInfo,
        isReadOnly
      };
    } catch (error) {
      this.logger.error('Failed to get Redis server info:', error);
      return {
        role: 'unknown',
        info: {},
        isReadOnly: true // Assume read-only if we can't get info
      };
    }
  }

  /**
   * Test Redis connection
   */
  async testConnection(): Promise<{ success: boolean; message: string; testData?: any; error?: string; serverInfo?: any }> {
    try {
      // Get server info first
      const serverInfo = await this.getServerInfo();

      if (serverInfo.isReadOnly) {
        return {
          success: false,
          message: 'Redis server is in read-only mode (replica/slave)',
          serverInfo,
          error: 'Cannot perform write operations on read-only Redis server'
        };
      }

      // Test SET operation
      const testKey = 'test:redis:connection';
      const testData = { test: 'data', timestamp: new Date() };

      await this.set(testKey, testData, 60); // 1 minute TTL

      // Test GET operation
      const result = await this.get(testKey);

      // Test DELETE operation
      await this.del(testKey);

      return {
        success: true,
        message: 'Redis is working perfectly!',
        testData: result,
        serverInfo
      };
    } catch (error) {
      return {
        success: false,
        message: 'Redis connection failed',
        error: error.message
      };
    }
  }

  /**
   * Check if Redis connection is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }

  /**
   * Get connection status and server info
   */
  async getConnectionStatus(): Promise<{
    connected: boolean;
    healthy: boolean;
    serverInfo: any;
    error?: string;
  }> {
    try {
      const healthy = await this.isHealthy();
      const serverInfo = await this.getServerInfo();

      return {
        connected: this.client.isReady,
        healthy,
        serverInfo,
      };
    } catch (error) {
      return {
        connected: false,
        healthy: false,
        serverInfo: { role: 'unknown', info: {}, isReadOnly: false },
        error: error.message,
      };
    }
  }
}
