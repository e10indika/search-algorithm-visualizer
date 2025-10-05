#!/bin/bash

echo "🚀 Starting Search Algorithms Visualizer..."
echo "============================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python 3.x"
    exit 1
fi

echo "✅ Python3 found: $(python3 --version)"
echo ""

# Navigate to backend directory
cd backend

# Check if virtual environment exists, if not create it
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
    echo ""
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📥 Installing/updating dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo "✅ Dependencies installed"
echo ""

# Start Flask backend server
echo "🌐 Starting Flask backend server on http://localhost:5001"
echo "📊 API will be available at http://localhost:5001/api"
echo ""
echo "============================================"
echo "🎯 Backend server is running..."
echo "📝 Press Ctrl+C to stop the server"
echo "============================================"
echo ""

# Run the Flask app
python3 app.py

