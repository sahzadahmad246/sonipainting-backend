// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const connectDB = require("./database/connection");
const router = require("./routes/router");

const port = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://sonipaintingworks.onrender.com",
    "https://sonipainting.com/",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "HEAD", "FETCH"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.static("public"));

// Middleware to parse incoming JSON data
app.use(express.json());

connectDB()
  .then(() => {
    app.use("/", router);
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
    // Handle the error, e.g., gracefully exit the application
    process.exit(1);
  });
