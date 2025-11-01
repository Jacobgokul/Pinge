#!/usr/bin/env python
"""
Development server runner for Pinge.
Run this script to start the FastAPI application.
"""
import uvicorn
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
