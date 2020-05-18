// learn more about HTTP functions here: https://arc.codes/primitives/http
const arc = require("@architect/functions");
const crypto = require("crypto");

// fetch this from environment variables
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const signVerification = async (req) => {
  const slackSignature = req.headers["X-Slack-Signature"];
  const requestBody = JSON.stringify(req.body);
  const timestamp = req.headers["X-Slack-Request-Timestamp"];
  console.log(`requestedBody: ${requestBody}`);

  const time = Math.floor(new Date().getTime() / 1000);

  if (Math.abs(time - timestamp) > 300) {
    console.log("Ignore this request.");
    return {
      status: 400,
      body: "Ignore this request.",
    };
  }

  if (!slackSigningSecret) {
    console.log("Slack signing secret is empty.");
    return {
      status: 400,
      body: "Slack signing secret is empty.",
    };
  }

  const mySignature =
    "v0=" +
    crypto
      .createHmac("sha256", slackSigningSecret)
      .update(`v0:${timestamp}:${requestBody}`)
      .digest("hex");

  console.log(`signing secret: ${slackSigningSecret}`);
  console.log(`mySignature: ${mySignature}`);
  console.log(`slackSignature: ${slackSignature}`);
  if (
    !crypto.timingSafeEqual(
      Buffer.from(mySignature),
      Buffer.from(slackSignature)
    )
  ) {
    console.log("Verification failed");
    return {
      status: 400,
      body: "Verification failed",
    };
  }
};

const route = async (req) => {
  const { body } = req;
  console.log(body);

  if (body.type === "url_verification") {
    return {
      headers: { "content-type": "application/json" },
      status: 200,
      body: JSON.stringify({ challenge: body.challenge }),
    };
  }

  return {
    status: 200,
  };
};

exports.handler = arc.http.async(signVerification, route);
