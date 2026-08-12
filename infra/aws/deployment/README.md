# Automatic staging deployment

`remote-deploy-staging.sh` is executed on the staging EC2 instance by AWS Systems
Manager from GitHub Actions.

Safety rules:

- MongoDB is not recreated during application deployments.
- The existing `/opt/fundsprojects/staging.env` remains the source of runtime
  application configuration and secrets.
- Images are uniquely tagged because the ECR repositories use immutable tags.
- The EC2 instance pulls images using its own instance role.
- The GitHub runner authenticates to AWS only through OIDC.
- Backend and frontend are health-checked after replacement.
- The previous application image IDs are captured before deployment.
- If the new application containers fail local verification, the script
  automatically recreates the previous backend/frontend images.
- Host Nginx and the Let's Encrypt certificate are retained across deployments.

Current staging endpoint:

`https://staging.fundsaudit.co.in`
