import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface StreamMessage {
  id: string;
  data: Record<string, string>;
}

export interface StreamReadResult {
  stream: string;
  messages: StreamMessage[];
}

@Injectable()
export class RedisStreamsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisStreamsService.name);
  private client: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('redis.host', 'localhost'),
      port: this.configService.get<number>('redis.port', 6379),
      password: this.configService.get<string>('redis.password'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('connect', () => {
      this.logger.log('Redis Streams client connected');
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Streams client error:', err);
    });
  }

  /**
   * Add message to stream (Producer - Server A)
   * @param stream - Stream name (e.g., 'ais_stream')
   * @param data - Message data
   * @returns Message ID
   */
  async addToStream(
    stream: string,
    data: Record<string, any>,
  ): Promise<string> {
    try {
      // Convert all values to strings (Redis requirement)
      const stringData: Record<string, string> = {};
      for (const [key, value] of Object.entries(data)) {
        stringData[key] = typeof value === 'string' ? value : JSON.stringify(value);
      }

      // XADD stream * field1 value1 field2 value2 ...
      const messageId = await this.client.xadd(
        stream,
        '*', // Auto-generate ID
        ...Object.entries(stringData).flat(),
      );

      this.logger.debug(`Added message to stream ${stream}: ${messageId}`);
      return messageId;
    } catch (error) {
      this.logger.error(`Error adding to stream ${stream}:`, error);
      throw error;
    }
  }

  /**
   * Read messages from stream (Consumer - Server B)
   * @param stream - Stream name
   * @param lastId - Last message ID (use '0' for all, '$' for new only)
   * @param count - Number of messages to read
   * @param block - Block time in milliseconds (0 = wait forever)
   * @returns Array of messages
   */
  async readFromStream(
    stream: string,
    lastId: string = '$',
    count: number = 10,
    block: number = 5000,
  ): Promise<StreamReadResult[]> {
    try {
      // XREAD BLOCK 5000 COUNT 10 STREAMS ais_stream $
      // Use call() to bypass TypeScript strict typing
      const result: any = await this.client.call(
        'XREAD',
        'BLOCK',
        block,
        'COUNT',
        count,
        'STREAMS',
        stream,
        lastId,
      );

      if (!result) {
        return [];
      }

      // Parse result: [[stream, [[id, [field, value, ...]], ...]]]
      return result.map(([streamName, messages]: [string, any[]]) => ({
        stream: streamName,
        messages: messages.map(([id, fields]: [string, string[]]) => {
          const data: Record<string, string> = {};
          for (let i = 0; i < fields.length; i += 2) {
            data[fields[i]] = fields[i + 1];
          }
          return { id, data };
        }),
      }));
    } catch (error) {
      this.logger.error(`Error reading from stream ${stream}:`, error);
      throw error;
    }
  }

  /**
   * Create consumer group (Server B initialization)
   * @param stream - Stream name
   * @param group - Consumer group name
   * @param startId - Start reading from ID ('0' = beginning, '$' = new only)
   */
  async createConsumerGroup(
    stream: string,
    group: string,
    startId: string = '0',
  ): Promise<void> {
    try {
      // XGROUP CREATE stream group startId MKSTREAM
      await this.client.xgroup('CREATE', stream, group, startId, 'MKSTREAM');
      this.logger.log(`Created consumer group ${group} for stream ${stream}`);
    } catch (error) {
      if (error.message.includes('BUSYGROUP')) {
        this.logger.log(`Consumer group ${group} already exists`);
      } else {
        this.logger.error(`Error creating consumer group:`, error);
        throw error;
      }
    }
  }

  /**
   * Read messages as consumer group (Server B)
   * @param stream - Stream name
   * @param group - Consumer group name
   * @param consumer - Consumer name
   * @param count - Number of messages
   * @param block - Block time in milliseconds
   * @returns Array of messages
   */
  async readAsConsumerGroup(
    stream: string,
    group: string,
    consumer: string,
    count: number = 10,
    block: number = 5000,
  ): Promise<StreamReadResult[]> {
    try {
      // XREADGROUP GROUP group consumer BLOCK 5000 COUNT 10 STREAMS stream >
      // Use call() to bypass TypeScript strict typing
      const result: any = await this.client.call(
        'XREADGROUP',
        'GROUP',
        group,
        consumer,
        'BLOCK',
        block,
        'COUNT',
        count,
        'STREAMS',
        stream,
        '>', // Read new messages only
      );

      if (!result) {
        return [];
      }

      return result.map(([streamName, messages]: [string, any[]]) => ({
        stream: streamName,
        messages: messages.map(([id, fields]: [string, string[]]) => {
          const data: Record<string, string> = {};
          for (let i = 0; i < fields.length; i += 2) {
            data[fields[i]] = fields[i + 1];
          }
          return { id, data };
        }),
      }));
    } catch (error) {
      this.logger.error(`Error reading as consumer group:`, error);
      throw error;
    }
  }

  /**
   * Acknowledge message (mark as processed)
   * @param stream - Stream name
   * @param group - Consumer group name
   * @param messageId - Message ID to acknowledge
   */
  async acknowledgeMessage(
    stream: string,
    group: string,
    messageId: string,
  ): Promise<number> {
    try {
      // XACK stream group messageId
      const result = await this.client.xack(stream, group, messageId);
      this.logger.debug(`Acknowledged message ${messageId} in stream ${stream}`);
      return result;
    } catch (error) {
      this.logger.error(`Error acknowledging message:`, error);
      throw error;
    }
  }

  /**
   * Get stream info
   * @param stream - Stream name
   */
  async getStreamInfo(stream: string): Promise<any> {
    try {
      const info: any = await this.client.xinfo('STREAM', stream);
      return this.parseStreamInfo(info);
    } catch (error) {
      this.logger.error(`Error getting stream info:`, error);
      return null;
    }
  }

  /**
   * Get stream length
   * @param stream - Stream name
   */
  async getStreamLength(stream: string): Promise<number> {
    try {
      return await this.client.xlen(stream);
    } catch (error) {
      this.logger.error(`Error getting stream length:`, error);
      return 0;
    }
  }

  /**
   * Trim stream (remove old messages)
   * @param stream - Stream name
   * @param maxLength - Maximum number of messages to keep
   */
  async trimStream(stream: string, maxLength: number): Promise<number> {
    try {
      // XTRIM stream MAXLEN ~ maxLength
      return await this.client.xtrim(stream, 'MAXLEN', '~', maxLength);
    } catch (error) {
      this.logger.error(`Error trimming stream:`, error);
      return 0;
    }
  }

  /**
   * Get pending messages (messages read but not acknowledged)
   * @param stream - Stream name
   * @param group - Consumer group name
   */
  async getPendingMessages(stream: string, group: string): Promise<any> {
    try {
      const pending = await this.client.xpending(stream, group);
      return pending;
    } catch (error) {
      this.logger.error(`Error getting pending messages:`, error);
      return null;
    }
  }

  /**
   * Claim pending messages (take over from another consumer)
   * @param stream - Stream name
   * @param group - Consumer group name
   * @param consumer - Consumer name
   * @param minIdleTime - Minimum idle time in milliseconds
   * @param messageIds - Array of message IDs to claim
   */
  async claimMessages(
    stream: string,
    group: string,
    consumer: string,
    minIdleTime: number,
    messageIds: string[],
  ): Promise<any> {
    try {
      const result = await this.client.xclaim(
        stream,
        group,
        consumer,
        minIdleTime,
        ...messageIds,
      );
      return result;
    } catch (error) {
      this.logger.error(`Error claiming messages:`, error);
      return null;
    }
  }

  private parseStreamInfo(info: any[]): Record<string, any> {
    const result: Record<string, any> = {};
    for (let i = 0; i < info.length; i += 2) {
      result[info[i]] = info[i + 1];
    }
    return result;
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis Streams client disconnected');
    }
  }
}

