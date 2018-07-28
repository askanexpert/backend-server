require('./../config/config');
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const {AUTH_SECRET} = require('./../keys/keys');

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    minLength: 1,
    trim: true,
    validate: {
      validator:  validator.isEmail,
      message: `{VALUE} is not a valid E-mail`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
      access: { type: String, required: true },
      token: { type: String, required: true }
  }]
});


// Instance Methods
UserSchema.pre('save', function (next) {
  var user = this;
  if(user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
})

UserSchema.methods.toJSON = function () {
  var user = this;
  return _.pick(user, ['_id', 'email']);
}

UserSchema.methods.generateAuthToken = function() {
    var user = this;
    var access = 'auth';
    var data = {
      _id: user._id.toHexString(),
      access
    };

    var token = jwt.sign(data, AUTH_SECRET).toString();
    user.tokens.push({access, token});

    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.removeToken = function (token) {
  var user = this;
  return user.update({
    $pull:{
      tokens:{token}
    }
  });
}


// Static methods
UserSchema.statics.findByToken = function(token) {
  var User = this;
  var decoded;
  try {
    decoded = jwt.verify(token, AUTH_SECRET);
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
     _id: decoded._id,
      'tokens.token': token,
      'tokens.access': 'auth'
    });
}

UserSchema.statics.findByCredentials = function(email, password) {
  var User = this;
  return User.findOne({email}).then((user) => {
    if(!user) { return Promise.reject()}
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if(res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
}

// Saves an array of User objects to database
UserSchema.static('saveToDatabase', function (users) {
  var promises = [];
  users.forEach((user) => {
    promises.push(
      user.save().then((user) => {
        console.log(`Saved user with id ${user.id} to database`);
      }).catch((e) => {
        console.log(`Error in saving users to database: ${e}`);
      })
    );
  });

  Promise.all(promises).then(() => {
    console.log(`Sucessfully saved users to database`);
  }).catch((e) => {
    console.log(`Error in saving users - ${e}`);
  });
});


// User model creation
const User = mongoose.model('User', UserSchema);

module.exports = {User};
