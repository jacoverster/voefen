const assert = require("assert");
const fs = require("fs");

const html = fs.readFileSync("public/index.html", "utf8");
const app = fs.readFileSync("public/app.js", "utf8");

assert(html.includes('id="workout-announcer"'));
assert(html.includes('id="workout-crew"'));
assert(!html.includes('id="fs-toast"'));
assert(app.includes('type: "ready"'));
assert(app.includes('return "Starting together"'));

console.log("Voefen smoke checks passed");
