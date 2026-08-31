#!/usr/bin/env node
/**
 * One-time OAuth authorization flow for Google Sheets access.
 *
 * Prereqs:
 *   1. Create an OAuth 2.0 Client ID of type "Desktop app" in Google Cloud
 *      Console (APIs & Services > Credentials).
 *   2. Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET (from that
 *      client) as environment variables, or in a .env.local this script
 *      loads automatically.
 *   3. Run:  node scripts/get-google-refresh-token.mjs
 *      (or:  npm run google:auth)
 *
 * This opens a URL for you to approve in a browser, spins up a temporary
 * local server on a loopback port to catch the redirect, exchanges the
 * resulting code for tokens, and prints the refresh token to save in
 * .env.local. This only needs to be run once per Google account — the
 * refresh token does not expire unless revoked.
 */

import http from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { google } from "googleapis";

// Minimal .env.local loader so this script works standalone (no extra deps).
function loadEnvLocal() {
  const path = new URL("../.env.local", import.meta.url);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim();
    }
  }
}
loadEnvLocal();

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET.\n" +
      "Set them in .env.local (or the environment) using the values from\n" +
      "your Desktop app OAuth client in Google Cloud Console, then re-run this script."
  );
  process.exit(1);
}

// Adjust scope if you only need read access:
// "https://www.googleapis.com/auth/spreadsheets.readonly"
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

async function main() {
  const server = http.createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  // Google's "Desktop app" client type accepts any loopback redirect URI
  // (http://127.0.0.1:<port>) without pre-registering the port.
  const redirectUri = `http://127.0.0.1:${port}`;

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, redirectUri);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // required to get a refresh_token
    prompt: "consent", // forces refresh_token even on repeat authorizations
    scope: SCOPES,
  });

  console.log("\nOpen this URL in a browser and approve access:\n");
  console.log(authUrl + "\n");
  console.log(`Waiting for authorization on ${redirectUri} ...\n`);

  const code = await new Promise((resolve, reject) => {
    server.on("request", (req, res) => {
      const url = new URL(req.url, redirectUri);
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");
      res.end(
        error
          ? "Authorization failed — check the terminal for details. You can close this tab."
          : "Authorization complete — you can close this tab and return to the terminal."
      );
      server.close();
      if (error) reject(new Error(error));
      else if (code) resolve(code);
    });
  });

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token) {
    console.warn(
      "\nNo refresh_token was returned. This usually means this Google account\n" +
        "already granted this app access before. Revoke it at\n" +
        "https://myaccount.google.com/permissions and re-run this script.\n"
    );
    process.exit(1);
  }

  console.log("\nSuccess! Add this to your .env.local:\n");
  console.log(`GOOGLE_OAUTH_CLIENT_ID=${CLIENT_ID}`);
  console.log(`GOOGLE_OAUTH_CLIENT_SECRET=${CLIENT_SECRET}`);
  console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
