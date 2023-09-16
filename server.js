const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path')
const app = express();
require('dotenv').config();
const Ticker = require('./models/tickers')
const PORT = process.env.PORT || 3000;

// static files
app.use(express.static(path.join(__dirname, 'public')));



// DB Connection
mongoose.connect(`mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@cluster0.jqo1zug.mongodb.net/hodlinfo`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Database connected successfully!");
}).catch((error) => {
  console.error("Error connecting to the database:", error);
});


// fetch and store data from the WazirX API
app.get('/fetch-and-store-data', async (req, res) => {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const data = response.data;

    // extract the top 10 results
    const top10Data = Object.values(data).slice(0, 10);

    // store data in database
    await Ticker.insertMany(top10Data);

    res.json({ message: 'Data stored successfully.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred.' });
  }
});

// retrieve data from MongoDB
app.get('/get-stored-data', async (req, res) => {
  try {
    const data = await Ticker.find({});
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred.' });
  }
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
