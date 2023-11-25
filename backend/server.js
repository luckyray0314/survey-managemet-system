const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();

// Connect to Database
connectDB();

// // Init middleware
// app.use(express.json({ extended: false })); //by default to parse body

// parse application/x-www-form-urlencoded
app.use(cors());
app.use(bodyParser.urlencoded({limit: '50mb', extended: false }));
app.use(bodyParser.json({limit: '50mb'}));

app.get('/', (req, res) => res.send('Api running'));

// Define Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/survey', require('./routes/api/survey'));
app.use('/api/personalresult', require('./routes/api/personalresult'));
app.use('/api/groupset', require('./routes/api/groupset'));
// app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/analytics', require('./routes/api/analytics'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
