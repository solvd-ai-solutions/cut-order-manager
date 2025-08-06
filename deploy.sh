#!/bin/bash

# Build the application
echo "Building Cut & Order Manager..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build files are in the 'dist' directory"
    echo ""
    echo "To serve the built application:"
    echo "  npm run preview"
    echo ""
    echo "Or serve with any static file server:"
    echo "  npx serve dist"
    echo "  npx http-server dist"
    echo "  python -m http.server --directory dist"
else
    echo "❌ Build failed!"
    exit 1
fi 