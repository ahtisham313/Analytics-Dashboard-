# MERN Stack Task Management System

A comprehensive role-based project management system with task CRUD operations, ticket resolution, and analytics dashboard.

## Features

### Roles
- **Admin**: Manage users, view system-wide analytics, and oversee projects
- **Moderator (Project Manager)**: Create/manage projects, assign tasks, track progress, view project analytics
- **User**: View assigned tasks, update status, and resolve tickets

### Core Features
- **Task Management (CRUD)**: Full CRUD operations for projects and tasks
- **Ticket Resolution**: Users resolve tasks with notes; moderators verify
- **Analytics Dashboard**:
  - Project status (active vs completed)
  - Task distribution (open, in-progress, resolved)
  - Tickets resolved per user
  - Moderator performance (team progress)

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB, JWT authentication
- **Database**: MongoDB

## Project Structure

```
mernTask/
├── server/                 # Backend server
│   ├── src/
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth middleware
│   │   ├── utils/         # Utility functions
│   │   └── index.js       # Server entry point
│   └── package.json
├── dashboard/             # Frontend application
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/              # API client and utilities
│   ├── types/            # TypeScript types
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-task
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
```

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the dashboard directory:
```bash
cd dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the dashboard directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/role/:role` - Get users by role

### Projects (Admin, Moderator)
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/tasks` - Get project tasks

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task (Admin, Moderator)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (Admin, Moderator)

### Tickets
- `GET /api/tickets` - Get all tickets
- `GET /api/tickets/:id` - Get ticket by ID
- `POST /api/tickets` - Create ticket (resolve task)
- `PUT /api/tickets/:id/verify` - Verify ticket (Admin, Moderator)
- `DELETE /api/tickets/:id` - Delete ticket (Admin, Moderator)

### Analytics
- `GET /api/analytics/system` - System-wide analytics (Admin)
- `GET /api/analytics/project/:id` - Project analytics
- `GET /api/analytics/moderator` - Moderator analytics
- `GET /api/analytics/user` - User analytics

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Dashboard**: View analytics based on your role
3. **Projects**: Create and manage projects (Admin/Moderator)
4. **Tasks**: Create, assign, and update tasks (Admin/Moderator can create, Users can update status)
5. **Tickets**: Users can create tickets to resolve tasks, Moderators can verify them
6. **Users**: Admin can manage all users

## Default Roles

When registering, you can choose a role:
- `user` - Regular user
- `moderator` - Project manager
- `admin` - System administrator

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Protected API routes
- Input validation

## Development

### Backend
- The server uses Express.js with MongoDB
- JWT tokens are used for authentication
- CORS is enabled for frontend communication

### Frontend
- Next.js 16 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Recharts for analytics visualizations
- Axios for API calls

## License

This project is open source and available under the MIT License.

