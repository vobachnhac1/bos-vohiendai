# Commons Module

The Commons module provides a flexible configuration system for storing key-value pairs with metadata. It's designed to handle lookup tables, configuration settings, and reference data.

## Table Structure

```sql
CREATE TABLE commons (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,        -- Category/type of configuration
    key VARCHAR(255) NOT NULL,         -- Unique key within the type
    value TEXT,                        -- Value associated with the key
    description VARCHAR(500),          -- Human-readable description
    status BOOLEAN DEFAULT TRUE,       -- Whether the item is active/enabled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_commons_type_key UNIQUE (type, key)
);
```

## Pre-loaded Data

The module comes with pre-loaded reference data for:

### Vessel Types (`vessel_type`)
- AIS vessel type codes (0-90)
- Examples: `30` = "Fishing", `70` = "Cargo", `80` = "Tanker"

### Navigation Status (`nav_status`)
- AIS navigation status codes (0-15)
- Examples: `0` = "Under way using engine", `1` = "At anchor", `5` = "Moored"

### AIS Message Types (`ais_message_type`)
- AIS message type codes
- Examples: `1` = "Position Report Class A", `5` = "Static and Voyage Related Data"

## API Endpoints

### CRUD Operations
- `GET /commons` - List all configurations with filtering and pagination
- `POST /commons` - Create new configuration
- `GET /commons/:id` - Get configuration by ID
- `PATCH /commons/:id` - Update configuration
- `DELETE /commons/:id` - Delete configuration
- `PATCH /commons/:id/toggle-status` - Toggle active/inactive status

### Lookup Operations
- `GET /commons/type/:type` - Get all active configurations by type
- `GET /commons/type/:type/key/:key` - Get specific configuration by type and key

### Quick Lookups
- `GET /commons/lookup/vessel-types` - Get vessel types as key-value pairs
- `GET /commons/lookup/nav-statuses` - Get navigation statuses as key-value pairs
- `GET /commons/lookup/ais-message-types` - Get AIS message types as key-value pairs

## Usage Examples

### Basic CRUD
```typescript
// Create new configuration
POST /commons
{
  "type": "alert_type",
  "key": "geofence_exit",
  "value": "Geofence Exit Alert",
  "description": "Alert triggered when vessel exits geofence",
  "status": true
}

// Get all vessel types
GET /commons/type/vessel_type

// Get specific vessel type
GET /commons/type/vessel_type/key/70
// Returns: { "key": "70", "value": "Cargo", "description": "Cargo ship" }
```

### Using the Lookup Service
```typescript
import { CommonsLookupService } from './commons/services/commons-lookup.service';

@Injectable()
export class SomeService {
  constructor(private readonly lookupService: CommonsLookupService) {}

  async processVessel(vesselTypeCode: string) {
    const vesselTypeName = await this.lookupService.getVesselTypeDescription(vesselTypeCode);
    console.log(`Vessel type: ${vesselTypeName}`); // "Cargo"
  }

  async getVesselTypes() {
    const types = await this.lookupService.getVesselTypes();
    // Returns: { "30": "Fishing", "70": "Cargo", "80": "Tanker", ... }
  }
}
```

### Filtering and Pagination
```typescript
// Get all active cargo-related configurations
GET /commons?type=vessel_type&value=cargo&status=true&page=1&limit=10

// Search by key pattern
GET /commons?key=tanker&page=1&limit=20
```

## Use Cases

1. **AIS Data Processing**: Lookup vessel types and navigation statuses
2. **Configuration Management**: Store application settings and feature flags
3. **Reference Data**: Maintain lookup tables for dropdowns and validation
4. **Multi-tenant Settings**: Store tenant-specific configurations
5. **Feature Toggles**: Enable/disable features using status field

## Best Practices

1. **Type Naming**: Use descriptive, consistent type names (e.g., `vessel_type`, `alert_type`)
2. **Key Format**: Use lowercase with underscores for keys
3. **Unique Constraints**: The combination of `type` + `key` must be unique
4. **Status Management**: Use the `status` field to enable/disable configurations
5. **Descriptions**: Always provide meaningful descriptions for maintainability

## Integration with Other Modules

The Commons module is designed to be used by other modules for configuration and lookup purposes:

- **AIS Module**: Vessel type and navigation status lookups
- **Alerts Module**: Alert type configurations
- **GPS Module**: Tracking configurations
- **Users Module**: User role and permission settings
