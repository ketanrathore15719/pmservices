const mongoose = require("mongoose");
const { config } =  require("dotenv");
config({ path: "./config/config.env" });

let mongoDB_URL = process.env.MONGO_URI || 'mongodb+srv://therealrathore:q94BB11oMAZTHxPc@cluster0.anaamsn.mongodb.net/service?retryWrites=true&w=majority&appName=Cluster0'
const connectDatabase = async () => {
  try {
    const { connection } = await mongoose.connect(mongoDB_URL);
    console.log(`MongoDB connected:- ${connection.host}:${connection.port}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDatabase