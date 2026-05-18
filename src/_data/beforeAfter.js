const fs = require("fs");
const path = require("path");

const clients = JSON.parse(
  fs.readFileSync(path.join(__dirname, "clients.json"), "utf8")
);

function byProcedure(match) {
  return clients.filter((client) => match.test(client.id));
}

module.exports = {
  microblading: byProcedure(/-microblading$/),
  lamination: byProcedure(/-laminirane-/),
};
