# CHC Oracle HCM Academy — portable deployment guide

This archive contains the complete application source at the time of export. It is a Next.js-compatible application built with Vinext for Cloudflare Workers. The current implementation stores relational application data in Cloudflare D1 and uploaded design documents, UAT documents and interview audio in Cloudflare R2.

## What is included

- Application pages, components, API routes and styling
- Training curricula, lessons, task banks and interview content
- Role-based access, trainer approval, trainee progress and scoring logic
- Drizzle database schema in `db/schema.ts`
- All SQL migrations in `drizzle/`
- D1 and R2 binding declarations in `.openai/hosting.json`
- Automated checks and build scripts
- Locked Node dependencies in `package-lock.json`

The archive intentionally excludes Git history, installed dependencies, build output, credentials, secrets and the identity of the original hosted Sites project.

## Direct deployment: Cloudflare D1 and R2

This is the shortest migration path because it matches the application's current data and file-storage APIs.

1. Install Node.js 22.13 or later.
2. Run `npm ci`.
3. Create a new Cloudflare D1 database and an R2 bucket in the destination account.
4. Bind the D1 database to the Worker as `DB` and the R2 bucket as `BUCKET`.
5. Apply every SQL file in `drizzle/` in numeric order, from `0000` through the final migration.
6. Configure authentication as described below.
7. If AI review and task generation are required, create the secret `OPENAI_API_KEY`. The optional `OPENAI_REVIEW_MODEL` variable selects the model; the application otherwise uses its built-in default.
8. Run `npm run build`, then deploy through the destination Cloudflare/Vinext workflow.
9. Test registration, trainer approval, document upload/download, progress tracking, interviews and AI-assisted review before opening access.

Do not put an API key in a source file, Git repository or client-side environment variable. Configure it as a server-side encrypted secret on the destination platform.

## Authentication

`app/chatgpt-auth.ts` reads identity supplied by the original Sites/ChatGPT hosting layer. When moving to another Sites project, configure that platform's sign-in and access policy. When moving outside Sites, replace this adapter with the selected identity provider, such as Microsoft Entra ID, Auth.js, Clerk or another server-side authentication system.

The replacement must continue to return a verified user email and display name to the application. Re-test all authorization checks; do not rely on a browser-supplied email header unless a trusted reverse proxy removes incoming copies and injects the verified value itself.

## Using PostgreSQL, MySQL or another database

The supplied schema and migrations target SQLite-compatible Cloudflare D1. They cannot be applied unchanged to PostgreSQL or MySQL.

For another database engine, the technical team should:

1. Change the Drizzle driver and schema column imports.
2. Convert the migrations to the target SQL dialect.
3. Replace `db/index.ts` with a server-safe connection/pool adapter.
4. Preserve the table names, primary keys, defaults and authorization-related fields unless a planned migration changes them.
5. Replace direct Cloudflare Worker environment access where the new host uses a different secret/configuration API.
6. Run migration and integration tests against a non-production database.

Uploads are binary objects and should remain in object storage rather than the relational database. If R2 is replaced, adapt the calls in `app/api/documents/route.ts` and `app/api/interview-audio/route.ts` to S3, Azure Blob Storage or the chosen equivalent.

## Moving existing live data

This ZIP contains code and database definitions, not the current live records or uploaded files. To preserve trainees, roles, progress, scores, trainer requests, time logs, resource links, submissions and interviews, export the source D1 data and R2 objects separately and import them into the destination after the schema is created.

Handle those exports as confidential learner data. Encrypt them in transit and at rest, restrict access, document retention, and validate record counts and sample downloads before switching the domain.

## Domain and cutover checklist

1. Deploy and validate the destination application on a temporary hostname.
2. Seed the owner/admin role and verify trainer-approval permissions.
3. Import data and objects, if required.
4. Complete functional, access-control, upload-size and mobile-browser UAT.
5. Add `academy.cloudheard.com` to the destination host.
6. Configure the required DNS record and wait for TLS to become active.
7. Lower DNS TTL before cutover when practical, then change traffic only after acceptance.
8. Keep the old deployment read-only for a defined rollback period.

## Local verification

Run:

```bash
npm ci
npm run build
npm test
```

Local database and object-storage emulation is supplied by the Vinext/Cloudflare development setup. Review `vite.config.ts`, `db/index.ts` and `.openai/hosting.json` before changing bindings.
