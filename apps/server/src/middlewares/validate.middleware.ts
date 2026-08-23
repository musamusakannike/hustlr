import type { NextFunction, Request, Response } from "express";
import type { ObjectSchema } from "joi";
import { ApiError } from "../utils/api-error.util";

type Source = "body" | "query" | "params";

export function validate(schema: ObjectSchema, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      throw ApiError.badRequest(
        "Validation failed",
        error.details.map((d) => d.message),
      );
    }
    req[source] = value;
    next();
  };
}
