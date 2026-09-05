import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesmanController } from './salesman.controller';
import { SalesmanService } from './salesman.service';
import { Salesman } from './salesman.entity';
import { User } from '../user/user.entity';
import { Distributor } from '../distributor/distributor.entity';
import { ApprovalRequest } from '../approval/approval-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Salesman, User, Distributor, ApprovalRequest]),
  ],
  controllers: [SalesmanController],
  providers: [SalesmanService],
  exports: [SalesmanService],
})
export class SalesmanModule {}
