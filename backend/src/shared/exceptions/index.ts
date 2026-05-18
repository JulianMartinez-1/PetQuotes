import { HttpException, HttpStatus } from '@nestjs/common';

export class DuplicateEntityException extends HttpException {
  constructor(entityName: string, field: string = 'id') {
    super(`${entityName} with this ${field} already exists`, HttpStatus.CONFLICT);
  }
}

export class EntityNotFoundException extends HttpException {
  constructor(entityName: string, identifier: string = 'id') {
    super(`${entityName} not found (${identifier})`, HttpStatus.NOT_FOUND);
  }
}

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super('Invalid email or password', HttpStatus.UNAUTHORIZED);
  }
}

export class AccountLockedException extends HttpException {
  constructor(unlockTime: Date) {
    super(
      `Account is locked. Try again after ${unlockTime.toISOString()}`,
      HttpStatus.FORBIDDEN,
    );
  }
}

export class UnauthorizedOperationException extends HttpException {
  constructor(message = 'You do not have permission to perform this operation') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class ValidationException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
