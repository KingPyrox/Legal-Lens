# Legal Lens - Quick Start Guide

## Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
3. **Git** - [Download](https://git-scm.com/)

## Setup Instructions

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd Legal-Lens

# Install dependencies
npm install --legacy-peer-deps

# Generate Prisma client
cd packages/database
npx prisma generate
cd ../..
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and set at minimum:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Random secret for JWT tokens
- `NEXTAUTH_SECRET` - Random secret for NextAuth

### 3. Start Docker Services

```bash
cd infra
docker compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- MinIO (ports 9000, 9001)
- ClamAV (port 3310)

### 4. Database Setup

```bash
# Run migrations
cd packages/database
npx prisma migrate dev

# Seed sample data
npm run db:seed
```

### 5. Start Development Servers

```bash
# From root directory
npm run dev
```

This starts:
- API server at http://localhost:3001
- Web app at http://localhost:3000
- API docs at http://localhost:3001/api

## Test Accounts

After seeding, you can login with:

- **Solo User**: solo@example.com / password123
- **Team Owner**: owner@example.com / password123
- **Team Member**: member@example.com / password123

## Project Structure

```
Legal-Lens/
├── apps/
│   ├── api/         # NestJS backend API
│   ├── web/         # Next.js web application
│   └── mobile/      # React Native mobile app
├── packages/
│   ├── database/    # Prisma ORM and schemas
│   ├── types/       # Shared TypeScript types
│   ├── ui/          # Shared UI components
│   ├── sdk/         # API client SDK
│   ├── prompts/     # LLM prompts
│   └── lawpacks/    # Legal knowledge base
└── infra/
    └── docker-compose.yml  # Development services
```

## Common Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start all services
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Database commands
cd packages/database
npx prisma studio     # Open Prisma Studio
npx prisma migrate dev # Run migrations
npm run db:seed       # Seed database

# Docker commands
cd infra
docker compose up -d   # Start services
docker compose down    # Stop services
docker compose logs    # View logs
```

## Troubleshooting

### Port Already in Use
If you get port conflicts, check if services are already running:
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5432

# Kill process by PID
taskkill /PID <process-id> /F
```

### Database Connection Issues
1. Ensure Docker services are running
2. Check PostgreSQL is accessible on port 5432
3. Verify DATABASE_URL in .env file

### Module Resolution Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Next Steps

1. Review the [Implementation Guide](IMPLEMENTATION_GUIDE.md)
2. Explore the API documentation at http://localhost:3001/api
3. Start building features following the PRD requirements
4. Run tests with `npm test`

## Support

For issues or questions, refer to the documentation or create an issue in the repository.