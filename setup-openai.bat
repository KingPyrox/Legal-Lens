@echo off
echo ======================================
echo Legal Lens - OpenAI Setup
echo ======================================
echo.

echo Step 1: Setting up environment for OpenAI...
copy .env.openai .env
echo Environment file created from OpenAI template.
echo.

echo Step 2: Installing dependencies...
call npm install --legacy-peer-deps
echo.

echo Step 3: Generating Prisma client...
cd packages\database
call npx prisma generate
cd ..\..
echo.

echo ======================================
echo Setup Complete!
echo ======================================
echo.
echo IMPORTANT: Edit .env file and add your OpenAI API key:
echo   OPENAI_API_KEY=sk-your-key-here
echo.
echo Next steps:
echo 1. Get your OpenAI API key from: https://platform.openai.com/api-keys
echo 2. Edit .env and add your OPENAI_API_KEY
echo 3. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
echo 4. Start Docker services: cd infra ^&^& docker compose up -d
echo 5. Run database migrations: cd packages\database ^&^& npx prisma migrate dev
echo 6. Seed test data: cd packages\database ^&^& npm run db:seed
echo 7. Start development: npm run dev
echo.
echo Cost-optimized settings:
echo   - Using GPT-3.5-Turbo (cheapest model)
echo   - Daily spending limit: $5
echo   - Response caching enabled
echo   - Token limits enforced
echo.
echo Test accounts after seeding:
echo   Solo User: solo@example.com / password123
echo   Team Owner: owner@example.com / password123
echo   Team Member: member@example.com / password123
echo.
pause