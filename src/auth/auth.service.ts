import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/users/dto/user.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { username: username },
    });

    if (user && (await argon2.verify(user.password, password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  s;
  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await argon2.hash(createUserDto.password);

    const exists = await this.prisma.user.findUnique({
      where: {
        username: createUserDto.username,
      },
    });

    if (exists) {
      throw new ConflictException('username already exists');
    }
    const emailExists = await this.prisma.user.findUnique({
      where: {
        username: createUserDto.email,
      },
    });

    if (emailExists) {
      throw new ConflictException('email already used');
    }

    const newUser = await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashedPassword,
      },
    });

    return {
      access_token: this.jwtService.sign(newUser),
    };
  }
}
