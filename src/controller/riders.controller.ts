import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { RidersService } from '../service/riders.service';
import { CreateRider } from '../model/create.rider';
import { Rider } from '../model/rider';
import { JwtAuthGuard } from 'src/auth-strategies/jwt.auth.guard';

//@UseGuards(JwtAuthGuard)
@Controller('bhb-customer-backend/riders')
export class RidersController {
  private readonly logger = new Logger(RidersController.name);
  constructor(private readonly ridersService: RidersService) {}

  @Post()
  async create(@Body() createRiderDto: CreateRider): Promise<Rider> {
    this.logger.log('Creating rider');
    const rider = await this.ridersService.create(createRiderDto);
    this.logger.log('Rider created successfully');
    return rider;
  }

  @Get()
  findAll() {
    this.logger.log('Finding all riders');
    const riders = this.ridersService.findAll();
    return riders;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log(`Finding rider with id: ${id}`);
    throw new Error('Method not implemented.');
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    this.logger.log(`Updating rider with id: ${id}`);
    throw new Error('Method not implemented.');
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.logger.log(`Removing rider with id: ${id}`);
    return this.ridersService.remove(id);
  }
}
