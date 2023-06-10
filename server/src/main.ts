import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.use(
    cors({
      credentials: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get('port');
  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}
bootstrap();
