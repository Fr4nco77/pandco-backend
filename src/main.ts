import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Una vez terminado hay que restringir el origin y metodos
  app.use(helmet());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:');
  console.error(err);
  process.exit(1);
});
