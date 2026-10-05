import bcrypt from 'bcrypt';

import { UserModel } from '../models/users.models';
import { NotFoundError, ValidationError } from '../../utils/error/errors.types';
import { deleteAdminTenant } from './organizationLifecycle.service';
import { OrganizationUserModel } from '../models/organizationUser.models';
import { deleteStaff } from './organizationLifecycle.service';

const deleteAdminAccountCascade = async (
  userId: string,
  password?: string,
): Promise<void> => {
  const user = await UserModel.findById(userId).lean();
  if (!user) throw new NotFoundError('User not found');

  if (password !== undefined) {
    const passwordMatches = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordMatches) {
      throw new ValidationError('Current password is incorrect');
    }
  }

  await deleteAdminTenant(userId);
};

const deleteSelfAccount = async (userId: string, password: string) => {
  const user = await UserModel.findById(userId).lean();
  if (!user) throw new NotFoundError('User not found');

  if (!(await bcrypt.compare(password, user.hashedPassword))) {
    throw new ValidationError('Current password is incorrect');
  }

  if (user.globalRoles.includes('SUPERADMIN')) {
    const membership = await OrganizationUserModel.findOne({ userId });
    if (membership) {
      throw new ValidationError('Global accounts cannot have organization membership');
    }
    await UserModel.deleteOne({ _id: userId });
    return;
  }

  const membership = await OrganizationUserModel.findOne({ userId });
  if (!membership) {
    await UserModel.deleteOne({ _id: userId });
    return;
  }

  if (membership.role === 'ADMIN') {
    await deleteAdminTenant(userId);
    return;
  }

  if (membership.role === 'STAFF') {
    await deleteStaff(membership.organizationId.toString(), userId);
    return;
  }

  throw new ValidationError('Invalid organization membership');
};

export const deleteSelfAdminService = { deleteAdminAccountCascade, deleteSelfAccount };
