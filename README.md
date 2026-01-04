# Pinge

Pinge is a real-time messaging application developed and maintained by [Gokul](https://github.com/Jacobgokul).  
It is built with a focus on performance, security, and scalability — aiming to offer a clean and modern chat experience.

---

## About

Pinge is designed to serve as a fully functional chat platform where users can register, communicate in real-time, and manage conversations securely.  
It is built using a modern Python backend stack and will evolve into a production-grade application with support for WebSocket-based messaging, authentication, and role-based features.

---

## Status

🚀 **Production-Ready Core Features**  
The application now includes a complete messaging system with authentication, contact management, direct messaging, group chats, and real-time WebSocket communication.

**Current Version:** v1.0.0  
**API Endpoints:** 30+  
**Database Tables:** 8  
**Real-Time:** WebSocket enabled

---

## Features

✅ **Implemented:**

**Authentication & Security:**
- User registration with email validation
- JWT-based authentication with token expiration
- Session management (multi-device support)
- Password hashing with bcrypt
- Protected API routes with OAuth2
- Proper error handling and logging
- Health check endpoints

**Contact Management:**
- Send/accept/reject friend requests
- Contact list management
- Remove contacts

**Messaging:**
- Direct messaging between contacts
- Group chat creation and management
- Real-time message delivery via WebSocket
- Message history with pagination
- Unread message tracking and notifications
- Mark messages as read functionality

**Group Features:**
- Create groups with multiple members
- Add/remove group members (admin only)
- Promote/demote members (role management)
- Update group name and description
- Leave group functionality
- Delete group (admin/creator only)
- View group members and their roles

**Real-Time Features:**
- WebSocket connections for instant messaging
- Live message notifications
- Unread count updates in real-time
- Multi-device support

📋 **TODO:**

**Backend:**
- [ ] Update user profile API (username, email, password)
- [ ] User avatar/profile picture upload
- [ ] Email verification on registration
- [ ] Password reset via email
- [ ] Message search API
- [ ] Delete/edit messages API
- [ ] Typing indicator events via WebSocket
- [ ] Online/offline status tracking

**Frontend:**
- [ ] Edit Profile functionality (Settings page)
- [ ] Notifications settings
- [ ] Privacy & Security settings
- [ ] Typing indicators UI
- [ ] Online/offline user status (real-time)
- [ ] Message read receipts (checkmarks)
- [ ] File/image attachments
- [ ] User search (to find new contacts)
- [ ] Group member management UI (add/remove from chat screen)
- [ ] Delete/edit messages UI
- [ ] Last message preview in conversation list
- [ ] Infinite scroll for message history
- [ ] Profile picture upload UI

**Future Enhancements:**
- [ ] Push notifications (mobile/web)
- [ ] Message reactions/emojis
- [ ] Voice/video calls
- [ ] End-to-end encryption
- [ ] Message forwarding
- [ ] Starred/pinned messages

---

## Tech Stack

- **Framework:** FastAPI (Python 3.12+)
- **Database:** PostgreSQL with asyncpg
- **ORM:** SQLAlchemy (async)
- **Authentication:** JWT (python-jose) + OAuth2
- **Password Hashing:** Bcrypt
- **Validation:** Pydantic
- **Real-Time:** WebSockets
- **Rate Limiting:** SlowAPI
- **CORS:** FastAPI middleware

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
   - Swagger Docs: http://localhost:8000/docs (dev mode only)
   - ReDoc: http://localhost:8000/redoc (dev mode only)
   - Health: http://localhost:8000/health
   - WebSocket: ws://localhost:8000/ws?token=<jwt_token>

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

### Contacts

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/contacts/send-request` | Send friend request | Yes |
| GET | `/contacts/requests` | Get pending requests | Yes |
| POST | `/contacts/accept/{request_id}` | Accept friend request | Yes |
| POST | `/contacts/reject/{request_id}` | Reject friend request | Yes |
| GET | `/contacts/` | Get your contacts list | Yes |
| DELETE | `/contacts/{contact_id}` | Remove a contact | Yes |

### Direct Messages

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/messages/direct` | Send direct message | Yes |
| GET | `/messages/direct/{contact_id}` | Get chat history | Yes |
| GET | `/messages/unread` | Get all unread messages | Yes |
| GET | `/messages/unread/count` | Get unread count per contact | Yes |
| POST | `/messages/mark-read` | Mark specific messages as read | Yes |
| POST | `/messages/mark-read/contact/{contact_id}` | Mark all from contact as read | Yes |

### Groups

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/messages/groups` | Create new group | Yes |
| GET | `/messages/groups` | Get your groups | Yes |
| GET | `/messages/groups/{group_id}/members` | Get group members | Yes |
| POST | `/messages/groups/{group_id}/members` | Add members (admin only) | Yes |
| DELETE | `/messages/groups/{group_id}/members/{user_id}` | Remove member (admin only) | Yes |
| PATCH | `/messages/groups/{group_id}/members/{user_id}/role` | Change member role (admin only) | Yes |
| PATCH | `/messages/groups/{group_id}` | Update group info (admin only) | Yes |
| POST | `/messages/groups/{group_id}/leave` | Leave group | Yes |
| DELETE | `/messages/groups/{group_id}` | Delete group (admin/creator only) | Yes |

### Group Messages

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/messages/groups/{group_id}/messages` | Send group message | Yes |
| GET | `/messages/groups/{group_id}/messages` | Get group chat history | Yes |

### WebSocket

| Endpoint | Description | Auth Required |
|----------|-------------|---------------|
| WS `/ws?token=<jwt>` | Real-time connection | Yes (via query param) |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root endpoint |
| GET | `/health` | Health check |

---

## Project Structure

```
pinge/
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables (not in git)
├── README.md                   # This file
└── backend/
    ├── main.py                 # FastAPI app with lifespan management
    ├── config.py               # Configuration and environment settings
    ├── database/
    │   ├── database.py         # Database connection and session
    │   ├── models.py           # SQLAlchemy models
    │   └── db_enum.py          # Database enums (Gender, Roles, Status)
    ├── routers/
    │   ├── authentication_api.py   # Authentication endpoints
    │   ├── contact_api.py          # Contact management endpoints
    │   ├── message_api.py          # Messaging and group endpoints
    │   └── websocket_api.py        # WebSocket connection endpoint
    ├── schema/
    │   ├── auth_schema.py          # Authentication schemas
    │   ├── contact_schema.py       # Contact schemas
    │   └── message_schema.py       # Message and group schemas
    └── utilities/
        ├── authentication_service.py   # Auth business logic
        ├── contact_service.py          # Contact management logic
        ├── message_service.py          # Messaging and group logic
        ├── websocket_manager.py        # WebSocket connection manager
        ├── exception_handler.py        # Global exception handler
        ├── middleware.py               # Custom middleware
        └── generic.py                  # Utility functions
```

---

## Development

### Running in Development Mode

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Testing WebSocket Connection

```javascript
// JavaScript example
const token = 'your-jwt-token';
const ws = new WebSocket(`ws://localhost:8000/ws?token=${token}`);

ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
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

- **JWT tokens** expire after 7 days (configurable)
- **Passwords** are hashed using bcrypt with salt
- **Session tracking** with device fingerprinting (IP, user agent, location)
- **Multi-device support** - Each login creates a separate session
- **Environment-based configuration** - Secrets in .env file
- **Protected routes** - OAuth2 bearer token authentication
- **Input validation** - Pydantic schemas validate all inputs
- **Error handling** - No internal details exposed to clients
- **Rate limiting** - SlowAPI prevents abuse
- **CORS** - Configurable origin restrictions
- **SQL injection protection** - SQLAlchemy ORM parameterized queries

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

**Polyform Noncommercial License 1.0.0**

This project is licensed under the [Polyform Noncommercial License 1.0.0](LICENSE).

**Summary:**
- ✅ For research and educational purposes
- ✅ To fix and raise bugs and issues
- ❌ Commercial use requires separate permission
- ❌ Cannot be used for commercial products or services

For the full license text, see the [LICENSE](LICENSE) file.

For commercial licensing inquiries, please contact the developer.

**Required Notice:** Copyright © 2026 Gokul (https://github.com/Jacobgokul)

---

## Contact

**Developer:** Gokul  
**GitHub:** [@Jacobgokul](https://github.com/Jacobgokul)

---