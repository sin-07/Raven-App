export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST() {
  // Check environment variables first
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;

  if (!apiKey) {
    return Response.json(
      { success: false, error: "BREVO_API_KEY not configured in Vercel" },
      { status: 500 }
    );
  }

  if (!senderEmail) {
    return Response.json(
      { success: false, error: "BREVO_SENDER_EMAIL not configured in Vercel" },
      { status: 500 }
    );
  }

  console.log("📧 Attempting to send email from:", senderEmail);
  console.log("🔑 API Key present:", apiKey ? "Yes" : "No");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.error("⏰ Aborting request after 8s");
    controller.abort();
  }, 8000);

  try {
    console.log("🚀 Sending request to Brevo API...");
    const startTime = Date.now();

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: senderName || "Raven Tutorials",
          email: senderEmail,
        },
        to: [{ email: "test@gmail.com" }],
        subject: "Brevo email test",
        htmlContent: "<h2>Email sent successfully</h2>",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    console.log(`⏱️ Request completed in ${duration}ms with status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Brevo error response:", errorText);
      
      let errorMsg = `Brevo API error ${response.status}`;
      if (response.status === 403) {
        errorMsg = "Sender email not verified in Brevo. Go to https://app.brevo.com/settings/senders";
      } else if (response.status === 401) {
        errorMsg = "Invalid API key. Check BREVO_API_KEY in Vercel settings";
      }

      return Response.json(
        { success: false, error: errorMsg, details: errorText, status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("✅ Email sent successfully:", data);
    return Response.json({ success: true, data, duration });

  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error("❌ Request failed:", error.name, error.message);

    if (error.name === "AbortError") {
      return Response.json(
        { 
          success: false, 
          error: "Request aborted after 8s - Brevo API not responding. Check sender email is verified.",
          hint: "Verify your sender email at: https://app.brevo.com/settings/senders"
        },
        { status: 504 }
      );
    }

    return Response.json(
      { success: false, error: error.message, type: error.name },
      { status: 500 }
    );
  }
}
