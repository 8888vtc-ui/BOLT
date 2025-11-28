#!/bin/bash
echo "🚀 Starting GuruGammon Dev Server..."
echo "📦 Checking dependencies..."

if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Installing..."
    npm install
else
    echo "✅ node_modules exists"
fi

if [ ! -d "node_modules/react-dnd" ]; then
    echo "❌ react-dnd not found. Reinstalling..."
    npm install react-dnd react-dnd-html5-backend react-dnd-touch-backend
fi

if [ ! -d "node_modules/framer-motion" ]; then
    echo "❌ framer-motion not found. Reinstalling..."
    npm install framer-motion
fi

echo "🧹 Cleaning Vite cache..."
rm -rf node_modules/.vite

echo "✅ All dependencies ready!"
echo "🎮 Starting dev server..."
echo ""
echo "Mode Local:  http://localhost:5173/play"
echo "Mode Online: http://localhost:5173/"
echo ""
npm run dev
