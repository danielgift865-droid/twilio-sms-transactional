import { Request, Response, NextFunction } from 'express';
import twilio from 'twilio';

export function twilioValidateMiddleware(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'development') {
    return next(); // Skip validation in dev (useful with ngrok)
  }

  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const signature = req.headers['x-twilio-signature'] as string;
  const url = process.env.TWILIO_WEBHOOK_URL!;
  const params = req.body;

  const isValid = twilio.validateRequest(authToken, signature, url, params);
  if (!isValid) {
    return res.status(403).json({ error: 'Forbidden: invalid Twilio signature' });
  }
  next();
}
