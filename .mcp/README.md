# MCP Configuration for Better-Auth Documentation

This folder contains MCP (Model Context Protocol) configurations and scripts for scraping better-auth documentation.

## Better-Auth Documentation Scraper

### Purpose
Scrapes official better-auth documentation to help keep the project skill updated.

### Usage

#### From Command Line
```bash
node .mcp/better-auth-scraper.js <url>
```

#### Examples
```bash
# Main docs
node .mcp/better-auth-scraper.js https://better-auth.com/docs

# OAuth Provider
node .mcp/better-auth-scraper.js https://better-auth.com/docs/plugins/oauth-provider

# Email/Password
node .mcp/better-auth-scraper.js https://better-auth.com/docs/authentication/email-password
```

### Output Format
```json
{
  "url": "https://better-auth.com/docs/plugins/oauth-provider",
  "text": "Cleaned text content from the page...",
  "relatedLinks": [
    "https://better-auth.com/docs/authentication/email-password",
    "https://better-auth.com/docs/authentication/sessions"
  ],
  "fetchedAt": "2024-03-18T12:00:00.000Z"
}
```

## OpenCode MCP Configuration

The `opencode.json` file configures the MCP server for OpenCode to use.

## Important URLs

- **Main Documentation**: https://better-auth.com/docs
- **OAuth Provider**: https://better-auth.com/docs/plugins/oauth-provider
- **Email/Password**: https://better-auth.com/docs/authentication/email-password
- **Sessions**: https://better-auth.com/docs/authentication/sessions
- **Database Adapters**: https://better-auth.com/docs/adapters/sqlite
- **Common Errors**: https://better-auth.com/docs/guides/common-errors

## Updating the Skill

When better-auth releases new features:

1. Scrape the relevant documentation
2. Review the new content
3. Update `.skills/better-auth.md` with new patterns
4. Add new troubleshooting entries if needed
5. Commit and push changes

## Alternative: Using websearch

Instead of the scraper, you can also use web search:

```
# Search for better-auth OAuth documentation
/search better-auth OAuth provider nextjs setup

# Search for common errors
/search better-auth common errors login
```

This uses the built-in web search capability.
