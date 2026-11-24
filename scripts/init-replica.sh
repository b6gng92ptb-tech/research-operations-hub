#!/usr/bin/env bash
set -euo pipefail
# Local development only; requires docker compose and mongosh in the mongo container.
docker compose up -d mongo
docker compose exec -T mongo mongosh --quiet --eval 'try { rs.status().ok } catch (e) { rs.initiate({_id:"rs0",members:[{_id:0,host:"localhost:27017"}]}) }'
echo 'Check replica readiness with: docker compose exec mongo mongosh --eval "rs.status()"'
