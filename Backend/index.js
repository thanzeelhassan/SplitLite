const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());

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

const { neon } = require("@neondatabase/serverless");
const bcrypt = require("bcrypt");

const sql = neon(process.env.DATABASE_URL);

app.get("/register", async (req, res) => {
  console.log("Registering");
  try {
    user_name = "Thanzeel6";
    email = "thanzeelhassan6@gmail.com";
    phone = "6235611196";
    password = "password";
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password : ", hashedPassword);
    const result =
      await sql`INSERT INTO users (name, email, phone_number, password) VALUES (${user_name}, ${email}, ${phone}, ${hashedPassword});`;
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

app.post("/login", async (req, res) => {
  console.log("Login");
  try {
    console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Email and password are required.");
    }

    const result = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (result.length === 0) {
      return res.status(404).send("User not found.");
    }

    const user = result[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send("Invalid password.");
    }

    res.status(200).send(`Welcome back, ${user.name}!`);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while processing your login.");
  }
});

app.get("/users", async (req, res) => {
  const result = await sql`SELECT count(*) from users`;
  console.log(result);
  const { count } = result[0];

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.write("Number of users in the database : ");
  res.end(count);
});
