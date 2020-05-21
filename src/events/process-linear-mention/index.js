// learn more about event functions here: https://arc.codes/primitives/events
const arc = require("@architect/functions");
const slackInstaller = require("@architect/shared/lib/slack-installer");
const { getTicketById } = require("@architect/shared/lib/linear-helper");
const { CourierClient } = require("@trycourier/courier");

const courier = CourierClient();

async function processLinearMention(event) {
  const {
    ticket,
    team_id,
    event: { channel },
  } = event;
  console.log(`Processing Linear Mention for ticket: ${ticket}.`);
  try {
    const bot = await slackInstaller.authorize({ teamId: team_id });
    console.log("Authorize response: ", bot);
  } catch (err) {
    console.log("Error retrieving from db: ", err);
  }
  try {
    const data = await getTicketById(ticket);
    console.log("Data from Linear", data);

    await courier.send({
      eventId: "LINEAR_MENTION",
      recipientId: channel,
      profile: {
        slack: {
          access_token: process.env.SLACK_BOT_ACCESS_TOKEN,
          channel,
        },
      },
      data: {
        ...data,
        ticket,
      },
    });
  } catch (err) {
    console.log(`Error occurred querying Linear ticket ${ticket}`, err.stack);
  }
  return;
}

exports.handler = arc.events.subscribe(processLinearMention);
