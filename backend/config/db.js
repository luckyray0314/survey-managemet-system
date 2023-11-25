const mongoose = require('mongoose');
// const config = require('config');
// const db = config.get('mongoURI');

// mongoose.set('useCreateIndex', true);

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/rtx2', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndexes: false,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.log(err.message);
    //Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
