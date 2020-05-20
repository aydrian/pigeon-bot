const arc = require("@architect/functions");
const slackInstaller = require("@architect/shared/lib/slack-installer");

const install = async (req) => {
  return slackInstaller.handleCallback(req);
};

exports.handler = arc.http.async(install);
