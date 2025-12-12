import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Common } from '../entities/common.entity';
import { CreateCommonDto } from '../dto/create-common.dto';
import { UpdateCommonDto } from '../dto/update-common.dto';
import { CommonQueryDto } from '../dto/common-query.dto';

@Injectable()
export class CommonsService {
  constructor(
    @InjectRepository(Common)
    private readonly commonRepository: Repository<Common>,
  ) {}

  async create(createCommonDto: CreateCommonDto): Promise<Common> {
    // Check if type+key combination already exists
    const existing = await this.commonRepository.findOne({
      where: { 
        type: createCommonDto.type, 
        key: createCommonDto.key 
      }
    });

    if (existing) {
      throw new ConflictException(`Common with type '${createCommonDto.type}' and key '${createCommonDto.key}' already exists`);
    }

    const common = this.commonRepository.create(createCommonDto);
    return await this.commonRepository.save(common);
  }

  async findAll(query: CommonQueryDto) {
    const { page = 1, limit = 50, type, key, value, status } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.commonRepository.createQueryBuilder('common');

    if (type) {
      queryBuilder.andWhere('common.type = :type', { type });
    }

    if (key) {
      queryBuilder.andWhere('common.key ILIKE :key', { key: `%${key}%` });
    }

    if (value) {
      queryBuilder.andWhere('common.value ILIKE :value', { value: `%${value}%` });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('common.status = :status', { status });
    }

    queryBuilder
      .orderBy('common.type', 'ASC')
      .addOrderBy('common.key', 'ASC')
      .skip(skip)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Common> {
    const common = await this.commonRepository.findOne({ where: { id } });
    if (!common) {
      throw new NotFoundException(`Common with ID ${id} not found`);
    }
    return common;
  }

  async findByTypeAndKey(type: string, key: string): Promise<Common | null> {
    return await this.commonRepository.findOne({
      where: { type, key, status: true }
    });
  }

  async findByType(type: string): Promise<Common[]> {
    return await this.commonRepository.find({
      where: { type, status: true },
      order: { key: 'ASC' }
    });
  }

  async update(id: number, updateCommonDto: UpdateCommonDto): Promise<Common> {
    const common = await this.findOne(id);

    // Check for conflicts if type or key is being updated
    if (updateCommonDto.type || updateCommonDto.key) {
      const newType = updateCommonDto.type || common.type;
      const newKey = updateCommonDto.key || common.key;

      const existing = await this.commonRepository.findOne({
        where: { type: newType, key: newKey }
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(`Common with type '${newType}' and key '${newKey}' already exists`);
      }
    }

    Object.assign(common, updateCommonDto);
    return await this.commonRepository.save(common);
  }

  async remove(id: number): Promise<void> {
    const common = await this.findOne(id);
    await this.commonRepository.remove(common);
  }

  async toggleStatus(id: number): Promise<Common> {
    const common = await this.findOne(id);
    common.status = !common.status;
    return await this.commonRepository.save(common);
  }

  /**
   * Bulk insert navigation status data
   */
  async seedNavigationStatuses(): Promise<void> {
    const statusMap: { [key: number]: string } = {
      0: 'Under way using engine',
      1: 'At anchor',
      2: 'Not under command',
      3: 'Restricted manoeuvrability',
      4: 'Constrained by her draught',
      5: 'Moored',
      6: 'Aground',
      7: 'Engaged in fishing',
      8: 'Under way sailing',
      9: 'Reserved for future amendment of navigation status for ships carrying DG, HS, or MP',
      10: 'Reserved for future amendment of navigation status for ships carrying DG, HS, or MP',
      11: 'Power-driven vessel towing astern (regional use)',
      12: 'Power-driven vessel pushing ahead or towing alongside (regional use)',
      13: 'Reserved for future use',
      14: 'AIS-SART (Search and Rescue Transmitter)',
      15: 'Default (also used by AIS-SART, MOB-AIS and EPIRB-AIS under test)'
    };

    const navStatuses = Object.entries(statusMap).map(([key, value]) => ({
      type: 'nav_status',
      key: key.toString(),
      value: value,
      description: `Navigation status code ${key}: ${value}`,
      status: true,
    }));

    // Use save with conflict handling
    for (const navStatus of navStatuses) {
      try {
        const existing = await this.commonRepository.findOne({
          where: { type: navStatus.type, key: navStatus.key }
        });

        if (existing) {
          // Update existing record
          Object.assign(existing, navStatus);
          await this.commonRepository.save(existing);
        } else {
          // Create new record
          const newRecord = this.commonRepository.create(navStatus);
          await this.commonRepository.save(newRecord);
        }
      } catch (error) {
        // Skip if already exists due to unique constraint
        console.log(`Skipping nav_status ${navStatus.key} - already exists`);
      }
    }
  }

  /**
   * Bulk insert vessel type data
   */
  async seedVesselTypes(): Promise<void> {
    const vesselTypes = [
      { key: '0', value: 'Not available', description: 'Default vessel type when not specified' },
      { key: '30', value: 'Fishing', description: 'Fishing vessel' },
      { key: '31', value: 'Towing', description: 'Vessel engaged in towing' },
      { key: '32', value: 'Towing (large)', description: 'Vessel engaged in towing (length > 200m)' },
      { key: '33', value: 'Dredging', description: 'Vessel engaged in dredging or underwater operations' },
      { key: '34', value: 'Diving', description: 'Vessel engaged in diving operations' },
      { key: '35', value: 'Military', description: 'Military operations vessel' },
      { key: '36', value: 'Sailing', description: 'Sailing vessel' },
      { key: '37', value: 'Pleasure craft', description: 'Pleasure craft' },
      { key: '40', value: 'High speed craft', description: 'High speed craft (HSC)' },
      { key: '50', value: 'Pilot vessel', description: 'Pilot vessel' },
      { key: '51', value: 'Search and rescue', description: 'Search and rescue vessel' },
      { key: '52', value: 'Tug', description: 'Tug boat' },
      { key: '53', value: 'Port tender', description: 'Port tender' },
      { key: '54', value: 'Anti-pollution', description: 'Anti-pollution equipment' },
      { key: '55', value: 'Law enforcement', description: 'Law enforcement vessel' },
      { key: '58', value: 'Medical transport', description: 'Medical transport' },
      { key: '59', value: 'Non-combatant ship', description: 'Non-combatant ship according to RR Resolution No. 18' },
      { key: '60', value: 'Passenger', description: 'Passenger ship' },
      { key: '70', value: 'Cargo', description: 'Cargo ship' },
      { key: '71', value: 'Cargo (hazardous A)', description: 'Cargo ship carrying hazardous goods category A' },
      { key: '72', value: 'Cargo (hazardous B)', description: 'Cargo ship carrying hazardous goods category B' },
      { key: '73', value: 'Cargo (hazardous C)', description: 'Cargo ship carrying hazardous goods category C' },
      { key: '74', value: 'Cargo (hazardous D)', description: 'Cargo ship carrying hazardous goods category D' },
      { key: '80', value: 'Tanker', description: 'Tanker' },
      { key: '81', value: 'Tanker (hazardous A)', description: 'Tanker carrying hazardous goods category A' },
      { key: '82', value: 'Tanker (hazardous B)', description: 'Tanker carrying hazardous goods category B' },
      { key: '83', value: 'Tanker (hazardous C)', description: 'Tanker carrying hazardous goods category C' },
      { key: '84', value: 'Tanker (hazardous D)', description: 'Tanker carrying hazardous goods category D' },
      { key: '90', value: 'Other', description: 'Other type of ship' },
    ];

    const vesselTypeData = vesselTypes.map(item => ({
      type: 'vessel_type',
      key: item.key,
      value: item.value,
      description: item.description,
      status: true,
    }));

    // Use save with conflict handling
    for (const vesselType of vesselTypeData) {
      try {
        const existing = await this.commonRepository.findOne({
          where: { type: vesselType.type, key: vesselType.key }
        });

        if (existing) {
          // Update existing record
          Object.assign(existing, vesselType);
          await this.commonRepository.save(existing);
        } else {
          // Create new record
          const newRecord = this.commonRepository.create(vesselType);
          await this.commonRepository.save(newRecord);
        }
      } catch (error) {
        // Skip if already exists due to unique constraint
        console.log(`Skipping vessel_type ${vesselType.key} - already exists`);
      }
    }
  }
}
