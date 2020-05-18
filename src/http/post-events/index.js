// learn more about HTTP functions here: https://arc.codes/primitives/http
const arc = require("@architect/functions");

const route = async function handler(req) {
  const { body } = req;

  console.log(body);

  return {
    status: 200,
  };
};

exports.handler = arc.http.async(route);
