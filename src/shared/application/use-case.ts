/**
 * A single application-level operation. Use cases orchestrate domain objects and ports;
 * they contain no business rules themselves.
 */
export interface UseCase<Input, Output> {
  execute(input: Input): Promise<Output>;
}
