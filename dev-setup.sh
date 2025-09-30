#!/bin/bash

# Development setup script
# This script ensures proper development environment setup

set -e  # Exit on any error

echo "🔧 Setting up WhatsApp Multi-Session development environment..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "🏗️  Building frontend for first time..."
    npm run build
else
    echo "✅ Frontend build exists"
fi

echo ""
echo "🚀 Development environment ready!"
echo ""
echo "Available commands:"
echo "  npm run dev        - Start development servers (Vite + API)"
echo "  npm run start:dev  - Start API server only"
echo "  npm run build      - Build frontend for production"
echo "  npm run preview    - Preview production build"
echo ""
echo "Development URLs:"
echo "  Frontend (Vite):   http://localhost:1100"
echo "  Backend API:       http://localhost:3000"
echo "  API Documentation: http://localhost:3000/api-docs"
echo "  Health Check:      http://localhost:3000/health"
echo ""
