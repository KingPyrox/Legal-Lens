@echo off
echo ======================================
echo Legal Lens - Setup Script
echo ======================================
echo.

echo Installing dependencies...
call npm install --legacy-peer-deps

echo.
echo Generating Prisma client...
cd packages\database
call npx prisma generate
cd ..\..

echo.
echo ======================================
echo Setup Complete!
echo ======================================
echo.
echo Next steps:
echo 1. Install Docker Desktop for Windows from https://www.docker.com/products/docker-desktop/
echo 2. Create a .env file from .env.example
echo 3. Run Docker services: cd infra ^&^& docker compose up -d
echo 4. Run database migrations: cd packages\database ^&^& npx prisma migrate dev
echo 5. Seed the database: cd packages\database ^&^& npm run db:seed
echo 6. Start development: npm run dev
echo.
echo Test accounts will be:
echo   Solo User: solo@example.com / password123
echo   Team Owner: owner@example.com / password123
echo   Team Member: member@example.com / password123
echo.
pause