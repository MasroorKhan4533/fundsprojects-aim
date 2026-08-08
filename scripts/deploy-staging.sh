#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

AWS_PROFILE_NAME="${AWS_PROFILE:-fundsprojects-admin}"
REGION="${AWS_REGION:-ap-south-1}"
ACCOUNT_ID="800591602204"
STACK_NAME="fundsprojects-aim-staging-foundation"
ROLE_NAME="fundsprojects-aim-staging-ec2-role"
DOCUMENTS_BUCKET="fundsprojects-aim-staging-documents-${ACCOUNT_ID}"
BACKUPS_BUCKET="fundsprojects-aim-staging-backups-${ACCOUNT_ID}"
BACKEND_REPO="fundsprojects-aim/backend"
FRONTEND_REPO="fundsprojects-aim/frontend"
PARAM_BASE="/fundsprojects-aim/staging"

export AWS_PROFILE="$AWS_PROFILE_NAME"
export AWS_REGION="$REGION"
export AWS_DEFAULT_REGION="$REGION"

say() { printf '\n===== %s =====\n' "$1"; }
stop() { echo "❌ $1"; exit 1; }

say "1/10 AWS + LOCAL PREFLIGHT"
ARN="$(aws sts get-caller-identity --query Arn --output text)"
ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
echo "Account: $ACCOUNT"
echo "ARN:     $ARN"
[[ "$ACCOUNT" == "$ACCOUNT_ID" ]] || stop "Wrong AWS account"
[[ "$ARN" == "arn:aws:iam::${ACCOUNT_ID}:user/fundsprojects-admin" ]] || stop "AWS CLI must use fundsprojects-admin"
[[ "$(git branch --show-current)" == "production-v1" ]] || stop "Run from production-v1"
docker info >/dev/null 2>&1 || stop "Docker Desktop is not running"
aws s3api head-bucket --bucket "$DOCUMENTS_BUCKET" >/dev/null 2>&1 || stop "Documents S3 bucket is missing"
aws s3api head-bucket --bucket "$BACKUPS_BUCKET" >/dev/null 2>&1 || stop "Backups S3 bucket is missing"
aws ecr describe-repositories --repository-names "$BACKEND_REPO" "$FRONTEND_REPO" >/dev/null

echo "✅ Preflight passed"

say "2/10 PATCH/UPDATE CLOUDFORMATION SECURITY"
TEMPLATE="infra/aws/staging-foundation.yaml"
[[ -f "$TEMPLATE" ]] || stop "Missing $TEMPLATE"

python3 <<'PY'
from pathlib import Path
p = Path("infra/aws/staging-foundation.yaml")
t = p.read_text()

if "HttpPutResponseHopLimit: 2" not in t:
    needle = "        HttpTokens: required\n"
    if needle not in t:
        raise SystemExit("Could not find MetadataOptions.HttpTokens")
    t = t.replace(needle, needle + "        HttpPutResponseHopLimit: 2\n", 1)

marker = "parameter/fundsprojects-aim/staging/*"
if marker not in t:
    needle = "                  - !Sub arn:${AWS::Partition}:ecr:${AWS::Region}:${AWS::AccountId}:repository/fundsprojects-aim/frontend\n"
    if needle not in t:
        raise SystemExit("Could not find ECR permission block")
    addition = needle + "\n              - Effect: Allow\n                Action:\n                  - ssm:GetParameter\n                  - ssm:GetParameters\n                Resource:\n                  - !Sub arn:${AWS::Partition}:ssm:${AWS::Region}:${AWS::AccountId}:parameter/fundsprojects-aim/staging/*\n"
    t = t.replace(needle, addition, 1)

p.write_text(t)
print("✅ CloudFormation patched for container IMDS + SSM parameter reads")
PY

aws cloudformation validate-template --template-body "file://${TEMPLATE}" >/dev/null
aws cloudformation deploy \
  --template-file "$TEMPLATE" \
  --stack-name "$STACK_NAME" \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides InstanceType=t3.small \
  --tags Project=FundsProjects-AIM Environment=staging ManagedBy=CloudFormation \
  --no-fail-on-empty-changeset

echo "✅ CloudFormation update complete"

INSTANCE_ID="$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='InstanceId'].OutputValue | [0]" --output text)"
PUBLIC_IP="$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='PublicIp'].OutputValue | [0]" --output text)"
[[ "$INSTANCE_ID" =~ ^i- ]] || stop "Invalid EC2 instance ID"
[[ -n "$PUBLIC_IP" && "$PUBLIC_IP" != "None" ]] || stop "Public IP unavailable"
echo "Instance:  $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"

say "3/10 CREATE/VERIFY STAGING SECRETS IN PARAMETER STORE"
parameter_exists() {
  aws ssm get-parameter --name "$1" >/dev/null 2>&1
}
put_secure_if_missing() {
  local name="$1" value="$2"
  if parameter_exists "$name"; then
    echo "ℹ️ Existing parameter kept: $name"
  else
    aws ssm put-parameter --name "$name" --type SecureString --value "$value" --description "FundsProjects AIM staging secret" >/dev/null
    echo "✅ Created secure parameter: $name"
  fi
}
put_string_if_missing() {
  local name="$1" value="$2"
  if parameter_exists "$name"; then
    echo "ℹ️ Existing parameter kept: $name"
  else
    aws ssm put-parameter --name "$name" --type String --value "$value" --description "FundsProjects AIM staging setting" >/dev/null
    echo "✅ Created parameter: $name"
  fi
}

MONGO_USER="aim_staging_admin"
put_string_if_missing "$PARAM_BASE/mongo/root_username" "$MONGO_USER"

if ! parameter_exists "$PARAM_BASE/mongo/root_password"; then
  MONGO_PASSWORD="$(openssl rand -hex 24)"
  put_secure_if_missing "$PARAM_BASE/mongo/root_password" "$MONGO_PASSWORD"
else
  echo "ℹ️ Existing Mongo password kept"
fi

if ! parameter_exists "$PARAM_BASE/app/jwt_secret"; then
  JWT_SECRET="$(openssl rand -hex 48)"
  put_secure_if_missing "$PARAM_BASE/app/jwt_secret" "$JWT_SECRET"
else
  echo "ℹ️ Existing JWT secret kept"
fi

if ! parameter_exists "$PARAM_BASE/app/bootstrap_admin_password"; then
  echo ""
  echo "Create a NEW staging admin password (minimum 12 characters)."
  echo "Do not use your AWS password and do not paste the password into ChatGPT."
  while true; do
    read -r -s -p "Staging admin password: " ADMIN_PASSWORD
    echo ""
    read -r -s -p "Confirm staging admin password: " ADMIN_PASSWORD_2
    echo ""
    if [[ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD_2" ]]; then
      echo "Passwords do not match. Try again."
      continue
    fi
    if (( ${#ADMIN_PASSWORD} < 12 )); then
      echo "Password must be at least 12 characters. Try again."
      continue
    fi
    break
  done
  put_secure_if_missing "$PARAM_BASE/app/bootstrap_admin_password" "$ADMIN_PASSWORD"
  unset ADMIN_PASSWORD ADMIN_PASSWORD_2
else
  echo "ℹ️ Existing staging admin password kept"
fi

put_string_if_missing "$PARAM_BASE/app/bootstrap_admin_email" "admin@fundsprojects.local"
aws ssm put-parameter --name "$PARAM_BASE/app/frontend_url" --type String --value "https://staging.fundsaudit.co.in" --overwrite >/dev/null
put_string_if_missing "$PARAM_BASE/storage/documents_bucket" "$DOCUMENTS_BUCKET"
put_string_if_missing "$PARAM_BASE/storage/backups_bucket" "$BACKUPS_BUCKET"

echo "✅ Parameter Store staging configuration ready"

say "4/10 APPLICATION QUALITY GATES"
(
  cd backend
  npm run check
  npm audit --omit=dev --audit-level=high
)
(
  cd frontend
  npm run check
  npm audit --omit=dev --audit-level=high
)
if [[ -x scripts/secret-scan.sh ]]; then ./scripts/secret-scan.sh; fi
git diff --check

echo "✅ Application quality gates passed"

say "5/10 BUILD + PUSH AMD64 DOCKER IMAGES"
REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
DEPLOY_TAG="staging-$(date -u +%Y%m%d%H%M%S)-$(git rev-parse --short=10 HEAD)"
BACKEND_IMAGE="${REGISTRY}/${BACKEND_REPO}:${DEPLOY_TAG}"
FRONTEND_IMAGE="${REGISTRY}/${FRONTEND_REPO}:${DEPLOY_TAG}"

aws ecr get-login-password | docker login --username AWS --password-stdin "$REGISTRY" >/dev/null

docker buildx build --platform linux/amd64 --provenance=false --sbom=false --push -t "$BACKEND_IMAGE" backend
docker buildx build --platform linux/amd64 --provenance=false --sbom=false --push --build-arg VITE_API_URL=/api/v1 -t "$FRONTEND_IMAGE" frontend

echo "Backend image:  $BACKEND_IMAGE"
echo "Frontend image: $FRONTEND_IMAGE"
echo "✅ Docker images pushed to ECR"

say "6/10 PREPARE REMOTE DEPLOYMENT SCRIPT"
cat > /tmp/fundsprojects-staging-remote.sh <<'REMOTE'
#!/bin/bash
set -euo pipefail

REGION="__REGION__"
ACCOUNT_ID="__ACCOUNT_ID__"
PUBLIC_IP="__PUBLIC_IP__"
BACKEND_IMAGE="__BACKEND_IMAGE__"
FRONTEND_IMAGE="__FRONTEND_IMAGE__"
PARAM_BASE="/fundsprojects-aim/staging"
NETWORK="fundsprojects-aim-staging-net"
MONGO_NAME="fundsprojects-aim-mongodb"
BACKEND_NAME="fundsprojects-aim-backend"
FRONTEND_NAME="fundsprojects-aim-frontend"

if ! command -v aws >/dev/null 2>&1; then
  dnf install -y unzip curl >/dev/null
  curl -fsSL https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o /tmp/awscliv2.zip
  rm -rf /tmp/aws
  unzip -q /tmp/awscliv2.zip -d /tmp
  /tmp/aws/install --update >/dev/null
fi

get_param() {
  aws ssm get-parameter --region "$REGION" --name "$1" --with-decryption --query 'Parameter.Value' --output text
}

MONGO_USER="$(get_param "$PARAM_BASE/mongo/root_username")"
MONGO_PASSWORD="$(get_param "$PARAM_BASE/mongo/root_password")"
JWT_SECRET="$(get_param "$PARAM_BASE/app/jwt_secret")"
ADMIN_PASSWORD="$(get_param "$PARAM_BASE/app/bootstrap_admin_password")"
ADMIN_EMAIL="$(get_param "$PARAM_BASE/app/bootstrap_admin_email")"
DOCUMENTS_BUCKET="$(get_param "$PARAM_BASE/storage/documents_bucket")"

mkdir -p /opt/fundsprojects
chmod 700 /opt/fundsprojects

cat > /opt/fundsprojects/staging.env <<ENVVARS
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://staging.fundsaudit.co.in
MONGODB_URI=mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongodb:27017/fundsprojects_aim?authSource=admin
MONGODB_MAX_POOL_SIZE=20
MONGODB_MIN_POOL_SIZE=2
MONGODB_SERVER_SELECTION_TIMEOUT_MS=5000
JWT_SECRET=${JWT_SECRET}
ACCESS_TOKEN_TTL_MINUTES=15
REFRESH_TOKEN_TTL_DAYS=7
REMEMBER_ME_REFRESH_TOKEN_TTL_DAYS=30
ACCESS_COOKIE_NAME=aim_access_token
REFRESH_COOKIE_NAME=aim_refresh_token
COOKIE_SECURE=true
ACTIVATION_TOKEN_TTL_MINUTES=1440
PASSWORD_RESET_TOKEN_TTL_MINUTES=30
BCRYPT_ROUNDS=12
LOGIN_MAX_FAILURES=5
LOGIN_LOCK_MINUTES=15
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=FundsProjects AIM <no-reply@fundsprojects.local>
EMAIL_DELIVERY_MODE=test
BOOTSTRAP_ADMIN_FULL_NAME=FundsProjects Admin
BOOTSTRAP_ADMIN_EMAIL=${ADMIN_EMAIL}
BOOTSTRAP_ADMIN_MOBILE=+919999999999
BOOTSTRAP_ADMIN_DESIGNATION=Administrator
BOOTSTRAP_ADMIN_PASSWORD=${ADMIN_PASSWORD}
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=500
REQUEST_BODY_LIMIT=12mb
SHUTDOWN_TIMEOUT_MS=10000
STORAGE_PROVIDER=s3
LOCAL_STORAGE_DIR=storage/private
MAX_UPLOAD_MB=10
S3_BUCKET=${DOCUMENTS_BUCKET}
S3_REGION=${REGION}
S3_PREFIX=private
AWS_REGION=${REGION}
AWS_DEFAULT_REGION=${REGION}
ENVVARS
chmod 600 /opt/fundsprojects/staging.env

REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$REGISTRY" >/dev/null

docker pull "$BACKEND_IMAGE"
docker pull "$FRONTEND_IMAGE"
docker pull public.ecr.aws/docker/library/mongo:8.0

docker network inspect "$NETWORK" >/dev/null 2>&1 || docker network create "$NETWORK" >/dev/null

docker rm -f "$FRONTEND_NAME" "$BACKEND_NAME" "$MONGO_NAME" >/dev/null 2>&1 || true

docker run -d \
  --name "$MONGO_NAME" \
  --restart unless-stopped \
  --network "$NETWORK" \
  --network-alias mongodb \
  -e MONGO_INITDB_ROOT_USERNAME="$MONGO_USER" \
  -e MONGO_INITDB_ROOT_PASSWORD="$MONGO_PASSWORD" \
  -v /var/lib/fundsprojects/mongodb:/data/db \
  --health-cmd='mongosh --quiet --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --eval "db.adminCommand({ ping: 1 }).ok" | grep 1' \
  --health-interval=5s \
  --health-timeout=5s \
  --health-retries=30 \
  --health-start-period=15s \
  public.ecr.aws/docker/library/mongo:8.0 >/dev/null

for i in $(seq 1 45); do
  STATUS="$(docker inspect -f '{{.State.Health.Status}}' "$MONGO_NAME" 2>/dev/null || true)"
  if [ "$STATUS" = "healthy" ]; then break; fi
  if [ "$i" -eq 45 ]; then docker logs "$MONGO_NAME" --tail 100; exit 1; fi
  sleep 2
done

docker run --rm \
  --network "$NETWORK" \
  --env-file /opt/fundsprojects/staging.env \
  "$BACKEND_IMAGE" npm run seed:admin

docker run -d \
  --name "$BACKEND_NAME" \
  --restart unless-stopped \
  --network "$NETWORK" \
  --network-alias backend \
  --env-file /opt/fundsprojects/staging.env \
  "$BACKEND_IMAGE" >/dev/null

for i in $(seq 1 45); do
  if docker run --rm --network "$NETWORK" public.ecr.aws/docker/library/alpine:3.22 \
      wget -qO- http://backend:5001/api/v1/health/ready >/tmp/backend-health 2>/dev/null; then
    break
  fi
  if [ "$i" -eq 45 ]; then docker logs "$BACKEND_NAME" --tail 120; exit 1; fi
  sleep 2
done

docker run -d \
  --name "$FRONTEND_NAME" \
  --restart unless-stopped \
  --network "$NETWORK" \
  -p 127.0.0.1:8080:80 \
  "$FRONTEND_IMAGE" >/dev/null

cat > /etc/nginx/conf.d/fundsprojects-aim.conf <<'NGINX'
server {
    listen 80 default_server;
    server_name _;
    client_max_body_size 12m;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
rm -f /etc/nginx/conf.d/default.conf
nginx -t
systemctl reload nginx

curl -fsS http://127.0.0.1:8080/ >/dev/null
curl -fsS http://127.0.0.1:8080/api/v1/health/ready >/tmp/fpa-health.json

echo "===== CONTAINERS ====="
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}'
echo "===== API HEALTH ====="
cat /tmp/fpa-health.json
echo "STAGING_REMOTE_DEPLOY_GREEN"
REMOTE

python3 - <<PY
from pathlib import Path
p = Path('/tmp/fundsprojects-staging-remote.sh')
t = p.read_text()
repls = {
  '__REGION__': '${REGION}',
  '__ACCOUNT_ID__': '${ACCOUNT_ID}',
  '__PUBLIC_IP__': '${PUBLIC_IP}',
  '__BACKEND_IMAGE__': '${BACKEND_IMAGE}',
  '__FRONTEND_IMAGE__': '${FRONTEND_IMAGE}',
}
for a,b in repls.items(): t=t.replace(a,b)
p.write_text(t)
PY
chmod +x /tmp/fundsprojects-staging-remote.sh

echo "✅ Remote deployment script prepared"

say "7/10 SEND DEPLOYMENT THROUGH SSM"
SCRIPT_B64="$(base64 < /tmp/fundsprojects-staging-remote.sh | tr -d '\n')"
export SCRIPT_B64
python3 <<'PY'
import json, os
payload = {"commands": [
  "echo '{}' | base64 -d > /tmp/fundsprojects-staging-remote.sh".format(os.environ["SCRIPT_B64"]),
  "chmod +x /tmp/fundsprojects-staging-remote.sh",
  "/bin/bash /tmp/fundsprojects-staging-remote.sh",
]}
with open('/tmp/fundsprojects-staging-ssm.json','w') as f: json.dump(payload,f)
PY
python3 -m json.tool /tmp/fundsprojects-staging-ssm.json >/dev/null

COMMAND_ID="$(aws ssm send-command \
  --instance-ids "$INSTANCE_ID" \
  --document-name AWS-RunShellScript \
  --comment "Deploy FundsProjects AIM staging ${DEPLOY_TAG}" \
  --parameters file:///tmp/fundsprojects-staging-ssm.json \
  --timeout-seconds 1800 \
  --query 'Command.CommandId' \
  --output text)"
echo "Command ID: $COMMAND_ID"
aws ssm wait command-executed --command-id "$COMMAND_ID" --instance-id "$INSTANCE_ID" || true

STATUS="$(aws ssm get-command-invocation --command-id "$COMMAND_ID" --instance-id "$INSTANCE_ID" --query Status --output text)"
echo "SSM status: $STATUS"
aws ssm get-command-invocation --command-id "$COMMAND_ID" --instance-id "$INSTANCE_ID" --query StandardOutputContent --output text
if [[ "$STATUS" != "Success" ]]; then
  echo "===== REMOTE STDERR ====="
  aws ssm get-command-invocation --command-id "$COMMAND_ID" --instance-id "$INSTANCE_ID" --query StandardErrorContent --output text
  stop "Remote staging deployment failed"
fi

echo "✅ Remote deployment passed"

say "8/10 VERIFY PUBLIC FRONTEND + API"
for i in {1..30}; do
  if curl -fsS --max-time 8 "http://${PUBLIC_IP}" >/dev/null && \
     curl -fsS --max-time 8 "http://${PUBLIC_IP}/api/v1/health/ready" >/tmp/fpa-public-health.json; then
    break
  fi
  if [[ "$i" == "30" ]]; then stop "Public staging frontend/API did not become ready"; fi
  sleep 3
done
cat /tmp/fpa-public-health.json

echo "✅ Public frontend + API reachable"

say "9/10 VERIFY S3 APPLICATION IDENTITY FROM BACKEND CONTAINER"
CHECK_ID="$(aws ssm send-command \
  --instance-ids "$INSTANCE_ID" \
  --document-name AWS-RunShellScript \
  --comment "Verify backend AWS identity and staging containers" \
  --parameters 'commands=["docker exec fundsprojects-aim-backend node -e '\''import(\"@aws-sdk/client-s3\").then(async ({S3Client,ListObjectsV2Command})=>{const c=new S3Client({region:process.env.S3_REGION});const r=await c.send(new ListObjectsV2Command({Bucket:process.env.S3_BUCKET,MaxKeys:1}));console.log(\"S3_BACKEND_ACCESS_GREEN\",r.KeyCount)})'\''","docker ps --format '\''table {{.Names}}\\t{{.Status}}'\''"]' \
  --query 'Command.CommandId' \
  --output text)"
aws ssm wait command-executed --command-id "$CHECK_ID" --instance-id "$INSTANCE_ID" || true
CHECK_STATUS="$(aws ssm get-command-invocation --command-id "$CHECK_ID" --instance-id "$INSTANCE_ID" --query Status --output text)"
aws ssm get-command-invocation --command-id "$CHECK_ID" --instance-id "$INSTANCE_ID" --query StandardOutputContent --output text
if [[ "$CHECK_STATUS" != "Success" ]]; then
  aws ssm get-command-invocation --command-id "$CHECK_ID" --instance-id "$INSTANCE_ID" --query StandardErrorContent --output text
  stop "Backend container could not use EC2 role for S3"
fi

echo "✅ Backend S3 role access verified"

say "10/10 STAGING DEPLOYMENT COMPLETE"
echo "Staging URL: http://${PUBLIC_IP}"
echo "Admin email: admin@fundsprojects.local"
echo "Admin password: the staging password you entered (stored securely in SSM)"
echo ""
echo "⚠️ Current staging transport is HTTP, so COOKIE_SECURE=true only until HTTPS is added in Phase 9."
echo "⚠️ Transactional email remains EMAIL_DELIVERY_MODE=test until SES/email provider setup."
echo ""
echo "=============================================="
echo "✅ CP-8.6.2 MERN STAGING DEPLOYMENT GREEN"
echo "=============================================="
