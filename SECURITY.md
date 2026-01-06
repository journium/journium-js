# Security Policy

## Supported Versions

We actively support the following versions of the Journium JavaScript SDK:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | ✅ Yes             |

## Reporting a Vulnerability

We take security issues seriously. If you discover a security vulnerability, please follow these steps:

### Private Disclosure

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, report security issues privately by:

1. **GitHub Security Advisories** (Preferred):
   - Go to the [Security tab](https://github.com/journium/journium-js/security) on GitHub
   - Click "Report a vulnerability"
   - Fill out the private vulnerability report

2. **Email** (Alternative):
   - Send an email to: security@journium.io
   - Include "SECURITY" in the subject line

### What to Include

Please include the following information:

- **Description**: Clear description of the vulnerability
- **Impact**: What could an attacker achieve?
- **Reproduction**: Step-by-step instructions to reproduce
- **Environment**: Browser versions, Node.js versions, etc.
- **Proof of Concept**: Code or screenshots (if applicable)

### Response Timeline

- **Initial Response**: Within 24 hours
- **Confirmation**: Within 48 hours  
- **Fix Timeline**: Varies based on severity, typically within 7 days for critical issues

### Disclosure Policy

- We will acknowledge receipt of your report within 24 hours
- We will provide regular updates on our progress
- We will credit you in our security advisory (unless you prefer to remain anonymous)
- We will coordinate disclosure timing with you

## Security Considerations

When using the Journium SDK:

- **API Keys**: Never expose API keys in client-side code
- **Data Sanitization**: Validate and sanitize any user data before tracking
- **HTTPS**: Always use HTTPS in production environments
- **Dependencies**: Keep the SDK updated to the latest version

## Bug Bounty

We currently do not have a formal bug bounty program, but we greatly appreciate security research and will acknowledge contributors.