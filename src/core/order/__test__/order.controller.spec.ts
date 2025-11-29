import { OrderController } from '../order.controller';
import { OrderService } from '../order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { FindOrderDto } from '../dto/find-order.dto';
import { Order } from '../entities/order.entity';
import { AuthRequest } from '../../../shared/interfaces/auth-request';

type OrderServiceMock = {
  create: jest.Mock;
  findMany: jest.Mock;
  findById: jest.Mock;
};

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderServiceMock;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findMany: jest.fn(),
      findById: jest.fn(),
    };

    controller = new OrderController(service as unknown as OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate create to service', async () => {
    const dto = {} as CreateOrderDto;
    const expected = {} as Order;

    service.create.mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('should delegate findMany to service', async () => {
    const req = { user: 'user-id' } as unknown as AuthRequest;
    const query = {} as FindOrderDto;
    const expected = [{} as Order];

    service.findMany.mockResolvedValue(expected);

    const result = await controller.findMany(req, query);

    expect(service.findMany).toHaveBeenCalledWith('user-id', query);
    expect(result).toEqual(expected);
  });

  it('should delegate findById to service', async () => {
    const expected = { id: 'order-id' } as unknown as Order;
    service.findById.mockResolvedValue(expected);

    const result = await controller.findById('order-id');

    expect(service.findById).toHaveBeenCalledWith('order-id');
    expect(result).toEqual(expected);
  });
});
