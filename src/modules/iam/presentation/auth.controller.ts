import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { minutes, Throttle } from '@nestjs/throttler';

import type { AuthenticatedUser } from '../../../shared/presentation/index.js';
import { ApiProblemResponses, CurrentUser, Public } from '../../../shared/presentation/index.js';
import { GetCurrentUserUseCase } from '../application/use-cases/get-current-user.use-case.js';
import { LoginUseCase } from '../application/use-cases/login.use-case.js';
import { LogoutUseCase } from '../application/use-cases/logout.use-case.js';
import { RefreshTokensUseCase } from '../application/use-cases/refresh-tokens.use-case.js';
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case.js';
import { toUserResponse } from './auth.presenter.js';
import type {
  AuthTokensResponse,
  LoginBody,
  RefreshBody,
  RegisterBody,
  UserResponse,
} from './auth.schemas.js';
import {
  authTokensResponseSchema,
  loginBodySchema,
  refreshBodySchema,
  registerBodySchema,
  userResponseSchema,
} from './auth.schemas.js';

/** Stricter rate limit for credential endpoints. */
const CREDENTIAL_THROTTLE = { default: { limit: 10, ttl: minutes(1) } };

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly login: LoginUseCase,
    private readonly refreshTokens: RefreshTokensUseCase,
    private readonly logout: LogoutUseCase,
    private readonly getCurrentUser: GetCurrentUserUseCase,
  ) {}

  @Post('register')
  @Public()
  @Throttle(CREDENTIAL_THROTTLE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new account',
    description: 'New accounts get the `user` role.',
  })
  @ApiCreatedResponse({ description: 'The new account', standardSchema: userResponseSchema })
  @ApiProblemResponses(HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT, HttpStatus.UNPROCESSABLE_ENTITY)
  async register(@Body({ schema: registerBodySchema }) body: RegisterBody): Promise<UserResponse> {
    return toUserResponse(await this.registerUser.execute(body));
  }

  @Post('login')
  @Public()
  @Throttle(CREDENTIAL_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in', description: 'Returns an access token and a refresh token.' })
  @ApiOkResponse({
    description: 'Access and refresh tokens',
    standardSchema: authTokensResponseSchema,
  })
  @ApiProblemResponses(HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED)
  async signIn(@Body({ schema: loginBodySchema }) body: LoginBody): Promise<AuthTokensResponse> {
    return this.login.execute(body);
  }

  @Post('refresh')
  @Public()
  @Throttle(CREDENTIAL_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh tokens',
    description: 'Rotates the refresh token: the presented token is invalidated.',
  })
  @ApiOkResponse({
    description: 'Fresh access and refresh tokens',
    standardSchema: authTokensResponseSchema,
  })
  @ApiProblemResponses(HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED)
  async refresh(
    @Body({ schema: refreshBodySchema }) body: RefreshBody,
  ): Promise<AuthTokensResponse> {
    return this.refreshTokens.execute(body);
  }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Log out',
    description: 'Revokes the refresh token of the current session.',
  })
  @ApiNoContentResponse({ description: 'Session revoked' })
  @ApiProblemResponses(HttpStatus.UNAUTHORIZED)
  async signOut(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.logout.execute({ userId: user.id });
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current account' })
  @ApiOkResponse({ description: 'The current account', standardSchema: userResponseSchema })
  @ApiProblemResponses(HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND)
  async me(@CurrentUser() user: AuthenticatedUser): Promise<UserResponse> {
    return toUserResponse(await this.getCurrentUser.execute({ userId: user.id }));
  }
}
