import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { PASSWORD_HASHER } from './application/ports/password-hasher.js';
import { TOKEN_SERVICE } from './application/ports/token-service.js';
import { EnsureAdminUserUseCase } from './application/use-cases/ensure-admin-user.use-case.js';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case.js';
import { LoginUseCase } from './application/use-cases/login.use-case.js';
import { LogoutUseCase } from './application/use-cases/logout.use-case.js';
import { RefreshTokensUseCase } from './application/use-cases/refresh-tokens.use-case.js';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case.js';
import { USER_REPOSITORY } from './domain/user.repository.js';
import { AdminBootstrapper } from './infrastructure/admin-bootstrapper.js';
import { MongoUserRepository } from './infrastructure/persistence/mongo-user.repository.js';
import { UserModel, UserSchema } from './infrastructure/persistence/user.schema.js';
import { Argon2PasswordHasher } from './infrastructure/security/argon2-password-hasher.js';
import { JwtTokenService } from './infrastructure/security/jwt-token.service.js';
import { AuthController } from './presentation/auth.controller.js';

/**
 * Identity & Access Management: accounts, sessions and token issuing/verification.
 * The global guards are registered by the composition root (AppModule) so that their
 * order relative to rate limiting is explicit.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    { provide: USER_REPOSITORY, useClass: MongoUserRepository },
    { provide: PASSWORD_HASHER, useClass: Argon2PasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    RegisterUserUseCase,
    LoginUseCase,
    RefreshTokensUseCase,
    LogoutUseCase,
    GetCurrentUserUseCase,
    EnsureAdminUserUseCase,
    AdminBootstrapper,
  ],
  exports: [TOKEN_SERVICE],
})
export class IamModule {}
