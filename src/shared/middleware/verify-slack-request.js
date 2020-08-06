const crypto = require("crypto");

// fetch this from environment variables
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;

const signVerification = async (req) => {
  const slackSignature =
    req.headers["X-Slack-Signature"] || req.headers["x-slack-signature"];
  const requestBody = JSON.stringify(req.body);
  const timestamp =
    req.headers["X-Slack-Request-Timestamp"] ||
    req.headers["x-slack-request-timestamp"];

  const time = Math.floor(new Date().getTime() / 1000);

  if (Math.abs(time - timestamp) > 300) {
    return {
      status: 400,
      type: "text/plain",
      body: "Ignore this request."
    };
  }

  if (!slackSigningSecret) {
    return {
      status: 400,
      type: "text/plain",
      body: "Slack signing secret is empty."
    };
  }

  const mySignature =
    "v0=" +
    crypto
      .createHmac("sha256", slackSigningSecret)
      .update(`v0:${timestamp}:${requestBody}`)
      .digest("hex");

  if (
    !crypto.timingSafeEqual(
      Buffer.from(mySignature),
      Buffer.from(slackSignature)
    )
  ) {
    console.debug("Invalid Request:", JSON.stringify(req.body));
    console.debug("timestamp: ", timestamp);
    console.debug("mySignature: ", mySignature);
    console.debug("slackSignature: ", slackSignature);
    return {
      status: 400,
      body: "Verification failed",
      type: "text/plain"
    };
  }
};

module.exports = signVerification;
