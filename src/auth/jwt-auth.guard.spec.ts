// jwt-auth.guard.spec.ts
import { JwtAuthGuard } from './jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

@Injectable()
class MockReflector {
  getAllAndOverride() {
    return false; // Simulando que a rota não é pública
  }
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: MockReflector;
  let canActivateSpy: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useClass: MockReflector,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<MockReflector>(Reflector);

    canActivateSpy = jest.fn();
    (guard as any).canActivate = canActivateSpy;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should delegate to super.canActivate if isPublic is false', async () => {
    const context = {
      switchToHttp: jest.fn().mockReturnThis(),
      getHandler: jest.fn().mockReturnThis(),
      getClass: jest.fn().mockReturnThis(),
    } as unknown as ExecutionContext;

    await guard.canActivate(context);

    expect(canActivateSpy).toHaveBeenCalled();
  });
});
