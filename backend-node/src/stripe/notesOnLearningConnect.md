# Stripe Connect learning notes

This file is intentionally retained as learning/reference documentation. It should not be deleted merely because it is not imported by runtime code.

+### 1 await stripe.v2.core.accounts.create(...)
router.post('/create-connect-account', async (req, res) εδω οπότε δεν έχουμε κανένα link να επιστρέψουμε στον user. o user πατάει ένα κουμπι "θέλω να ενταχθω στο stripe connect" και εμείς με το router.post('/create-connect-account', async (req, res) φτιάχνουμε ενα id-acct_ και το αποθηκέυουμε στο org του (και τα υπόλοιπα θα τα δουμε παρακάτω σε επόμενα βήματα)

1. Ο ADMIN πατάει:
   'Θέλω να συνδέσω Stripe'

2. Frontend:
   POST /create-connect-account

3. Backend:
   stripe.v2.core.accounts.create(...)

4. Stripe:
   δημιουργεί connected account
   → acct_...

5. Backend:
   αποθηκεύει το acct_... στο Organization

6. Backend:
   επιστρέφει success / accountId

```ts
const account = await stripe.v2.core.accounts.create({
  display_name: 'My Cafe',
  contact_email: 'cafe@example.com',
});
```
```ts
const accountId = account.id;
```


### 2 onboarding link  await stripe.v2.core.accountLinks.create
```ts
router.post('/create-account-link', async (req, res) => {
  // Το acct_... που δημιουργήσαμε πριν
  const accountId = req.body.accountId;

  // Ζητάμε από Stripe ένα onboarding link για αυτό το account. αυτό θα δώσουμε στον user για να ολοκληρώσει την εγγραφή του
  const accountLink = await stripe.v2.core.accountLinks.create({
    account: accountId,

    use_case: {
      // Θέλουμε onboarding
      type: 'account_onboarding',

      account_onboarding: {
        // Τι onboarding/configuration θα ολοκληρώσει
        // recipient → ότι ζητάς από το Stripe onboarding να ρυθμίσει το connected account ως recipient, δηλαδή account που θα μπορεί να λαμβάνει funds/transfers σύμφωνα με αυτό το configuration.
        configurations: ['recipient'],

        // Αν χρειαστεί νέο/refresh onboarding link
        refresh_url: 'https://example.com',

        // Πού επιστρέφει μετά το onboarding
        return_url: `https://example.com?accountId=${accountId}`,
      },
    },
  });

  // Στέλνουμε το Stripe onboarding URL στο frontend
  res.json({
    url: accountLink.url,
  });
});
```

ωραία 
1. user pressed want to connect with stripe
2. backend created stripe id and saved on org 
3. created onboarding url and hand it to user 
μετα;
4. Ο user ανοίγει το onboarding URL στη Stripe και συμπληρώνει τα στοιχεία του. 
5. Η Stripe τον επιστρέφει στο return_url. 
6. Το backend πρέπει να ελέγξει το συγκεκριμένο acct_... για να δει αν το onboarding ολοκληρώθηκε και αν το account είναι έτοιμο

### 3 account status check. stripe.v2.core.accounts.retrieve(accountId, ...) → «Stripe, πες μου την κατάσταση αυτού του acct_....»

```ts
router.get('/account-status/:accountId', async (req, res) => {
  try {
    // Παίρνουμε το acct_... που είχαμε αποθηκεύσει
    const accountId = req.params.accountId;

    // Ρωτάμε τη Stripe για την τρέχουσα κατάσταση του connected account
    const account = await stripe.v2.core.accounts.retrieve(accountId, {
      include: ['requirements', 'configuration.recipient'],
    });

    // Ελέγχουμε αν μπορεί να κάνει payouts
    const payoutsEnabled =
      account.configuration?.recipient?.capabilities?.stripe_balance?.payouts
        ?.status === 'active';

    // Ελέγχουμε αν μπορεί να δέχεται transfers / payments σύμφωνα με το sample
    const chargesEnabled =
      account.configuration?.recipient?.capabilities?.stripe_balance
        ?.stripe_transfers?.status === 'active';

    // Ελέγχουμε αν υπάρχουν άμεσα απαιτούμενα στοιχεία
    const summaryStatus =
      account.requirements?.summary?.minimum_deadline?.status;

    const detailsSubmitted =
      !summaryStatus || summaryStatus === 'eventually_due';

    return res.json({
      id: account.id,
      payoutsEnabled,
      chargesEnabled,
      detailsSubmitted,
      requirements: account.requirements?.entries,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
});
```

1. user pressed want to connect with stripe
2. backend created stripe id and saved on org 
3. created onboarding url and hand it to user 
4. Ο user ανοίγει το onboarding URL στη Stripe και συμπληρώνει τα στοιχεία του. 
5. Η Stripe τον επιστρέφει στο return_url. 
6. Το backend πρέπει να ελέγξει το συγκεκριμένο acct_... για να δει αν το onboarding ολοκληρώθηκε και αν το account είναι έτοιμο

> μετά
> μετα το 6. για να το δοκιμάσουμε θα πρέπει να έχει ολοκληρωθεί η σύνδεσή μας στο stripe account https://dashboard.stripe.com/account/onboarding. και θέλει και id identification
> χρησιμοποιώ test/sandbox στο stripe. ήθελε προσθήκη στο env

7. onboardingComplete = true
8. Από εκεί και πέρα το Organization θεωρείται payment-ready και μπορείς να εμφανίζεις/ενεργοποιείς online payments.
Όταν πελάτης πάει να πληρώσει:
9. βρίσκεις το Table
10. από το Table βρίσκεις το Organization
11. από το Organization παίρνεις το stripeConnectedAccountId
12. Με αυτό δημιουργείς Checkout Session για το σωστό connected  account.
13. Ο πελάτης πληρώνει στη Stripe.
14. Η Stripe στέλνει webhook πίσω στο backend.
15. Το backend επιβεβαιώνει το event και ενημερώνει το TableSession ως partially/fully paid.

Άρα ο κύκλος είναι:

Connect account
→ onboarding
→ verify status
→ mark Organization payment-ready
→ customer checkout
→ Stripe payment
→ webhook
→ update TableSession

### 12 session stripe.checkout.sessions.create
το front κάνει κατι σαν
```ts
      const res = await axios.post(
        `${url}/api/stripe/table/checkout/table-session`,
        {
          tableSessionId,
          tableToken: token,
          ...(amountCents !== undefined && { amountCents }), // '...' → αν έχουμε τα προσθέτει αλλιώς δεν κάνει τίποτα
        },
      );
```
και στο back το σημαντικό είναι αυτό
```ts
    // ⚠️ αυτή είναι η κύρια εντολή για την έναρξη του stripe. H σύνταξη είναι stripe.checkout.sessions.create({ params, options }) (θέλει και αλλη εξήγηση)
    const checkout = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ['card'],
        // δεν έχει στα αλήθεια προϊόντα, στέλνουμε μόνο ένα ποσο
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name:
                  chargeAmountCents === remainingAmountCents
                    ? `Table ${table.number} bill`
                    : `Table ${table.number} partial bill`,
              },
              unit_amount: chargeAmountCents,
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL}/tables/${tableToken}/orders?paid=true`,
        cancel_url: `${process.env.FRONTEND_URL}/tables/${tableToken}/orders`,
        metadata: {
          organizationId: organization._id.toString(),
          tableId: table._id.toString(),
          participantId: session.participant.toString(), // η οντότητα που μεσολαβει τις πωλήσεις σε (user, guest, table etc)
          tableSessionId: session._id.toString(), // το session του τραπεζιού (οχι stripe session)
          amountCents: chargeAmountCents.toString(), // το ποσό που πληρώθηκε (θα μπορούσε να είναι partial)
        },
      },
      // ως εδώ ήταν τα params, ⚠️ τωρα για stripe connect προσθέσαμε και option. params → τι πληρώνει ο customer. options.stripeAccount → σε ποιο connected Stripe account δημιουργείται η πληρωμή
      {
        stripeAccount: connectedAccountId,
      },
    );
```

### webhook
```ts
// αν το session είναι επιτυχημένο τότε αυτό πιάνει το webhook στην επιστροφή: Δημιουργείς checkout session → ο χρήστης πληρώνει στο Stripe hosted page → το Stripe, ανεξάρτητα από το redirect του browser, στέλνει HTTP POST στο webhook endpoint που έχεις δηλώσει στο Stripe dashboard. Εκεί χτυπάει το handleTableWebhook
// αν δεν έρθει amountCents → χρεώνει όλο το υπόλοιπο : αν έρθει amountCents → χρεώνει μέρος του υπολοίπου
const handleTableWebhook = async (req: Request, res: Response) => {
  console.log("🔥 TABLE STRIPE WEBHOOK HIT");

  try {
    // validation της υπογραφής του stripe και του secret που έχουμε πάρει απο το site του stripe
    const sig = req.headers["stripe-signature"];

    if (!sig) {
      return res.status(400).send("Missing stripe signature");
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("Missing STRIPE_WEBHOOK_SECRET");
    }

    // λαμβάνουμε απο το stripe το event
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    // αν το event είναι completed (success)
    if (event.type === "checkout.session.completed") {
      const stripeSession = event.data.object as Stripe.Checkout.Session;

      // for stripe connect ελέγχουμε το connected account του Direct Charge.
      const connectedAccountId = event.account;
      if (!connectedAccountId) {
        console.warn("Stripe Table webhook has no connected account");
        return res.json({ received: true });
      }

      if (stripeSession.payment_status !== "paid") {
        return res.json({ received: true });
      }

      // βγάζουμε απο το obj της επιστροφής αυτά που μας ενδιαφέρουν
      const participantId = stripeSession.metadata?.participantId;
      const tableSessionId = stripeSession.metadata?.tableSessionId;
      const metadataAmount = stripeSession.metadata?.amountCents;

      if (!participantId || !tableSessionId) {
        return res.json({ received: true });
      }

      // for stripe connect επαληθεύουμε ότι TableSession, Table και Organization ανήκουν στο ίδιο tenant.
      const session = await tableSessionDAO.findById(tableSessionId);
      const table = await TableModel.findById(session.table);
      if (!table) {
        console.warn("Stripe Table webhook table not found", { tableSessionId });
        return res.json({ received: true });
      }

      const organization = await OrganizationModel.findById(table.organizationId);
      const metadataOrganizationId = stripeSession.metadata?.organizationId;
      const metadataTableId = stripeSession.metadata?.tableId;
      const organizationMatches =
        organization &&
        organization.stripeConnectedAccountId === connectedAccountId &&
        organization._id.toString() === metadataOrganizationId;
      const tableMatches = table._id.toString() === metadataTableId;

      if (!organizationMatches || !tableMatches) {
        console.warn("Stripe Table webhook ownership mismatch", {
          connectedAccountId,
          metadataOrganizationId,
          metadataTableId,
          tableSessionId,
        });
        return res.json({ received: true });
      }

      // amount_total = τι πλήρωσε ο χρήστης (source of truth) : metadataAmount = fallback (δικό σου). κράτα Stripe value first → metadata μόνο backup
      const paidAmountCents =
        typeof stripeSession.amount_total === "number"
          ? stripeSession.amount_total
          : Number(metadataAmount);

      if (!paidAmountCents || paidAmountCents <= 0) {
        return res.json({ received: true });
      }

      // στέλνουμε στο dao για τα session του τραπεζιού να σημειώσει οτι έγινε η πληρωμη (εδω θα πρέπει να γίνει αλλαγή αν η πληρωμή είναι partial). το incrementPaidAmount είναι άλλο απο το paid (που είχαμε πριν το split bill. καταλαβαίνει το dao αν ο λογαριασμός ολοκληρώθηκε και αν ναι τον κάνει paid)
      // for stripe connect αποφεύγουμε δεύτερη καταχώρηση του ίδιου Stripe event.
      const updatedSession = await tableSessionDAO.incrementPaidAmountForStripeEvent(
        tableSessionId,
        paidAmountCents,
        event.id,
      );

      if (!updatedSession) {
        console.log("Stripe Table webhook already processed", { eventId: event.id });
        return res.json({ received: true });
      }

      if (paidAmountCents > updatedSession.totalAmountCents) {
        console.warn("Overpayment detected, capped");
      }

      console.log("💰 TABLE PAYMENT CONFIRMED", {
        tableSessionId,
        participantId,
        paidAmountCents,
        totalAmountCents: updatedSession.totalAmountCents,
        paidSoFarCents: updatedSession.paidAmountCents,
        remainingCents:
          updatedSession.totalAmountCents - updatedSession.paidAmountCents,
      });

      // κανουμε emit socket για instant update
      const io = getIO();
      const room = getOrganizationRoom(table.organizationId.toString());
      io.to(room).emit("table:partial_paid", {
        tableId: updatedSession.table.toString(),
        sessionId: updatedSession._id.toString(),
        paidAmountCents: updatedSession.paidAmountCents,
        remainingCents:
          updatedSession.totalAmountCents - updatedSession.paidAmountCents,
        status: updatedSession.status,
      });

      // emit paid ONLY όταν έκλεισε πλήρως
      if (updatedSession.status === "paid") {
        io.to(room).emit("table:paid", {
          tableId: updatedSession.table.toString(),
          sessionId: updatedSession._id.toString(),
        });
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Stripe table webhook error:", err);
    return res.status(400).send("Webhook error");
  }
};
```



###
αρα το μόνο που μένει να κάνω για να επιστρέψω στο production είναι να γυρίσω τα STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET σε αυτά που ήταν πριν?

Όχι, όχι μόνο τα δύο keys. Για production χρειάζονται 4 πράγματα:

Να γυρίσεις:
STRIPE_SECRET_KEY=sk_live_...
Να δημιουργήσεις Live webhook destination στο Stripe Dashboard που να δείχνει:
https://cafe.portfolio-projects.space/api/stripe/table/webhook

και να δέχεται events από connected accounts, τουλάχιστον:

checkout.session.completed

Από αυτό το live webhook παίρνεις νέο:

STRIPE_WEBHOOK_SECRET=whsec_...
Τα sandbox connected accounts acct_... δεν ισχύουν στο Live mode. Άρα το υπάρχον:
stripeConnectedAccountId

του test Organization δεν πρέπει να χρησιμοποιηθεί στο production. Κάθε πραγματικό café θα πρέπει να κάνει ξανά:

Connect Stripe
→ δημιουργία live acct_...
→ live onboarding
→ paymentsReady
Το δικό σου Stripe platform account πρέπει να είναι ενεργοποιημένο για Live Connect — εκεί είχαμε δει ότι η Stripe ζητούσε identity verification.

Οπότε η μετάβαση είναι ουσιαστικά:

Sandbox:
sk_test + sandbox whsec + sandbox acct

Production:
sk_live + live webhook whsec + live acct

Ο κώδικας δεν χρειάζεται αλλαγή. Αλλά μην αλλάξεις απλώς τα keys ενώ στη Mongo υπάρχουν sandbox acct_..., γιατί τότε το live Stripe API δεν θα αναγνωρίζει αυτά τα accounts.
