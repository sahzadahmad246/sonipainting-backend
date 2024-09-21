const mongoose = require('mongoose');


const imageSchema = new mongoose.Schema({
  images: [
    {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    }
  ],
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});


const Image = mongoose.model('Image', imageSchema);
module.exports = Image;
