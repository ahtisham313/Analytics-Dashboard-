# Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-task
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
```

Start the server:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd dashboard
npm install
```

Create a `.env.local` file in the `dashboard` directory:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

### 3. MongoDB Setup

Make sure MongoDB is running on your system. You can:
- Install MongoDB locally
- Use MongoDB Atlas (cloud)
- Use Docker: `docker run -d -p 27017:27017 mongo`

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Creating First User

1. Go to http://localhost:3000/register
2. Register with:
   - Name: Admin User
   - Email: admin@example.com
   - Password: password123
   - Role: Admin
3. Login with your credentials

## Testing Roles

### Admin Role
- Can manage all users
- Can view system-wide analytics
- Can create/manage all projects
- Can verify all tickets

### Moderator Role
- Can create/manage their projects
- Can assign tasks to users
- Can view project analytics
- Can verify tickets for their projects

### User Role
- Can view assigned tasks
- Can update task status
- Can create tickets to resolve tasks
- Can view their own analytics

## API Testing

You can test the API using:
- Postman
- curl
- Browser (for GET requests)

Example API call:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Get projects (with token)
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check the MONGODB_URI in .env file
- Verify MongoDB is accessible on port 27017

### CORS Error
- Make sure the frontend URL is correct in backend CORS settings
- Check NEXT_PUBLIC_API_URL in frontend .env.local

### Authentication Error
- Check JWT_SECRET is set in backend .env
- Verify token is being sent in Authorization header
- Check token expiration

### Port Already in Use
- Change PORT in backend .env
- Update NEXT_PUBLIC_API_URL in frontend .env.local

## Project Structure

```
mernTask/
├── server/                 # Backend
│   ├── src/
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth middleware
│   │   ├── utils/         # Utilities
│   │   └── index.js       # Entry point
│   ├── .env               # Environment variables
│   └── package.json
├── dashboard/             # Frontend
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   ├── lib/              # API client
│   ├── types/            # TypeScript types
│   ├── .env.local        # Environment variables
│   └── package.json
└── README.md
```

## Next Steps

1. Set up production environment variables
2. Configure MongoDB Atlas for production
3. Set up authentication with stronger JWT secrets
4. Add error logging and monitoring
5. Deploy to production servers

## Support

For issues or questions, please check:
- README.md for general information
- server/README.md for backend details
- Code comments for implementation details

