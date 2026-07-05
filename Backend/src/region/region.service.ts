import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from './entities/state.entity';
import { City } from './entities/city.entity';
import { CityQueryDto } from './dto/city-query.dto';

@Injectable()
export class RegionService {
  constructor(
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) { }

  async findAllStates(): Promise<{ id: string; name: string }[]> {
    const states = await this.stateRepository.find({
      select: {
        id: true,
        name: true,
      },
      order: {
        name: 'ASC',
      },
    });
    return states.map(state => ({
      id: state.id,
      name: state.name,
    }));
  }

  async findCities(query: CityQueryDto): Promise<{ id: string; name: string; state_id: string }[]> {
    const stateId = query.state_id;

    const cities = await this.cityRepository.find({
      select: {
        id: true,
        name: true,
        state_id: true,
      },
      where: stateId ? { state_id: stateId } : {},
      order: {
        name: 'ASC',
      },
    });

    return cities.map(city => ({
      id: city.id,
      name: city.name,
      state_id: city.state_id,
    }));
  }
}
