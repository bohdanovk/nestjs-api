import { z } from 'zod';

/** Path parameter schema for aggregate identifiers. */
export const idParamSchema = z.uuid().describe('Resource identifier (UUID)');

export const isoDateTimeSchema = z.iso.datetime({ offset: true });

/** Dates are serialised as ISO-8601 strings in responses. */
export const dateOutputSchema = z.iso.datetime().describe('ISO-8601 timestamp');
