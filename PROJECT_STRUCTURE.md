# Project Structure

## Backend (server/)

```
server/
├── src/
│   ├── index.js                 # Server entry point
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Project.js           # Project model
│   │   ├── Task.js              # Task model
│   │   └── Ticket.js            # Ticket model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User management routes
│   │   ├── projects.js          # Project routes
│   │   ├── tasks.js             # Task routes
│   │   ├── tickets.js           # Ticket routes
│   │   └── analytics.js         # Analytics routes
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   ├── userController.js    # User management
│   │   ├── projectController.js # Project management
│   │   ├── taskController.js    # Task management
│   │   ├── ticketController.js  # Ticket management
│   │   └── analyticsController.js # Analytics logic
│   ├── middleware/
│   │   └── auth.js              # JWT auth & role-based access
│   └── utils/
│       └── generateToken.js     # JWT token generation
├── .env                         # Environment variables
├── .gitignore                   # Git ignore file
├── package.json                 # Dependencies
└── README.md                    # Backend documentation
```

## Frontend (dashboard/)

```
dashboard/
├── app/
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (redirects)
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── register/
│   │   └── page.tsx             # Register page
│   ├── dashboard/
│   │   └── page.tsx             # Analytics dashboard
│   ├── projects/
│   │   └── page.tsx             # Projects list
│   ├── tasks/
│   │   └── page.tsx             # Tasks list
│   ├── tickets/
│   │   └── page.tsx             # Tickets list
│   └── users/
│       └── page.tsx             # Users management (Admin)
├── components/
│   └── Layout.tsx               # Navigation layout
├── lib/
│   ├── api.ts                   # API client
│   └── auth.ts                  # Auth utilities
├── types/
│   └── index.ts                 # TypeScript types
├── .env.local                   # Environment variables
├── next.config.ts               # Next.js config
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
└── README.md                    # Frontend documentation
```

## Features Implemented

### Authentication
- ✅ User registration
- ✅ User login
- ✅ JWT token-based authentication
- ✅ Protected routes
- ✅ Role-based access control

### User Management (Admin)
- ✅ View all users
- ✅ Update user details
- ✅ Delete users
- ✅ Filter users by role
- ✅ Activate/deactivate users

### Project Management (Admin, Moderator)
- ✅ Create projects
- ✅ View projects
- ✅ Update projects
- ✅ Delete projects
- ✅ Assign members to projects
- ✅ View project tasks

### Task Management
- ✅ Create tasks (Admin, Moderator)
- ✅ View tasks
- ✅ Update task status
- ✅ Assign tasks to users
- ✅ Set task priority
- ✅ Set due dates
- ✅ Delete tasks (Admin, Moderator)

### Ticket Resolution
- ✅ Create tickets (Users)
- ✅ View tickets
- ✅ Verify tickets (Admin, Moderator)
- ✅ Reject tickets with reasons
- ✅ View ticket history

### Analytics Dashboard
- ✅ System-wide analytics (Admin)
  - Project status distribution
  - Task distribution
  - Tickets resolved per user
  - Moderator performance
- ✅ Project analytics (Moderator)
  - Project status
  - Task distribution
  - Team progress
  - Ticket status
- ✅ User analytics
  - Task status
  - Tickets resolved
  - Projects involved

## Role-Based Access

### Admin
- Full system access
- Manage all users
- View system-wide analytics
- Manage all projects
- Verify all tickets

### Moderator (Project Manager)
- Create/manage their projects
- Assign tasks to users
- View project analytics
- Verify tickets for their projects
- View team progress

### User
- View assigned tasks
- Update task status
- Create tickets to resolve tasks
- View own analytics
- View projects they're members of

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users (Admin)
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
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Tickets
- `GET /api/tickets` - Get all tickets
- `GET /api/tickets/:id` - Get ticket by ID
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/:id/verify` - Verify ticket
- `DELETE /api/tickets/:id` - Delete ticket

### Analytics
- `GET /api/analytics/system` - System analytics (Admin)
- `GET /api/analytics/project/:id` - Project analytics
- `GET /api/analytics/moderator` - Moderator analytics
- `GET /api/analytics/user` - User analytics

## Database Models

### User
- name
- email
- password (hashed)
- role (admin, moderator, user)
- isActive
- timestamps

### Project
- name
- description
- status (active, completed, archived)
- moderator (User reference)
- members (User references)
- startDate
- endDate
- timestamps

### Task
- title
- description
- status (open, in-progress, resolved)
- priority (low, medium, high)
- project (Project reference)
- assignedTo (User reference)
- createdBy (User reference)
- dueDate
- timestamps

### Ticket
- task (Task reference)
- resolvedBy (User reference)
- resolutionNotes
- status (pending, verified, rejected)
- verifiedBy (User reference)
- verifiedAt
- rejectionReason
- timestamps

## Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Protected API routes
- ✅ Input validation
- ✅ CORS configuration
- ✅ Error handling

## Frontend Features

- ✅ Responsive design
- ✅ Role-based navigation
- ✅ Analytics visualizations
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Modal dialogs
- ✅ Data tables
- ✅ Charts and graphs

## Next Steps

1. Add more detailed error handling
2. Add unit tests
3. Add integration tests
4. Add API documentation (Swagger)
5. Add email notifications
6. Add file uploads
7. Add real-time updates
8. Add search and filtering
9. Add pagination
10. Add export functionality

