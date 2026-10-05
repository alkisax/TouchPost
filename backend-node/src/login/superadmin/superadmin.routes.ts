import { Router } from 'express';
import { middleware } from '../middleware/verification.middleware';
import { superadminController } from './superadmin.controller';

const router = Router();

router.use(
  middleware.verifyToken,
  middleware.checkGlobalRole('SUPERADMIN'),
);

router.get('/stats', superadminController.getSummary);
router.get('/users', superadminController.listUsers);
router.get('/users/:userId', superadminController.getUser);
router.post('/users', superadminController.createPlainUser);
router.put('/users/:userId', superadminController.updateManagedUser);
router.delete('/users/:userId', superadminController.deletePlainUser);
router.post('/admins', superadminController.createAdmin);
router.get('/admins', superadminController.listAdmins);
router.get('/admins/:userId', superadminController.getAdmin);
router.patch('/admins/:userId', superadminController.updateAdmin);
router.delete('/admins/:userId', superadminController.deleteAdmin);
router.delete('/staff/:userId', superadminController.deleteStaffByUserId);
router.get('/companies', superadminController.listOrganizations);
router.get('/organizations', superadminController.listOrganizations);
router.put('/users/:userId/ad-status', superadminController.updateUserAdStatus);
router.get('/users/:userId/ad-status', superadminController.getUserAdStatus);
router.post(
  '/organizations/:organizationId/staff',
  superadminController.createStaff,
);
router.patch(
  '/organizations/:organizationId/staff/:userId',
  superadminController.updateStaff,
);
router.delete(
  '/organizations/:organizationId/staff/:userId',
  superadminController.removeStaff,
);

export default router;
