const arc = require("@architect/functions");
const layout = require("@architect/shared/views/bootstrap");
const addToSlack = require("@architect/shared/views/add-to-slack");

exports.handler = async function Index() {
  let body = layout({
    title: "Pigeon Bot",
    body: `
    <div class=jumbotron>
      <h1 class=display-4>Add to Slack</h1>
      <p class=lead>Install this app to start using it in Slack.</p>
      <hr class=my-4>
      ${await addToSlack()}
    </div>`,
  });
  return {
    headers: {
      "content-type": "text/html; charset=utf8",
      "cache-control":
        "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0",
    },
    body,
  };
};
