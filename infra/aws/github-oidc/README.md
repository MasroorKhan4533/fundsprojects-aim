# FundsProjects AIM — GitHub → AWS OIDC

This IAM trust is intentionally restricted to:

- GitHub owner: `MasroorKhan4533`
- Repository: `fundsprojects-aim`
- Branch: `production-v1`
- AWS account: `800591602204`
- AWS region: `ap-south-1`
- Staging EC2 instance: `i-0eb69c3c3e0f1abb9`

No long-lived AWS access keys are stored in GitHub.

The trust policy accepts both GitHub's legacy repository subject format and the
new immutable owner/repository-ID subject format while keeping the owner,
repository name, and deployment branch fixed.
