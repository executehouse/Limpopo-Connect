# Deployment Fix Guide: Pointing Your Domain to Vercel

**Last Updated**: October 13, 2025

This guide provides instructions to resolve the minor DNS misconfiguration for `limpopoconnect.site` to align with Vercel's best practices.

## ⚠️ Issue Summary

The site is **live and accessible** at `https://www.limpopoconnect.site`.

However, the root domain (`limpopoconnect.site`) points to a non-Vercel IP address. This is not optimal and can cause issues with SSL certificate renewals and Vercel's infrastructure.

- **Current A Record**: `216.198.79.1` (Incorrect)
- **Recommended A Record**: `76.76.21.21` (Vercel's IP)

## ✅ How to Fix

You will need to log in to your domain registrar's dashboard (e.g., GoDaddy, Namecheap, Google Domains) to make this change.

### Step 1: Update the A Record

1.  Navigate to the DNS management section for `limpopoconnect.site`.
2.  Find the **A Record** for the root domain (usually represented by `@`).
3.  Edit the existing A Record and change the **Value** (or "Points to") field.

**Update the record with these settings:**

- **Type**: `A`
- **Name**: `@` (or `limpopoconnect.site`)
- **Value**: `76.76.21.21`
- **TTL (Time to Live)**: Leave as default (usually "Automatic" or 1 hour).

### Step 2: Verify the Change

DNS changes can take anywhere from a few minutes to several hours to propagate across the internet. You can verify the change using the command line:

```bash
# Wait about 15-60 minutes, then run this command
nslookup limpopoconnect.site
```

**Expected Output:**

```
Server:  your.dns.server
Address: your.dns.server.ip

Non-authoritative answer:
Name:    limpopoconnect.site
Address: 76.76.21.21
```

If you still see the old IP address, please wait longer for the DNS to update.

### Step 3: Set Primary Domain in Vercel (Optional but Recommended)

1.  Go to your Vercel project dashboard.
2.  Navigate to **Settings → Domains**.
3.  Decide whether you want `limpopoconnect.site` or `www.limpopoconnect.site` to be the primary domain.
4.  Set the redirect accordingly (e.g., redirect `www` to the root domain).

## ❓ Why This Is Important

- **Stability**: Aligns your domain with Vercel's global edge network.
- **Performance**: Ensures users are routed through Vercel's optimized infrastructure.
- **Reliability**: Prevents potential issues with SSL certificate auto-renewals.

This is a one-time fix that will ensure your deployment is robust and scalable. If you have any questions, please consult your domain registrar's documentation on updating A records.
