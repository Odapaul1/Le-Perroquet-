# MongoDB Setup Guide for French LMS Authentication

## Option 1: MongoDB Atlas (Recommended - Cloud Database)

MongoDB Atlas is a free cloud database service that's perfect for development and testing.

### Steps:
1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for a free account
   - Verify your email

2. **Create a New Cluster**
   - Click "Build a New Cluster"
   - Choose "Shared" (free tier)
   - Select your preferred cloud provider and region
   - Click "Create Cluster" (this takes a few minutes)

3. **Configure Database Access**
   - Go to "Database Access" in the left menu
   - Click "Add New Database User"
   - Create a username and password (save these!)
   - Set privileges to "Read and Write to any database"

4. **Configure Network Access**
   - Go to "Network Access" in the left menu
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
   - Or add your specific IP address for production

5. **Get Connection String**
   - Go to "Clusters" and click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/french-lms`)
   - Replace `<password>` with your actual password

6. **Update Backend Configuration**
   - Copy the connection string
   - Update your `backend/.env` file:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/french-lms
   ```

## Option 2: Local MongoDB Installation

### For Windows:

1. **Download MongoDB Community Server**
   - Go to https://www.mongodb.com/try/download/community
   - Download the Windows installer (.msi)
   - Run the installer and follow the setup wizard

2. **Install MongoDB**
   - Choose "Complete" installation
   - Uncheck "Install MongoDB Compass" (optional GUI tool)
   - Complete the installation

3. **Start MongoDB Service**
   - Open Command Prompt as Administrator
   - Run: `net start MongoDB`
   - Or use Windows Services to start MongoDB

4. **Verify Installation**
   - Open Command Prompt
   - Run: `mongo --version`
   - Should show MongoDB version

5. **Update Backend Configuration**
   - Your local connection string is: `mongodb://localhost:27017/french-lms`
   - This is already set in your `backend/.env.example` file

### For macOS:

1. **Install using Homebrew**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Start MongoDB Service**
   ```bash
   brew services start mongodb-community
   ```

3. **Verify Installation**
   ```bash
   mongo --version
   ```

### For Linux (Ubuntu/Debian):

1. **Import MongoDB GPG Key**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   ```

2. **Create MongoDB List File**
   ```bash
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   ```

3. **Install MongoDB**
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Start MongoDB Service**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

## Testing the Connection

After setting up MongoDB (either Atlas or local), test your connection:

1. **Update your `.env` file** with the correct connection string
2. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Check the console output** - you should see:
   ```
   MongoDB Connected: <your-cluster-name>
   Server running on port 5000
   ```

## Troubleshooting

### Common Issues:

1. **Connection Timeout (Atlas)**
   - Check your IP whitelist in Network Access
   - Verify username/password in connection string
   - Ensure cluster is running (not paused)

2. **ECONNREFUSED (Local)**
   - MongoDB service is not running - start it
   - Wrong port - default is 27017
   - Firewall blocking connection

3. **Authentication Failed**
   - Wrong database credentials
   - User doesn't have proper permissions
   - Database name is incorrect

4. **DNS Resolution Issues (Atlas)**
   - Try using different DNS servers
   - Check if your ISP blocks MongoDB Atlas
   - Use VPN if necessary

## Quick Test Script

Create a file `test-mongodb.js` to test your connection:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

testConnection();
```

Run it with:
```bash
node test-mongodb.js
```

## Next Steps

Once MongoDB is set up and connected:

1. **Start your backend server** with `npm run dev`
2. **Test the authentication endpoints** using Postman or curl
3. **Access your frontend** at http://localhost:3000
4. **Register a new user** to test the full authentication flow

## Support

If you continue to have issues:
- Check MongoDB Atlas status: https://status.mongodb.com/
- Review MongoDB logs in your cluster
- Verify all environment variables are set correctly
- Ensure your internet connection is stable (for Atlas)