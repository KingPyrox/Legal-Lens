#!/bin/bash

echo "🚀 Setting up Legal Lens SaaS Application"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup database
echo "🗄️ Setting up database..."
cd packages/database
npm install
npx prisma generate
cd ../..

# Setup packages
echo "📦 Setting up packages..."
cd packages/types && npm install && cd ../..
cd packages/ui && npm install && cd ../..
cd packages/sdk && npm install && cd ../..
cd packages/prompts && npm install && cd ../..
cd packages/lawpacks && npm install && cd ../..

# Setup apps
echo "🔧 Setting up applications..."
cd apps/api && npm install && cd ../..
cd apps/web && npm install && cd ../..
cd apps/mobile && npm install && cd ../..

# Docker services
echo "🐳 Starting Docker services..."
cd infra
docker-compose up -d
cd ..

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Run database migrations
echo "📊 Running database migrations..."
cd packages/database
npx prisma migrate dev --name init
npm run db:seed
cd ../..

echo "✅ Setup complete!"
echo ""
echo "To start the development servers, run:"
echo "  npm run dev"
echo ""
echo "Available URLs:"
echo "  Web App: http://localhost:3000"
echo "  API: http://localhost:3001"
echo "  API Docs: http://localhost:3001/api"
echo "  MinIO Console: http://localhost:9001"
echo ""
echo "Test Accounts:"
echo "  Solo User: solo@example.com / password123"
echo "  Team Owner: owner@example.com / password123"
echo "  Team Member: member@example.com / password123"