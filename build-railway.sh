#!/bin/bash

echo "🚀 Starting Railway build process..."

# Set error handling
set -e

echo "📦 Installing backend dependencies..."
cd backend
npm install --production=false

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🔨 Building TypeScript..."
npm run build

echo "✅ Build completed. Checking output..."
if [ -f "dist/index.js" ]; then
    echo "✅ Backend build successful!"
    ls -la dist/
    
    # Verify Prisma client exists
    if [ -d "node_modules/.prisma/client" ]; then
        echo "✅ Prisma client generated successfully!"
        ls -la node_modules/.prisma/client/
    else
        echo "❌ Prisma client not found!"
        exit 1
    fi
else
    echo "❌ Backend build failed!"
    exit 1
fi

echo "🚀 Railway build process completed successfully!"

