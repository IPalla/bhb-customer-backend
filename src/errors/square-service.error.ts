export class SquareServiceError extends Error {
  constructor(
    message: string,
    public readonly details: unknown,
  ) {
    super(message);
    this.name = "SquareServiceError";
    Object.setPrototypeOf(this, SquareServiceError.prototype);
  }
}
