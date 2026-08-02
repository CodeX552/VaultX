# VaultX - Secure Password Manager

VaultX is a production-style secure password manager built with React, Vite, TypeScript, Tailwind CSS, Node.js, Express, PostgreSQL, and Prisma. It focuses on security-first credential storage with AES-256-GCM encryption, JWT-based authentication, protected routes, audit logging, password history, and master-password recovery flows.

## Features

- User registration, login, logout, refresh token flow
- Forgot password and reset password flow
- Change master password
- Encrypted password vault with AES-256-GCM
- Random IV and authentication tag storage
- Password reveal only on demand
- Search and category filtering
- Dashboard statistics and recent activity
- Password history tracking
- Audit logs for key account and vault events
- Strong password generator with strength and entropy feedback
- Responsive dark UI with polished dashboard cards and modal flows

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router, React Hook Form, Zod, Axios, Hero Icons
- Backend: Node.js, Express.js, TypeScript, Winston, Helmet, CORS, Compression, Morgan, Rate Limiting
- Database: PostgreSQL, Prisma ORM
- Security: bcrypt, JWT, AES-256-GCM, validation with Zod

## Folder Structure

```text
backend/
  prisma/
  src/
    config/
    controllers/
    crypto/
    database/
    middleware/
    repositories/
    routes/
    services/
    types/
    utils/
    validators/

frontend/
  src/
    components/
    hooks/
    layouts/
    pages/
    services/
    types/
    utils/
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npm run prisma:generate --workspace backend
```

3. Run database migration:

```bash
npm run prisma:migrate --workspace backend
```

## Environment Variables

Backend `.env`:

```bash
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vaultx?schema=public"
JWT_ACCESS_SECRET="replace-with-a-long-random-access-secret-32-chars-min"
JWT_REFRESH_SECRET="replace-with-a-long-random-refresh-secret-32-chars-min"
ENCRYPTION_KEY="0000000000000000000000000000000000000000000000000000000000000000"
CLIENT_URL="http://localhost:5173"
BCRYPT_SALT_ROUNDS=12
```

Frontend `.env`:

```bash
VITE_API_BASE_URL="http://localhost:4000/api"
```

## Running the Project

Run both apps through the workspace scripts:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

Build both apps:

```bash
npm run build
```

## API Documentation

### Auth

- `POST /register`
- `POST /login`
- `POST /refresh`
- `POST /logout`
- `POST /forgot-password`
- `POST /reset-password`
- `PUT /change-password`

### Vault

- `GET /vault`
- `POST /vault`
- `PUT /vault/:id`
- `DELETE /vault/:id`
- `GET /vault/:id/password`
- `GET /vault/:id/history`

### Dashboard and Activity

- `GET /dashboard`
- `GET /audit-logs`

## Security Features

- Password hashing with bcrypt for master passwords
- AES-256-GCM encryption for vault passwords
- Random IV and authentication tag storage
- JWT access and refresh tokens
- HTTP-only refresh token cookie
- Helmet, CORS, compression, Morgan, and rate limiting
- Centralized error handling
- Zod validation for every request layer
- Audit logging for authentication and vault actions

## Screenshots Placeholder

Add screenshots here for the landing page, login flow, dashboard, vault modal, and recovery workflows.

## Future Improvements

- TOTP-based two-factor authentication
- CSV import and export
- Encrypted backup downloads
- Breach checking integration
- Better token rotation and device session management
- Email delivery for reset workflows
