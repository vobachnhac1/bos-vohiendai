import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from '../entities/subject.entity';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';
import { SubjectQueryDto } from '../dto/subject-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    // Kiểm tra duplicate code
    const existing = await this.subjectRepository.findOne({
      where: { code: createSubjectDto.code },
    });
    if (existing) {
      throw new ConflictException(
        `Subject with code ${createSubjectDto.code} already exists`,
      );
    }

    const subject = this.subjectRepository.create(createSubjectDto);
    return await this.subjectRepository.save(subject);
  }

  async findAll(
    query: SubjectQueryDto,
  ): Promise<PaginatedResponseDto<Subject>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      code,
      name,
      status,
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.subjectRepository.createQueryBuilder('subject');

    // Filters
    if (code) {
      queryBuilder.andWhere('subject.code ILIKE :code', {
        code: `%${code}%`,
      });
    }

    if (name) {
      queryBuilder.andWhere('subject.name ILIKE :name', {
        name: `%${name}%`,
      });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('subject.status = :status', { status });
    }

    // Sorting
    const allowedSortFields = ['id', 'code', 'name', 'createdAt', 'updatedAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    queryBuilder
      .orderBy(`subject.${sortField}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return PaginatedResponseDto.create(items, total, page, limit);
  }

  async findOne(id: number): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({
      where: { id },
      relations: ['subjectLevels'],
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return subject;
  }

  async findByCode(code: string): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({
      where: { code },
      relations: ['subjectLevels'],
    });

    if (!subject) {
      throw new NotFoundException(`Subject with code ${code} not found`);
    }

    return subject;
  }

  async update(
    id: number,
    updateSubjectDto: UpdateSubjectDto,
  ): Promise<Subject> {
    const subject = await this.findOne(id);

    // Kiểm tra duplicate code nếu thay đổi code
    if (updateSubjectDto.code && updateSubjectDto.code !== subject.code) {
      const existing = await this.subjectRepository.findOne({
        where: { code: updateSubjectDto.code },
      });
      if (existing) {
        throw new ConflictException(
          `Subject with code ${updateSubjectDto.code} already exists`,
        );
      }
    }

    Object.assign(subject, updateSubjectDto);
    return await this.subjectRepository.save(subject);
  }

  async remove(id: number): Promise<void> {
    const subject = await this.findOne(id);
    await this.subjectRepository.remove(subject);
  }

  async toggleStatus(id: number): Promise<Subject> {
    const subject = await this.findOne(id);
    subject.status = subject.status === true ? false : true;
    return await this.subjectRepository.save(subject);
  }
}

