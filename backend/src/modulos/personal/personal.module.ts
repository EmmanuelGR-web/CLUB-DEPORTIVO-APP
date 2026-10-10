import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jornada, Personal } from './personal.entity';
import { PersonalService } from './personal.service';
import { JornadasService } from './jornadas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Personal, Jornada])],
  providers: [PersonalService, JornadasService],
  exports: [PersonalService, JornadasService],
})
export class PersonalModule {}
