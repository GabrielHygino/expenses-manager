import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/users/dto/user.model';
import * as argon2 from 'argon2';
import { ErrorConstants } from 'src/constants/error.constants';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findFirst({
      where: { username: username },
    });

    if (!user) {
      return null;
    }

    if (!argon2.verify(user.password, password)) {
      return null;
    }

    return user;
  }

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
      throw ErrorConstants.ERROR_001;
    }
    const emailExists = await this.prisma.user.findUnique({
      where: {
        username: createUserDto.email,
      },
    });

    if (emailExists) {
      throw ErrorConstants.ERROR_002;
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
