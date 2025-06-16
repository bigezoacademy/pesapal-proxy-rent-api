# Firebase Functions for premium-rent-api-proxy

This folder contains the Cloud Functions code for the API proxy.

## Deploy Instructions

1. Open a terminal in this folder:
   ```
   cd "C:/Users/dell/Documents/GRSTUDIO/2025/THE PREMIUM RENT APP/premium-rent-api-proxy"
   ```
2. Install dependencies:
   ```
   cd functions
   npm install
   cd ..
   ```
3. Deploy to Firebase:
   ```
   firebase deploy --only functions
   ```

## Usage

- Your API endpoint will be:
  ```
  POST https://us-central1-premium-rent-app.cloudfunctions.net/api/pesapal/pay
  ```

- Use the same request body as before.

## Notes
- You do NOT need to set GOOGLE_APPLICATION_CREDENTIALS when running on Firebase Cloud Functions.
- All credentials are managed by Firebase automatically.
