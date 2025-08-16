# Legal Lens - Implementation Guide

## Architecture Overview

Legal Lens is a production-ready SaaS application for analyzing legal documents using AI. It supports both web and mobile platforms, with multi-tenant architecture supporting Solo users and Teams.

## Project Structure

```
legal-lens/
├── apps/
│   ├── web/          # Next.js 14 web application
│   ├── mobile/       # React Native (Expo) mobile app
│   └── api/          # NestJS backend API
├── packages/
│   ├── database/     # Prisma ORM and schemas
│   ├── types/        # Shared TypeScript types and Zod schemas
│   ├── ui/           # Shared UI components (shadcn/ui)
│   ├── sdk/          # TypeScript SDK for API
│   ├── prompts/      # LLM prompts and evaluators
│   └── lawpacks/     # Law Pack Knowledge Base
├── infra/
│   ├── docker-compose.yml  # Development services
│   └── migrations/         # Database migrations
└── turbo.json             # Turborepo configuration
```

## Core Features

### 1. Document Processing Pipeline
- **Upload**: Multi-page PDF/image upload with virus scanning
- **OCR**: Pluggable OCR providers (Tesseract, Google Vision, AWS Textract)
- **Normalization**: Text cleaning and structure preservation
- **Analysis**: AI-powered clause extraction and risk assessment
- **Reporting**: PDF/HTML report generation with recommendations

### 2. Multi-Tenancy
- **Solo Mode**: Single-user workspaces with personal documents
- **Team Mode**: Organizations with role-based access (Owner/Admin/Member/Viewer)
- **Upgrade Path**: Seamless Solo → Team conversion

### 3. Security & Compliance
- **Row-Level Security**: PostgreSQL RLS for data isolation
- **Encryption**: At-rest and in-transit encryption
- **Audit Logging**: Complete activity tracking
- **Data Retention**: Configurable retention policies (7/30/365 days)
- **GDPR/CCPA**: Data export and deletion capabilities

## Technology Stack

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: BullMQ (Redis) for job processing
- **Storage**: S3-compatible (MinIO in dev)
- **Auth**: JWT with Passport.js
- **API Docs**: OpenAPI/Swagger

### Frontend (Web)
- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **State**: React Query + Zustand
- **Forms**: React Hook Form + Zod

### Mobile
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **UI**: Shared components from packages/ui
- **Camera**: Expo Camera for document scanning

### AI/ML
- **LLM**: OpenAI GPT-4 (pluggable providers)
- **OCR**: Tesseract.js with cloud provider fallbacks
- **Prompts**: Deterministic rubrics for consistency

## Database Schema

### Core Tables
- `orgs`: Organizations/workspaces
- `users`: User accounts
- `memberships`: User-org relationships with roles
- `documents`: Uploaded documents
- `pages`: Individual document pages with OCR data
- `analyses`: Analysis jobs and results
- `clauses`: Extracted clauses with risk scores
- `suggestions`: Negotiation tactics and rewrites
- `audit_logs`: Activity tracking
- `billing_customers`: Stripe integration

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Logout

### Organizations
- `GET /orgs` - List user's organizations
- `POST /orgs` - Create organization
- `GET /orgs/:id` - Get organization details
- `POST /orgs/:id/invites` - Invite users
- `POST /orgs/:id/upgrade` - Upgrade Solo → Team

### Documents
- `GET /documents` - List documents
- `POST /documents` - Upload document
- `GET /documents/:id` - Get document details
- `POST /documents/:id/analyze` - Start analysis
- `GET /documents/:id/report` - Generate report

### Analysis
- `GET /analyses/:id` - Get analysis status
- `GET /analyses/:id/clauses` - Get extracted clauses
- `GET /clauses/:id` - Get clause details

## Job Processing Pipeline

1. **Virus Scan** → ClamAV container
2. **OCR** → Page-by-page text extraction
3. **Normalization** → Clean and structure text
4. **Jurisdiction Detection** → Identify applicable law
5. **Clause Extraction** → LLM with function calling
6. **Risk Scoring** → Law Pack rules + LLM rubric
7. **Suggestions** → Generate negotiation tactics
8. **Report Build** → HTML → PDF conversion

## Development Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Quick Start
```bash
# Clone repository
git clone https://github.com/yourusername/legal-lens.git
cd legal-lens

# Install dependencies
npm install

# Start Docker services
cd infra
docker-compose up -d
cd ..

# Setup database
cd packages/database
npx prisma migrate dev
npm run db:seed
cd ../..

# Start development servers
npm run dev
```

### Environment Variables
Copy `.env.example` to `.env` and configure:
- Database connection
- Redis URL
- S3/MinIO credentials
- OAuth providers
- Stripe keys
- OpenAI API key

## Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Redis configured for production
- [ ] S3 bucket created and configured
- [ ] SSL certificates installed
- [ ] Rate limiting configured
- [ ] Monitoring setup (Datadog/New Relic)
- [ ] Error tracking (Sentry)
- [ ] Backup strategy implemented

### Deployment Options
1. **Vercel** (Web) + **Railway** (API/Database)
2. **AWS**: ECS + RDS + ElastiCache + S3
3. **Google Cloud**: Cloud Run + Cloud SQL + Memorystore
4. **Docker Swarm/Kubernetes**: Full container orchestration

## Testing Strategy

### Unit Tests
- Database models and RLS policies
- API service methods
- React components
- Utility functions

### Integration Tests
- API endpoints
- Document upload → analysis pipeline
- Report generation
- Billing workflows

### E2E Tests
- Critical user journeys
- Solo mode signup and usage
- Team creation and management
- Document analysis workflow

## Security Considerations

### Data Protection
- Encrypt sensitive data at rest
- Use signed URLs for file uploads
- Implement rate limiting
- Sanitize user inputs
- Validate file types and sizes

### Access Control
- JWT tokens with short expiry
- Role-based permissions
- Row-level security in database
- API key management for external services

### Compliance
- GDPR data export/deletion
- CCPA compliance
- PIPEDA for Canadian users
- NOT LEGAL ADVICE disclaimers

## Monitoring & Observability

### Metrics
- API response times
- Job queue performance
- OCR/LLM processing times
- Error rates
- User activity

### Logging
- Structured JSON logs
- Request/response logging
- Error stack traces
- Audit trail events

### Alerts
- High error rates
- Queue backlogs
- Failed payments
- Storage quota warnings

## Scaling Considerations

### Horizontal Scaling
- Stateless API servers
- Redis cluster for queues
- Read replicas for database
- CDN for static assets

### Performance Optimization
- Database query optimization
- Caching strategy (Redis)
- Image optimization
- Lazy loading
- Code splitting

## Support & Maintenance

### Regular Tasks
- Security updates
- Dependency updates
- Database backups
- Log rotation
- Performance monitoring

### Documentation
- API documentation (Swagger)
- User guides
- Developer documentation
- Deployment guides

## License & Legal

This is a proprietary SaaS application. Ensure all dependencies are properly licensed for commercial use.

## Contact

For questions or support, contact the development team.