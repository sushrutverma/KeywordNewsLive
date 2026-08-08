const axios = require('axios');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing RESEND_API_KEY environment variable" }),
    };
  }

  try {
    const { to, subject, html, from } = JSON.parse(event.body || "{}");

    if (!to || !subject || !html) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields: to, subject, html" }),
      };
    }

    // Call Resend's REST API
    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from: from || "Keywords News <onboarding@resend.dev>",
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      },
      {
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Email sent successfully!",
        id: response.data.id,
      }),
    };
  } catch (error) {
    console.error("Resend API error:", error.response?.data || error.message);
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({
        error: "Failed to send email via Resend",
        details: error.response?.data || error.message,
      }),
    };
  }
};
