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
const quotationRoute = require("./routes/quotationRoute");
const { googleAuthCallback } = require("./controllers/userController");
const cloudinary = require("cloudinary");
const app = express();
const port = process.env.PORT || 5000;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const fileUpload = require('express-fileupload');
// CORS configuration
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
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    },
    
  })
);

// Setup passport
app.use(passport.initialize());
app.use(passport.session());
app.use(fileUpload());
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
app.use("/", router);
app.use("/", imageRouter);
app.use("/", quotationRoute);

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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
