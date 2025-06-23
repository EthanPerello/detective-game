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
