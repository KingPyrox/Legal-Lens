# Legal Lens

> AI-powered legal document analysis SaaS platform for contract review and risk assessment

## 🚀 Features

- **Document Analysis**: Upload contracts (PDF/images) for AI-powered analysis
- **Risk Assessment**: Automatic identification of risky clauses with severity ratings
- **Smart Suggestions**: Get negotiation tactics and clause rewrites
- **Multi-tenancy**: Support for Solo users and Teams with role-based access
- **Mobile Support**: iOS/Android apps for document capture and review
- **Compliance Ready**: GDPR/CCPA compliant with audit logging

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React Native (Expo), TypeScript, Tailwind CSS
- **Backend**: NestJS, PostgreSQL, Prisma ORM, Redis, BullMQ
- **AI/ML**: OpenAI GPT-4, Tesseract OCR, pluggable providers
- **Infrastructure**: Docker, MinIO (S3), Turborepo monorepo

## 📋 Prerequisites

- Node.js 18+
- Docker Desktop
- Git

## ⚡ Quick Start

```bash
# Clone and install
git clone <your-repo-url>
cd Legal-Lens
npm install --legacy-peer-deps

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start Docker services
cd infra && docker compose up -d

# Setup database
cd packages/database
npx prisma generate
npx prisma migrate dev
npm run db:seed

# Start development
cd ../..
npm run dev
```

Services will be available at:
- Web App: http://localhost:3000
- API: http://localhost:3001
- API Docs: http://localhost:3001/api

## 📚 Documentation

- [Quick Start Guide](QUICKSTART.md) - Detailed setup instructions
- [Implementation Guide](IMPLEMENTATION_GUIDE.md) - Architecture and development
- [Build Report](BUILD_REPORT.md) - Current status and roadmap

## 🧪 Test Accounts

- **Solo User**: solo@example.com / password123
- **Team Owner**: owner@example.com / password123
- **Team Member**: member@example.com / password123

## 📝 License

Proprietary - All rights reserved