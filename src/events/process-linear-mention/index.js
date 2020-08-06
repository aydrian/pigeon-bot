// learn more about event functions here: https://arc.codes/primitives/events
const arc = require("@architect/functions");
const { getTicketById } = require("@architect/shared/lib/linear-helper");
const { CourierClient } = require("@trycourier/courier");

const courier = CourierClient();

async function processLinearMention(event) {
  const {
    ticket,
    team_id,
    event: { channel },
    bot
  } = event;
  console.debug(`Processing Linear Mention for ticket: ${ticket}.`);

  try {
    const data = await getTicketById(ticket);
    console.debug("Data from Linear", data);

    await courier.send({
      eventId: "LINEAR_MENTION",
      recipientId: channel,
      profile: {
        slack: {
          access_token: bot.botToken,
          channel
        }
      },
      data: {
        ...data,
        ticket
      }
    });
  } catch (err) {
    console.error(`Error occurred querying Linear ticket ${ticket}`, err.stack);
  }
  return;
}

exports.handler = arc.events.subscribe(processLinearMention);
