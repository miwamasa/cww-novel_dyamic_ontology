#!/bin/bash

echo "=========================================="
echo "Dynamic Ontology System - Status Check"
echo "=========================================="
echo ""

# Check Backend
echo "📡 Backend Status (http://localhost:3000):"
if curl -s -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "  ✅ Backend is running"
    curl -s http://localhost:3000/health | python3 -m json.tool
else
    echo "  ❌ Backend is not responding"
fi

echo ""

# Check Frontend
echo "🖥️  Frontend Status (http://localhost:5173):"
if curl -s -f http://localhost:5173/ > /dev/null 2>&1; then
    echo "  ✅ Frontend is running"
    echo "  Access at: http://localhost:5173"
else
    echo "  ❌ Frontend is not responding"
fi

echo ""

# Check processes
echo "🔍 Running Processes:"
ps aux | grep -E "vite|node.*server.js" | grep -v grep | awk '{print "  " $11 " " $12 " " $13 " " $14}'

echo ""
echo "=========================================="
echo "Quick Commands:"
echo "=========================================="
echo "  Start Backend:  cd backend && npm run dev"
echo "  Start Frontend: cd frontend && npm run dev"
echo "  View Logs:      Use separate terminals for each"
echo "  Access App:     http://localhost:5173"
echo "=========================================="
