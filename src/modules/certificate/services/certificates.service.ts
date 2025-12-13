import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '../entities/certificate.entity';
import { CreateCertificateDto } from '../dto/create-certificate.dto';
import { UpdateCertificateDto } from '../dto/update-certificate.dto';
import { CertificateQueryDto } from '../dto/certificate-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
  ) {}

  async create(
    createCertificateDto: CreateCertificateDto,
    userId?: number,
  ): Promise<Certificate> {
    // Kiểm tra mã chứng chỉ đã tồn tại chưa
    const existing = await this.certificateRepository.findOne({
      where: { code: createCertificateDto.code, isDeleted: false },
    });

    if (existing) {
      throw new ConflictException(
        `Certificate with code '${createCertificateDto.code}' already exists`,
      );
    }

    const certificate = this.certificateRepository.create({
      ...createCertificateDto,
      createdBy: userId,
    });

    return await this.certificateRepository.save(certificate);
  }

  async findAll(
    query: CertificateQueryDto,
  ): Promise<PaginatedResponseDto<Certificate>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      code,
      name,
      certificateType,
      level,
      organizer,
      status,
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.certificateRepository
      .createQueryBuilder('certificate')
      .where('certificate.isDeleted = :isDeleted', { isDeleted: 0 });

    // Filters
    if (code) {
      queryBuilder.andWhere('certificate.code ILIKE :code', {
        code: `%${code}%`,
      });
    }

    if (name) {
      queryBuilder.andWhere('certificate.name ILIKE :name', {
        name: `%${name}%`,
      });
    }

    if (certificateType) {
      queryBuilder.andWhere('certificate.certificateType = :certificateType', {
        certificateType,
      });
    }

    if (level) {
      queryBuilder.andWhere('certificate.level = :level', { level });
    }

    if (organizer) {
      queryBuilder.andWhere('certificate.organizer ILIKE :organizer', {
        organizer: `%${organizer}%`,
      });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('certificate.status = :status', { status });
    }

    // Sorting
    const allowedSortFields = [
      'id',
      'code',
      'name',
      'eventDate',
      'createdAt',
      'updatedAt',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    queryBuilder
      .orderBy(`certificate.${sortField}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return PaginatedResponseDto.create(items, total, page, limit);
  }

  async findOne(id: number): Promise<Certificate> {
    const certificate = await this.certificateRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['staffCertificates', 'staffCertificates.staff'],
    });

    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }

    return certificate;
  }

  async findByCode(code: string): Promise<Certificate | null> {
    return await this.certificateRepository.findOne({
      where: { code, isDeleted: false },
    });
  }

  async update(
    id: number,
    updateCertificateDto: UpdateCertificateDto,
    userId?: number,
  ): Promise<Certificate> {
    const certificate = await this.findOne(id);

    // Kiểm tra conflict nếu đổi mã
    if (updateCertificateDto.code && updateCertificateDto.code !== certificate.code) {
      const existing = await this.certificateRepository.findOne({
        where: { code: updateCertificateDto.code, isDeleted:  false },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Certificate with code '${updateCertificateDto.code}' already exists`,
        );
      }
    }

    Object.assign(certificate, {
      ...updateCertificateDto,
      updatedBy: userId,
    });

    return await this.certificateRepository.save(certificate);
  }

  async remove(id: number, userId?: number): Promise<void> {
    const certificate = await this.findOne(id);

    // Soft delete
    certificate.isDeleted = true;
    certificate.updatedBy = userId;

    await this.certificateRepository.save(certificate);
  }

  async toggleStatus(id: number, userId?: number): Promise<Certificate> {
    const certificate = await this.findOne(id);

    certificate.status = certificate.status === true ? false : true;
    certificate.updatedBy = userId;

    return await this.certificateRepository.save(certificate);
  }
}
