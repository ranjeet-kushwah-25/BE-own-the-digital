# Own The Digital Backend API

A modern, full-featured Node.js backend API for blog management, contact forms, and user authentication. Built with Express.js, MongoDB Atlas, and following modern architectural patterns.

## Features

- **Authentication System**: JWT-based authentication with role-based access control
- **Blog Management**: Complete CRUD operations for blog posts with advanced features
- **Contact Form**: Email-enabled contact form with admin panel
- **Modern Architecture**: Clean, scalable, and maintainable code structure
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation
- **Security**: Rate limiting, input validation, and security headers
- **Email Integration**: Automated email notifications using Nodemailer

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Email**: Nodemailer
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
backend-own-the-digital/
|-- config/
|   |-- database.js              # MongoDB connection configuration
|-- controllers/
|   |-- authController.js        # Authentication logic
|   |-- blogController.js        # Blog CRUD operations
|   |-- contactController.js    # Contact form management
|-- middleware/
|   |-- auth.js                  # Authentication middleware
|   |-- validation.js            # Validation middleware
|   |-- errorHandler.js         # Error handling middleware
|-- models/
|   |-- User.js                  # User model
|   |-- Blog.js                  # Blog model
|   |-- Contact.js               # Contact model
|-- routes/
|   |-- auth.js                  # Authentication routes
|   |-- blog.js                  # Blog routes
|   |-- contact.js               # Contact routes
|-- utils/
|   |-- jwt.js                   # JWT utility functions
|   |-- email.js                 # Email utility functions
|-- validators/
|   |-- authValidator.js         # Authentication validation rules
|   |-- blogValidator.js         # Blog validation rules
|   |-- contactValidator.js      # Contact validation rules
|-- .env.example                 # Environment variables template
|-- package.json                 # Dependencies and scripts
|-- server.js                    # Main application file
|-- README.md                    # This file
```

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Email service (Gmail recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend-own-the-digital
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure your `.env` file**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Atlas Configuration
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d

   # Email Configuration (Gmail SMTP)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@braininventory.com

   # Contact Email
   CONTACT_EMAIL=r.kushwah@brainInventory.com

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

6. **Access the API**
   - API Base URL: `http://localhost:5000`
   - API Documentation: `http://localhost:5000/api-docs`
   - Health Check: `http://localhost:5000/health`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/profile` | Get user profile | Private |
| PUT | `/api/auth/profile` | Update user profile | Private |
| PUT | `/api/auth/change-password` | Change password | Private |

### Blog Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/blogs` | Create blog post | Private |
| GET | `/api/blogs` | Get all blog posts | Public |
| GET | `/api/blogs/:id` | Get single blog post | Public |
| PUT | `/api/blogs/:id` | Update blog post | Private (Author/Admin) |
| DELETE | `/api/blogs/:id` | Delete blog post | Private (Author/Admin) |
| POST | `/api/blogs/:id/like` | Like/unlike blog post | Private |
| POST | `/api/blogs/:id/comments` | Add comment | Private |
| GET | `/api/blogs/categories` | Get all categories | Public |

### Contact Form

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/contact` | Submit contact form | Public |
| GET | `/api/contact` | Get all submissions | Admin |
| GET | `/api/contact/:id` | Get single submission | Admin |
| PUT | `/api/contact/:id` | Update submission status | Admin |
| DELETE | `/api/contact/:id` | Delete submission | Admin |
| GET | `/api/contact/stats` | Get contact statistics | Admin |

## API Documentation

The API includes comprehensive Swagger/OpenAPI documentation. Once the server is running, visit:

**http://localhost:5000/api-docs**

This provides:
- Interactive API testing
- Request/response examples
- Authentication requirements
- Validation rules

## Email Configuration

### Gmail Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Create a new app password for this application
3. **Use the App Password** in your `.env` file

### Email Features

- **Contact Notifications**: Automatic emails sent to `r.kushwah@brainInventory.com`
- **Auto-Reply**: Confirmation emails sent to users
- **HTML Templates**: Professional email design
- **Error Handling**: Graceful failure handling with logging

## Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  isActive: Boolean (default: true),
  timestamps: true
}
```

### Blog Model
```javascript
{
  title: String (required),
  content: String (required),
  excerpt: String (optional),
  author: ObjectId (ref: 'User', required),
  tags: [String],
  category: String (required),
  slug: String (unique, auto-generated),
  status: String (enum: ['draft', 'published'], default: 'draft'),
  featuredImage: String (URL),
  readTime: Number (auto-calculated),
  views: Number (default: 0),
  likes: [ObjectId] (ref: 'User'),
  comments: [{
    user: ObjectId (ref: 'User'),
    content: String,
    createdAt: Date
  }],
  timestamps: true
}
```

### Contact Model
```javascript
{
  name: String (required),
  email: String (required),
  subject: String (required),
  message: String (required),
  phone: String (optional),
  company: String (optional),
  status: String (enum: ['pending', 'in-progress', 'completed'], default: 'pending'),
  emailSent: Boolean (default: false),
  priority: String (enum: ['low', 'medium', 'high'], default: 'medium'),
  timestamps: true
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive request validation
- **Security Headers**: Helmet.js for security headers
- **CORS Configuration**: Proper cross-origin resource sharing
- **Error Handling**: Secure error responses

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `MONGODB_URI` | MongoDB Atlas connection string | Yes |
| `JWT_SECRET` | JWT secret key | Yes |
| `JWT_EXPIRE` | Token expiration time | No (default: 7d) |
| `EMAIL_HOST` | SMTP host | Yes |
| `EMAIL_PORT` | SMTP port | Yes |
| `EMAIL_USER` | SMTP username | Yes |
| `EMAIL_PASS` | SMTP password | Yes |
| `EMAIL_FROM` | From email address | Yes |
| `CONTACT_EMAIL` | Contact notification email | Yes |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | No (default: 15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No (default: 100) |

## Deployment

### Production Setup

1. **Set Environment Variables**
   ```bash
   export NODE_ENV=production
   export PORT=5000
   # Set all other required environment variables
   ```

2. **Install Production Dependencies**
   ```bash
   npm ci --only=production
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

### Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t own-the-digital-api .
docker run -p 5000:5000 own-the-digital-api
```

## Frontend Integration

### Authentication Flow

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  }
};

// Authenticated Request
const authenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
  return response.json();
};
```

### Example API Calls

```javascript
// Get blog posts
const getBlogs = async (page = 1, limit = 10) => {
  const response = await fetch(`/api/blogs?page=${page}&limit=${limit}`);
  return response.json();
};

// Submit contact form
const submitContact = async (formData) => {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  return response.json();
};

// Create blog post
const createBlog = async (blogData, token) => {
  const response = await fetch('/api/blogs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(blogData)
  });
  return response.json();
};
```

## Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact:
- Email: r.kushwah@brainInventory.com
- API Documentation: `/api-docs`
- Issues: GitHub Issues

## Changelog

### Version 1.0.0
- Initial release
- Authentication system
- Blog CRUD operations
- Contact form with email
- Swagger documentation
- Security features
- MongoDB Atlas integration
