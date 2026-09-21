const DUPLICATE_KEY_ERROR_CODE = 11_000;

/** True when MongoDB rejected a write because of a unique-index violation. */
export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === DUPLICATE_KEY_ERROR_CODE
  );
}
