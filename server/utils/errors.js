// Typed, structured app errors. Services throw these; the error middleware
// translates them to the response shape mandated by CLAUDE.md §B.5:
//   { success: false, message, code? }

class AppError extends Error {
  constructor(message, { status = 500, code = 'INTERNAL_ERROR', details } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

class BadRequest extends AppError {
  constructor(message = 'Bad request', code = 'BAD_REQUEST', details) {
    super(message, { status: 400, code, details });
  }
}
class Unauthorized extends AppError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(message, { status: 401, code });
  }
}
class Forbidden extends AppError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN') {
    super(message, { status: 403, code });
  }
}
class NotFound extends AppError {
  constructor(message = 'Not found', code = 'NOT_FOUND') {
    super(message, { status: 404, code });
  }
}
class Conflict extends AppError {
  constructor(message = 'Conflict', code = 'CONFLICT') {
    super(message, { status: 409, code });
  }
}
class TooMany extends AppError {
  constructor(message = 'Too many requests', code = 'RATE_LIMITED') {
    super(message, { status: 429, code });
  }
}

module.exports = { AppError, BadRequest, Unauthorized, Forbidden, NotFound, Conflict, TooMany };
