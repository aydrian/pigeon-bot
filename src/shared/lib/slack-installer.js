const { InstallProvider } = require("@slack/oauth");
const { WebClient } = require("@slack/web-api");
const arc = require("@architect/functions");
const data = require("@begin/data");

const storeInstallation = async (installation) => {
  try {
    await data.set({
      table: "bots",
      teamId: installation.team.id,
      ...installation,
    });
  } catch (err) {
    console.log("Error storing installation", err);
    throw err;
  }
  return;
};

const fetchInstallation = async (installQuery) => {
  const result = await data.get({
    table: "bots",
    teamId: installQuery.teamId,
  });
  return result;
};

const installer = new InstallProvider({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: "pigeon-bot",
  installationStore: {
    storeInstallation,
    fetchInstallation,
  },
});

// Gets the bot_id using the `auth.test` method.
async function getBotId(token) {
  const client = new WebClient(token);
  const authResult = await client.auth.test();
  if (authResult.bot_id !== undefined) {
    return authResult.bot_id;
  }
  // If a user token was used for auth.test, there is no bot_id
  // return an empty string in this case
  return "";
}

const handleCallback = async (req) => {
  const { code } = req.queryStringParameters;
  const client = new WebClient();
  const resp = await client.oauth.v2.access({
    code,
    client_id: process.env.SLACK_CLIENT_ID,
    client_secret: process.env.SLACK_CLIENT_SECRET,
    redirect_uri: process.env.SLACK_INSTALL_REDIRECT,
  });

  //get botId
  const botId = await getBotId(resp.access_token);

  // resp obj for v2 - https://api.slack.com/methods/oauth.v2.access#response
  let installation = {
    team: resp.team,
    appId: resp.app_id,
    user: {
      token: resp.authed_user.access_token,
      scopes:
        resp.authed_user.scope !== undefined
          ? resp.authed_user.scope.split(",")
          : undefined,
      id: resp.authed_user.id,
    },
    bot: {
      scopes: resp.scope.split(","),
      token: resp.access_token,
      userId: resp.bot_user_id,
      id: botId,
    },
    tokenType: resp.token_type,
  };

  if (resp.enterprise !== null) {
    installation.enterprise = {
      id: resp.enterprise.id,
      name: resp.enterprise.name,
    };
  }

  console.log("Installation: ", installation);
  await storeInstallation(installation);
  return { location: "/" };
};

module.exports = {
  generateInstallUrl: async (opts) => {
    return await installer.generateInstallUrl(opts);
  },
  handleCallback,
};
