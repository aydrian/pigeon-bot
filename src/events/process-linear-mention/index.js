// learn more about event functions here: https://arc.codes/primitives/events
const arc = require("@architect/functions");
const slackInstaller = require("@architect/shared/lib/slack-installer");
const { CourierClient } = require("@trycourier/courier");
const { createApolloFetch } = require("apollo-fetch");
const fetch = createApolloFetch({
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
  const {
    ticket,
    team_id,
    event: { channel },
  } = event;
  console.log(`Processing Linear Mention for ticket: ${ticket}.`);
  const bot = await slackInstaller.authorize({ teamId: team_id });
  console.log("Authorize response: ", bot);
  try {
    const { data } = await fetch({
      query: `query IssueById($id: String!) {
        issue(id: $id) {
          title
          description
          url
          assignee {
            name
          }
          state {
            type
          }
        }
      }`,
      variables: { id: ticket },
    });
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
