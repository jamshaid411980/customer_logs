const mongoose = require('mongoose')
uri = `mongodb://127.0.0.1:27017/customerlogs`

mongoose.connect(uri);

console.log('Mongoose connecting to: ' + uri);

mongoose.connection.on('connected', function () {
  console.log('Mongoose connected');
});
mongoose.connection.on('error', function (err) {
  console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose disconnected');
});