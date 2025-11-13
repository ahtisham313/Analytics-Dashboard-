# MERN Task Management Server

Backend server for the MERN Task Management System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the server directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-task
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
```

3. Make sure MongoDB is running on your system.

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user (Protected)

### Users (Admin only)
- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user
- GET `/api/users/role/:role` - Get users by role

### Projects
- GET `/api/projects` - Get all projects
- GET `/api/projects/:id` - Get project by ID
- POST `/api/projects` - Create project *(Moderator)*
- PUT `/api/projects/:id` - Update project *(Moderator)*
- DELETE `/api/projects/:id` - Delete project *(Moderator)*
- GET `/api/projects/:id/tasks` - Get project tasks

### Tasks
- GET `/api/tasks` - Get all tasks
- GET `/api/tasks/:id` - Get task by ID
- POST `/api/tasks` - Create task *(Moderator)*
- PUT `/api/tasks/:id` - Update task
- DELETE `/api/tasks/:id` - Delete task *(Moderator)*

### Tickets
- GET `/api/tickets` - Get all tickets
- GET `/api/tickets/:id` - Get ticket by ID
- POST `/api/tickets` - Create ticket (resolve task) *(User)*
- PUT `/api/tickets/:id/verify` - Verify ticket *(Moderator)*
- DELETE `/api/tickets/:id` - Delete ticket *(Moderator)*

### Analytics
- GET `/api/analytics/system` - System-wide analytics *(Admin)*
- GET `/api/analytics/project/:id` - Project analytics
- GET `/api/analytics/moderator` - Moderator analytics *(Moderator)*
- GET `/api/analytics/user` - User analytics

## Roles

- **Admin**: Manage users, oversee projects and tasks, and view system-wide analytics.
- **Moderator (Project Manager)**: Create and manage projects, assign tasks, track team progress, and verify ticket resolutions.
- **User**: View assigned tasks, move work forward, and resolve tasks by submitting tickets for moderator review.

