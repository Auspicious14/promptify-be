import { Request, Response } from "express";
import axios from "axios";
import { userModel } from "../../models/user";
import { v4 as uuidv4 } from "uuid";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const FRONTEND_URL = process.env.CLIENT_URL!;

export const initializeSubscription = async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;
    const userId = (req as any).user.id;

    if (plan !== "premium") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid plan specified." });
    }

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthenticated" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const transactionRef = `sub_${uuidv4()}`;
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: 3000 * 100, // 3000 NGN in kobo
        reference: transactionRef,
        callback_url: `${FRONTEND_URL}/verify-payment`,
        currency: "NGN",
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      data: {
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
        reference: transactionRef,
      },
    });
  } catch (error: any) {
    console.error("Payment initialization failed:", error);
    res.status(500).json({
      success: false,
      message: "Payment initialization failed. Please try again later.",
      error: error.message,
    });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const userId = (req as any).user.id;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    if (response.data.data.status === "success") {
      await userModel.findByIdAndUpdate(userId, {
        subscription: {
          plan: "premium",
          status: "active",
          paystackCustomerId: response.data.data.customer.id,
        },
      });
      return res.json({ success: true, message: "Payment successful" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed." });
    }
  } catch (error: any) {
    console.error("Payment verification failed:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed. Please try again later.",
      error: error.message,
    });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const event = req.body;

  // It's a good practice to verify the webhook signature here

  if (event && event.event === "charge.success") {
    const customerId = event.data.customer.id;
    const plan = event.data.plan; // You might need to adjust this based on your webhook payload

    if (plan === "premium") {
      await userModel.findOneAndUpdate(
        { "subscription.paystackCustomerId": customerId },
        { "subscription.status": "active" }
      );
    }
  }

  res.sendStatus(200);
};
