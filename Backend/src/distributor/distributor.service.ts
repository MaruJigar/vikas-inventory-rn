import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Distributor } from './distributor.entity';
import { UpdateDistributorProfileDto } from './dto/update-distributor-profile.dto';

@Injectable()
export class DistributorService {
  constructor(
    @InjectRepository(Distributor) private distributorRepo: Repository<Distributor>,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.distributorRepo.findOne({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Distributor profile not found');
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateDistributorProfileDto) {
    const profile = await this.getProfile(userId);
    Object.assign(profile, dto);
    return this.distributorRepo.save(profile);
  }
}
