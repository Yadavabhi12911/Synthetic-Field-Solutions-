
import express from 'express';
import connectDb from './src/db/dbIndex.js';
import { app } from './src/utility/app.js';

// Connect to database and start server
connectDb()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });

 
