import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { OpenAIClient } from '@platohq/nestjs-openai';
import { Request, Response } from 'express';
import { UserService } from 'src/services/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private openaiClient: OpenAIClient,
  ) {}

  setRefreshToken(response: Response, refreshToken: string) {
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/auth/refresh_token',
    });
  }

  @Post('/register')
  async register(
    @Body(ValidationPipe) body: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokenPair = await this.userService.register(body);

    this.setRefreshToken(response, tokenPair.refreshToken);

    return { token: tokenPair.token };
  }

  @Post('/login')
  async login(
    @Body(ValidationPipe) body: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokenPair = await this.userService.login(body);

    this.setRefreshToken(response, tokenPair.refreshToken);

    return { token: tokenPair.token };
  }

  @Post('/refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!req.cookies.refreshToken)
      throw new BadRequestException('Refresh token is missing');

    const tokenPair = await this.userService.validateRefreshToken(
      req.cookies.refreshToken,
    );

    this.setRefreshToken(response, tokenPair.refreshToken);

    return { token: tokenPair.token };
  }
}
