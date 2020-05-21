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

const ticketRegex = // match a linear ticket
  "(?:" + // anchor this match; require either
  "\\s+" + // whitespace
  "|^" + // or beginning of string
  ")" + // before the ticket match starts
  "(" + // capture ticket id
  "[A-Z]" + // first part is 1 uppercase letter
  "-" + // then a dash
  "[0-9]+" + // then 1+ numbers
  ")" + // that's a ticket id
  "\\b" + // word break after numbers
  "(?!" + // deal breakers go here
  "\\." + // no dots after the number, e.g. MO-4.2.26.2
  ")"; // done with deal breakers

const findTicketId = (text) => {
  return text.match(ticketRegex)[1];
};

const getTicketById = async (id) => {
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
    variables: { id },
  });
  return data;
};

module.exports = {
  findTicketId,
  getTicketById,
};
