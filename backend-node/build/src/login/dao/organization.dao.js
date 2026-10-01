"use strict";
// backend/src/login/dao/organization.dao.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationDAO = void 0;
const organization_models_1 = require("../models/organization.models");
const errors_types_1 = require("../../utils/error/errors.types");
// SAFE MAPPER
const toOrganizationDAO = (organization) => {
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
const toSlugBase = (name) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'organization';
const createUniqueSlug = async (name) => {
    const base = toSlugBase(name);
    let slug = base;
    let suffix = 2;
    while (await organization_models_1.OrganizationModel.exists({ slug })) {
        slug = `${base}-${suffix}`;
        suffix += 1;
    }
    return slug;
};
// CREATE
const create = async (organizationData, session) => {
    try {
        const organization = new organization_models_1.OrganizationModel({
            name: organizationData.name,
            slug: organizationData.slug ?? await createUniqueSlug(organizationData.name),
        });
        const saved = await organization.save(session ? { session } : undefined);
        return toOrganizationDAO(saved);
    }
    catch {
        throw new errors_types_1.DatabaseError("Error creating organization");
    }
};
const readBySlug = async (slug) => {
    const organization = await organization_models_1.OrganizationModel.findOne({ slug }).lean();
    return organization ? toOrganizationDAO(organization) : null;
};
// READ
const readAll = async () => {
    const organizations = await organization_models_1.OrganizationModel.find().sort({
        createdAt: -1,
    });
    return organizations.map((organization) => toOrganizationDAO(organization));
};
const readById = async (organizationId) => {
    const organization = await organization_models_1.OrganizationModel.findById(organizationId);
    if (!organization) {
        throw new errors_types_1.NotFoundError("Organization not found");
    }
    return toOrganizationDAO(organization);
};
// UPDATE
const update = async (organizationId, organizationData) => {
    const updated = await organization_models_1.OrganizationModel.findByIdAndUpdate(organizationId, organizationData, {
        returnDocument: 'after',
    });
    if (!updated) {
        throw new errors_types_1.NotFoundError("Organization not found");
    }
    return toOrganizationDAO(updated);
};
// DELETE
const deleteById = async (organizationId) => {
    const deleted = await organization_models_1.OrganizationModel.findByIdAndDelete(organizationId);
    if (!deleted) {
        throw new errors_types_1.NotFoundError("Organization not found");
    }
    return toOrganizationDAO(deleted);
};
exports.organizationDAO = {
    toOrganizationDAO,
    create,
    readAll,
    readById,
    readBySlug,
    update,
    deleteById,
};
//# sourceMappingURL=organization.dao.js.map