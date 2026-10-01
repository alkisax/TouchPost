import { organizationUserDAO } from '../dao/organizationUser.dao';

export const getAdminOrganizationId = async (
  userId: string,
): Promise<string | null> => {
  const membership = await organizationUserDAO.readAdminOrganization(userId);

  return membership?.organizationId ?? null;
};
