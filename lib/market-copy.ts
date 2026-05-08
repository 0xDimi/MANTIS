import type { BoardMarket, MarketDetailRead } from '@/lib/alpha-read-model';
import { tr, type UiLang } from '@/lib/ui-lang';

type GreekMarketCopy = {
  question?: string;
  description?: string;
  sourcePrimary?: string;
  sourceFallback?: string;
  voidRule?: string;
  yesLabel?: string;
  noLabel?: string;
};

const categoryCopy: Record<string, { en: string; el: string }> = {
  politics: { en: 'Politics', el: 'Πολιτική' },
  economy: { en: 'Economy', el: 'Οικονομία' },
  weather: { en: 'Weather', el: 'Καιρός' },
  culture: { en: 'Culture', el: 'Πολιτισμός' },
  technology: { en: 'Technology', el: 'Τεχνολογία' },
  sports: { en: 'Sports', el: 'Αθλητισμός' },
  gas: { en: 'Gas Price', el: 'Τιμή Καυσίμων' },
  social: { en: 'Social', el: 'Κοινωνικά' },
  global: { en: 'Global', el: 'Διεθνή' },
  crypto: { en: 'Crypto', el: 'Κρύπτο' },
  ops: { en: 'Operations', el: 'Λειτουργία' }
};

const greekMarketCopyBySlug: Record<string, GreekMarketCopy> = {
  'gre-politics-cabinet-reshuffle-announced': {
    question: 'Θα ανακοινώσει η ελληνική κυβέρνηση ανασχηματισμό πριν το τέλος του μήνα;',
    description: 'Αγορά πολιτικής επικαιρότητας για πιθανό ανασχηματισμό.',
    sourcePrimary: 'ΦΕΚ ή επίσημη ανακοίνωση Γραφείου Πρωθυπουργού',
    sourceFallback: 'Αρχείο ανακοινώσεων της Βουλής',
    voidRule: 'Ακυρώνεται αν δεν δημοσιευτεί επίσημη ανακοίνωση έως τη λήξη.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-politics-opposition-leadership-change': {
    question: 'Θα ανακοινώσει μεγάλο κόμμα της αντιπολίτευσης αλλαγή ηγεσίας μέσα στον μήνα;',
    description: 'Αγορά πολιτικής επικαιρότητας για ενδεχόμενη αλλαγή ηγεσίας.',
    sourcePrimary: 'Επίσημη ανακοίνωση κόμματος',
    sourceFallback: 'Επιβεβαίωση από κορυφαίο ελληνικό μέσο',
    voidRule: 'Ακυρώνεται αν υπάρχουν αντικρουόμενες αναφορές χωρίς επίσημη επιβεβαίωση.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-politics-tsipras-new-party-may15': {
    question: 'Θα ανακοινώσει ο Αλέξης Τσίπρας νέο κόμμα έως τις 15 Μαΐου 2026;',
    description: 'Αγορά για πιθανή ανακοίνωση νέου πολιτικού φορέα.',
    sourcePrimary: 'Επίσημη ανακοίνωση από Αλέξη Τσίπρα ή νέο κόμμα',
    sourceFallback: 'Επιβεβαίωση από κορυφαία ελληνικά μέσα με σαφή δημόσια δήλωση',
    voidRule: 'Ακυρώνεται αν δεν υπάρχει σαφής δημόσια ανακοίνωση έως τη λήξη.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-politics-minister-resignation-before-may15': {
    question: 'Θα παραιτηθεί Έλληνας υπουργός πριν τις 15 Μαΐου 2026;',
    description: 'Αγορά πολιτικής επικαιρότητας για πιθανή παραίτηση υπουργού πριν τα μέσα Μαΐου.',
    sourcePrimary: 'Επίσημη ανακοίνωση της κυβέρνησης ή σχετική δημοσίευση στο ΦΕΚ',
    sourceFallback: 'Δήλωση του ίδιου του υπουργού ή επιβεβαίωση από κορυφαίο ελληνικό μέσο με σαφή δημόσια τεκμηρίωση',
    voidRule: 'Ακυρώνεται αν υπάρχει αποχώρηση χωρίς καθαρή επίσημη ή δημόσια επιβεβαίωση παραίτησης έως τη λήξη.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-economy-inflation-below-2': {
    question: 'Θα δημοσιευτεί ετήσιος ΔΤΚ κάτω από 2,0% στην επόμενη ανακοίνωση της ΕΛΣΤΑΤ;',
    description: 'Αγορά για τον βασικό δείκτη πληθωρισμού.',
    sourcePrimary: 'Δελτίο ΔΤΚ της ΕΛΣΤΑΤ',
    sourceFallback: 'Αντίστοιχη δημοσίευση Eurostat',
    voidRule: 'Ακυρώνεται αν η ΕΛΣΤΑΤ δεν δημοσιεύσει τελικό συγκρίσιμο αποτέλεσμα.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-economy-unemployment-rate-down': {
    question: 'Θα είναι χαμηλότερο το ποσοστό ανεργίας από τον προηγούμενο μήνα στην επόμενη επίσημη ανακοίνωση;',
    description: 'Αγορά για την κατεύθυνση της ανεργίας.',
    sourcePrimary: 'Ανακοίνωση εργατικού δυναμικού της ΕΛΣΤΑΤ',
    sourceFallback: 'Σχετικό dashboard της Eurostat',
    voidRule: 'Ακυρώνεται αν η ανακοίνωση δεν είναι συγκρίσιμη με τον προηγούμενο μήνα.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-economy-banks-deposit-growth': {
    question: 'Θα αυξηθούν οι συνολικές καταθέσεις νοικοκυριών στις ελληνικές τράπεζες σε σχέση με τον προηγούμενο μήνα;',
    description: 'Αγορά για την τάση των τραπεζικών καταθέσεων.',
    sourcePrimary: 'Νομισματικά στατιστικά Τράπεζας της Ελλάδος',
    sourceFallback: 'Αντίστοιχη βάση δεδομένων της ΕΚΤ',
    voidRule: 'Ακυρώνεται αν δεν δημοσιευτεί η μηνιαία σειρά καταθέσεων.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-economy-eu-unemployment-last': {
    question: 'Θα είναι η Ελλάδα τελευταία στην επόμενη κατάταξη ανεργίας της Eurostat (ΕΕ-27);',
    description: 'Αγορά για συγκριτική θέση της Ελλάδας στην ανεργία στην ΕΕ.',
    sourcePrimary: 'Eurostat unemployment table (EU-27)',
    sourceFallback: 'ELSTAT / TradingEconomics mirror with identical ranking',
    voidRule: 'Ακυρώνεται αν δεν δημοσιευτεί συγκρίσιμος πίνακας κατάταξης ΕΕ-27.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-tourism-arrivals-up': {
    question: 'Θα ξεπεράσουν οι μηνιαίες αφίξεις τουριστών το ίδιο διάστημα του προηγούμενου έτους;',
    description: 'Αγορά για τη δυναμική του ελληνικού τουρισμού.',
    sourcePrimary: 'Ανακοίνωση τουρισμού της ΕΛΣΤΑΤ',
    sourceFallback: 'Ανακοίνωση Υπουργείου Τουρισμού',
    voidRule: 'Ακυρώνεται αν δεν δημοσιευτεί συγκρίσιμο ετήσιο στοιχείο.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-energy-power-demand-peak': {
    question: 'Θα καταγράψει η ημερήσια ζήτηση ρεύματος στην Ελλάδα νέο υψηλό μήνα πριν τη λήξη της αγοράς;',
    description: 'Αγορά παρακολούθησης ζήτησης ηλεκτρικής ενέργειας.',
    sourcePrimary: 'Επίσημο dashboard ζήτησης του ΑΔΜΗΕ',
    sourceFallback: 'Δελτίο της Ρυθμιστικής Αρχής Ενέργειας',
    voidRule: 'Ακυρώνεται αν υπάρχει διακοπή δεδομένων άνω των 48 ωρών κοντά στη λήξη.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-weather-athens-heatwave': {
    question: 'Θα καταγραφεί επίσημο επεισόδιο καύσωνα στην Αθήνα πριν το τέλος του μήνα;',
    description: 'Αγορά για καιρικό γεγονός στην Αθήνα.',
    sourcePrimary: 'Επίσημο δελτίο της ΕΜΥ',
    sourceFallback: 'Σύνοψη Πολιτικής Προστασίας',
    voidRule: 'Ακυρώνεται αν αλλάξουν επίσημα τα κριτήρια καύσωνα εντός περιόδου.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-weather-athens-30c-before-may15': {
    question: 'Θα φτάσει η Αθήνα θερμοκρασία 30°C πριν τις 15 Μαΐου 2026;',
    description: 'Αγορά για επίσημη μέγιστη θερμοκρασία στην Αθήνα.',
    sourcePrimary: 'ΕΜΥ / HNMS επίσημα στοιχεία σταθμού Αθήνας',
    sourceFallback: 'Meteo.gr ιστορικό μετρήσεων Αθήνας',
    voidRule: 'Ακυρώνεται αν δεν υπάρχουν διαθέσιμες επίσημες μετρήσεις για το κρίσιμο διάστημα.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-weather-thessaloniki-heavy-rain': {
    question: 'Θα καταγραφεί ημερήσια βροχόπτωση πάνω από 30mm στη Θεσσαλονίκη πριν το τέλος του μήνα;',
    description: 'Αγορά για έντονο καιρικό γεγονός στη Θεσσαλονίκη.',
    sourcePrimary: 'Σταθμοί μέτρησης της ΕΜΥ',
    sourceFallback: 'Αναφορές Πολιτικής Προστασίας',
    voidRule: 'Ακυρώνεται αν η κάλυψη σταθμών λείπει πάνω από 24 ώρες σε κρίσιμες ημέρες.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-culture-film-award-win': {
    question: 'Θα κερδίσει ελληνική παραγωγή σημαντικό διεθνές βραβείο φεστιβάλ σε αυτόν τον κύκλο;',
    description: 'Αγορά πολιτιστικής επικαιρότητας.',
    sourcePrimary: 'Επίσημη σελίδα νικητών του φεστιβάλ',
    sourceFallback: 'Επίσημη ανακοίνωση παραγωγής',
    voidRule: 'Ακυρώνεται αν η κατηγορία βραβείου ακυρωθεί ή αλλάξει ουσιαστικά.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-social-streaming-topshow': {
    question: 'Θα μπει ελληνική σειρά σε κορυφαίο περιφερειακό chart streaming μέσα στον μήνα;',
    description: 'Αγορά για τάσεις στη streaming ψυχαγωγία.',
    sourcePrimary: 'Επίσημη περιφερειακή λίστα πλατφόρμας',
    sourceFallback: 'Δημόσια ανακοίνωση στούντιο',
    voidRule: 'Ακυρώνεται αν η πλατφόρμα διακόψει τη δημοσίευση του chart.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-social-adonis-posts-over-300-monthend': {
    question: 'Θα κάνει ο Άδωνις Γεωργιάδης πάνω από 300 δημοσιεύσεις στο X πριν το τέλος του μήνα;',
    description: 'Αγορά social activity μόνο για original posts (χωρίς reposts).',
    sourcePrimary: 'X advanced search για @AdonisGeorgiadi με φίλτρο -is:retweet',
    sourceFallback: 'X profile post timeline και exported count από verified recorder',
    voidRule: 'Ακυρώνεται αν το X είναι μη διαθέσιμο ή αν τα δεδομένα λείπουν για πάνω από 24 ώρες κοντά στη λήξη.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-social-adonis-posts-on-20-distinct-days-in-may': {
    question: 'Θα ποστάρει ο Άδωνις Γεωργιάδης σε 20 διαφορετικές ημέρες μέσα στον Μάιο 2026;',
    description: 'Αγορά social activity για distinct posting days μόνο από original posts στο X.',
    sourcePrimary: 'Direct profile timeline του @AdonisGeorgiadi με day-count για 1-31 Μαΐου 2026',
    sourceFallback: 'X advanced search cross-check για from:AdonisGeorgiadi since:2026-05-01 until:2026-06-01 -is:retweet',
    voidRule: 'Ακυρώνεται αν το timeline/counting workflow δεν είναι καθαρά auditable ή αν το X λείπει για πάνω από 24 ώρες κοντά στη λήξη.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-health-hantavirus-case-by-may31': {
    question: 'Θα αναφέρει ο ΕΟΔΥ επιβεβαιωμένο ανθρώπινο κρούσμα hantavirus στην Ελλάδα έως τις 31 Μαΐου 2026;',
    description: 'Αγορά υγειονομικής επικαιρότητας με βάση δημόσια αναφορά του ΕΟΔΥ για εργαστηριακά επιβεβαιωμένο ανθρώπινο κρούσμα hantavirus στην Ελλάδα έως το τέλος του μήνα.',
    sourcePrimary: 'Δημόσιες ανακοινώσεις ή ενημερώσεις νοσημάτων του ΕΟΔΥ που αναφέρουν ρητά επιβεβαιωμένο ανθρώπινο κρούσμα hantavirus στην Ελλάδα',
    sourceFallback: 'Ανακοίνωση του Υπουργείου Υγείας και στη συνέχεια WHO ή ECDC μόνο αν δηλώνουν ρητά επιβεβαιωμένο ανθρώπινο κρούσμα hantavirus στην Ελλάδα',
    voidRule: 'Ακυρώνεται αν λείπει επίσημη ελληνική ενημέρωση κοντά στη λήξη και καμία fallback πηγή δεν επιβεβαιώνει ή αποκλείει καθαρά επιβεβαιωμένο ανθρώπινο κρούσμα hantavirus στην Ελλάδα έως την προθεσμία.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'global-us-iran-final-agreement-apr30': {
    question: 'Θα καταλήξουν οι ΗΠΑ και το Ιράν σε τελική συμφωνία έως τις 30 Απριλίου 2026;',
    description: 'Αγορά διεθνούς επικαιρότητας για επίσημη διμερή συμφωνία.',
    sourcePrimary: 'Επίσημες ανακοινώσεις από τις κυβερνήσεις ΗΠΑ και Ιράν',
    sourceFallback: 'Reuters / AP με ρητή αναφορά επιβεβαίωσης και από τις δύο πλευρές',
    voidRule: 'Ακυρώνεται αν δεν υπάρχει δημόσια επιβεβαίωση τελικής συμφωνίας και από τις δύο κυβερνήσεις έως τη λήξη.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'global-us-iran-new-talks-announced-before-may15': {
    question: 'Θα ανακοινώσουν οι ΗΠΑ και το Ιράν νέες συνομιλίες πριν τις 15 Μαΐου 2026;',
    description: 'Αγορά διεθνούς επικαιρότητας για επίσημη ανακοίνωση νέου γύρου συνομιλιών μεταξύ ΗΠΑ και Ιράν.',
    sourcePrimary: 'Επίσημη ανακοίνωση από τις κυβερνήσεις των ΗΠΑ ή του Ιράν για νέο γύρο συνομιλιών',
    sourceFallback: 'Reuters ή AP με σαφή αναφορά ότι ανακοινώθηκαν νέες συνομιλίες από επίσημες πλευρές',
    voidRule: 'Ακυρώνεται αν εμφανιστούν ανεπίσημες διαρροές χωρίς καθαρή δημόσια ανακοίνωση νέων συνομιλιών έως τη λήξη.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-gas-unleaded-above-2-monthend': {
    question: 'Θα μείνει η μέση τιμή αμόλυβδης 95 στην Ελλάδα πάνω από €2,00/λίτρο στο τελευταίο Weekly Oil Bulletin πριν το τέλος του μήνα;',
    description: 'Αγορά για εθνική μέση τιμή καυσίμου στην Ελλάδα.',
    sourcePrimary: 'European Commission Weekly Oil Bulletin',
    sourceFallback: 'data.europa.eu mirror του Oil Bulletin',
    voidRule: 'Ακυρώνεται αν δεν δημοσιευτεί το αναμενόμενο εβδομαδιαίο δελτίο πριν το τέλος του μήνα.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-sports-aek-superleague-title': {
    question: 'Θα κατακτήσει η ΑΕΚ τον τίτλο της Super League αυτή τη σεζόν;',
    description: 'Αγορά αθλητικής επικαιρότητας για τον τίτλο Super League.',
    sourcePrimary: 'Επίσημη βαθμολογία και ανακοίνωση Super League',
    sourceFallback: 'ΕΠΟ / UEFA competition records',
    voidRule: 'Ακυρώνεται αν η διοργάνωση διακοπεί οριστικά ή αλλάξει format χωρίς επίσημο πρωταθλητή.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-sports-euroleague-final': {
    question: 'Θα φτάσει ελληνική ομάδα στον τελικό της EuroLeague;',
    description: 'Αγορά αθλητικής επικαιρότητας για συμμετοχή ελληνικής ομάδας στον τελικό της EuroLeague.',
    sourcePrimary: 'Επίσημο πρόγραμμα, bracket ή αποτελέσματα της EuroLeague',
    sourceFallback: 'FIBA ή επίσημες ανακοινώσεις των συλλόγων με σαφή πρόκριση στον τελικό',
    voidRule: 'Ακυρώνεται αν αλλάξει ουσιωδώς η μορφή της διοργάνωσης ή δεν διεξαχθεί επίσημος τελικός.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'crypto-btc-close-above-80k': {
    question: 'Θα κλείσει το BTC πάνω από $80.000 (UTC daily close) πριν το τέλος του μήνα;',
    description: 'Αγορά για επίπεδο τιμής BTC.',
    sourcePrimary: 'Coinbase BTC-USD official daily close (UTC)',
    sourceFallback: 'Binance + Kraken UTC daily close confirmation',
    voidRule: 'Ακυρώνεται αν δεν είναι διαθέσιμο αξιόπιστο UTC daily close από τουλάχιστον μία κύρια πηγή.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'crypto-btc-daily-close-above-82k-before-may15': {
    question: 'Θα κλείσει το BTC πάνω από $82.000 σε ημερήσιο κλείσιμο UTC πριν τις 15 Μαΐου 2026;',
    description: 'Αγορά κρύπτο για ημερήσιο κλείσιμο BTC πάνω από το όριο των $82.000 πριν τα μέσα Μαΐου.',
    sourcePrimary: 'Επίσημο ημερήσιο κλείσιμο BTC-USD της Coinbase σε UTC',
    sourceFallback: 'Επιβεβαίωση UTC daily close από Binance και Kraken',
    voidRule: 'Ακυρώνεται αν δεν υπάρχει αξιόπιστο UTC daily close από τουλάχιστον μία κύρια spot πηγή για την κρίσιμη ημέρα.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-tech-ai-startup-round': {
    question: 'Θα ανακοινώσει ελληνική startup AI γύρο χρηματοδότησης άνω των €5 εκατ. αυτό το τρίμηνο;',
    description: 'Αγορά για χρηματοδοτήσεις τεχνολογίας.',
    sourcePrimary: 'Επίσημη ανακοίνωση εταιρείας και διαθέσιμες καταχωρίσεις',
    sourceFallback: 'Επιβεβαίωση από κορυφαίο μέσο',
    voidRule: 'Ακυρώνεται αν το ποσό δεν μπορεί να επιβεβαιωθεί από πρωτογενή πηγή.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-politics-election-seat-majority': {
    question: 'Θα υπάρξει κοινοβουλευτική πλειοψηφία πάνω από το όριο στην επόμενη εκλογική αναμέτρηση;',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-banks-npl-ratio-down': {
    question: 'Θα μειωθεί ο δείκτης NPL των ελληνικών τραπεζών στην επόμενη δημοσίευση;',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-sports-olympiacos-title': {
    question: 'Θα κατακτήσει τίτλο ο Ολυμπιακός σε αυτή την αγωνιστική περίοδο;',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-sports-euroleague-final4': {
    question: 'Θα προκριθεί ελληνική ομάδα στο Final Four της EuroLeague;',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-crypto-eurc-volume-up': {
    question: 'Θα αυξηθεί ο μηνιαίος όγκος του EURC σε σχέση με τον προηγούμενο μήνα;',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  }
};

export function labelize(value: string) {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\w\S*/g, (part) => part.charAt(0).toUpperCase() + part.slice(1));
}

export function localizedCategory(category: string, lang: UiLang) {
  const key = (category ?? '').toLowerCase();
  const copy = categoryCopy[key];

  if (!copy) {
    return labelize(category ?? '');
  }

  return lang === 'el' ? copy.el : copy.en;
}

export function localizedOutcomeLabel(label: string | null | undefined, fallback: 'yes' | 'no', lang: UiLang) {
  if (lang === 'el') {
    return fallback === 'yes' ? 'Ναι' : 'Όχι';
  }

  const baseline = fallback === 'yes' ? 'Yes' : 'No';
  const value = (label ?? '').trim();

  if (!value) return baseline;
  if (value.toLowerCase() === fallback) return baseline;

  return value;
}

export function localizedMarketStatus(status: string, lang: UiLang, mode: 'short' | 'long' = 'short') {
  const normalized = (status ?? '').toLowerCase();

  switch (normalized) {
    case 'open':
      return mode === 'long' ? tr(lang, 'Open for trading', 'Ανοιχτή για διαπραγμάτευση') : tr(lang, 'Open', 'Ανοιχτή');
    case 'draft':
    case 'opening_soon':
    case 'opening soon':
      return mode === 'long' ? tr(lang, 'Opening soon', 'Έρχεται σύντομα') : tr(lang, 'Opening soon', 'Έρχεται');
    case 'paused':
      return mode === 'long' ? tr(lang, 'Temporarily paused', 'Προσωρινά σε παύση') : tr(lang, 'Paused', 'Σε παύση');
    case 'closed':
      return mode === 'long' ? tr(lang, 'Trading closed', 'Η διαπραγμάτευση έκλεισε') : tr(lang, 'Closed', 'Κλειστή');
    case 'resolved':
      return tr(lang, 'Resolved', 'Επιλυμένη');
    case 'settled':
      return tr(lang, 'Settled', 'Διακανονισμένη');
    case 'void':
      return tr(lang, 'Void', 'Ακυρωμένη');
    default:
      return labelize(status ?? '');
  }
}

export function localizeBoardMarketCopy(market: BoardMarket, lang: UiLang): BoardMarket {
  if (lang !== 'el') {
    return market;
  }

  const copy = greekMarketCopyBySlug[market.slug];

  return {
    ...market,
    question: copy?.question ?? market.question
  };
}

export function localizeMarketDetailCopy(market: MarketDetailRead, lang: UiLang): MarketDetailRead {
  if (lang !== 'el') {
    return market;
  }

  const copy = greekMarketCopyBySlug[market.slug];

  return {
    ...market,
    question: copy?.question ?? market.question,
    description: copy?.description ?? market.description,
    sourcePrimary: copy?.sourcePrimary ?? market.sourcePrimary,
    sourceFallback: copy?.sourceFallback ?? market.sourceFallback,
    voidRule: copy?.voidRule ?? market.voidRule,
    yesLabel: copy?.yesLabel ?? localizedOutcomeLabel(market.yesLabel, 'yes', lang),
    noLabel: copy?.noLabel ?? localizedOutcomeLabel(market.noLabel, 'no', lang)
  };
}

export function localizedMarketSearchBlob(market: BoardMarket, lang: UiLang) {
  const localized = localizeBoardMarketCopy(market, lang);
  const localizedCategoryLabel = localizedCategory(market.category, lang);
  return `${localized.question} ${localizedCategoryLabel} ${market.question} ${market.category}`.toLowerCase();
}

export function localizedQuestionFromSlug(slug: string, fallbackQuestion: string, lang: UiLang) {
  if (lang !== 'el') return fallbackQuestion;
  return greekMarketCopyBySlug[slug]?.question ?? fallbackQuestion;
}
