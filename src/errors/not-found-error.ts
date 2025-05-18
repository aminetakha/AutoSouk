import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  statusCode = 404;
  constructor() {
    super("Not found");
  }

  serializeError(): { message: string; field?: string }[] {
    return [{ message: "Not Found" }];
  }
}
