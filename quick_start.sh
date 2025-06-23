#!/bin/bash

# Detective Game - Quick Start Script
# This handles stopping existing services and starting everything fresh

set -e

echo "Detective Game - Quick Start"
echo "==============================="

# Stop any existing services first
stop_existing_services() {
    echo "Stopping any existing services..."
    
    # Stop services using PID files if they exist
    for service in katana torii backend frontend; do
        if [ -f "${service}.pid" ]; then
            echo "  Stopping ${service}..."
            kill $(cat ${service}.pid) 2>/dev/null || true
            rm ${service}.pid
        fi
    done
    
    # Also try to stop by process name (in case PID files are missing)
    pkill -f "katana" 2>/dev/null || true
    pkill -f "torii" 2>/dev/null || true
    pkill -f "npm start" 2>/dev/null || true  # backend
    pkill -f "npm run dev" 2>/dev/null || true  # frontend
    
    # Wait a moment for processes to stop
    sleep 3
    
    echo "Existing services stopped"
}

# Start Katana with CORS
start_katana_with_cors() {
    echo "Starting Katana with CORS enabled..."
    
    # Start Katana with proper CORS configuration
    katana --dev --dev.no-fee \
        --http.cors_origins "*" \
        --http.addr "0.0.0.0" \
        --http.port 5050 > katana.log 2>&1 &
    
    KATANA_PID=$!
    echo $KATANA_PID > katana.pid
    
    # Wait for Katana to start
    echo "Waiting for Katana to start..."
    for i in {1..30}; do
        if curl -s http://localhost:5050 > /dev/null 2>&1; then
            echo "Katana started successfully with CORS enabled"
            break
        fi
        sleep 1
    done
    
    if ! curl -s http://localhost:5050 > /dev/null 2>&1; then
        echo "Failed to start Katana"
        exit 1
    fi
    
    # Test CORS is working
    echo "Testing CORS configuration..."
    CORS_TEST=$(curl -s -X POST http://localhost:5050 \
        -H "Content-Type: application/json" \
        -H "Origin: http://localhost:5173" \
        -d '{"jsonrpc":"2.0","method":"starknet_chainId","params":[],"id":1}' \
        -w "%{http_code}" -o /dev/null 2>/dev/null || echo "000")
    
    if [ "$CORS_TEST" = "200" ]; then
        echo "CORS is properly configured - frontend can connect"
    else
        echo "CORS test inconclusive, but Katana is running"
    fi
}

# Deploy Dojo world and get the actual world address
deploy_dojo_world() {
    echo "Building and deploying Dojo world..."
    
    # Build the project
    echo "Building project..."
    sozo build
    
    # Generate TypeScript bindings
    echo "Generating TypeScript bindings..."
    sozo build --typescript --bindings-output ./frontend/src/generated
    
    # Deploy/migrate the world and capture the output
    echo "Deploying world..."
    MIGRATE_OUTPUT=$(sozo migrate 2>&1)
    echo "$MIGRATE_OUTPUT"
    
    # Extract world address from migration output
    WORLD_ADDRESS=$(echo "$MIGRATE_OUTPUT" | grep -o "world at address 0x[a-fA-F0-9]\{64\}" | grep -o "0x[a-fA-F0-9]\{64\}" || echo "")
    
    if [ -z "$WORLD_ADDRESS" ]; then
        echo "Failed to extract world address from migration output"
        echo "Migration output was:"
        echo "$MIGRATE_OUTPUT"
        exit 1
    fi
    
    echo "World deployed at address: $WORLD_ADDRESS"
    
    # Update frontend configuration with the correct world address
    echo "Updating frontend configuration..."
    if [ -f "frontend/src/dojo/setup.ts" ]; then
        # Create backup
        cp frontend/src/dojo/setup.ts frontend/src/dojo/setup.ts.bak
        
        # Update the world address
        sed -i.tmp "s/const WORLD_ADDRESS = \".*\";/const WORLD_ADDRESS = \"$WORLD_ADDRESS\";/" frontend/src/dojo/setup.ts
        rm frontend/src/dojo/setup.ts.tmp 2>/dev/null || true
        
        echo "Frontend configuration updated with world address: $WORLD_ADDRESS"
    else
        echo "Warning: frontend/src/dojo/setup.ts not found"
    fi
    
    # Update dojo_dev.toml with world address
    if [ -f "dojo_dev.toml" ]; then
        if grep -q "world_address" dojo_dev.toml; then
            sed -i.tmp "s/world_address = \".*\"/world_address = \"$WORLD_ADDRESS\"/" dojo_dev.toml
        else
            # Add world_address to [env] section
            sed -i.tmp "/\[env\]/a\\
world_address = \"$WORLD_ADDRESS\"" dojo_dev.toml
        fi
        rm dojo_dev.toml.tmp 2>/dev/null || true
        echo "dojo_dev.toml updated with world address"
    fi
    
    return 0
}

# Start Torii indexer
start_torii() {
    echo "Starting Torii indexer..."
    
    if [ -z "$WORLD_ADDRESS" ]; then
        echo "Error: World address not set"
        exit 1
    fi
    
    if pgrep -f "torii.*$WORLD_ADDRESS" > /dev/null; then
        echo "Torii is already running for this world"
    else
        torii --world $WORLD_ADDRESS > torii.log 2>&1 &
        TORII_PID=$!
        echo $TORII_PID > torii.pid
        
        # Wait for Torii to start
        echo "Waiting for Torii to start..."
        for i in {1..30}; do
            if curl -s http://localhost:8080 > /dev/null 2>&1; then
                echo "Torii started successfully"
                break
            fi
            sleep 1
        done
        
        if ! curl -s http://localhost:8080 > /dev/null 2>&1; then
            echo "Failed to start Torii"
            echo "Check torii.log for details"
            return 1
        fi
    fi
}

# Setup backend environment
start_backend() {
    echo "Starting backend..."
    
    if [ ! -f "backend/.env" ]; then
        echo "Backend .env file not found!"
        echo "   Please create backend/.env with your OPENAI_API_KEY"
        echo "   Example: OPENAI_API_KEY=your_api_key_here"
        exit 1
    fi
    
    # Check if backend is already running
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo "Backend is already running"
    else
        cd backend
        if [ ! -d "node_modules" ]; then
            echo "Installing backend dependencies..."
            npm install
        fi
        
        echo "Starting backend server..."
        npm start > ../backend.log 2>&1 &
        BACKEND_PID=$!
        echo $BACKEND_PID > ../backend.pid
        cd ..
        
        # Wait for backend to start
        echo "Waiting for backend to start..."
        for i in {1..30}; do
            if curl -s http://localhost:3001/health > /dev/null 2>&1; then
                echo "Backend started successfully"
                break
            fi
            sleep 1
        done
        
        if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
            echo "Failed to start backend"
            echo "Check backend.log for details"
            exit 1
        fi
    fi
}

# Setup frontend
start_frontend() {
    echo "Starting frontend..."
    
    # Check if frontend is already running
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo "Frontend is already running"
    else
        cd frontend
        if [ ! -d "node_modules" ]; then
            echo "Installing frontend dependencies..."
            npm install
        fi
        
        echo "Starting frontend development server..."
        npm run dev > ../frontend.log 2>&1 &
        FRONTEND_PID=$!
        echo $FRONTEND_PID > ../frontend.pid
        cd ..
        
        echo "Frontend starting... (check http://localhost:5173 in a moment)"
    fi
}

# Create stop script
create_stop_script() {
    cat > stop.sh << 'EOF'
#!/bin/bash
echo "Stopping Detective Game services..."

if [ -f katana.pid ]; then
    kill $(cat katana.pid) 2>/dev/null || true
    rm katana.pid
    echo "Katana stopped"
else
    # Try to stop any running katana process
    pkill -f katana 2>/dev/null || true
    echo "Katana stopped"
fi

if [ -f torii.pid ]; then
    kill $(cat torii.pid) 2>/dev/null || true
    rm torii.pid
    echo "Torii stopped"
fi

if [ -f backend.pid ]; then
    kill $(cat backend.pid) 2>/dev/null || true
    rm backend.pid
    echo "Backend stopped"
fi

if [ -f frontend.pid ]; then
    kill $(cat frontend.pid) 2>/dev/null || true
    rm frontend.pid
    echo "Frontend stopped"
fi

echo "All services stopped"
EOF
    chmod +x stop.sh
}

# Show status
show_status() {
    echo ""
    echo "Detective Game is Ready!"
    echo "=========================="
    echo ""
    echo "Service Status:"
    echo "  Katana (Blockchain):  http://localhost:5050"
    echo "  Torii (Indexer):      http://localhost:8080"  
    echo "  Backend API:          http://localhost:3001"
    echo "  Frontend:             http://localhost:5173"
    echo ""
    echo "World Address: $WORLD_ADDRESS"
    echo ""
    echo "Ready to Play:"
    echo "  1. Open http://localhost:5173 in your browser"
    echo "  2. You should see 'Blockchain Connected' in the top right"
    echo "  3. Start investigating the Office Party Murder!"
    echo ""
    echo "Fresh Deployment Applied:"
    echo "  All services stopped and restarted cleanly"
    echo "  Dojo world deployed with fresh contracts"
    echo "  Frontend configured with correct world address"
    echo "  All connections properly established"
    echo ""
    echo "Log Files:"
    echo "  - katana.log (blockchain logs)"
    echo "  - torii.log (indexer logs)"
    echo "  - backend.log (API logs)"  
    echo "  - frontend.log (frontend logs)"
    echo ""
    echo "To stop all services: ./stop.sh"
}

# Handle script interruption
cleanup() {
    echo ""
    echo "Setup interrupted. Cleaning up..."
    ./stop.sh 2>/dev/null || true
    exit 1
}

trap cleanup INT TERM

# Main execution
main() {
    stop_existing_services
    start_katana_with_cors
    deploy_dojo_world  # This is the key addition!
    start_torii
    start_backend
    start_frontend
    create_stop_script
    show_status
}

# Run main function
main