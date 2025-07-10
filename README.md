# CourseHub LMS - Learning Management System

A comprehensive Learning Management System where instructors can upload courses, students can enroll, complete lessons, and get certifications.

## Features

- **User Management**: Student, Instructor, and Admin roles
- **Course Management**: Create, edit, and manage courses
- **Lesson System**: Structured learning with lesson tracking
- **Enrollment System**: Students can enroll in courses
- **Progress Tracking**: Monitor learning progress
- **Certification**: Issue certificates upon course completion
- **User Authentication**: Secure login and registration
- **Role-based Access**: Different permissions for different user types

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Authentication**: JWT (planned)
- **Environment**: dotenv

## Project Structure

```
CourseHub_LMS_BE/
├── config/
│   └── database.js          # MongoDB connection configuration
├── models/
│   └── User.js              # User schema and model
├── routes/
│   └── userRoutes.js        # User-related API routes
├── controllers/             # Business logic (planned)
├── middleware/              # Authentication middleware (planned)
├── .env                     # Environment variables
├── .gitignore              # Git ignore file
├── app.js                  # Main application file
├── package.json            # Project dependencies
└── README.md               # Project documentation
```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zain0313233/CourseHub_LMS_BE.git
   cd CourseHub_LMS_BE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb+srv:....
   PORT=3001
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   or for development:
   ```bash
   npm run dev
   ```

## API Endpoints

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/create-user` | Create a new user |
| GET | `/api/users/get-users` | Get all users |
| GET | `/api/users/get-user/:id` | Get user by ID |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check server status |

### Health Check
```bash
curl http://localhost:3001/api/health
```

## Planned Features

- **Course Model**: Complete course management system
- **Lesson Model**: Individual lesson tracking
- **Enrollment Model**: Student-course relationship
- **Certificate Model**: Achievement tracking
- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control
- **File Upload**: Course materials and avatars
- **Email Notifications**: Course updates and certificates
- **Progress Analytics**: Learning analytics dashboard
- **Search & Filter**: Course discovery features

## Development Status

- ✅ Basic server setup
- ✅ MongoDB connection
- ✅ User model and routes
- ✅ Basic CRUD operations
- ⏳ Authentication system
- ⏳ Course management
- ⏳ Lesson system
- ⏳ Enrollment features
- ⏳ Certificate generation

## Scripts

```json
{
  "start": "node app.js",
  "dev": "nodemon app.js",
  "test": "node test-connection.js"
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `PORT` | Server port | `3001` |
| `JWT_SECRET` | JWT secret key (planned) | `your-secret-key` |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/username-contibution`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/username-contibution`)
5. Open a Pull Request

## Learning Objectives

This project is built for:
- Learning MongoDB and Mongoose
- Understanding RESTful API design
- Practicing Node.js and Express.js
- Building a complete backend system
- Understanding database relationships
- Implementing authentication and authorization

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

**Developer**: Zain Ali  
**Email**: zainalicsdev@example.com  
**GitHub**: [zain0313233](https://github.com/zain0313233)

---

**Note**: This is a learning project built for educational purposes and portfolio development.