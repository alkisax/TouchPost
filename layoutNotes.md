## Μικρή έκδοση — Native + Web, χωρίς backend

Η πρώτη και πιο απλή έκδοση μπορεί να λειτουργήσει χωρίς backend και χωρίς database. Το native app χρησιμοποιείται μόνο για τη δημιουργία της κάρτας και για το γράψιμο των δεδομένων στο NFC tag. Ο χρήστης επιλέγει έως 5 image URLs, title, προαιρετικά text1 και text2, καθώς και theme. Το app μετατρέπει τα δεδομένα σε compact payload και τα ενσωματώνει σε ένα URL που γράφεται στο NFC.

Η βασική ροή είναι:

Create Card → Add up to 5 image URLs → Choose theme → Add title/text → Preview → Write to NFC

Το NFC περιέχει ουσιαστικά όλα τα δεδομένα που χρειάζεται η postcard. Όταν ο παραλήπτης ακουμπήσει το κινητό του στο tag, ανοίγει η web εφαρμογή με τα δεδομένα μέσα στο URL. Η web εφαρμογή τα διαβάζει, τα κρατά προσωρινά στο state και αμέσως χρησιμοποιεί `window.history.replaceState()` ώστε να καθαρίσει το URL από το address bar. Έτσι, αν ο χρήστης κάνει μετά Copy URL ή Share, αντιγράφεται μόνο το καθαρό URL της σελίδας και όχι το payload της κάρτας.

Η ροή προβολής είναι:

NFC tap → Web page opens with payload → Read card data → `replaceState()` → Render postcard

Οι εικόνες δεν χρειάζεται να βρίσκονται σε δικό μας storage. Για την εφαρμογή είναι απλώς URLs και μπορούν να προέρχονται από οποιοδήποτε cloud ή hosting χρησιμοποιεί ο χρήστης. Επειδή το NTAG215 έχει περιορισμένο χώρο, τα image URLs καλό είναι να είναι shortened και τα κείμενα να έχουν μικρό όριο χαρακτήρων.

Τα themes μπορούν να είναι free ή premium. Στο backendless μοντέλο ένα premium theme μπορεί να αγοράζεται ως consumable one-time purchase μέσα από το Google Play ή το App Store. Η αγορά ισχύει για μία postcard και καταναλώνεται αφού ολοκληρωθεί επιτυχώς το NFC write. Δεν απαιτείται login ή δικός μας backend για το βασικό flow.

Αυτή η έκδοση είναι κατάλληλη για V1, testing και validation της ιδέας, γιατί έχει πολύ μικρότερο complexity και σχεδόν μηδενικό server cost.

## Μεγάλη έκδοση — Native + Web + Backend + PostgreSQL

Η μεγαλύτερη έκδοση μεταφέρει τα δεδομένα της postcard από το NFC στο backend. Το native app αποκτά login, My Cards και κανονικό card management. Ο χρήστης δημιουργεί την postcard μέσα από wizard, αλλά αντί να αποθηκεύονται όλα τα δεδομένα στο NFC, αποθηκεύονται στο backend και στη PostgreSQL.

Η βασική ροή δημιουργίας είναι:

Login → My Cards → Create Card → Add up to 5 image URLs → Choose theme → Add title/text → Save card → Write NFC

Στη database αποθηκεύονται το card id, ο ιδιοκτήτης, το title, τα προαιρετικά texts, το theme, τα image URLs και ένας secret code. Το NFC χρειάζεται πλέον να περιέχει μόνο ένα μικρό URL με card id και code, για παράδειγμα:

`https://postal.app/c/8f3d21?code=K7P4X9`

Όταν ο παραλήπτης κάνει tap στο NFC, ανοίγει η web εφαρμογή. Η web εφαρμογή στέλνει το card id και το code στο backend, το backend τα ελέγχει και επιστρέφει τα δεδομένα της postcard. Μετά το frontend κάνει `replaceState()` ώστε το secret code να εξαφανιστεί από το address bar.

Η ροή προβολής είναι:

NFC tap → Web page opens → Validate card id + code → Backend returns card data → `replaceState()` → Render postcard

Η μεγάλη έκδοση επιτρέπει πολύ περισσότερα features: edit card, replace images χωρίς επανεγγραφή NFC, cloud backup, restore, card history, analytics, usage limits, subscriptions, paid themes tied to account και γενικά πιο πλήρες multi-user σύστημα.

Το σημαντικό είναι ότι μπορούμε να ξεκινήσουμε από τη μικρή έκδοση και αργότερα να περάσουμε στη μεγάλη χωρίς να πετάξουμε όλο το project. Αν από την αρχή έχουμε κοινό `Card` model και κρατήσουμε ξεχωριστά το UI από το persistence layer, το ίδιο Create Card wizard, τα themes, το preview και μεγάλο μέρος του web viewer μπορούν να παραμείνουν ίδια. Η βασική αλλαγή θα είναι ότι στην πρώτη έκδοση το `Card` γίνεται encode στο NFC, ενώ στη δεύτερη αποθηκεύεται στο backend και το NFC κρατά μόνο το card id και το secret.