#!/bin/bash

echo "🎵 Setting up TIPSI - Nightlife NFC Platform"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Node.js and Docker found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start PostgreSQL
echo "🐘 Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is ready
if ! docker exec tipsi-postgres pg_isready -U tipsi_user -d tipsi &> /dev/null; then
    echo "❌ Database is not ready. Please check Docker logs."
    exit 1
fi

echo "✅ Database is ready"

# Run database migrations
echo "🗄️  Running database migrations..."
npm run migrate

# Seed database
echo "🌱 Seeding database with demo data..."
npm run seed

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📱 Test table page: http://localhost:3000/t/[table-id]"
echo "⚙️  Admin page: http://localhost:3000/admin/venue"
echo "🎵 DJ Badge: http://localhost:3000/dj-badge"
echo "🏥 Health check: http://localhost:3000/health"
echo ""
echo "🚀 Start the server with: npm run dev"
echo ""
echo "📚 See README.md for detailed setup instructions"
