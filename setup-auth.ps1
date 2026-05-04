Write-Host "🚀 Setting up French LMS Authentication System..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location -Path "backend"
npm install

# Check if .env exists, if not create from example
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Please update the .env file with your configuration before running the server." -ForegroundColor Yellow
}

Write-Host "✅ Backend setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update the .env file with your MongoDB URI and email configuration" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start the backend server" -ForegroundColor White
Write-Host "3. Install frontend dependencies: cd ../app && npm install" -ForegroundColor White
Write-Host "4. Start the frontend: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed setup instructions, see AUTHENTICATION_SETUP.md" -ForegroundColor Cyan