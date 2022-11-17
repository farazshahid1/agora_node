const mongoose = require("mongoose");

// @TODO
const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, "email is required"],
    validate: {
      validator: (v) =>
        /^[a-zA-Z0-9.! #$%&'*+/=? ^_`{|}~-]+@[a-zA-Z0-9-]+(?:\. [a-zA-Z0-9-]+)*$/.test(
          v
        ),
      message: (props) => `${props.value} is not a valid email`,
    },
  },
  password: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
    required: true,
  },
  longitude: {
    type: String,
    required: true,
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId }],
});

module.exports = mongoose.model("User", UserSchema);
