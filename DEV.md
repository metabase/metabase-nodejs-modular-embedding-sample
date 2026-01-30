# Development info (for Metabase developers only)

### Dev env variables
To test with Docker locally, define additional env variables in the `.env.docker` env file:
```
MB_RUN_MODE="dev"
METASTORE_DEV_SERVER_URL="https://token-check.staging.metabase.com"
```