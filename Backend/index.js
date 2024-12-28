const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());

const cookieParser = require("cookie-parser");

// Middleware for parsing cookies
app.use(cookieParser());

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

app.post("/register", async (req, res) => {
  console.log("Registering");
  try {
    const { username, email, phone, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).send("Password and confirm password do not match");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result =
      await sql`INSERT INTO users (name, email, phone_number, password) VALUES (${username}, ${email}, ${phone}, ${hashedPassword});`;
    console.log("result : ", result);
    console.log("length of result : ", result.length);
    if (result.length === 0) {
      res
        .status(200)
        .send("Registered user " + username + " with email " + email);
    } else {
      res.status(400).send("Failed to register");
    }
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send("An error occurred while processing your registration.");
  }
});

app.delete("/delete", async (req, res) => {
  console.log("Deleting user");
  try {
    const { username, email, phone, password } = req.body;

    if (!username || !email || !phone || !password) {
      return res
        .status(400)
        .send("Username, email, phone, and password are required");
    }

    const user = await sql`
      SELECT password FROM users 
      WHERE name = ${username} 
        AND email = ${email} 
        AND phone_number = ${phone};
    `;
    if (user.length === 0) {
      return res.status(404).send("User not found");
    }

    const hashedPassword = user[0].password;
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordMatch) {
      return res.status(401).send("Invalid credentials");
    }

    const result = await sql`
      DELETE FROM users 
      WHERE name = ${username} 
        AND email = ${email} 
        AND phone_number = ${phone};
    `;

    console.log(result);
    if (result.length === 0) {
      res.status(200).send(`Deleted user ${username}`);
    } else {
      res.status(400).send("Failed to delete user");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting user");
  }
});

const jwt = require("jsonwebtoken");

const JWT_SECRET = "HdZXv90sPpwccnGbVGotaIVdAlk9SW39";
const JWT_EXPIRATION = "1h";

app.post("/login", async (req, res) => {
  console.log("Login");
  try {
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

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name }, // Payload
      JWT_SECRET, // Secret key
      { expiresIn: JWT_EXPIRATION } // Token expiration
    );

    // Set token as an HTTP-only cookie
    res.cookie("authToken", token, {
      httpOnly: true, // Prevents client-side scripts from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Ensures cookies are sent over HTTPS in production
      sameSite: "strict", // Helps prevent CSRF attacks
    });

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

function authenticateToken(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user data to the request
    next(); // Proceed to the next middleware or endpoint
  } catch (err) {
    res.status(403).send("Invalid or expired token.");
  }
}

app.get("/protected", authenticateToken, (req, res) => {
  res.status(200).send(`Hello, ${req.user.name}. You are authorized!`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.status(200).send("Logged out successfully.");
});
