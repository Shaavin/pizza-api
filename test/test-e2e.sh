#!/bin/bash

# Function to cleanup Docker containers and processes on script exit
cleanup() {
    echo "Cleaning up..."
    docker-compose -f ../docker-compose.yml stop
    exit 0
}

# Set up trap for cleanup on script exit
trap cleanup EXIT

echo "Starting the Docker container..."
docker-compose -f ../docker-compose.yml up -d --wait

echo "Running DB migrations..."
docker exec server npm run db:migrate

echo "Running DB seed script..."
docker exec server npm run db:seed

echo "Running e2e tests..."
docker exec server npm run test:e2e