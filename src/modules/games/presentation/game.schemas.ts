import { z } from 'zod';

import {
  dateOutputSchema,
  isoDateTimeSchema,
  pageResponseSchema,
} from '../../../shared/presentation/index.js';
import { GAME_TITLE_MAX_LENGTH } from '../domain/value-objects/game-title.js';
import { MAX_PRICE } from '../domain/value-objects/price.js';
import { MAX_TAGS, TAG_MAX_LENGTH } from '../domain/value-objects/tags.js';

const hasAtMostTwoDecimals = (value: number): boolean =>
  Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;

export const gameBodySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1)
      .max(GAME_TITLE_MAX_LENGTH)
      .describe('Game title')
      .meta({ example: 'Hollow Knight: Silksong' }),
    price: z
      .number()
      .min(0)
      .max(MAX_PRICE)
      .refine(hasAtMostTwoDecimals, 'must have at most two decimal places')
      .describe('Price in major currency units. 0 means free.')
      .meta({ example: 19.99 }),
    tags: z
      .array(z.string().trim().min(1).max(TAG_MAX_LENGTH))
      .max(MAX_TAGS)
      .default([])
      .describe('Free-form tags; normalised to lower-case and de-duplicated')
      .meta({ example: ['metroidvania', 'indie'] }),
    releaseDate: isoDateTimeSchema
      .transform((value) => new Date(value))
      .describe('Release date (ISO-8601)')
      .meta({ example: '2025-09-04T00:00:00.000Z' }),
    publisherId: z
      .uuid()
      .nullable()
      .default(null)
      .describe('Identifier of an existing publisher, or null')
      .meta({ example: '2f1b7f60-6e5f-4c4e-9f19-8b8e0c4f9d21' }),
  })
  .strict()
  .meta({ id: 'GameInput' });

export type GameBody = z.output<typeof gameBodySchema>;

export const discountResponseSchema = z
  .object({
    percentage: z.int().min(1).max(100),
    appliedAt: dateOutputSchema,
  })
  .meta({ id: 'Discount' });

export const gameResponseSchema = z
  .object({
    id: z.uuid(),
    title: z.string(),
    price: z.number().describe('Current price in major currency units'),
    tags: z.array(z.string()),
    releaseDate: dateOutputSchema,
    publisherId: z.uuid().nullable(),
    discount: discountResponseSchema.nullable().describe('Automatic discount, if one was applied'),
    createdAt: dateOutputSchema,
    updatedAt: dateOutputSchema,
  })
  .meta({ id: 'Game' });

export type GameResponse = z.output<typeof gameResponseSchema>;

export const gamePageSchema = pageResponseSchema(gameResponseSchema, 'GamePage');

export type GamePage = z.output<typeof gamePageSchema>;

export const catalogMaintenanceResponseSchema = z
  .object({
    retiredCount: z.int().nonnegative().describe('Number of games removed from the catalog'),
    discountedGames: z.array(gameResponseSchema).describe('Games that received the discount'),
  })
  .meta({ id: 'CatalogMaintenanceReport' });

export type CatalogMaintenanceResponse = z.output<typeof catalogMaintenanceResponseSchema>;
