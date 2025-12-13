# Release Notes

## Upcoming deployment
- Removed package-lock files across services so Docker builds install dependencies directly from each `package.json`.
- Ensured each service has its own TypeScript toolchain and build scripts using `npx` for reliable compiler resolution.
- Simplified Dockerfiles to install dependencies from service manifests and structured builder/runner stages for web, API, and seatlock worker images.
