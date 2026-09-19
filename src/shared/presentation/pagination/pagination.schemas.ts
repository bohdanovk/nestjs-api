import { z } from 'zod';

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

export const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).describe('1-based page number'),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE)
    .describe('Number of items per page'),
});

export type PageQuery = z.infer<typeof pageQuerySchema>;

/** Builds the response schema for a paginated list of `item`. */
export type PageResponseSchema<Item extends z.ZodType> = z.ZodObject<{
  items: z.ZodArray<Item>;
  total: z.ZodInt;
  page: z.ZodInt;
  pageSize: z.ZodInt;
}>;

export function pageResponseSchema<Item extends z.ZodType>(
  item: Item,
  id: string,
): PageResponseSchema<Item> {
  return z
    .object({
      items: z.array(item),
      total: z.int().nonnegative().describe('Total number of items across all pages'),
      page: z.int().positive(),
      pageSize: z.int().positive(),
    })
    .meta({ id });
}
