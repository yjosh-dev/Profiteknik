# Profiteknik Corp E-Recruitment Platform

A web-based e-recruitment system designed for **Profiteknik Corp**, a company specializing in civil, mechanical, and industrial engineering projects. The platform streamlines hiring for skilled blue-collar and technical field roles — welders, pipefitters, riggers, electricians, and other field specialists — while giving administrative and recruitment staff the tools to manage the full hiring pipeline.

## Table of Contents

- [Overview](#overview)
- [Scope](#scope)
- [User Groups](#user-groups)
- [Core Features](#core-features)
- [System Architecture](#system-architecture)
- [Development Lifecycle](#development-lifecycle)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Status](#project-status)
- [Contributing](#contributing)
- [License](#license)

## Overview

Profiteknik Corp regularly hires skilled field labor for engineering projects, and traditionally relies on manual, paper-based recruitment workflows. This platform digitizes that process — from job posting to applicant screening to manpower pooling — into a single web-based system accessible from any standard browser, with no dedicated application install required.

## Scope

This project covers the full system development lifecycle for the platform, including:

- Requirements gathering
- System design
- Development
- Testing
- Deployment in Profiteknik Corp's operational context

The system is built as a **browser-based web application** rather than a native or desktop application, to ensure accessibility across different devices and technologies without additional installation overhead.

## User Groups

| User Group | Description |
|---|---|
| **Administrative & Recruitment Staff** | Internal Profiteknik Corp users who create job postings, screen applicants, manage the hiring pipeline, and maintain the manpower pool. |
| **External Job Seekers** | Skilled blue-collar and technical workers (welders, pipefitters, riggers, electricians, and other field specialists) applying for available positions. |

## Core Features

The platform is organized into five main functional areas:

### 1. Job Posting & Application Management
Enables administrators to create, publish, and manage job listings tied to specific project requirements. External applicants can browse open positions and submit applications directly through the system.

### 2. Skill-Based Matching
Automatically compares applicant skill profiles against job requirements to surface the most relevant candidates for each posting.

### 3. Applicant Tracking & Manpower Pooling
Tracks application progress across multiple hiring stages and maintains a centralized pool of pre-screened, qualified workers available for immediate project deployment.

### 4. Document Submission & Management
Allows applicants to upload and manage required employment documents online, eliminating physical paperwork and speeding up administrative processing.

### 5. Worker Profile & Skill Profiling
Lets job seekers build and maintain digital profiles covering technical skills, work experience, certifications, and availability — creating a searchable, reliable candidate database for the company.

## System Architecture

The system is split into two independent projects within this repository:

```
Profiteknik/
├── frontend/    # Vite + React (TypeScript) single-page application
└── backend/     # Laravel (PHP) REST API + authentication
```

The frontend consumes the backend as an API (via `axios`), rather than the backend rendering pages server-side. Authentication between the two is handled by **Laravel Sanctum**, suited for SPA-to-API token/cookie-based auth.

- **Frontend** — Vite-based React SPA. Routing is handled with `react-router-dom` (nested layout routes for shared UI like the sidebar/header). Styled with Tailwind CSS v4.
- **Backend** — Laravel API exposing endpoints under `routes/api.php`. Database access via Eloquent models (`app/Models`), with schema defined in `database/migrations`.
- **Database** — SQLite by default in local development (see `backend/.env.example`), swappable for MySQL/PostgreSQL in production via Laravel's standard `DB_CONNECTION` config.

## Development Lifecycle

This study/project follows the system development lifecycle below:

1. **Requirements Gathering** — Identifying needs of administrative staff, recruitment team, and job seekers.
2. **System Design** — Defining architecture, database schema, and UI/UX for both user groups.
3. **Development** — Implementation of the five core functional areas.
4. **Testing** — Functional, usability, and system testing prior to deployment.
5. **Deployment** — Rollout into Profiteknik Corp's operational environment.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, Axios |
| Backend | Laravel 13 (PHP 8.3), Laravel Sanctum (auth) |
| Database | SQLite (local dev) — configurable via Laravel's `.env` |
| Testing | PHPUnit (backend) |

> _Fill in your hosting/deployment target (e.g. VPS, AWS, Laravel Forge/Vapor, Vercel for the frontend) once decided._

## Getting Started

Clone the repository:

```bash
git clone https://github.com/yjosh-dev/Profiteknik.git
cd Profiteknik
```

### Backend (Laravel API)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite   # if using SQLite locally
php artisan migrate

# Run backend, queue, logs, and frontend dev server together:
composer run dev
```

### Frontend (React SPA)

```bash
cd frontend
npm install
npm run dev
```

By default, Vite serves the frontend and Laravel serves the API — make sure `backend/config/cors.php` and your frontend's API base URL (in `frontend/src/service`) are pointed at each other correctly for local development.

## Project Status

**In Development** — This platform is being actively designed and built as part of a system development study for Profiteknik Corp. Core authentication scaffolding (`User`, `RootAccount` models) and initial routing/layout structure are in place; the five core functional areas are being built out incrementally.

## Contributing

This is an academic/organizational system development project. If working with a team:

- Follow the branch naming convention: `feature/`, `fix/`, `chore/`
- Write descriptive commit messages (see [Conventional Commits](https://www.conventionalcommits.org/))
- Open a pull request for review before merging into `main`

## License

> _Specify a license, or note that this is proprietary to Profiteknik Corp / for academic use only._
