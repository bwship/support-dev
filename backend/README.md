# Support.dev Backend

Welcome to the Support.dev backend.

## Prerequisites

- [Deno Installation](https://deno.land/manual@v1.35.2/getting_started/installation)
  - If you would like to use Deno Version Manager
  - https://deno.land/x/dvm@v1.8.8
- [pnpm Installation](https://pnpm.io/installation)

## Install NPM Packages

We are using pnpm for node_modules

```
pnpm install
```

## Local Development

Supabase provides a complete docker environment for running the system locally.

- [Supabase Local Development Documentation](https://supabase.com/docs/guides/getting-started/local-development)

To start the system, you can issue the following command:

```
pnpm local:start
```

To stop the system, you can issue the following command:

```
pnpm local:stop
```

To start up the Edge Functions, you can issue the following command:

```
pnpm local:functions
```

## Database

The database is a Postgres realtime database hosted on Supabase.  The database schema is located at ./supabase/migrations

To deploy to Supabase, you can issue the following command:

``` 
pnpm local:db:deploy
```

This will install the database to your local postgres

## Testing
You can test functions locally like this

```
deno test --allow-all hello-world-test.ts --allow-env .env.local
```

And test the database with

```
pnpm local:db:test
```
