// backend/src/login/dao/organization.dao.ts

import type {
  IOrganization,
  OrganizationView,
  CreateOrganization,
  UpdateOrganization,
} from "../types/organization.types";

import { OrganizationModel } from "../models/organization.models";
import type { ClientSession } from 'mongoose';

import { NotFoundError, DatabaseError } from "../../utils/error/errors.types";

// SAFE MAPPER
const toOrganizationDAO = (organization: IOrganization): OrganizationView => {
  return {
    id: organization._id.toString(),
    name: organization.name,
    slug: organization.slug,
    hasPaid: organization.hasPaid,
    adFreeUntil: organization.adFreeUntil ?? null,
    createdAt: organization.createdAt,
    updatedAt: organization.updatedAt,
  };
};

const toSlugBase = (name: string) =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'organization';

const createUniqueSlug = async (name: string) => {
  const base = toSlugBase(name);
  let slug = base;
  let suffix = 2;

  while (await OrganizationModel.exists({ slug })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

// CREATE
const create = async (
  organizationData: CreateOrganization,
  session?: ClientSession,
): Promise<OrganizationView> => {
  try {
    const organization = new OrganizationModel({
      name: organizationData.name,
      slug: organizationData.slug ?? await createUniqueSlug(organizationData.name),
    });

    const saved = await organization.save(session ? { session } : undefined);

    return toOrganizationDAO(saved);
  } catch {
    throw new DatabaseError("Error creating organization");
  }
};

const readBySlug = async (slug: string): Promise<OrganizationView | null> => {
  const organization = await OrganizationModel.findOne({ slug }).lean();
  return organization ? toOrganizationDAO(organization as IOrganization) : null;
};

// READ
const readAll = async (): Promise<OrganizationView[]> => {
  const organizations = await OrganizationModel.find().sort({
    createdAt: -1,
  });

  return organizations.map((organization) => toOrganizationDAO(organization));
};

const readById = async (organizationId: string): Promise<OrganizationView> => {
  const organization = await OrganizationModel.findById(organizationId);

  if (!organization) {
    throw new NotFoundError("Organization not found");
  }

  return toOrganizationDAO(organization);
};

// UPDATE
const update = async (
  organizationId: string,
  organizationData: UpdateOrganization,
): Promise<OrganizationView> => {
  const updated = await OrganizationModel.findByIdAndUpdate(
    organizationId,
    organizationData,
    {
      returnDocument: 'after',
    },
  );

  if (!updated) {
    throw new NotFoundError("Organization not found");
  }

  return toOrganizationDAO(updated);
};

// DELETE
const deleteById = async (
  organizationId: string,
): Promise<OrganizationView> => {
  const deleted = await OrganizationModel.findByIdAndDelete(organizationId);

  if (!deleted) {
    throw new NotFoundError("Organization not found");
  }

  return toOrganizationDAO(deleted);
};

export const organizationDAO = {
  toOrganizationDAO,
  create,
  readAll,
  readById,
  readBySlug,
  update,
  deleteById,
};
