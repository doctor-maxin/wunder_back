import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RedocModule, RedocOptions } from 'nestjs-redoc';
import { PrismaService } from './prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AtGuard } from './common/gards/at.gard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_HOST,
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.setViewEngine('ejs');

  const config = new DocumentBuilder();
  config.setTitle('Wunder Back API');
  config.setVersion('2.0');
  config.addBearerAuth();
  config.build();

  const jwtService = app.get(JwtService);
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new AtGuard(jwtService, reflector));
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const document = SwaggerModule.createDocument(app, config);
  const redocOptions: RedocOptions = {
    title: 'Wunder Back API',
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await RedocModule.setup('/docs', app, document, redocOptions);

  const PORT = process.env.PORT || 5000;

  await app.listen(PORT);
  console.log('Server started on port ' + PORT);
}
bootstrap();
