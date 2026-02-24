import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // 1. Configuración de Variables de Entorno
    ConfigModule.forRoot({
      isGlobal: true, // Esto permite leer las variables en cualquier parte sin importar ConfigModule nuevamente
      envFilePath: '.env', // Ruta al archivo .env (dentro de /backend)
    }),

    // 2. Configuración de la Base de Datos con TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true, // Busca automáticamente en los módulos las entidades
        synchronize: true, // Sincroniza el código a la BD (solo usar en desarrollo local)
      }),
    }),

    // 3. Configuración de GraphQL (Code-First)
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // Autogenera el archivo del schema
      playground: true, // Interfaz visual en /graphql para probar consultas
    }),

    // 4. Módulos de nuestra aplicación
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
