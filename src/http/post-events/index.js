// learn more about HTTP functions here: https://arc.codes/primitives/http
const arc = require("@architect/functions");
const crypto = require("crypto");
const qs = require("qs");

// fetch this from environment variables
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const signVerification = async (req, res, next) => {
  const slackSignature = req.headers["X-Slack-Signature"];
  const requestBody = qs.stringify(req.body, { format: "RFC1738" });
  const timestamp = req.headers["X-Slack-Request-Timestamp"];
  console.log(timestamp, slackSignature);

  const time = Math.floor(new Date().getTime() / 1000);

  if (Math.abs(time - timestamp) > 300) {
    return {
      status: 400,
      body: "Ignore this request.",
    };
  }

  if (!slackSigningSecret) {
    return {
      status: 400,
      body: "Slack signing secret is empty.",
    };
  }

  const sigBasestring = "v0:" + timestamp + ":" + requestBody;
  const mySignature =
    "v0=" +
    crypto
      .createHmac("sha256", slackSigningSecret)
      .update(sigBasestring, "utf8")
      .digest("hex");

  if (
    crypto.timingSafeEqual(
      Buffer.from(mySignature, "utf8"),
      Buffer.from(slackSignature, "utf8")
    )
  ) {
    next();
  } else {
    return {
      status: 400,
      body: "Verification failed",
    };
  }
};

const route = async function handler(req) {
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
