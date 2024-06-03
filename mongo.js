import { ReturnDocument } from 'mongodb';
import {client} from './index.js';


export async function first(){
    return await client.db("hotelbooking").collection("hotels").find().toArray();
}
export async function checkavailability(newdata) {
  try {
    return await client.db("hotelbooking").collection("bookings").find({ _id: newdata._id }).toArray();
  } catch (error) {
    console.error("Error in checkavailability:", error);
    throw error;
  }
}

export async function searchHotels(search) {
    const result =  await client.db("hotelbooking").collection("hotels").find({
      $or: [
        { Name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { price: search }
      ]
    }).toArray();
    return result
  }

export async function finduser(Email){
   return await client.db("hotelbooking").collection("register").findOne({Email:Email});
}

export async function registeruser(newdata){
    return await client.db("hotelbooking").collection("register").insertOne({Name:newdata.Name,Email:newdata.Email,Password:newdata.hashpass});
    
}

export async function login(Email){
    return await client.db("hotelbooking").collection("register").findOne({Email:Email});
}

export async function booking(newdata){
   return await client.db("hotelbooking").collection("bookings").insertOne(newdata);
}
export async function payment(receipt){
  return  await client.db("hotelbooking").collection("payment").insertOne({receipt});
}
export async function resetpassword(email,Password){
  return await client.db("hotelbooking").collection("register").findOneAndUpdate({Email:email},{$set:{Password:Password}},{ReturnDocument:'after'});
}

