const mongoose = require ("mongoose");

const DB = process.env.MONGODB_URI;
const connectDB = async () =>{
    try {
        await mongoose.connect(DB)
        console.log("connected to database successfull")
    } catch (error) {
        console.error("database connection failed")      
    }
};

module.exports = connectDB;