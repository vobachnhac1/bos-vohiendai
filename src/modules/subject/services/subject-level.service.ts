import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubjectLevel } from '../entities/subject-level.entity';
import { Subject } from '../entities/subject.entity';
import { CreateSubjectLevelDto } from '../dto/create-subject-level.dto';
import { UpdateSubjectLevelDto } from '../dto/update-subject-level.dto';
import { SubjectLevelQueryDto } from '../dto/subject-level-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class SubjectLevelService {
  constructor(
    @InjectRepository(SubjectLevel)
    private readonly subjectLevelRepository: Repository<SubjectLevel>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async create(
    createSubjectLevelDto: CreateSubjectLevelDto,
  ): Promise<SubjectLevel> {
    // Kiểm tra subject tồn tại
    const subject = await this.subjectRepository.findOne({
      where: { id: createSubjectLevelDto.subjectId },
    });
    if (!subject) {
      throw new NotFoundException(
        `Subject with ID ${createSubjectLevelDto.subjectId} not found`,
      );
    }

    // Kiểm tra duplicate code trong cùng subject
    const existingCode = await this.subjectLevelRepository.findOne({
      where: {
        subjectId: createSubjectLevelDto.subjectId,
        code: createSubjectLevelDto.code,
      },
    });
    if (existingCode) {
      throw new ConflictException(
        `Level with code ${createSubjectLevelDto.code} already exists in this subject`,
      );
    }

    // Kiểm tra duplicate orderIndex trong cùng subject
    const existingOrder = await this.subjectLevelRepository.findOne({
      where: {
        subjectId: createSubjectLevelDto.subjectId,
        orderIndex: createSubjectLevelDto.orderIndex,
      },
    });
    if (existingOrder) {
      throw new ConflictException(
        `Order index ${createSubjectLevelDto.orderIndex} already exists in this subject`,
      );
    }

    const subjectLevel = this.subjectLevelRepository.create(
      createSubjectLevelDto,
    );
    return await this.subjectLevelRepository.save(subjectLevel);
  }

  async findAll(
    query: SubjectLevelQueryDto,
  ): Promise<PaginatedResponseDto<SubjectLevel>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'orderIndex',
      sortOrder = 'ASC',
      subjectId,
      code,
      name,
      status,
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.subjectLevelRepository
      .createQueryBuilder('level')
      .leftJoinAndSelect('level.subject', 'subject');

    // Filters
    if (subjectId) {
      queryBuilder.andWhere('level.subjectId = :subjectId', { subjectId });
    }

    if (code) {
      queryBuilder.andWhere('level.code ILIKE :code', {
        code: `%${code}%`,
      });
    }

    if (name) {
      queryBuilder.andWhere('level.name ILIKE :name', {
        name: `%${name}%`,
      });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('level.status = :status', { status });
    }

    // Sorting
    const allowedSortFields = [
      'id',
      'code',
      'name',
      'orderIndex',
      'createdAt',
      'updatedAt',
    ];
    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : 'orderIndex';

    queryBuilder
      .orderBy(`level.${sortField}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return PaginatedResponseDto.create(items, total, page, limit);
  }

  async findOne(id: number): Promise<SubjectLevel> {
    const subjectLevel = await this.subjectLevelRepository.findOne({
      where: { id },
      relations: ['subject'],
    });

    if (!subjectLevel) {
      throw new NotFoundException(`SubjectLevel with ID ${id} not found`);
    }

    return subjectLevel;
  }

  async findBySubject(subjectId: number): Promise<SubjectLevel[]> {
    return await this.subjectLevelRepository.find({
      where: { subjectId },
      order: { orderIndex: 'ASC' },
    });
  }

  async update(
    id: number,
    updateSubjectLevelDto: UpdateSubjectLevelDto,
  ): Promise<SubjectLevel> {
    const subjectLevel = await this.findOne(id);

    // Kiểm tra duplicate code nếu thay đổi code
    if (updateSubjectLevelDto.code && updateSubjectLevelDto.code !== subjectLevel.code) {
      const existingCode = await this.subjectLevelRepository.findOne({
        where: {
          subjectId: subjectLevel.subjectId,
          code: updateSubjectLevelDto.code,
        },
      });
      if (existingCode) {
        throw new ConflictException(
          `Level with code ${updateSubjectLevelDto.code} already exists in this subject`,
        );
      }
    }

    // Kiểm tra duplicate orderIndex nếu thay đổi orderIndex
    if (
      updateSubjectLevelDto.orderIndex !== undefined &&
      updateSubjectLevelDto.orderIndex !== subjectLevel.orderIndex
    ) {
      const existingOrder = await this.subjectLevelRepository.findOne({
        where: {
          subjectId: subjectLevel.subjectId,
          orderIndex: updateSubjectLevelDto.orderIndex,
        },
      });
      if (existingOrder) {
        throw new ConflictException(
          `Order index ${updateSubjectLevelDto.orderIndex} already exists in this subject`,
        );
      }
    }

    Object.assign(subjectLevel, updateSubjectLevelDto);
    return await this.subjectLevelRepository.save(subjectLevel);
  }

  async remove(id: number): Promise<void> {
    const subjectLevel = await this.findOne(id);
    await this.subjectLevelRepository.remove(subjectLevel);
  }

  async toggleStatus(id: number): Promise<SubjectLevel> {
    const subjectLevel = await this.findOne(id);
    subjectLevel.status = subjectLevel.status === true ? false : true;
    return await this.subjectLevelRepository.save(subjectLevel);
  }
}


