export interface PageRequest {
  /** 1-based page number. */
  readonly page: number;
  readonly pageSize: number;
}

export interface Page<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export function toOffset({ page, pageSize }: PageRequest): number {
  return (page - 1) * pageSize;
}
