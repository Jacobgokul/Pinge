# Pinge

Pinge is a real-time messaging application developed and maintained by [Gokul](https://github.com/Jacobgokul).  
It is being built with a focus on performance, security, and scalability — aiming to offer a clean and modern chat experience.

---

## About

Pinge is designed to serve as a fully functional chat platform where users can register, communicate in real-time, and manage conversations securely.  
It is built using a modern Python backend stack, and will evolve into a production-grade application with support for WebSocket-based messaging, authentication, and role-based features.

---

## Status

🚧 **Active development**  
Initial modules including user registration, JWT authentication, and database setup are completed. More features are being added in structured phases.

---

## Features

✅ **Implemented:**
- User registration with email validation
- JWT-based authentication with token expiration
- Session management (multi-device support)
- Password hashing with bcrypt
- Protected API routes
- Proper error handling and logging
- Health check endpoints

🔄 **In Progress:**
- WebSocket implementation for real-time messaging
- Message storage and retrieval
- Friend/contact management

📋 **Planned:**
- Group chat functionality
- File upload and media sharing
- Push notifications
- User profile management
- Email verification

---

## Tech Stack

- **Framework:** FastAPI (Python 3.12+)
- **Database:** PostgreSQL with asyncpg
- **ORM:** SQLAlchemy (async)
- **Authentication:** JWT (python-jose) + OAuth2
- **Password Hashing:** Bcrypt
- **Validation:** Pydantic

---

## Setup Instructions

### Prerequisites

- Python 3.12+
- PostgreSQL database
- pip or poetry for dependency management

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jacobgokul/Pinge.git
   cd Pinge
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv env
   # On Windows
   .\env\Scripts\activate
   # On Linux/Mac
   source env/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your configuration
   # - Set a strong secret_key
   # - Update database credentials
   ```

5. **Run the application**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

6. **Access the API**
   - API: http://localhost:8000
   - Docs: http://localhost:8000/docs (dev mode only)
   - Health: http://localhost:8000/health

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/authentication/register_user` | Register new user | No |
| POST | `/authentication/login` | Login and get JWT token | No |
| POST | `/authentication/logout` | Logout and invalidate token | Yes |
| GET | `/authentication/me` | Get current user info | Yes |
| GET | `/authentication/users` | Get all users | Yes |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root endpoint |
| GET | `/health` | Health check |

---

## Project Structure

```
pinge/
├── backend/
│   ├── main.py                 # FastAPI app with lifespan management
│   ├── config.py               # Configuration and environment settings
│   ├── database/
│   │   ├── database.py         # Database connection and session
│   │   ├── models.py           # SQLAlchemy models
│   │   └── db_enum.py          # Database enums
│   ├── routers/
│   │   └── authentication_api.py  # Authentication endpoints
│   ├── schema/
│   │   └── auth_schema.py      # Pydantic schemas
│   └── utilities/
│       ├── authentication_service.py  # Auth business logic
│       ├── exception_handler.py       # Global exception handler
│       └── middleware.py              # Custom middleware
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables template
└── README.md                  # This file
```

---

## Development

### Running in Development Mode

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Database Migrations

Tables are automatically created on application startup using SQLAlchemy's `create_all()`.

For production, consider using Alembic for migrations:
```bash
# Initialize (first time only)
alembic init alembic

# Create migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head
```

---

## Security

- JWT tokens expire after 7 days (configurable)
- Passwords are hashed using bcrypt
- Session tracking with device fingerprinting
- Environment-based configuration
- Proper error handling without exposing internals

**Important:** Always set a strong `secret_key` in production!

Generate a secure key:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## License

[Add your license here]

---

## Contact

**Developer:** Gokul  
**GitHub:** [@Jacobgokul](https://github.com/Jacobgokul)

---