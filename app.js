require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./database/connection");
const cookieParser = require("cookie-parser");
const router = require("./routes/router");
const imageRouter = require("./routes/imageRoute");
const userRouter = require("./routes/userRoute");
const quotationRoute = require("./routes/quotationRoute");
const { googleAuthCallback } = require("./controllers/userController");
const cloudinary = require("cloudinary");
const app = express();
const port = process.env.PORT || 5000;
const fileUpload = require("express-fileupload");

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
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
// Middleware to parse incoming JSON data
app.use(express.json());
app.use(cookieParser());
// Use the user router for authentication routes
app.use("/api", userRouter);
app.use("/", router);
app.use("/api/v1", imageRouter);
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
