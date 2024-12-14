const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.status(200).send("Welcome to SplitLite");
});

app.get("/name", (req, res) => {
  res.json({ name: "John" });
});

app.listen(3000);
console.log("Started listening");
