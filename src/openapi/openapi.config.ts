import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppConfigService } from '../config/app-config.service';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { BaseResponseDto } from '../common/dto/base-response.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PaginationMetaDto } from '../common/dto/pagination-meta.dto';

/**
 * ฟังก์ชันสร้าง Swagger document config พร้อม servers, tags และ Bearer JWT security
 */
export function createOpenApiDocument(
  app: INestApplication,
  appConfigService: AppConfigService,
): OpenAPIObject {
  const appConfig = appConfigService.app;
  const documentConfig = new DocumentBuilder()
    .setTitle(appConfig.name)
    .setDescription('OpenAPI documentation generated from NestJS source code for Apidog sync.')
    .setVersion(appConfig.version)
    .addServer(`http://localhost:${appConfig.port}`, 'Development')
    .addServer('https://staging-api.example.com', 'Staging')
    .addServer('https://api.example.com', 'Production')
    .addTag('Health', 'Service health check endpoints')
    .addTag('users', 'User management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste JWT access token without Bearer prefix.',
      },
      'JWT-auth',
    )
    .build();

  return SwaggerModule.createDocument(app, documentConfig, {
    extraModels: [BaseResponseDto, ErrorResponseDto, PaginatedResponseDto, PaginationMetaDto],
    operationIdFactory: (controllerKey: string, methodKey: string): string =>
      `${controllerKey}_${methodKey}`,
  });
}

/**
 * ฟังก์ชันคืนค่า custom CSS สำหรับ branding ของ Swagger UI
 */
export function getSwaggerCustomCss(): string {
  return `
    :root {
      --brand-color: #0f766e;
      --brand-accent: #f59e0b;
    }

    .swagger-ui .topbar {
      background-color: var(--brand-color);
      border-bottom: 4px solid var(--brand-accent);
    }

    .swagger-ui .topbar-wrapper img {
      content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='40' viewBox='0 0 160 40'%3E%3Crect width='160' height='40' rx='6' fill='%230f766e'/%3E%3Ctext x='16' y='26' font-family='Arial' font-size='17' font-weight='700' fill='white'%3ETEST Open API%3C/text%3E%3C/svg%3E");
    }

    .swagger-ui .info .title {
      color: var(--brand-color);
    }

    .swagger-ui .btn.authorize {
      border-color: var(--brand-color);
      color: var(--brand-color);
    }
  `;
}
