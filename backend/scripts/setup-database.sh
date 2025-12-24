#!/bin/bash

# Database Setup Script
# This script sets up the PostgreSQL database and seeds it with data

set -e

echo "🚀 Starting database setup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start PostgreSQL container
echo "📦 Starting PostgreSQL container..."
docker compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if database is ready
until docker exec reviews-postgres pg_isready -U reviews_user -d reviews_db > /dev/null 2>&1; do
    echo "   Waiting for database..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"

# Seed the database
echo ""
echo "🌱 Seeding database..."
npm run seed:run

echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "You can now start the backend server with: npm run start:dev"

