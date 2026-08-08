#!/usr/bin/env bash
set -euo pipefail

: "${BACKEND_IMAGE:?BACKEND_IMAGE is required}"
: "${FRONTEND_IMAGE:?FRONTEND_IMAGE is required}"

AWS_REGION="${AWS_REGION:-ap-south-1}"
ACCOUNT_ID="${ACCOUNT_ID:-800591602204}"
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

BACKEND_NAME="fundsprojects-aim-backend"
FRONTEND_NAME="fundsprojects-aim-frontend"
NETWORK_NAME="fundsprojects-aim-staging-net"
ENV_FILE="/opt/fundsprojects/staging.env"

PREV_BACKEND_IMAGE=""
PREV_FRONTEND_IMAGE=""
ROLLED_BACK=0

log() {
  printf '\n===== %s =====\n' "$1"
}

container_image() {
  docker inspect -f '{{.Config.Image}}' "$1" 2>/dev/null || true
}

start_backend() {
  local image="$1"
  docker run -d \
    --name "$BACKEND_NAME" \
    --restart unless-stopped \
    --network "$NETWORK_NAME" \
    --network-alias backend \
    --env-file "$ENV_FILE" \
    -p 127.0.0.1:5001:5001 \
    "$image" >/dev/null
}

start_frontend() {
  local image="$1"
  docker run -d \
    --name "$FRONTEND_NAME" \
    --restart unless-stopped \
    --network "$NETWORK_NAME" \
    -p 127.0.0.1:8080:80 \
    "$image" >/dev/null
}

wait_backend() {
  for attempt in $(seq 1 30); do
    if curl -fsS --max-time 5 \
      http://127.0.0.1:5001/api/v1/health/ready >/tmp/fpa-backend-health.json; then
      cat /tmp/fpa-backend-health.json
      rm -f /tmp/fpa-backend-health.json
      return 0
    fi
    sleep 3
  done

  rm -f /tmp/fpa-backend-health.json
  return 1
}

wait_frontend() {
  for attempt in $(seq 1 20); do
    if curl -fsSI --max-time 5 http://127.0.0.1:8080 >/dev/null; then
      return 0
    fi
    sleep 2
  done
  return 1
}

rollback() {
  local code=$?
  trap - ERR

  if [[ "$ROLLED_BACK" -eq 1 ]]; then
    exit "$code"
  fi
  ROLLED_BACK=1

  echo ""
  echo "❌ New staging containers failed verification."
  echo "Starting automatic rollback..."

  docker rm -f "$BACKEND_NAME" "$FRONTEND_NAME" >/dev/null 2>&1 || true

  if [[ -n "$PREV_BACKEND_IMAGE" && -n "$PREV_FRONTEND_IMAGE" ]]; then
    start_backend "$PREV_BACKEND_IMAGE" || true
    start_frontend "$PREV_FRONTEND_IMAGE" || true

    if wait_backend && wait_frontend; then
      echo "✅ AUTOMATIC_ROLLBACK_GREEN"
    else
      echo "❌ ROLLBACK_HEALTH_CHECK_FAILED"
    fi
  else
    echo "❌ Previous images were not available for rollback."
  fi

  exit "$code"
}

trap rollback ERR

log "1/8 PRECHECK"

test -f "$ENV_FILE"
docker network inspect "$NETWORK_NAME" >/dev/null
docker inspect "$BACKEND_NAME" >/dev/null
docker inspect "$FRONTEND_NAME" >/dev/null
docker inspect fundsprojects-aim-mongodb >/dev/null

PREV_BACKEND_IMAGE="$(container_image "$BACKEND_NAME")"
PREV_FRONTEND_IMAGE="$(container_image "$FRONTEND_NAME")"

echo "Previous backend image:  $PREV_BACKEND_IMAGE"
echo "Previous frontend image: $PREV_FRONTEND_IMAGE"
echo "DEPLOY_PRECHECK_GREEN"

log "2/8 ECR LOGIN"

aws ecr get-login-password --region "$AWS_REGION" |
  docker login \
    --username AWS \
    --password-stdin "$ECR_REGISTRY" >/dev/null

echo "ECR_LOGIN_GREEN"

log "3/8 PULL NEW IMAGES"

docker pull "$BACKEND_IMAGE"
docker pull "$FRONTEND_IMAGE"
echo "IMAGE_PULL_GREEN"

log "4/8 REPLACE APPLICATION CONTAINERS"

# MongoDB is deliberately NOT stopped/recreated.
docker rm -f "$BACKEND_NAME" "$FRONTEND_NAME" >/dev/null

start_backend "$BACKEND_IMAGE"
start_frontend "$FRONTEND_IMAGE"

echo "CONTAINERS_STARTED_GREEN"

log "5/8 LOCAL HEALTH"

wait_backend
wait_frontend

echo "LOCAL_HEALTH_GREEN"

log "6/8 NGINX + HTTPS"

nginx -t
systemctl is-active --quiet nginx

curl -fsS --max-time 10 \
  -H 'Host: staging.fundsaudit.co.in' \
  http://127.0.0.1/api/v1/health/ready >/tmp/fpa-nginx-health.json

cat /tmp/fpa-nginx-health.json
rm -f /tmp/fpa-nginx-health.json

echo "NGINX_PROXY_GREEN"

log "7/8 CONTAINER STATE"

docker ps \
  --filter "name=fundsprojects-aim-" \
  --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'

test "$(docker inspect -f '{{.State.Running}}' "$BACKEND_NAME")" = "true"
test "$(docker inspect -f '{{.State.Running}}' "$FRONTEND_NAME")" = "true"
test "$(docker inspect -f '{{.State.Running}}' fundsprojects-aim-mongodb)" = "true"

echo "CONTAINER_STATE_GREEN"

log "8/8 CLEANUP"

docker image prune -f >/dev/null || true

trap - ERR

echo ""
echo "✅ STAGING_REMOTE_DEPLOY_GREEN"
