import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../entities/staff.entity';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import { StaffQueryDto } from '../dto/staff-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async create(
    createStaffDto: CreateStaffDto,
    userId?: number,
  ): Promise<Staff> {
    const staff = this.staffRepository.create({
      ...createStaffDto,
      createdBy: userId,
    });

    return await this.staffRepository.save(staff);
  }

  async findAll(query: StaffQueryDto): Promise<PaginatedResponseDto<Staff>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      tenantId,
      fullName,
      phone,
      email,
      idNumber,
      position,
      staffType,
      gender,
      status,
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.staffRepository
      .createQueryBuilder('staff')
      .where('staff.isDeleted = :isDeleted', { isDeleted: 0 });

    // Filters
    if (tenantId) {
      queryBuilder.andWhere('staff.tenantId = :tenantId', { tenantId });
    }

    if (fullName) {
      queryBuilder.andWhere('staff.fullName ILIKE :fullName', {
        fullName: `%${fullName}%`,
      });
    }

    if (phone) {
      queryBuilder.andWhere('staff.phone ILIKE :phone', {
        phone: `%${phone}%`,
      });
    }

    if (email) {
      queryBuilder.andWhere('staff.email ILIKE :email', {
        email: `%${email}%`,
      });
    }

    if (idNumber) {
      queryBuilder.andWhere('staff.idNumber = :idNumber', { idNumber });
    }

    if (position) {
      queryBuilder.andWhere('staff.position = :position', { position });
    }

    if (staffType) {
      queryBuilder.andWhere('staff.staffType = :staffType', { staffType });
    }

    if (gender !== undefined) {
      queryBuilder.andWhere('staff.gender = :gender', { gender });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('staff.status = :status', { status });
    }

    // Sorting
    const allowedSortFields = [
      'id',
      'fullName',
      'phone',
      'email',
      'position',
      'joinDate',
      'createdAt',
      'updatedAt',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    queryBuilder
      .orderBy(`staff.${sortField}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return PaginatedResponseDto.create(items, total, page, limit);
  }

  async findOne(id: number): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['contacts', 'staffCertificates', 'staffCertificates.certificate'],
    });

    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    return staff;
  }

  async findByTenant(tenantId: number): Promise<Staff[]> {
    return await this.staffRepository.find({
      where: { tenantId, isDeleted: false },
      order: { fullName: 'ASC' },
    });
  }

  async update(
    id: number,
    updateStaffDto: UpdateStaffDto,
    userId?: number,
  ): Promise<Staff> {
    const staff = await this.findOne(id);

    Object.assign(staff, {
      ...updateStaffDto,
      updatedBy: userId,
    });

    return await this.staffRepository.save(staff);
  }

  async remove(id: number, userId?: number): Promise<void> {
    const staff = await this.findOne(id);

    // Soft delete
    staff.isDeleted = true;
    staff.updatedBy = userId;

    await this.staffRepository.save(staff);
  }

  async updateStatus(
    id: number,
    status: number,
    userId?: number,
  ): Promise<Staff> {
    const staff = await this.findOne(id);

    staff.status = status;
    staff.updatedBy = userId;

    return await this.staffRepository.save(staff);
  }
}
