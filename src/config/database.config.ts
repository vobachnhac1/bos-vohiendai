import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'gps_backend',
    autoLoadEntities: true,
    synchronize: true, // process.env.NODE_ENV === 'development',
    logging: false, // process.env.NODE_ENV === 'development',
    // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    ssl: false,
    // Cấu hình thời gian UTC
    extra: {
      timezone: 'UTC',
    },
  }),
);
