import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bullmq';
import { EmailService } from '../email.service';
import { Job } from 'bullmq';

jest.mock('nodemailer', () => ({
  createTransport: (): { sendMail: jest.Mock } => ({
    sendMail: jest.fn(),
  }),
}));

type QueueMock = {
  add: jest.Mock;
};

type ConfigServiceMock = {
  get: jest.Mock;
};

describe('EmailService', () => {
  let service: EmailService;
  let queue: QueueMock;
  let config: ConfigServiceMock;

  beforeEach(async () => {
    queue = {
      add: jest.fn(),
    };

    config = {
      get: jest.fn((key: string) => {
        if (key == 'email.address') return 'test@example.com';
        if (key == 'email.password') return 'password';
        if (key == 'client.url') return 'https://client.example.com';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: getQueueToken('email'),
          useValue: queue,
        },
        {
          provide: ConfigService,
          useValue: config,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should enqueue email using queue', async () => {
    const dto = {
      to: 'user@test.com',
      subject: 'subject',
      html: '<p>body</p>',
    };

    await service.enqueueMail(dto);

    expect(queue.add).toHaveBeenCalledWith(
      'send-email',
      dto,
      expect.objectContaining({
        attempts: 3,
      }),
    );
  });

  it('should generate new password message including password', () => {
    const message = service.createNewPasswordMessage('123456');

    expect(message).toContain('123456');
    expect(message).toContain('https://client.example.com');
  });

  it('should generate account validation message including token', () => {
    const token = 'token123';
    const message = service.createAccountValidationMessage(token);

    expect(message).toContain(token);
    expect(message).toContain('https://client.example.com');
  });

  it('should process job and send email', async () => {
    const transporter = (
      service as unknown as { transporter: { sendMail: jest.Mock } }
    ).transporter;
    const job = {
      data: {
        to: 'user@test.com',
        subject: 'Test',
        html: '<p>Test</p>',
      },
    } as unknown as Job;

    await service.process(job);

    expect(transporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"Vox" <test@example.com>',
        to: 'user@test.com',
      }),
    );
  });
});
