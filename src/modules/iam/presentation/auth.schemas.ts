import { z } from 'zod';

import { ALL_ROLES } from '../../../shared/domain/index.js';
import { dateOutputSchema } from '../../../shared/presentation/index.js';
import { EMAIL_MAX_LENGTH } from '../domain/value-objects/email.js';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../domain/value-objects/password.js';

const emailField = z
  .email()
  .max(EMAIL_MAX_LENGTH)
  .describe('E-mail address')
  .meta({ example: 'jane@example.com' });

export const registerBodySchema = z
  .object({
    email: emailField,
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH)
      .max(PASSWORD_MAX_LENGTH)
      .describe(`Password, ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters`)
      .meta({ example: 'correct horse battery staple' }),
  })
  .strict()
  .meta({ id: 'RegisterInput' });

export type RegisterBody = z.infer<typeof registerBodySchema>;

export const loginBodySchema = z
  .object({
    email: emailField,
    password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
  })
  .strict()
  .meta({ id: 'LoginInput' });

export type LoginBody = z.infer<typeof loginBodySchema>;

export const refreshBodySchema = z
  .object({
    refreshToken: z.jwt().describe('Refresh token obtained from login or a previous refresh'),
  })
  .strict()
  .meta({ id: 'RefreshInput' });

export type RefreshBody = z.infer<typeof refreshBodySchema>;

export const authTokensResponseSchema = z
  .object({
    tokenType: z.literal('Bearer'),
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.int().positive().describe('Access token lifetime in seconds'),
  })
  .meta({ id: 'AuthTokens' });

export type AuthTokensResponse = z.output<typeof authTokensResponseSchema>;

export const userResponseSchema = z
  .object({
    id: z.uuid(),
    email: z.email(),
    role: z.enum(ALL_ROLES),
    createdAt: dateOutputSchema,
  })
  .meta({ id: 'User' });

export type UserResponse = z.output<typeof userResponseSchema>;
