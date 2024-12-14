const express = require("express");
const cors = require('cors');
const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // React app's URL
}));


app.get("/", (req, res) => {
  res.status(200).send("Welcome to SplitLite");
});

app.get("/name", (req, res) => {
  res.json({ name: "John" });
});

app.listen(3000, () => {
  console.log("Started listening on port: 3000");
});
