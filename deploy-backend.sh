#!/bin/bash
# Deploy Backend Script

# Clone or pull the repository
cd /root
if [ -d "online-course-platform" ]; then
    echo "Updating existing repository..."
    cd online-course-platform
    git pull
else
    echo "Cloning repository..."
    git clone https://github.com/oven-ttta/online-course-platform.git
    cd online-course-platform
fi

# Go to backend directory
cd backend

# Stop existing containers
docker-compose down 2>/dev/null || true

# Build and start containers
docker-compose up -d --build

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Show status
docker-compose ps

# Show logs
echo "=== Recent Logs ==="
docker-compose logs --tail=50

echo ""
echo "==================================="
echo "Backend deployed successfully!"
echo "API URL: http://192.168.1.13:3000"
echo "Health Check: http://192.168.1.13:3000/health"
echo "==================================="
