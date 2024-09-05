require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const connectDB = require("./database/connection");
const router = require("./routes/router");
const imageRouter = require("./routes/imageRoute");
const userRouter = require("./routes/userRoute");
const { googleAuthCallback } = require("./controllers/userController");

const app = express();

const port = process.env.PORT || 5000;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://sonipaintingworks.onrender.com",
    "https://sonipainting.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "HEAD", "FETCH"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.static("public"));

// Setup session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 6 * 30 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

// Setup passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new OAuth2Strategy(
    {
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? "https://sonipainting-backend.onrender.com/auth/google/callback"
          : "http://localhost:5000/auth/google/callback",
    },
    googleAuthCallback
  )
);

// Middleware to parse incoming JSON data
app.use(express.json());

// Use the user router for authentication routes
app.use("/", userRouter);

// Use other routers
app.use("/", router);
app.use("/", imageRouter);

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  });
