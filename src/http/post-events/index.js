// learn more about HTTP functions here: https://arc.codes/primitives/http
const arc = require("@architect/functions");
const signVerification = require("@architect/shared/middleware/verify-slack-request");
const { findTicketId } = require("@architect/shared/lib/linear-helper");

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
    if (event.bot_id === "B013ELL0DP1") {
      // don't process messages from the bot
      return {
        status: 200,
      };
    }
    if (subtype.length > 0) {
      //don't process message subtypes
      console.log(`Skipping ${subtype}`);
      return {
        status: 200,
      };
    }

    // Check for presence of Linear Ticket
    const ticket = findTicketId(event.text);
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
//exports.handler = arc.http.async(route);
