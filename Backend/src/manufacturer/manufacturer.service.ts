import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Manufacturer } from './manufacturer.entity';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { Distributor } from '../distributor/distributor.entity';
import { ManufacturerDistributor } from '../distributor/manufacturer-distributor.entity';

@Injectable()
export class ManufacturerService {
  constructor(
    @InjectRepository(Manufacturer) private manufacturerRepo: Repository<Manufacturer>,
    private dataSource: DataSource,
  ) {}

  async createProfile(userId: string, dto: CreateManufacturerDto) {
    const existing = await this.manufacturerRepo.findOne({ where: { user_id: userId } });
    if (existing) throw new BadRequestException('Manufacturer profile already exists');

    const profile = this.manufacturerRepo.create({
      user_id: userId,
      ...dto,
    });
    return this.manufacturerRepo.save(profile);
  }

  async getProfile(userId: string) {
    const profile = await this.manufacturerRepo.findOne({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Manufacturer profile not found');
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateManufacturerDto) {
    const profile = await this.getProfile(userId);
    Object.assign(profile, dto);
    return this.manufacturerRepo.save(profile);
  }

  async linkDistributor(manufacturerId: string, distributorId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manufacturer = await queryRunner.manager.findOne(Manufacturer, { where: { id: manufacturerId } });
      const distributor = await queryRunner.manager.findOne(Distributor, { where: { id: distributorId } });
      
      if (!manufacturer || !distributor) throw new NotFoundException('Manufacturer or Distributor not found');

      const link = queryRunner.manager.create(ManufacturerDistributor, {
        manufacturer_id: manufacturerId,
        distributor_id: distributorId,
      });

      await queryRunner.manager.save(link);
      await queryRunner.commitTransaction();
      return link;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
