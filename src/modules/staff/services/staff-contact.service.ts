import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffContact } from '../entities/staff-contact.entity';
import { Staff } from '../entities/staff.entity';
import { CreateStaffContactDto } from '../dto/create-staff-contact.dto';
import { UpdateStaffContactDto } from '../dto/update-staff-contact.dto';
import { StaffContactQueryDto } from '../dto/staff-contact-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class StaffContactService {
  constructor(
    @InjectRepository(StaffContact)
    private readonly staffContactRepository: Repository<StaffContact>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async create(
    createStaffContactDto: CreateStaffContactDto,
    userId?: number,
  ): Promise<StaffContact> {
    // Kiểm tra staff tồn tại
    const staff = await this.staffRepository.findOne({
      where: { id: createStaffContactDto.staffId, isDeleted: false },
    });
    if (!staff) {
      throw new NotFoundException(
        `Staff with ID ${createStaffContactDto.staffId} not found`,
      );
    }

    // Nếu đặt làm primary, bỏ primary của các contact khác
    if (createStaffContactDto.isPrimary === true) {
      await this.staffContactRepository.update(
        { staffId: createStaffContactDto.staffId, isPrimary: true },
        { isPrimary: false },
      );
    }

    const staffContact = this.staffContactRepository.create({
      ...createStaffContactDto,
      createdBy: userId,
    });

    return await this.staffContactRepository.save(staffContact);
  }

  async findAll(
    query: StaffContactQueryDto,
  ): Promise<PaginatedResponseDto<StaffContact>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      staffId,
      fullName,
      phone,
      relationship,
      isPrimary,
      status,
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.staffContactRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.staff', 'staff')
      .where('contact.isDeleted = :isDeleted', { isDeleted: 0 });

    // Filters
    if (staffId) {
      queryBuilder.andWhere('contact.staffId = :staffId', { staffId });
    }

    if (fullName) {
      queryBuilder.andWhere('contact.fullName ILIKE :fullName', {
        fullName: `%${fullName}%`,
      });
    }

    if (phone) {
      queryBuilder.andWhere('contact.phone ILIKE :phone', {
        phone: `%${phone}%`,
      });
    }

    if (relationship) {
      queryBuilder.andWhere('contact.relationship = :relationship', {
        relationship,
      });
    }

    if (isPrimary !== undefined) {
      queryBuilder.andWhere('contact.isPrimary = :isPrimary', { isPrimary });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('contact.status = :status', { status });
    }

    // Sorting
    const allowedSortFields = [
      'id',
      'fullName',
      'phone',
      'isPrimary',
      'createdAt',
      'updatedAt',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    queryBuilder
      .orderBy(`contact.${sortField}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return PaginatedResponseDto.create(items, total, page, limit);
  }

  async findOne(id: number): Promise<StaffContact> {
    const staffContact = await this.staffContactRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['staff'],
    });

    if (!staffContact) {
      throw new NotFoundException(`StaffContact with ID ${id} not found`);
    }

    return staffContact;
  }

  async findByStaff(staffId: number): Promise<StaffContact[]> {
    return await this.staffContactRepository.find({
      where: { staffId, isDeleted: false },
      order: { isPrimary: 'DESC', createdAt: 'DESC' },
    });
  }

  async findPrimaryContact(staffId: number): Promise<StaffContact | null> {
    return await this.staffContactRepository.findOne({
      where: { staffId, isPrimary: true, isDeleted: false },
    });
  }

  async update(
    id: number,
    updateStaffContactDto: UpdateStaffContactDto,
    userId?: number,
  ): Promise<StaffContact> {
    const staffContact = await this.findOne(id);

    // Nếu đặt làm primary, bỏ primary của các contact khác
    if (updateStaffContactDto.isPrimary === true) {
      await this.staffContactRepository
        .createQueryBuilder()
        .update(StaffContact)
        .set({ isPrimary: false})
        .where('staffId = :staffId', { staffId: staffContact.staffId })
        .andWhere('isPrimary = :isPrimary', { isPrimary: 1 })
        .andWhere('id != :id', { id })
        .execute();
    }

    Object.assign(staffContact, {
      ...updateStaffContactDto,
      updatedBy: userId,
    });

    return await this.staffContactRepository.save(staffContact);
  }

  async remove(id: number, userId?: number): Promise<void> {
    const staffContact = await this.findOne(id);

    // Soft delete
    staffContact.isDeleted = true;
    staffContact.updatedBy = userId;

    await this.staffContactRepository.save(staffContact);
  }

  async setPrimary(id: number, userId?: number): Promise<StaffContact> {
    const staffContact = await this.findOne(id);

    // Bỏ primary của các contact khác
    await this.staffContactRepository.update(
      { staffId: staffContact.staffId, isPrimary: true },
      { isPrimary: false },
    );

    // Đặt contact này làm primary
    staffContact.isPrimary = true;
    staffContact.updatedBy = userId;

    return await this.staffContactRepository.save(staffContact);
  }

  async toggleStatus(id: number, userId?: number): Promise<StaffContact> {
    const staffContact = await this.findOne(id);

    staffContact.status = staffContact.status === true ? false : true;
    staffContact.updatedBy = userId;

    return await this.staffContactRepository.save(staffContact);
  }
}
