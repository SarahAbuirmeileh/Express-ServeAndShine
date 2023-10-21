#!/bin/bash

docker-compose -f docker-compose-prod.yml exec app npx typeorm-ts-node-esm migration:run -d ./src/db/dataSource.ts
docker-compose -f docker-compose-prod.yml exec app mv ./src/db/migrations/1697005494066-CreateRoles.ts ./src/db/migration
docker-compose -f docker-compose-prod.yml exec app npx typeorm-ts-node-esm migration:run -d ./src/db/dataSource.ts
docker-compose -f docker-compose-prod.yml exec app mv ./src/db/migrations/1697005554406-RootUser.ts ./src/db/migration
docker-compose -f docker-compose-prod.yml exec app npx typeorm-ts-node-esm migration:run -d ./src/db/dataSource.ts
