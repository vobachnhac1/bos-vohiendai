# Marine Solution - AIS Tracking Backend

A comprehensive Marine AIS (Automatic Identification System) tracking backend built with NestJS, featuring real-time vessel tracking, geofencing, alert management, and maritime domain expertise.

## 🌊 Overview

Marine Solution is an enterprise-grade backend system designed for maritime vessel tracking and monitoring. It processes AIS messages, manages geofences, generates alerts, and provides real-time tracking capabilities for maritime operations.

## 📋 Requirements

### System Requirements
- **Node.js**: >= 20.0.0 (Required for NestJS 11)
- **npm**: >= 9.0.0
- **PostgreSQL**: >= 12.0 with PostGIS extension
- **Redis**: >= 6.0

### Recommended Environment
- **Node.js**: 20.x LTS or 22.x LTS
- **PostgreSQL**: 14.x or 15.x with PostGIS 3.x
- **Redis**: 7.x

## ✨ Features

### 🚢 **Maritime Domain**
- **AIS Message Processing**: Complete AIS message type support with maritime-specific validation
- **Vessel Management**: MMSI-based vessel identification with IMO, callsign, and vessel type
- **Real-time Tracking**: Live vessel position updates with speed, course, and heading
- **Maritime Standards**: Full compliance with AIS and maritime identification standards

### 🗺️ **Geospatial Capabilities**
- **PostGIS Integration**: Advanced geospatial queries and operations
- **Geofencing**: Configurable monitored areas (restricted, warning, pipeline, anchorage)
- **Buffer Zones**: Automatic buffer generation for linear features like pipelines
- **Proximity Search**: Find vessels within specified radius of coordinates

### 🚨 **Alert System**
- **Rule Engine**: Configurable alert rules (enter/exit, speed below, stop/dwell)
- **Alert Lifecycle**: Complete alert management with acknowledgment tracking
- **Severity Levels**: Configurable severity levels (1-4) for different alert types
- **Operator Notes**: Full annotation and acknowledgment system

### 🔐 **Security & Authentication**
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Maritime-specific roles (admin, ops, viewer, analyst)
- **Username/Email Login**: Flexible authentication with username or email
- **Password Security**: Bcrypt hashing with secure password policies

### 🏗️ **Enterprise Architecture**
- **Modular Design**: Clean separation of concerns with feature modules
- **TypeScript**: Full type safety throughout the application
- **Database Optimization**: Proper indexing for high-volume AIS data
- **Comprehensive Logging**: Winston-based logging with file rotation
- **API Documentation**: Complete Swagger/OpenAPI documentation

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js) with TypeScript
- **Database**: PostgreSQL with PostGIS extension
- **ORM**: TypeORM with custom entities for maritime domain
- **Cache**: Redis for session management and performance
- **Authentication**: JWT with Passport.js strategies
- **WebSocket**: Socket.IO for real-time vessel tracking
- **Logging**: Winston with multiple transports
- **Documentation**: Swagger/OpenAPI with maritime examples
- **Containerization**: Docker & Docker Compose

## 📊 Database Schema

### Core Entities
- **Users**: System operators with maritime roles
- **Vessels**: Vessel master data with last known position
- **VesselLogs**: Raw AIS message logs (append-only, partitioned)
- **Areas**: Geofence definitions with PostGIS geometry
- **Rules**: Alert rule definitions tied to areas
- **Alerts**: Alert lifecycle with acknowledgment tracking

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v20+ (Required for NestJS 11 and optimal performance)
- **npm**: v9+ (Package manager)
- **PostgreSQL**: v13+ with PostGIS extension
- **Redis**: v6+
- **Docker & Docker Compose**: Latest versions

### Installation

1. **Verify Node.js version**:
```bash
node --version  # Should be >= 20.0.0
npm --version   # Should be >= 9.0.0
```

2. **Clone and setup**:
```bash
git clone <repository-url>
cd gps-backend
npm install
```

> **Note**: If you're using Node.js < 20, you'll see engine warnings. While the application may still work, Node.js 20+ is strongly recommended for optimal performance and compatibility.

2. **Environment configuration**:
```bash
cp .env.example .env
# Edit .env with your maritime-specific configuration
```

3. **Start services**:
```bash
# Using Docker Compose (recommended)
docker-compose up -d

# Or start manually (without database)
npm run start:dev
```

4. **Access the application**:
- **API**: http://localhost:3000/api/v1
- **Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/v1/health

## 📡 API Endpoints

### 🔐 Authentication
- `POST /api/v1/auth/register` - Register maritime operator
- `POST /api/v1/auth/login` - Login with username/email

### 🚢 Vessel Operations
- `POST /api/v1/vessels` - Register new vessel
- `GET /api/v1/vessels` - List vessels with filtering
- `POST /api/v1/vessels/logs` - Submit AIS message

### 🗺️ Area Management
- `POST /api/v1/areas` - Create geofence area
- `GET /api/v1/areas` - List monitored areas

### 🚨 Alert Management
- `GET /api/v1/alerts` - List alerts with filtering
- `POST /api/v1/alerts/:id/acknowledge` - Acknowledge alert

## 🔌 WebSocket Events

### 📡 Client to Server
- `ais-message` - Submit real-time AIS data
- `join-area` - Monitor specific area
- `vessel-subscribe` - Subscribe to vessel updates

### 📢 Server to Client
- `vessel-update` - Real-time vessel position update
- `alert-triggered` - New alert generated
- `area-event` - Vessel enter/exit area

## 📚 Documentation

- **🏗️ Architecture**: See `ARCHITECTURE.md` for system design
- **🚀 Deployment**: See `DEPLOYMENT_GUIDE.md` for production setup
- **🛠️ Implementation**: See `MARINE_SOLUTION_IMPLEMENTATION.md` for technical details
- **📊 Entities & DTOs**: See `MARINE_ENTITIES_DTOS.md` for data structures

## 🧪 Development

### Running Tests
```bash
npm run test        # Unit tests
npm run test:e2e    # E2E tests
npm run test:cov    # Test coverage
```

### Client Examples
```bash
cd client-examples
npm install
npm run test        # Test WebSocket connection
```

Or open `client-examples/socket-client.html` for interactive testing.

## 🐳 Docker Support

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## 🎯 Maritime Use Cases

- **🚢 Vessel Traffic Monitoring**: Real-time tracking in port areas
- **🛡️ Security & Compliance**: Restricted area monitoring
- **🏭 Industrial Operations**: Pipeline protection zones
- **📊 Analytics & Reporting**: Vessel movement patterns

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/ais-enhancement`)
3. Commit changes (`git commit -m 'Add AIS message validation'`)
4. Push to branch (`git push origin feature/ais-enhancement`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- 🐛 **Issues**: GitHub Issues with maritime labels
- 📖 **Documentation**: Full API docs at `/api/docs`

---

**Built for the maritime industry with ⚓ by maritime technology experts** 🌊
