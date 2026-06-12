import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

class EnvironmentVariables {
  // Config
  @IsEnum(Environment)
  NODE_ENV!: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT!: number;

  @IsString()
  JWT_SECRET!: string;

  // DB
  @IsString()
  DATABASE_URL!: string;

  // Email Service
  @IsString()
  RESEND_KEY!: string;

  @IsString()
  MAIL_FROM!: string;

  // Domains
  @IsUrl({ require_tld: false }) // require_tld: false permite que acepte 'http://localhost:5173'
  FRONTEND!: string;

  // Stripe
  @IsString()
  STRIPE_SECRET_KEY!: string;

  @IsString()
  STRIPE_WEBHOOK_SECRET!: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    console.error('❌ CRITICAL ERROR: Invalid environment configuration:');
    // Mapeamos los errores para que en la consola se lea exactamente qué falló
    const errorMessage = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join(' | ');
    throw new Error(errorMessage);
  }

  return validatedConfig;
}
