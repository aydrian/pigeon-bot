// learn more about HTTP functions here: https://arc.codes/primitives/http
const arc = require("@architect/functions");
const signVerification = require("@architect/shared/middleware/verify-slack-request");
const slackInstaller = require("@architect/shared/lib/slack-installer");
const { findTicketId } = require("@architect/shared/lib/linear-helper");

const route = async (req) => {
  const { type, event, team_id, challenge } = req.body;

  if (type === "url_verification") {
    return {
      headers: { "content-type": "application/json" },
      status: 200,
      body: JSON.stringify({ challenge })
    };
  }

  if (type === "event_callback" && event.type === "message") {
    const { subtype = "" } = event;
    let bot = {};

    try {
      bot = await slackInstaller.authorize({ teamId: team_id });
      console.debug("Authorize response: ", bot);
    } catch (err) {
      console.debug("Error Authorizing: ", err);
    }

    if (event.bot_id === bot.botId) {
      // don't process messages from the bot
      return {
        status: 200
      };
    }
    if (subtype.length > 0) {
      //don't process message subtypes
      console.debug(`Skipping ${subtype}`);
      return {
        status: 200
      };
    }

    // Check for presence of Linear Ticket
    const ticket = findTicketId(event.text);
    console.debug(`ticket: ${JSON.stringify(ticket)}`);
    if (process.env.LINEAR_API_KEY && ticket) {
      await arc.events.publish({
        name: "process-linear-mention",
        payload: {
          ticket,
          team_id,
          event,
          bot
        }
      });
    }
  }

  return {
    status: 200
  };
};

exports.handler = arc.http.async(signVerification, route);
//exports.handler = arc.http.async(route);
