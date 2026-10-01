import { Router } from 'express';
import { middleware } from '../login/middleware/verification.middleware';
import { stripePaymentController } from './stripe.payment.controller';

const router = Router();

// Payment creation is tenant-scoped through the authenticated ADMIN. The
// organization is resolved from the JWT user, not from request-supplied IDs.
router.post(
  '/checkout',
  middleware.verifyToken,
  middleware.checkOrganizationRole('ADMIN'),
  stripePaymentController.createCheckoutSession,
);

export default router;
