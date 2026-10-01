import { Router } from 'express';

import { userController } from '../controllers/user.controller';
import { middleware } from '../middleware/verification.middleware';

const router = Router();

router.use(middleware.verifyToken, middleware.checkOrganizationRole('ADMIN'));

router.post('/staff', userController.createStaff);
router.get('/organization/staff', userController.seeCompanyStaff);

router.put('/:staffId', (req, res) => {
  (req.params as Record<string, string>).id = String(req.params.staffId);
  return userController.updateById(req, res);
});

router.delete('/:staffId', userController.removeStaffByAdmin);

export default router;
