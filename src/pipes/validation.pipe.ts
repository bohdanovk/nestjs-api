import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ValidationException } from '../exceptions/validation.exception';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const obj = plainToInstance(metadata.metatype, value);

    // only when object
    if (typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
      const errors = await validate(obj);

      if (errors.length) {
        const messages = errors.map((err) => {
          return `${err.property} - ${Object.values(err.constraints).join(
            ', ',
          )}`;
        });

        throw new ValidationException(messages);
      }
    }

    return value;
  }
}
