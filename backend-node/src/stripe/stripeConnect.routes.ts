import { Router } from 'express';
import { middleware } from '../login/middleware/verification.middleware';
import { stripeConnectController } from './stripeConnect.controller';

const router = Router();

router.use(
  middleware.verifyToken,
  middleware.checkOrganizationRole('ADMIN'),
);

router.post('/account', stripeConnectController.createConnectedAccount);
router.post('/onboarding-link', stripeConnectController.createOnboardingLink);
router.get('/status', stripeConnectController.getConnectedAccountStatus);

export default router;
