# Continuous Integration (CI) and Deployment (CD)

The Vikas Inventory Backend utilizes GitHub Actions to ensure code quality, type safety, and architectural integrity on every single Pull Request and push to the main branch.

## CI Workflow Pipeline (`.github/workflows/ci.yml`)

The CI pipeline runs the following strict validation checks in a containerized `ubuntu-latest` environment:

### 1. Installation (`npm ci`)
Ensures that the `package-lock.json` completely dictates the dependency tree, preventing "works on my machine" bugs where developers accidentally install drifting minor versions of packages.

### 2. Build Verification (`npm run build`)
The strict NestJS/TypeScript compiler compiles the entire application. If a single interface is misaligned or an import is missing, the workflow will fail immediately, preventing broken code from reaching staging.

### 3. Migration Configuration Check
It executes a dry run of the TypeORM CLI to verify that `data-source.ts` successfully compiles and loads environment variables without crashing. It utilizes mocked environment variables (`DB_HOST=localhost`) so it does not require a live database.

### 4. Test Audit (Informational)
Currently, `npm test` runs with `continue-on-error: true`. 
**Why?** An audit revealed 41 failing tests (concentrated in pagination logic for `visit.service` and `order.service`). Rather than disabling tests entirely or faking success, the pipeline runs them to provide visibility on Pull Requests. Once the technical debt is paid down, this flag must be removed to enforce strict TDD passing.

## Branch Protection Recommendations
For production repositories, you should configure GitHub Branch Protection Rules on the `main` branch to enforce:
- **Require status checks to pass before merging:** Specifically, the `Build & Validate` job.
- **Require pull request reviews before merging.**

## Future Deployment (CD)
Currently, deployment is manual. In the future, a CD pipeline should be added to trigger upon a push to `main` ONLY if the CI pipeline succeeds.
A standard CD workflow will execute:
1. SSH into VPS.
2. `git pull origin main`.
3. `npm ci`.
4. `npm run build`.
5. `./scripts/backup-db.sh`.
6. `npm run migration:run`.
7. `pm2 restart vikas-backend`.
