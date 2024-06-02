import express from "express";
import {
  booking,
  finduser,
  login,
  registeruser,
  payment,
  first,
  searchHotels,
  checkavailability,
} from "../mongo.js";
import { hashing, comparing } from "../helper.js";
import Razorpay from "razorpay";
import axios from "axios";

const router = express.Router();

/*router.get('/',async ()=>{ 
})*/

router.post("/register", async (req, res) => {
  try {
    const { Name, Email, Password } = req.body;
    //check user is already exsist or not
    const registereduser = await finduser(Email);
    console.log(registereduser);

    if (registereduser) {
      res.status(409).send("User Already exists");
      return;
    }
    const hashpass = await hashing(Password);
    const newdata = { Name, Email, hashpass };
    await registeruser(newdata);
    res.status(201).send("Register successfull");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server Error");
  }
});
router.post("/login", async (req, res) => {
  const { Email, Password, captcha } = req.body;

  try {
    // Verify the ReCAPTCHA
    const capResponse = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: "6LdWJ-4pAAAAAGw7CZm4_WndhJQbOHWhoP0VBXnk",
        response: captcha
      }
    });

    if (!capResponse.data.success) {
      return res.status(400).json({
        success: false,
        message: "CAPTCHA verification failed!"
      });
    }

    // Check for user
    const user = await login(Email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Wrong Credentials!"
      });
    }

    // Compare passwords
    const isPasswordCorrect = await comparing(Password, user);

    if (isPasswordCorrect && user.Email === Email) {
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Wrong Credentials!"
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!"
    });
  }
});


router.get("/home", async (req, res) => {
  const hotels = await first();
  res.send(hotels);
});
router.get("/home/:search", async (req, res) => {
  const { search } = req.params;
  console.error(search);
  try {
    const results = await searchHotels(search);
    res.send(results);
  } catch (error) {
    console.error("Error searching for hotels:", error);
    res.status(500).send("Internal Server Error");
  }
});
//booking a room 
router.post("/bookings/room/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const { checkin, checkout } = req.body;
    const newdata = {
      _id,
      checkin: new Date(checkin),
      checkout: new Date(checkout),
    };

    console.log("New data to be booked:", newdata);

    const finds = await checkavailability(newdata);
    console.log("Existing bookings found:", finds);

    let roomAlreadyBooked = false;

    for (const find of finds) {
      const existingCheckin = new Date(find.checkin);
      const existingCheckout = new Date(find.checkout);

      if (
        (newdata.checkin <= existingCheckout && newdata.checkin >= existingCheckin) ||
        (newdata.checkout <= existingCheckout && newdata.checkout >= existingCheckin) ||
        (newdata.checkin <= existingCheckin && newdata.checkout >= existingCheckout)
      ) {
        roomAlreadyBooked = true;
        break;
      }
    }

    if (roomAlreadyBooked) {
      res.status(400).send("Room already booked for this date and time");
    } else {
      const result = booking(newdata);
      res.send({ message: "Booking successful", result });
    }
  } catch (error) {
    console.error("Error in booking:", error);
    res.status(500).send("Internal Server Error");
  }
});
//to create oreder
const razorpay = new Razorpay({
  key_id: 'YOUR_RAZORPAY_KEY_ID',
  key_secret: 'YOUR_RAZORPAY_KEY_SECRET',
});

router.post('/create-order', async (req, res) => {
  const options = {
      amount: req.body.amount , 
      currency: "INR",
      receipt: "order_rcptid_11"
  };
  try {
      const order = await razorpay.orders.create(options);
      res.json(order);
  } catch (error) {
      res.status(500).send(error);
  }
});
//verify payment
router.post('/verifyPayment', async (req, res) => {
  const { paymentId, orderId, signature } = req.body;
  // Implement payment verification logic here
  // Verify the signature and confirm the payment status

  res.send('Payment verified');
});
const userRouter = router;
export default userRouter;
