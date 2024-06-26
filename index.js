import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import * as dotenv from "dotenv";
dotenv.config();
import userRouter from './Routes/user.js';



  const app = express();
const port = 8000;
app.use(express.json());
app.use(cors());

const MONGO = process.env.MONGO_URL;

async function creatingconnection(){
    const client  =new  MongoClient(MONGO);
    await client.connect();
    console.log("MongoDB is connected")
    return client;
}
export const client = await creatingconnection();



app.use("/",userRouter)
app.use("/register",userRouter)
app.use("/login",userRouter)
app.use("/home",userRouter)
app.use("/home/:search",userRouter)
app.use("/forgotpassword",userRouter)
app.use("/createOrder",userRouter)

app.listen(port,()=>{console.log("server started at the port",port)})