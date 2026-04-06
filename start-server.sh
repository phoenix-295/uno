#!/bin/bash
echo "🎮 Starting Uno Server..."
cd "$(dirname "$0")/server"
node index.js
