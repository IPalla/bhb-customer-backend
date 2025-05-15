export class SquareServiceError extends Error {
  constructor(
    message: string,
    public readonly details: unknown,
  ) {
    super(message);
    this.name = "SquareServiceError";
    Object.setPrototypeOf(this, SquareServiceError.prototype);
  }

  getErrorInfo() {
    console.log(
      "Square API Error Details:",
      JSON.stringify(this.details, null, 2),
    );

    if (
      this.details &&
      Array.isArray(this.details) &&
      this.details.length > 0
    ) {
      const firstError = this.details[0];
      console.log("First Error:", JSON.stringify(firstError, null, 2));

      if (firstError) {
        return {
          code: firstError.code || "UNKNOWN_ERROR",
          detail: firstError.detail || "Unknown error occurred",
          category: firstError.category || "UNKNOWN_CATEGORY",
        };
      }
    }

    return {
      code: "UNKNOWN_ERROR",
      detail: this.message,
      category: "UNKNOWN_CATEGORY",
    };
  }
}
