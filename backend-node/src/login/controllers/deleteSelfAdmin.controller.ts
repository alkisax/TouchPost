import type { Response } from 'express';

import type { AuthRequest } from '../types/user.types';
import { deleteSelfAdminService } from '../services/deleteSelfAdmin.service';
import { handleControllerError } from '../../utils/error/errorHandler';
import { deleteSelfAdminSchema } from '../validation/user.schema';

const deleteSelfAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const requester = req.user;

    if (!requester) {
      return res.status(401).json({
        status: false,
        message: 'Unauthorized',
      });
    }

    const parsed = deleteSelfAdminSchema.parse(req.body);

    await deleteSelfAdminService.deleteSelfAccount(
      requester.id,
      parsed.password,
    );

    return res.status(200).json({
      status: true,
      message: 'Account deleted successfully',
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export const deleteSelfAdminController = {
  deleteSelfAdmin,
};
