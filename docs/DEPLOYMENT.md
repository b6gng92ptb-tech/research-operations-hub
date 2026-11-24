# Deployment blueprint (not yet deployed)

1. Provision a Linux VM or AWS EC2 instance with Node.js 22, HTTPS ingress, and a MongoDB database accessible only over private networking.
2. Create an AWS Cognito User Pool (or another OIDC provider), app client and groups `requester`, `reviewer`, `admin`. Configure `OIDC_ISSUER`, `OIDC_AUDIENCE`, `OIDC_JWKS_URL` from the provider's official metadata. Validate token audience and issuer.
3. Set environment variables outside Git. Run `npm install`, `node scripts/create-indexes.mjs`, `npm test`, `npm run build`.
4. Start via PM2 (`pm2 start npm --name research-operations -- start`) under a non-root user. Use systemd startup for PM2.
5. Configure Nginx as HTTPS reverse proxy to `127.0.0.1:3000`. Provision Let's Encrypt with certbot, set DNS A/AAAA records, renew certificates automatically.
6. Restrict security groups and firewall, disable public MongoDB exposure, rotate secrets, collect logs, configure backups and recovery checks.
7. Exercise end-to-end login, role permissions, race-condition conflicts, API error responses and webhook replay before publication.

**Not implemented here:** automated EC2 provisioning, Lambda deployment, Cognito user pool creation, browser login redirect, n8n workflows. These are integration tasks, not claimed deliverables.
