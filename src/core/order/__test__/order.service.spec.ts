import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OrderService } from '../order.service';
import { IOrderRepository } from '../repositories/order.repository';
import { UserService } from '../../user/user.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { FindOrderDto } from '../dto/find-order.dto';
import { Order } from '../entities/order.entity';

type OrderRepositoryMock = {
  create: jest.Mock;
  findMany: jest.Mock;
  findById: jest.Mock;
  update: jest.Mock;
};

type ConfigServiceMock = {
  get: jest.Mock;
};

type UserServiceMock = {
  findById: jest.Mock;
};

describe('OrderService', () => {
  let service: OrderService;
  let repo: OrderRepositoryMock;
  let config: ConfigServiceMock;
  let userService: UserServiceMock;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      findMany: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };

    config = {
      get: jest.fn(() => 100),
    };

    userService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: ConfigService, useValue: config },
        { provide: IOrderRepository, useValue: repo },
        { provide: UserService, useValue: userService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate value and create order', async () => {
    const dto = {
      plan: 'BASIC',
      votes: 2,
      user: 'user-id',
    } as unknown as CreateOrderDto;

    repo.create.mockResolvedValue({ id: 'order-id' } as unknown as Order);

    const result = await service.create(dto);

    expect(userService.findById).toHaveBeenCalledWith('user-id');
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(result).toHaveProperty('id', 'order-id');
  });

  it('should delegate findMany to repository', async () => {
    const dto = {} as FindOrderDto;
    const expected = [{} as Order];
    repo.findMany.mockResolvedValue(expected);

    const result = await service.findMany('user-id', dto);

    expect(repo.findMany).toHaveBeenCalledWith('user-id', dto);
    expect(result).toEqual(expected);
  });

  it('should throw when order not found', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.findById('id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
