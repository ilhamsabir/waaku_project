#!/bin/bash

# WhatsApp Multi-Session Startup Script

echo "🚀 Starting WhatsApp Multi-Session Manager..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  start         Start the application in production mode"
    echo "  stop          Stop the application"
    echo "  restart       Restart the application"
    echo "  logs          Show application logs"
    echo "  build         Rebuild the application"
    echo "  clean         Clean up containers and volumes"
    echo "  backup        Backup session data"
    echo "  restore       Restore session data from backup"
    echo ""
}

# Default to production if no argument
if [ $# -eq 0 ]; then
    MODE="start"
else
    MODE=$1
fi

case $MODE in
    "start")
        echo "📦 Starting in production mode..."
        docker-compose up -d
        echo "✅ Application started at http://localhost:3000"
        ;;
    "stop")
        echo "⏹️  Stopping application..."
        docker-compose down
        echo "✅ Application stopped"
        ;;
    "restart")
        echo "🔄 Restarting application..."
        docker-compose restart
        echo "✅ Application restarted"
        ;;
    "logs")
        echo "📋 Showing application logs..."
        docker-compose logs -f
        ;;
    "build")
        echo "🔨 Rebuilding application..."
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        echo "✅ Application rebuilt and started"
        ;;
    "setup")
        echo "🔧 Setting up development environment..."
        echo "Deprecated: use npm run dev instead"
        ;;
    "local")
        echo "💻 Starting local development (without Docker)..."
        if [ ! -d "node_modules" ]; then
            echo "📦 Installing dependencies..."
            npm install
        fi
        if [ ! -d "dist" ]; then
            echo "🏗️  Building frontend..."
            npm run build
        fi
        echo "🚀 Starting servers..."
        npm run dev
        ;;
    "clean")
        echo "🧹 Cleaning up..."
        docker-compose down -v
        docker system prune -f
        echo "✅ Cleanup completed"
        ;;
    "backup")
        echo "💾 Creating backup..."
        BACKUP_FILE="sessions-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
        docker run --rm -v waaku_whatsapp_sessions:/data -v $(pwd):/backup alpine tar czf /backup/$BACKUP_FILE -C /data .
        echo "✅ Backup created: $BACKUP_FILE"
        ;;
    "restore")
        if [ -z "$2" ]; then
            echo "❌ Please specify backup file: $0 restore <backup-file>"
            exit 1
        fi
        echo "📥 Restoring from backup: $2"
        docker run --rm -v waaku_whatsapp_sessions:/data -v $(pwd):/backup alpine tar xzf /backup/$2 -C /data
        echo "✅ Backup restored successfully"
        ;;
    "help"|"--help"|"-h")
        show_usage
        ;;
    *)
        echo "❌ Unknown option: $MODE"
        show_usage
        exit 1
        ;;
esac
