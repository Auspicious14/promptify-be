import { Request, Response } from "express";
import axios from "axios";
import { userModel } from "../models/user";
import { v4 as uuidv4 } from "uuid";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_PUBLIC = process.env.PAYSTACK_PUBLIC_KEY!;
const FRONTEND_URL = process.env.FRONTEND_URL!;

export const initializeSubscription = async (req: Request, res: Response) => {
  try {
    const { email, plan } = req.body;
    const transactionRef = `sub_${uuidv4()}`;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: plan === "premium" ? 299900 : 0,
        reference: transactionRef,
        callback_url: `${FRONTEND_URL}/verify-payment`,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_PUBLIC}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
      reference: transactionRef,
    });
  } catch (error) {
    res.status(500).json({ error: "Payment initialization failed" });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    if (response.data.data.status === "success") {
      await userModel.findByIdAndUpdate((req as any).user.id, {
        "subscription.plan": "premium",
        "subscription.paystackCustomerId": response.data.data.customer.id,
      });
    }

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Payment verification failed" });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const event = req.body;

  if (event.event === "charge.success") {
    const customerId = event.data.customer.id;
    await userModel.findOneAndUpdate(
      { "subscription.paystackCustomerId": customerId },
      { "subscription.status": "active" }
    );
  }

  res.sendStatus(200);
};
