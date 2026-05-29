import {
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './dto/login.dto.js'; // 👈 Importa tu DTO

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();

    // 1. Transformamos el body de la petición en una instancia real de tu LoginDto class
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const loginInstance = plainToInstance(LoginDto, request.body);

    // 2. Ejecutamos las validaciones decoradas en el DTO
    const errors = await validate(loginInstance);

    // 3. Si hay errores, los mapeamos y frenamos la petición de inmediato
    if (errors.length > 0) {
      const messages = errors.map((err) =>
        Object.values(err.constraints ?? {}).join(', '),
      );
      throw new BadRequestException(messages);
    }

    // 4. Si el DTO es válido, dejamos que Passport y la base de datos hagan su trabajo
    const result = (await super.canActivate(context)) as boolean;
    return result;
  }
}
