"""
Search Algorithms Visualizer - Main Entry Point
Run this file to start the complete application
"""

import webbrowser
import time
import os
from threading import Timer

def open_browser():
    """Open the frontend in the default browser"""
    frontend_path = os.path.join(os.path.dirname(__file__), 'frontend', 'index.html')
    webbrowser.open('file://' + frontend_path)

if __name__ == '__main__':
    print("=" * 60)
    print("🔍 Search Algorithms Visualizer")
    print("=" * 60)
    print()
    print("Starting the application...")
    print()
    print("📋 Instructions:")
    print("1. The Flask backend will start on http://localhost:5000")
    print("2. The frontend will open automatically in your browser")
    print()
    print("If the frontend doesn't open automatically, open:")
    print("   frontend/index.html")
    print()
    print("Press Ctrl+C to stop the server")
    print()
    print("=" * 60)

    # Import and run the Flask app
    os.chdir(os.path.join(os.path.dirname(__file__), 'backend'))

    # Open browser after 2 seconds
    Timer(2.0, open_browser).start()

    # Start Flask
    from backend.app import app
    app.run(debug=True, port=5000)

