/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt } from 'passport-jwt';

jest.mock('@nestjs/config');

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('should validate payload', async () => {
    const payload = { sub: 1, username: 'testuser' };
    const result = await jwtStrategy.validate(payload);
    expect(result).toEqual({ userId: payload.sub, username: payload.username });
  });

  it('should extract JWT from auth header as Bearer token', () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer test-token',
      },
    };
    const extractJwt = ExtractJwt.fromAuthHeaderAsBearerToken();
    const token = extractJwt(mockRequest);
    expect(token).toBe('test-token');
  });
});
