import { z } from 'zod';

import { dateOutputSchema, pageResponseSchema } from '../../../shared/presentation/index.js';
import { PHONE_INPUT_PATTERN } from '../domain/value-objects/phone-number.js';
import { PUBLISHER_NAME_MAX_LENGTH } from '../domain/value-objects/publisher-name.js';
import { SIRET_LENGTH } from '../domain/value-objects/siret.js';

export const publisherBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(PUBLISHER_NAME_MAX_LENGTH)
      .describe('Publisher name')
      .meta({ example: 'Ubisoft Entertainment' }),
    siret: z
      .string()
      .regex(/^\d{14}$/, `must be ${SIRET_LENGTH} digits`)
      .describe('French establishment identifier (SIRET)')
      .meta({ example: '73282932000074' }),
    phone: z
      .string()
      .regex(PHONE_INPUT_PATTERN, 'must be an international phone number, e.g. +33 1 23 45 67 89')
      .describe(
        'Contact phone number in E.164 format; spaces, dots, dashes and parentheses are ignored',
      )
      .meta({ example: '+33 1 23 45 67 89' }),
  })
  .strict()
  .meta({ id: 'PublisherInput' });

export type PublisherBody = z.infer<typeof publisherBodySchema>;

export const publisherResponseSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    siret: z.string(),
    phone: z.string(),
    createdAt: dateOutputSchema,
    updatedAt: dateOutputSchema,
  })
  .meta({ id: 'Publisher' });

export type PublisherResponse = z.output<typeof publisherResponseSchema>;

export const publisherPageSchema = pageResponseSchema(publisherResponseSchema, 'PublisherPage');

export type PublisherPage = z.output<typeof publisherPageSchema>;
