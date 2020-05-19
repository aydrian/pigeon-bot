// learn more about HTTP functions here: https://arc.codes/primitives/http
const arc = require("@architect/functions");
const crypto = require("crypto");

const ticketRegex = // match a linear ticket
  "(?:" + // anchor this match; require either
  "\\s+" + // whitespace
  "|^" + // or beginning of string
  ")" + // before the ticket match starts
  "(" + // capture ticket id
  "[A-Z]" + // first part is 1 uppercase letter
  "-" + // then a dash
  "[0-9]+" + // then 1+ numbers
  ")" + // that's a ticket id
  "\\b" + // word break after numbers
  "(?!" + // deal breakers go here
  "\\." + // no dots after the number, e.g. MO-4.2.26.2
  ")"; // done with deal breakers

// fetch this from environment variables
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const signVerification = async (req) => {
  console.log("Headers", JSON.stringify(req.headers));
  const slackSignature = req.headers["x-slack-signature"];
  const requestBody = JSON.stringify(req.body);
  const timestamp = req.headers["x-slack-request-timestamp"];

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
    return {
      status: 400,
      body: "Verification failed",
    };
  }
};

const route = async (req) => {
  console.log(req.body);
  const { type, event, team_id } = req.body;

  if (type === "url_verification") {
    const { body } = req;
    return {
      headers: { "content-type": "application/json" },
      status: 200,
      body: JSON.stringify({ challenge: body.challenge }),
    };
  }

  if (type === "event_callback" && event.type === "message") {
    const { subtype = "" } = event;
    if (subtype.length > 0) {
      //don't process message subtypes
      return {
        status: 200,
      };
    }

    // Check for presence of Linear Ticket
    const ticket = event.text.match(ticketRegex)[1];
    console.log(`ticket: ${JSON.stringify(ticket)}`);
    if (process.env.LINEAR_API_KEY && ticket) {
      await arc.events.publish({
        name: "process-linear-mention",
        payload: {
          ticket,
          team_id,
          event,
        },
      });
    }
  }

  return {
    status: 200,
  };
};

exports.handler = arc.http.async(signVerification, route);
