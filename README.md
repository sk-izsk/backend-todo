# backend-todo

Simple backend-first Todo project to brush up core backend skills in small, practical steps.

## Why this project exists

The goal of this repository is not to build a polished product. The goal is to repeatedly practice backend fundamentals with a tiny domain (auth + todos) so the learning loop stays fast.

This project intentionally focuses on backend work:

1. Authentication and authorization flow
2. Request validation and error handling
3. Database migration path and persistence choices
4. Running services in containers for reproducible environments

The frontend is intentionally minimal and only exists to exercise backend endpoints.

## Learning progression in this repo

The stack evolves in phases to rehearse common real-world transitions:

1. SQLite phase
2. PostgreSQL + Prisma phase
3. Dockerized local environment phase

This progression helps practice:

1. Starting simple with local persistence
2. Moving to relational production-like infrastructure
3. Running app + database consistently across machines

## Auth approach

Auth now uses HTTP-only cookies for JWT transport instead of localStorage.

Reason:

1. localStorage tokens are accessible from JavaScript and increase XSS blast radius
2. HTTP-only cookies reduce token exposure to client-side scripts
3. This better matches common backend security practice for session-style auth in browser apps

## What is intentionally out of scope

1. Fancy frontend UX/design
2. Full production hardening
3. Complex domain modeling

The repository is meant for backend brush-up and iteration speed, not frontend depth.
