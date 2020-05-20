const slackInstaller = require("@architect/shared/lib/slack-installer");

module.exports = async function addToSlack() {
  const scopes = ["channels:history", "chat:write"];
  const href = await slackInstaller.generateInstallUrl({
    scopes,
    redirectUri: process.env.SLACK_INSTALL_REDIRECT,
  });
  return `
<a href=${href}>
<img alt="Add to Slack" 
  height="40" 
  width="139" 
  src="https://platform.slack-edge.com/img/add_to_slack.png" 
  srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x">
</a>
`;
};
