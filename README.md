## Run local postgres database

```bash
$ docker run -d --name myPostgresDb -p 5455:5432 \
  -e POSTGRES_USER=myUser -e POSTGRES_PASSWORD=myPassword postgres
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Export database
```bash
PGPASSWORD=<password> pg_dump "postgresql://bite-admin@34.116.213.106:5432/bhb-operations-postgresql" -F c -b -v -f <backup_file_name>.dump
```
