import { google } from "googleapis";

const CLIENT_ID = "enter your own";
const CLIENT_SECRET = "enter your own";
const REDIRECT_URI = "http://localhost:5173/googlefit/callback";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

export const getAuthUrl = () => {
  const scopes = [
    "https://www.googleapis.com/auth/fitness.activity.read",     // Steps, calories, etc.
    "https://www.googleapis.com/auth/fitness.body.read",         // Weight, BMI, body fat
    "https://www.googleapis.com/auth/fitness.sleep.read",        // Sleep segments
    "https://www.googleapis.com/auth/fitness.heart_rate.read"    // Heart rate
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
    include_granted_scopes: false,
    state: crypto.randomUUID(), // 👈 Randomizes state to force refresh
  });
  
};

export const getAccessToken = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken({
      code: code,
      redirect_uri: REDIRECT_URI // MUST match EXACTLY what's in Google Cloud
    });
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error('❌ Token exchange failed:', error.message);
    throw new Error(`Token exchange failed: ${error.message}`);
  }
};
