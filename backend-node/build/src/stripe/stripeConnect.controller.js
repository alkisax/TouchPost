"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeConnectController = void 0;
const stripe_1 = __importDefault(require("stripe"));
const organization_models_1 = require("../login/models/organization.models");
const organizationAccess_service_1 = require("../login/services/organizationAccess.service");
const errorHandler_1 = require("../utils/error/errorHandler");
const stripeConnectReadiness_1 = require("./stripeConnectReadiness");
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY');
}
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
// Stripe Connect lets each Organization receive payments through its own
// connected account. The account ID is stored on Organization, while Stripe
// remains the platform coordinating the connected accounts.
const getAdminOrganization = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ status: false, message: 'Unauthorized' });
        return null;
    }
    const organizationId = await (0, organizationAccess_service_1.getAdminOrganizationId)(req.user.id);
    if (!organizationId) {
        res.status(403).json({ status: false, message: 'Admin access required' });
        return null;
    }
    const organization = await organization_models_1.OrganizationModel.findById(organizationId);
    if (!organization) {
        res.status(404).json({ status: false, message: 'Organization not found' });
        return null;
    }
    return organization;
};
const createConnectedAccount = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }
        const organization = await getAdminOrganization(req, res);
        if (!organization)
            return;
        if (organization.stripeConnectedAccountId) {
            return res.status(200).json({
                status: true,
                data: {
                    accountId: organization.stripeConnectedAccountId,
                    onboardingComplete: organization.stripeOnboardingComplete ?? false,
                },
            });
        }
        // Creating the account returns an acct_... identifier. We store that ID
        // on the Organization and create the onboarding link in a separate step.
        const account = await stripe.v2.core.accounts.create({
            dashboard: 'full',
            defaults: {
                responsibilities: {
                    fees_collector: 'stripe',
                    losses_collector: 'stripe',
                },
            },
            configuration: {
                merchant: {
                    capabilities: {
                        card_payments: { requested: true },
                    },
                },
            },
            display_name: organization.name,
            metadata: { organizationId: organization._id.toString() },
        });
        organization.stripeConnectedAccountId = account.id;
        organization.stripeOnboardingComplete = false;
        await organization.save();
        return res.status(201).json({
            status: true,
            data: { accountId: account.id, onboardingComplete: false },
        });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const createOnboardingLink = async (req, res) => {
    try {
        const organization = await getAdminOrganization(req, res);
        if (!organization)
            return;
        const accountId = organization.stripeConnectedAccountId;
        if (!accountId) {
            return res.status(400).json({
                status: false,
                message: 'Create the Stripe connected account first',
            });
        }
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        // The onboarding URL is single-use/temporary in Stripe's flow. The
        // frontend receives it and sends the admin to Stripe to complete setup.
        const accountLink = await stripe.v2.core.accountLinks.create({
            account: accountId,
            use_case: {
                type: 'account_onboarding',
                account_onboarding: {
                    configurations: ['merchant'],
                    refresh_url: `${frontendUrl}/admin-panel`,
                    return_url: `${frontendUrl}/admin-panel`,
                },
            },
        });
        return res.status(200).json({ status: true, data: { url: accountLink.url } });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const getConnectedAccountStatus = async (req, res) => {
    try {
        const organization = await getAdminOrganization(req, res);
        if (!organization)
            return;
        const accountId = organization.stripeConnectedAccountId;
        if (!accountId) {
            return res.status(404).json({
                status: false,
                message: 'Stripe connected account not found',
            });
        }
        // The database flag is only a convenience cache. Stripe is the source of
        // truth for current capability/readiness state, so retrieve the account
        // and inspect its requirements and card-payment capability.
        const account = await stripe.v2.core.accounts.retrieve(accountId, {
            include: ['configuration.merchant', 'requirements'],
        });
        const merchant = account.configuration?.merchant;
        const requirements = account.requirements?.entries ?? [];
        const onboardingComplete = merchant?.applied === true &&
            !requirements.some((entry) => entry.awaiting_action_from === 'user' &&
                entry.impact.restricts_capabilities?.some((capability) => capability.capability === 'card_payments'));
        organization.stripeOnboardingComplete = onboardingComplete;
        await organization.save();
        return res.status(200).json({
            status: true,
            data: {
                accountId,
                onboardingComplete,
                paymentsReady: (0, stripeConnectReadiness_1.isStripePaymentsReady)(account),
                cardPaymentsStatus: merchant?.capabilities?.card_payments?.status,
                requirements: requirements.map((entry) => ({
                    description: entry.description,
                    awaitingActionFrom: entry.awaiting_action_from,
                    restrictsCapabilities: entry.impact.restricts_capabilities?.map((capability) => capability.capability),
                })),
            },
        });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
exports.stripeConnectController = {
    createConnectedAccount,
    createOnboardingLink,
    getConnectedAccountStatus,
};
//# sourceMappingURL=stripeConnect.controller.js.map