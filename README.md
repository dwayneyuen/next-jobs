# next-jobs

Open source job scheduling and job queueing solution for serverless NextJS apps.

This is pretty far from complete! Things to do:

- Implement subscription via Stripe
- Client activity dashboard
- Customer portal

## Stack

The frontends are NextJS and deployed to Vercel and the backends are either NextJS API routes or NestJS deployed to AWS
EC2.

## Project layout

- cli - CLI tool for deploying next-jobs
- sdk - Client library published to npm
- server - Self-hostable implementation of next-jobs
- server-managed - Managed implementation of the next-jobs server
- web-backend - Backend NestJS application supporting the website, webhooks, etc.
- web-frontend - Frontend Next.js application supporting the website, API docs, etc.
