const functions = require("firebase-functions");
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp(); // On Cloud Functions, credentials are automatically provided
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// POST /pesapal/pay
app.post("/pesapal/pay", async (req, res) => {
  const { managerEmail, paymentData } = req.body;
  if (!managerEmail || !paymentData) {
    return res
      .status(400)
      .json({ error: "Missing managerEmail or paymentData" });
  }
  try {
    // Query Firestore for credentials
    const credSnap = await db
      .collection("credentials")
      .where("userEmail", "==", managerEmail)
      .limit(1)
      .get();
    if (credSnap.empty) {
      return res.status(404).json({ error: "Manager credentials not found" });
    }
    const creds = credSnap.docs[0].data();
    const pesapal = creds.pesapal || {};
    const consumer_key = pesapal.Consumer_key;
    const consumer_secret = pesapal.Consumer_secret;
    if (!consumer_key || !consumer_secret) {
      return res
        .status(400)
        .json({ error: "Missing Consumer_key or Consumer_secret" });
    }

    // Authenticate with Pesapal
    const authResp = await axios.post(
      "https://pay.pesapal.com/v3/api/Auth/RequestToken",
      { consumer_key, consumer_secret },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    const token = authResp.data.token;
    if (!token) {
      return res.status(500).json({ error: "Failed to get Pesapal token" });
    }

    // Submit payment
    const payResp = await axios.post(
      "https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest",
      paymentData,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    res.json(payResp.data);
  } catch (err) {
    console.error("Payment failed:", {
      error: err.toString(),
      stack: err.stack,
      requestBody: req.body,
      time: new Date().toISOString(),
    });
    res.status(500).json({ error: err.toString() });
  }
});

// Export the Express app as a Cloud Function
exports.api = functions.https.onRequest(app);
