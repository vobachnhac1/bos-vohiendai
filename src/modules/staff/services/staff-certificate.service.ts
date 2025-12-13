import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffCertificate } from '../entities/staff-certificate.entity';
import { Staff } from '../entities/staff.entity';
import { Certificate } from '../../certificate/entities/certificate.entity';
import { CreateStaffCertificateDto } from '../dto/create-staff-certificate.dto';
import { UpdateStaffCertificateDto } from '../dto/update-staff-certificate.dto';
import { StaffCertificateQueryDto } from '../dto/staff-certificate-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class StaffCertificateService {
  constructor(
    @InjectRepository(StaffCertificate)
    private readonly staffCertificateRepository: Repository<StaffCertificate>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
  ) {}

  async create(
    createStaffCertificateDto: CreateStaffCertificateDto,
    userId?: number,
  ): Promise<StaffCertificate> {
    // Kiểm tra staff tồn tại
    const staff = await this.staffRepository.findOne({
      where: { id: createStaffCertificateDto.staffId, isDeleted: false },
    });
    if (!staff) {
      throw new NotFoundException(
        `Staff with ID ${createStaffCertificateDto.staffId} not found`,
      );
    }

    // Kiểm tra certificate tồn tại
    const certificate = await this.certificateRepository.findOne({
      where: { id: createStaffCertificateDto.certificateId, isDeleted:  false },
    });
    if (!certificate) {
      throw new NotFoundException(
        `Certificate with ID ${createStaffCertificateDto.certificateId} not found`,
      );
    }

    // Kiểm tra duplicate
    const existing = await this.staffCertificateRepository.findOne({
      where: {
        staffId: createStaffCertificateDto.staffId,
        certificateId: createStaffCertificateDto.certificateId,
        isDeleted:  false,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Staff already has this certificate assigned`,
      );
    }

    const staffCertificate = this.staffCertificateRepository.create({
      ...createStaffCertificateDto,
      createdBy: userId,
    });

    return await this.staffCertificateRepository.save(staffCertificate);
  }

  async findAll(
    query: StaffCertificateQueryDto,
  ): Promise<PaginatedResponseDto<StaffCertificate>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      staffId,
      certificateId,
      achievementStatus,
      rank,
      issuedBy,
      status,
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.staffCertificateRepository
      .createQueryBuilder('sc')
      .leftJoinAndSelect('sc.staff', 'staff')
      .leftJoinAndSelect('sc.certificate', 'certificate')
      .where('sc.isDeleted = :isDeleted', { isDeleted: 0 });

    // Filters
    if (staffId) {
      queryBuilder.andWhere('sc.staffId = :staffId', { staffId });
    }

    if (certificateId) {
      queryBuilder.andWhere('sc.certificateId = :certificateId', {
        certificateId,
      });
    }

    if (achievementStatus) {
      queryBuilder.andWhere('sc.achievementStatus = :achievementStatus', {
        achievementStatus,
      });
    }

    if (rank) {
      queryBuilder.andWhere('sc.rank = :rank', { rank });
    }

    if (issuedBy) {
      queryBuilder.andWhere('sc.issuedBy ILIKE :issuedBy', {
        issuedBy: `%${issuedBy}%`,
      });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('sc.status = :status', { status });
    }

    // Sorting
    const allowedSortFields = [
      'id',
      'issuedDate',
      'expiryDate',
      'score',
      'createdAt',
      'updatedAt',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    queryBuilder
      .orderBy(`sc.${sortField}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return PaginatedResponseDto.create(items, total, page, limit);
  }

  async findOne(id: number): Promise<StaffCertificate> {
    const staffCertificate = await this.staffCertificateRepository.findOne({
      where: { id, isDeleted:  false },
      relations: ['staff', 'certificate'],
    });

    if (!staffCertificate) {
      throw new NotFoundException(`StaffCertificate with ID ${id} not found`);
    }

    return staffCertificate;
  }

  async findByStaff(staffId: number): Promise<StaffCertificate[]> {
    return await this.staffCertificateRepository.find({
      where: { staffId, isDeleted: false },
      relations: ['certificate'],
      order: { issuedDate: 'DESC' },
    });
  }

  async findByCertificate(certificateId: number): Promise<StaffCertificate[]> {
    return await this.staffCertificateRepository.find({
      where: { certificateId, isDeleted: false },
      relations: ['staff'],
      order: { issuedDate: 'DESC' },
    });
  }

  async update(
    id: number,
    updateStaffCertificateDto: UpdateStaffCertificateDto,
    userId?: number,
  ): Promise<StaffCertificate> {
    const staffCertificate = await this.findOne(id);

    Object.assign(staffCertificate, {
      ...updateStaffCertificateDto,
      updatedBy: userId,
    });

    return await this.staffCertificateRepository.save(staffCertificate);
  }

  async remove(id: number, userId?: number): Promise<void> {
    const staffCertificate = await this.findOne(id);

    // Soft delete
    staffCertificate.isDeleted = true;
    staffCertificate.updatedBy = userId;

    await this.staffCertificateRepository.save(staffCertificate);
  }

  async toggleStatus(id: number, userId?: number): Promise<StaffCertificate> {
    const staffCertificate = await this.findOne(id);

    staffCertificate.status = staffCertificate.status === true ? false : true;
    staffCertificate.updatedBy = userId;

    return await this.staffCertificateRepository.save(staffCertificate);
  }
}
