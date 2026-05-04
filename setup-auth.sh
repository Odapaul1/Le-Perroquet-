#!/bin/bash

echo "🚀 Setting up French LMS Authentication System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing backend dependencies..."
cd backend
npm install

# Check if .env exists, if not create from example
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your configuration before running the server."
fi

echo "✅ Backend setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update the .env file with your MongoDB URI and email configuration"
echo "2. Run 'npm run dev' to start the backend server"
echo "3. Install frontend dependencies: cd ../app && npm install"
echo "4. Start the frontend: npm run dev"
echo ""
echo "📖 For detailed setup instructions, see AUTHENTICATION_SETUP.md"