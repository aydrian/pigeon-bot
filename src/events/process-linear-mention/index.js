// learn more about event functions here: https://arc.codes/primitives/events
const arc = require("@architect/functions");
//const { CourierClient } = require("@trycourier/courier");
//const { createApolloFetch } = require("apollo-fetch");
/*const fetch = createApolloFetch({
  uri: "https://api.linear.app/graphql",
});

fetch.use(({ request, options }, next) => {
  if (!options.headers) {
    options.headers = {}; // Create the headers object if needed.
  }
  options.headers["authorization"] = process.env.LINEAR_API_KEY;

  next();
});

const courier = CourierClient();

async function processLinearMention(event) {
  console.log(JSON.stringify(event, null, 2));
  const {
    ticket,
    event: { channel },
  } = event;
  try {
    const { data } = fetch({
      query: `query issue(id: "${ticket}") {
      id
      number
      title
      team {
        key
      }
    }
    `,
    });
    console.log(data);
    courier.send({
      eventId: "LINEAR_MENTION",
      recipientId: channel,
      profile: {
        slack: {
          access_token: process.env.SLACK_BOT_ACCESS_TOKEN,
          channel_id: channel,
        },
      },
      data,
    });
  } catch (err) {
    console.log(`Error occurred querying Linear ticket ${ticket}`, err.stack);
  }
  return;
}

exports.handler = arc.events.subscribe(processLinearMention);
*/

async function simpleEvent(event) {
  console.log(JSON.stringify(event, null, 2));
  return;
}

exports.handler = arc.events.subscribe(simpleEvent);
