const express = require("express");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // React app's URL
  })
);

app.get("/", (req, res) => {
  res.status(200).send("Welcome to SplitLite");
});

app.get("/name", (req, res) => {
  res.json({ name: "John" });
});

app.listen(3000, () => {
  console.log("Started listening on port: 3000");
});

require("dotenv").config();

const http = require("http");
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

app.get("/register", async (req, res) => {
  console.log("Registering");
  try {
    user_name = "Thanzeel5";
    email = "thanzeelhassan5@gmail.com";
    phone = "6235611195";
    password = "password";
    const result =
      await sql`INSERT INTO users (name, email, phone_number, password) VALUES (${user_name}, ${email}, ${phone}, ${password});`;
    console.log("result : ", result);
    console.log("length of result : ", result.length);
    if (result.length === 0) {
      res
        .status(200)
        .send("Registered user " + user_name + " with email " + email);
    } else {
      res.status(400).send("Failed to register");
    }
  } catch (err) {
    console.log(err);
    res.status(400).send("Error");
  }
});

app.get("/login", (req, res) => {
  console.log("Login");
  res.status(200).send("Login");
});

app.get("/users", async (req, res) => {
  const result = await sql`SELECT count(*) from users`;
  console.log(result);
  const { count } = result[0];

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.write("Number of users in the database : ");
  res.end(count);
});
