# VaultX - AI-Powered Cyber Threat Intelligence Platform

VaultX started as a production-style secure password manager and has evolved into an **Enterprise Cyber Threat Intelligence Platform & Active Deception Framework (Honeypot)**. It combines military-grade credential storage (AES-256-GCM) with advanced SOC capabilities including Threat Detection, a Web Application Firewall (WAF), MITRE ATT&CK mapping, SIEM integration, and an AI Security Assistant.

## Features

### 🛡️ Enterprise Security Operations (SOC)
- **Web Application Firewall (WAF)**: Deep packet inspection of API requests to block SQL Injection (SQLi), Cross-Site Scripting (XSS), Command Injection, and Path Traversal.
- **Active Deception (Honeypots)**: Fake endpoints (e.g., `/phpmyadmin`, `/.git/config`) designed to attract, log, and block automated scanners and human attackers.
- **MITRE ATT&CK Mapping**: Every intercepted attack is classified and mapped to standardized MITRE techniques (e.g., T1190, T1078).
- **Threat Hunting Dashboard**: A dedicated interface for security analysts to investigate intercepted attacks, view attacker IPs, and analyze targeted endpoints.
- **AI Security Assistant**: Simulates sending malicious payloads to an LLM for automated security analysis, confidence scoring, and remediation recommendations.
- **SIEM Export**: One-click JSON export of threat intelligence data formatted for ingestion into external tools like Splunk, Elastic, or Wazuh.

### 🔒 Secure Password Management & Identity
- **AES-256-GCM Encryption**: Credentials are encrypted at rest with randomly generated Initialization Vectors (IV) and Authentication Tags to prevent tampering.
- **Advanced Audit Logging**: Comprehensive telemetry tracking IP addresses, device types, geographical locations, and a dynamically calculated Risk Score for every login attempt.
- **Session Management**: Revoke active sessions across devices and monitor connection history.
- **Password History & Strength**: Track previous passwords, enforce complexity, and calculate entropy.
- **Data Portability**: Import and export vault data via CSV.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, React Router, Recharts, Hero Icons
- **Backend**: Node.js, Express.js, TypeScript, Winston, Helmet, CORS, Rate Limiting
- **Database**: PostgreSQL (Neon), Prisma ORM
- **Security**: bcrypt, JWT, AES-256-GCM, Zod Validation

## Directory Structure

```text
VaultX/
├── backend/                  # Node.js / Express backend
│   ├── prisma/               # Database schema and migrations
│   └── src/
│       ├── config/           # Environment variables and configurations
│       ├── controllers/      # API Route Handlers
│       ├── crypto/           # AES-256-GCM Cryptography module
│       ├── middleware/       # WAF, Auth, and Rate Limiting
│       ├── routes/           # Honeypots, Threats, Auth, Vault
│       └── services/         # Threat Intel, Risk Engine, AI Assistant
├── frontend/                 # React / Vite frontend
│   └── src/
│       ├── components/       # UI Components (Incident Timeline, Modals)
│       ├── pages/            # ThreatDashboard, Sessions, Vault
│       └── services/         # API Integration layer
├── package.json              # Monorepo configuration
├── README.md                 # Project Documentation
└── ARCHITECTURE.md           # Deep dive into Threat Intel architecture
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Generate Prisma client & Push Database Schema:
```bash
npm run prisma:generate --workspace backend
npx prisma db push --schema=./backend/prisma/schema.prisma
```

## Environment Variables

To deploy this project or run it locally, create `.env` files in their respective directories.

**Backend (`backend/.env`)**:
```bash
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://user:password@hostname/vaultx?schema=public"
JWT_ACCESS_SECRET="replace-with-a-long-random-access-secret-32-chars-min"
JWT_REFRESH_SECRET="replace-with-a-long-random-refresh-secret-32-chars-min"
ENCRYPTION_KEY="0000000000000000000000000000000000000000000000000000000000000000"
CLIENT_URL="http://localhost:5173"
BCRYPT_SALT_ROUNDS=12
```
> **CRITICAL:** The `ENCRYPTION_KEY` must be exactly 32 bytes (64 hex characters or 32 standard characters). If lost, your vault is unrecoverable.

**Frontend (`frontend/.env`)**:
```bash
VITE_API_BASE_URL="http://localhost:5000/api"
```

## Running the Project

Run both frontend and backend concurrently from the root directory:
```bash
npm run dev
```

Build the project for production:
```bash
npm run build
```

## API Documentation

### Cyber Threat Intelligence
- `GET /api/threats` - Fetch all security alerts, anomalies, and stats.
- `POST /api/threats/:id/resolve` - Mark a threat as resolved.
- `GET /api/threats/:ip/timeline` - Get interleaved audit logs and security alerts for an IP.
- `POST /api/threats/:id/analyze` - Trigger the AI Security Assistant on a specific payload.
- `GET /api/threats/export/siem` - Download raw threat JSON for SIEM ingestion.

### Active Deception (Honeypots)
- `POST /admin/login`, `GET /phpmyadmin`, `GET /.git/config`, etc. (Mounted at root)

### User & Session Management
- `GET /api/sessions` - List active sessions and device telemetry.
- `DELETE /api/sessions/:id` - Revoke a specific session.
- `GET /api/dashboard/audit-logs` - View enriched account activity logs.

## Future Improvements

- Automated IP ban management via IPTables or Cloudflare integration.
- Full LLM API integration (OpenAI/Anthropic) for dynamic threat analysis.
- TOTP-based Two-Factor Authentication.
- Dark Web Breach checking integration for stored vault passwords.
