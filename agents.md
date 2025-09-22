# Contributor Guide

## Project Overview

This is a Next.js monorepo using pnpm workspaces. Frontend in /apps/web, backend in /apps/api.

## Build & Commands

- Install deps: pnpm install

- Start dev server: pnpm dev

- Run tests: pnpm test

- Build for production: pnpm build

## Code Style

- TypeScript strict mode

- Single quotes, no semicolons

- Use functional patterns where possible

## Testing

- Vitest for unit tests

- Playwright for E2E tests

- Test files: *.test.ts

## PR Instructions

- Title format: [<project>] <Title>

- Always run pnpm lint and pnpm test before committing
