// userController.js
const passport = require("passport");
const User = require("../database/userSchema");

// Google OAuth2 Strategy configuration
const googleAuthCallback = async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: {
          public_id: "",
          url: profile.photos[0].value,
        },
      });
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
};

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google authentication success handler
const googleAuthSuccess = async (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "User has successfully authenticated",
      user: req.user,
    });
  } else {
    res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }
};

// Logout handler
const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("https://sonipainting.com");
  });
};

module.exports = {
  googleAuthCallback,
  googleAuthSuccess,
  logout,
};
