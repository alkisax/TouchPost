"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripePaymentController = void 0;
const stripe_1 = __importDefault(require("stripe"));
const organization_models_1 = require("../login/models/organization.models");
const organizationAccess_service_1 = require("../login/services/organizationAccess.service");
const errorHandler_1 = require("../utils/error/errorHandler");
const stripe_payment_schema_1 = require("./stripe.payment.schema");
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY');
}
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
// Stripe amounts are represented in the smallest currency unit. For EUR,
// amountCents: 2500 means €25.00. The request currently supplies the amount
// as a starter example; a real application should replace it with a
// server-derived amount after applying its own business validation.
const getAuthenticatedOrganization = async (req, res) => {
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
const createCheckoutSession = async (req, res) => {
    try {
        const parsed = stripe_payment_schema_1.paymentCheckoutSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                message: 'amountCents must be a positive integer',
            });
        }
        const organization = await getAuthenticatedOrganization(req, res);
        if (!organization)
            return;
        const connectedAccountId = organization.stripeConnectedAccountId;
        if (!connectedAccountId) {
            return res.status(400).json({
                status: false,
                message: 'Online payments are not configured for this organization',
            });
        }
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        // This is the main command that starts Stripe Checkout. The first object
        // describes what the customer pays. There are no products or price IDs in
        // this generic flow: one synthetic line item carries the monetary amount.
        const checkout = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        // unit_amount is an integer in the currency's smallest unit.
                        product_data: { name: 'Payment' },
                        unit_amount: parsed.data.amountCents,
                    },
                    quantity: 1,
                },
            ],
            success_url: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/payment-cancelled`,
            metadata: {
                organizationId: organization._id.toString(),
            },
        }, 
        // The second argument is the Stripe SDK options object. stripeAccount
        // makes this a direct charge on the tenant's connected account.
        { stripeAccount: connectedAccountId });
        return res.status(200).json({
            status: true,
            data: {
                id: checkout.id,
                url: checkout.url,
            },
        });
    }
    catch (error) {
        return (0, errorHandler_1.handleControllerError)(res, error);
    }
};
const handleWebhook = async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
        return res.status(400).send('Missing Stripe signature');
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        return res.status(500).send('Missing Stripe webhook configuration');
    }
    try {
        // Stripe signs the raw request body. This route is registered with
        // express.raw(...) before express.json(), otherwise signature validation
        // cannot work correctly.
        const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            console.log('Stripe payment completed', {
                eventId: event.id,
                sessionId: session.id,
                amountTotal: session.amount_total,
                connectedAccountId: event.account,
                organizationId: session.metadata?.organizationId,
            });
        }
        return res.json({ received: true });
    }
    catch (error) {
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }
};
exports.stripePaymentController = {
    createCheckoutSession,
    handleWebhook,
};
//# sourceMappingURL=stripe.payment.controller.js.map