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
  'gre-politics-tsipras-new-party-before-jun1': {
    question: 'Θα ανακοινώσει ο Αλέξης Τσίπρας νέο πολιτικό κόμμα πριν την 1η Ιουνίου 2026;',
    description: 'Αγορά για πιθανή ανακοίνωση νέου πολιτικού φορέα πριν την 1η Ιουνίου.',
    sourcePrimary: 'Επίσημη ανακοίνωση από Αλέξη Τσίπρα ή νέο κόμμα',
    sourceFallback: 'Επιβεβαίωση από κορυφαία ελληνικά μέσα με σαφή δημόσια δήλωση',
    voidRule: 'Ακυρώνεται αν δεν υπάρχει σαφής δημόσια ανακοίνωση έως τη λήξη.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-politics-samaras-new-party-before-jun30-2026': {
    question: 'Θα ανακοινώσει ο Αντώνης Σαμαράς νέο πολιτικό κόμμα πριν τις 30 Ιουνίου 2026;',
    description: 'Αγορά πολιτικής επικαιρότητας για το αν ο πρώην πρωθυπουργός Αντώνης Σαμαράς θα ανακοινώσει δημόσια τη δημιουργία ή την ίδρυση νέου πολιτικού κόμματος πριν τις 30 Ιουνίου 2026.',
    sourcePrimary: 'Επίσημη δημόσια δήλωση του Αντώνη Σαμαρά, επίσημο κανάλι νέου κόμματος ή επίσημη καταχώριση κόμματος που δείχνει ανακοίνωση πριν τις 30 Ιουνίου 2026 00:00 ώρα Ελλάδας',
    sourceFallback: 'ΑΠΕ-ΜΠΕ, Reuters, Associated Press, eKathimerini, Το Βήμα, Πρώτο Θέμα, ΣΚΑΪ ή άλλο αξιόπιστο πανελλαδικό ελληνικό μέσο που αναφέρει άμεση δημόσια ανακοίνωση από τον Σαμαρά ή επίσημους εκπροσώπους του',
    voidRule: 'YES μόνο αν ο Αντώνης Σαμαράς ανακοινώσει δημόσια τη δημιουργία, το όνομα ή την έναρξη νέου πολιτικού κόμματος πριν τις 30 Ιουνίου 2026 00:00 ώρα Ελλάδας. NO για φήμες, διερευνητικές επαφές, ομιλίες-μανιφέστο, στήριξη άλλου κόμματος ή ανακοίνωση στις/μετά τις 30 Ιουνίου. Ακυρώνεται μόνο αν τα δημόσια στοιχεία είναι ουσιωδώς αντικρουόμενα και δεν μπορεί να εξακριβωθεί αν υπήρξε εμπρόθεσμη ανακοίνωση.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-politics-election-before-2027': {
    question: 'Θα γίνουν εθνικές εκλογές στην Ελλάδα πριν το 2027;',
    description: 'Αγορά πολιτικής επικαιρότητας για το αν η Ελλάδα θα διεξαγάγει εθνικές βουλευτικές εκλογές πριν την 1η Ιανουαρίου 2027.',
    sourcePrimary: 'Επίσημη σελίδα αποτελεσμάτων εθνικών εκλογών του Υπουργείου Εσωτερικών, προεδρικό διάταγμα διάλυσης της Βουλής ή άλλη επίσημη κρατική δημοσίευση που επιβεβαιώνει ότι διεξήχθησαν βουλευτικές εκλογές πριν τη λήξη',
    sourceFallback: 'Reuters, Associated Press ή μεγάλο πανελλαδικό ελληνικό μέσο μόνο αν αναφέρει καθαρά ότι διεξήχθησαν εθνικές βουλευτικές εκλογές πριν τη λήξη και αυτό συνδέεται με την επίσημη εκλογική διαδικασία',
    voidRule: 'YES αν διεξαχθούν εθνικές βουλευτικές εκλογές στην Ελλάδα οποιαδήποτε στιγμή πριν από την 1η Ιανουαρίου 2027 ώρα Ελλάδας. Μετρούν πρόωρες, έκτακτες ή κανονικά προγραμματισμένες εθνικές βουλευτικές εκλογές. Δεν μετρούν ευρωεκλογές, αυτοδιοικητικές εκλογές, εσωκομματικές ψηφοφορίες, ανασχηματισμοί, ψήφοι εμπιστοσύνης ή απλή ανακοίνωση εκλογών. Ακυρώνεται μόνο αν τα επίσημα δημόσια στοιχεία είναι ουσιωδώς αντικρουόμενα ή μη διαθέσιμα μετά το παράθυρο επίλυσης.',
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
    question: 'Θα δημοσιευτεί ετήσιος πληθωρισμός ΔΤΚ κάτω από 2,0% στην επόμενη ανακοίνωση της ΕΛΣΤΑΤ;',
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
  'gre-economy-cpi-above-5-may2026': {
    question: 'Θα είναι ο ετήσιος πληθωρισμός ΔΤΚ της Ελλάδας για τον Μάιο 2026 πάνω από 5,0%, σύμφωνα με την ανακοίνωση της ΕΛΣΤΑΤ στις 10 Ιουνίου 2026;',
    description: 'Μακροοικονομική αγορά για το αν ο ετήσιος πληθωρισμός ΔΤΚ της Ελλάδας θα μείνει πάνω από το όριο του 5,0% στην ανακοίνωση της ΕΛΣΤΑΤ για τον Μάιο 2026.',
    sourcePrimary: 'Δελτίο Δείκτη Τιμών Καταναλωτή της ΕΛΣΤΑΤ για τον Μάιο 2026',
    sourceFallback: 'Eurostat ή TradingEconomics μόνο αν αναπαράγει καθαρά την ίδια τελική ετήσια μέτρηση ΔΤΚ της ΕΛΣΤΑΤ για τον Μάιο 2026',
    voidRule: 'Ακυρώνεται αν η ΕΛΣΤΑΤ δεν δημοσιεύσει συγκρίσιμη τελική ετήσια μέτρηση ΔΤΚ για τον Μάιο 2026 ή αν η προγραμματισμένη ανακοίνωση καθυστερήσει χωρίς καθαρό τελικό αποτέλεσμα εγκαίρως για διακανονισμό.',
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
  'gre-economy-unemployment-below-95-may2026': {
    question: 'Θα είναι κάτω από 9,5% η εποχικά διορθωμένη ανεργία της Ελλάδας για τον Μάιο 2026 στην ανακοίνωση της ΕΛΣΤΑΤ την 1η Ιουλίου 2026;',
    description: 'Μακροοικονομική αγορά για το αν η εποχικά διορθωμένη ανεργία της Ελλάδας θα πέσει κάτω από το όριο του 9,5% στην ανακοίνωση της ΕΛΣΤΑΤ για τον Μάιο 2026.',
    sourcePrimary: 'Μηνιαία ανακοίνωση Έρευνας Εργατικού Δυναμικού της ΕΛΣΤΑΤ για τον Μάιο 2026',
    sourceFallback: 'Eurostat ή TradingEconomics μόνο αν αναπαράγει καθαρά την ίδια τελική εποχικά διορθωμένη μέτρηση ανεργίας της ΕΛΣΤΑΤ για τον Μάιο 2026',
    voidRule: 'YES αν η ΕΛΣΤΑΤ δημοσιεύσει εποχικά διορθωμένη ανεργία Μάιου 2026 αυστηρά κάτω από 9,5%. NO αν είναι 9,5% ή υψηλότερα. Ακυρώνεται αν δεν δημοσιευτεί συγκρίσιμη τελική μέτρηση εγκαίρως για διακανονισμό.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-markets-athex-general-index-2300-may29-2026': {
    question: 'Θα κλείσει ο Γενικός Δείκτης του Χρηματιστηρίου Αθηνών πάνω από τις 2.300 μονάδες έως την Παρασκευή 29 Μαΐου 2026;',
    description: 'Αγορά για το αν ο Γενικός Δείκτης του Χρηματιστηρίου Αθηνών θα καταγράψει επίσημο κλείσιμο πάνω από τις 2.300,00 μονάδες μέχρι και τη συνεδρίαση της 29ης Μαΐου 2026.',
    sourcePrimary: 'ATHEXGroup / Χρηματιστήριο Αθηνών, επίσημες τιμές κλεισίματος δεικτών, Γενικός Δείκτης',
    sourceFallback: 'Επίσημο ημερήσιο δελτίο ATHEXGroup ή αναπαραγωγή της ίδιας επίσημης τιμής κλεισίματος από καθιερωμένο οικονομικό μέσο μόνο αν η σελίδα τιμών κλεισίματος δεν είναι διαθέσιμη',
    voidRule: 'Ακυρώνεται μόνο αν το Χρηματιστήριο Αθηνών δεν δημοσιεύσει συγκρίσιμη επίσημη τιμή κλεισίματος για τον Γενικό Δείκτη για το κρίσιμο διάστημα.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-markets-athex-general-index-2415-jun12-2026': {
    question: 'Θα κλείσει ο Γενικός Δείκτης του Χρηματιστηρίου Αθηνών πάνω από τις 2.415 μονάδες έως την Παρασκευή 12 Ιουνίου 2026;',
    description: 'Αγορά για το αν ο Γενικός Δείκτης του Χρηματιστηρίου Αθηνών θα καταγράψει επίσημο κλείσιμο πάνω από τις 2.415,00 μονάδες μέχρι και τη συνεδρίαση της 12ης Ιουνίου 2026.',
    sourcePrimary: 'ATHEXGroup / Χρηματιστήριο Αθηνών, επίσημες τιμές κλεισίματος δεικτών, Γενικός Δείκτης',
    sourceFallback: 'Επίσημο ημερήσιο δελτίο ATHEXGroup ή αναπαραγωγή της ίδιας επίσημης τιμής κλεισίματος από καθιερωμένο οικονομικό μέσο μόνο αν η σελίδα τιμών κλεισίματος δεν είναι διαθέσιμη',
    voidRule: 'YES αν ο επίσημος Γενικός Δείκτης κλείσει αυστηρά πάνω από τις 2.415,00 μονάδες σε οποιαδήποτε συνεδρίαση έως και τις 12 Ιουνίου 2026. NO αν δεν υπάρξει τέτοιο κλείσιμο. Ακυρώνεται μόνο αν δεν δημοσιευτεί συγκρίσιμη επίσημη τιμή κλεισίματος για το κρίσιμο διάστημα.',
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
  'gre-weather-athens-33c-by-jun15-2026': {
    question: 'Θα ξεπεράσει η μέγιστη θερμοκρασία στην Αθήνα τους 33°C έως και τις 15 Ιουνίου 2026;',
    description: 'Αγορά καιρού για το αν η επίσημη μέγιστη θερμοκρασία αέρα στην Αθήνα θα ξεπεράσει τους 33,0°C έως τη λήξη της 15ης Ιουνίου 2026.',
    sourcePrimary: 'Εθνικό Αστεροσκοπείο Αθηνών / meteo.gr, σταθμός ΑΘΗΝΑ - ΚΕΝΤΡΟ, ημερήσια μέγιστη θερμοκρασία αέρα',
    sourceFallback: 'ΕΜΥ / HNMS επίσημος σταθμός Αθήνας μόνο αν τα δεδομένα του meteo.gr για το κρίσιμο διάστημα δεν είναι διαθέσιμα',
    voidRule: 'Ακυρώνεται αν δεν υπάρχουν συγκρίσιμα επίσημα στοιχεία μέγιστης θερμοκρασίας για την Αθήνα για το κρίσιμο διάστημα από καμία από τις ορισμένες πηγές.',
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
  'gre-culture-greece-top-5-eurovision-final': {
    question: 'Θα τερματίσει η Ελλάδα στην πρώτη πεντάδα του τελικού της Eurovision 2026;',
    description: 'Αγορά πολιτιστικής επικαιρότητας για την τελική θέση της Ελλάδας στον μεγάλο τελικό της Eurovision 2026.',
    sourcePrimary: 'Επίσημος πίνακας τελικής βαθμολογίας της Eurovision',
    sourceFallback: 'Επίσημη σελίδα αποτελεσμάτων της Eurovision',
    voidRule: 'Ακυρώνεται αν δεν δημοσιευτεί επίσημος πίνακας αποτελεσμάτων του τελικού ή αν ο τελικός ακυρωθεί ή αλλάξει ουσιωδώς.',
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
  'gre-social-heraklion-airport-protest-jun24-2026': {
    question: 'Θα γίνει η διαμαρτυρία στο αεροδρόμιο Ηρακλείου στις 24 Ιουνίου 2026;',
    description: 'Αγορά κοινωνικής επικαιρότητας για το αν εργαζόμενοι σε τουρισμό και επισιτισμό θα πραγματοποιήσουν ή θα μεταφέρουν δράση διαμαρτυρίας στο αεροδρόμιο Ηρακλείου στις 24 Ιουνίου 2026, στο πλαίσιο της προαναγγελθείσας απεργίας.',
    sourcePrimary: 'Δημόσια ανακοίνωση ή μετενημέρωση από το Σωματείο Ξενοδοχοϋπαλλήλων Ηρακλείου, την ΠΟΕΕΤ, το Εργατικό Κέντρο Ηρακλείου, την αρχή του αεροδρομίου Ηρακλείου ή αρμόδιες τοπικές αρχές που επιβεβαιώνει αν έγινε η διαμαρτυρία στο αεροδρόμιο',
    sourceFallback: 'Αξιόπιστη κάλυψη από ελληνικό πανελλαδικό ή τοπικό μέσο της Κρήτης με καθαρή αναφορά, φωτογραφίες ή βίντεο για διαμαρτυρία στις 24 Ιουνίου 2026 στο ή ακριβώς έξω από το αεροδρόμιο Ηρακλείου',
    voidRule: 'YES αν στις 24 Ιουνίου 2026 γίνει συγκέντρωση, πορεία, απόπειρα αποκλεισμού ή μηχανοκίνητη διαμαρτυρία εργαζομένων σχετική με την απεργία επισιτισμού/τουρισμού στο, προς ή ακριβώς έξω από το αεροδρόμιο Ηρακλείου. NO αν δεν γίνει τέτοια δράση στο αεροδρόμιο εκείνη την ημέρα, ακόμη κι αν γίνει απεργία ή διαμαρτυρία αλλού. Ακυρώνεται μόνο αν δεν υπάρχουν αξιόπιστα δημόσια στοιχεία ή αν τα στοιχεία είναι ουσιωδώς αντικρουόμενα μετά το παράθυρο επίλυσης.',
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
  'global-us-iran-final-agreement-before-may31': {
    question: 'Θα καταλήξουν οι ΗΠΑ και το Ιράν σε τελική συμφωνία έως τις 31 Μαΐου 2026;',
    description: 'Αγορά διεθνούς επικαιρότητας για επίσημη διμερή συμφωνία.',
    sourcePrimary: 'Επίσημες ανακοινώσεις από τις κυβερνήσεις ΗΠΑ και Ιράν',
    sourceFallback: 'Reuters / AP με ρητή αναφορά επιβεβαίωσης και από τις δύο πλευρές',
    voidRule: 'Ακυρώνεται αν δεν υπάρχει δημόσια επιβεβαίωση τελικής συμφωνίας και από τις δύο κυβερνήσεις έως τη λήξη.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'global-us-invade-iran-by-jun30': {
    question: 'Θα εισβάλουν οι ΗΠΑ στο Ιράν έως τις 30 Ιουνίου 2026;',
    description: 'Αγορά διεθνούς επικαιρότητας που λύνει στο YES μόνο αν οι ΗΠΑ ξεκινήσουν σαφή στρατιωτική εισβολή σε ιρανικό έδαφος πριν από τη λήξη.',
    sourcePrimary: 'Επίσημες ανακοινώσεις από τον Λευκό Οίκο, το Υπουργείο Άμυνας των ΗΠΑ ή την ιρανική κυβέρνηση',
    sourceFallback: 'Reuters ή AP με σαφή αναφορά ότι αμερικανική εισβολή στο ιρανικό έδαφος βρίσκεται σε εξέλιξη',
    voidRule: 'Ακυρώνεται αν υπάρξουν μόνο αεροπορικά πλήγματα, πυραυλικές επιθέσεις, ναυτικά επεισόδια, επιχειρήσεις δι’ αντιπροσώπων ή συγκεχυμένες αναφορές χωρίς καθαρή έναρξη αμερικανικής εισβολής σε ιρανικό έδαφος έως τη λήξη.',
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
  'global-albania-rama-ceases-pm-before-2027': {
    question: 'Θα πάψει ο Έντι Ράμα να είναι πρωθυπουργός της Αλβανίας πριν από τις 31 Δεκεμβρίου 2026;',
    description: 'Αγορά διεθνούς πολιτικής για το αν ο Έντι Ράμα θα σταματήσει να κατέχει το αξίωμα του πρωθυπουργού της Αλβανίας πριν από το τέλος του 2026, είτε μέσω παραίτησης, παύσης, ψήφου δυσπιστίας, ορισμού διαδόχου ή άλλης επίσημης αποχώρησης από το αξίωμα.',
    sourcePrimary: 'Επίσημες ανακοινώσεις από το γραφείο του Πρωθυπουργού της Αλβανίας, τον Πρόεδρο της Αλβανίας, το Κοινοβούλιο της Αλβανίας ή το επίσημο δελτίο/εφημερίδα της κυβέρνησης που δείχνει ότι ο Ράμα δεν είναι πλέον πρωθυπουργός',
    sourceFallback: 'Reuters, Associated Press ή BIRN μόνο αν αναφέρουν καθαρά ότι ο Έντι Ράμα έπαψε να υπηρετεί ως πρωθυπουργός ή ότι άλλος πρωθυπουργός ανέλαβε επίσημα πριν από τη λήξη',
    voidRule: 'YES αν ο Έντι Ράμα πάψει να κατέχει το αξίωμα του πρωθυπουργού της Αλβανίας οποιαδήποτε στιγμή πριν από τις 31 Δεκεμβρίου 2026 23:59 ώρα Τιράνων. Αυτό περιλαμβάνει παραίτηση, παύση, απώλεια ψήφου εμπιστοσύνης με επίσημη αποχώρηση από το αξίωμα, θάνατο ή αντικατάσταση από νέο πρωθυπουργό. NO αν παραμείνει πρωθυπουργός έως τη λήξη. Δεν μετρούν προσωρινές απουσίες, πολιτικές κρίσεις χωρίς επίσημη αποχώρηση ή απλές φήμες. Ακυρώνεται μόνο αν τα επίσημα δημόσια στοιχεία για το ποιος κατείχε το αξίωμα στη λήξη είναι ουσιωδώς αντικρουόμενα ή μη διαθέσιμα.',
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
  'gre-gas-unleaded-above-2-first-may-bulletin': {
    question: 'Θα παραμείνει η μέση τιμή Euro-super 95 στην Ελλάδα πάνω από €2,00/λίτρο στο πρώτο Weekly Oil Bulletin της ΕΕ για τον Μάιο 2026;',
    description: 'Βραχυχρόνια αγορά καυσίμων συνδεδεμένη με την πρώτη δημοσίευση του EC Weekly Oil Bulletin για την Ελλάδα μέσα στον Μάιο 2026.',
    sourcePrimary: 'European Commission Weekly Oil Bulletin (eurosuper 95, Greece)',
    sourceFallback: 'data.europa.eu mirror του Oil Bulletin dataset',
    voidRule: 'Ακυρώνεται αν δεν δημοσιευτεί εγκαίρως το πρώτο επιλέξιμο δελτίο του Μαΐου για επαλήθευση.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-gas-unleaded-above-213-jun04-2026': {
    question: 'Θα είναι πάνω από €2,13/λίτρο η μέση τιμή Euro-super 95 στην Ελλάδα στο EC Weekly Oil Bulletin της 4ης Ιουνίου 2026;',
    description: 'Βραχυχρόνια αγορά καυσίμων βασισμένη στη γραμμή Greece και στη στήλη Euro-super 95 του Weekly Oil Bulletin της Ευρωπαϊκής Επιτροπής.',
    sourcePrimary: 'European Commission Weekly Oil Bulletin, Prices with taxes latest prices xlsx, γραμμή Greece, στήλη Euro-super 95',
    sourceFallback: 'data.europa.eu mirror του Oil Bulletin dataset μόνο αν αναπαράγει καθαρά την ίδια εβδομαδιαία τιμή της Ευρωπαϊκής Επιτροπής για Ελλάδα Euro-super 95 με φόρους',
    voidRule: 'YES αν η τιμή είναι αυστηρά πάνω από 2.130 EUR ανά 1000L. NO αν είναι 2.130 EUR ανά 1000L ή χαμηλότερα. Ακυρώνεται αν δεν δημοσιευτεί συγκρίσιμη τιμή για το επιλέξιμο δελτίο εγκαίρως για διακανονισμό.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-gas-unleaded-above-206-jun11-2026': {
    question: 'Θα παραμείνει πάνω από €2,06 το λίτρο η μέση τιμή της αμόλυβδης 95 στην Ελλάδα;',
    description: 'Νέα αγορά-διάδοχος καυσίμων βασισμένη στο τρέχον print της 4ης Ιουνίου 2026, όπου η γραμμή Greece για Euro-super 95 έκλεισε στα 2.064 EUR ανά 1000L με φόρους.',
    sourcePrimary: 'European Commission Weekly Oil Bulletin, Prices with taxes latest prices xlsx, γραμμή Greece, στήλη Euro-super 95',
    sourceFallback: 'data.europa.eu mirror του Oil Bulletin dataset μόνο αν αναπαράγει καθαρά την ίδια εβδομαδιαία τιμή της Ευρωπαϊκής Επιτροπής για Ελλάδα Euro-super 95 με φόρους',
    voidRule: 'YES αν το EC Weekly Oil Bulletin της 11ης Ιουνίου 2026 δείξει Greece Euro-super 95 αυστηρά πάνω από 2.060 EUR ανά 1000L. NO αν είναι 2.060 EUR ανά 1000L ή χαμηλότερα. Ακυρώνεται αν δεν δημοσιευτεί συγκρίσιμη τιμή για το επιλέξιμο δελτίο εγκαίρως για διακανονισμό.',
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
  'gre-sports-olympiacos-uefa-league-phase-2026-27': {
    question: 'Θα μπει ο Ολυμπιακός σε league phase διοργάνωσης UEFA το 2026/27;',
    description: 'Ποδοσφαιρική αγορά για το αν ο Ολυμπιακός θα εμφανιστεί σε league phase του Champions League, Europa League ή Conference League τη σεζόν 2026/27.',
    sourcePrimary: 'Επίσημες κληρώσεις, αποτελέσματα και τελικές λίστες league phase της UEFA για Champions League, Europa League και Conference League 2026/27',
    sourceFallback: 'Επίσημες ανακοινώσεις του Ολυμπιακού μόνο αν επιβεβαιώνουν καθαρά συμμετοχή σε league phase και συμφωνούν με τις λίστες της UEFA',
    voidRule: 'ΝΑΙ αν ο Ολυμπιακός εμφανίζεται επίσημα από την UEFA σε league phase του Champions League, Europa League ή Conference League 2026/27. ΟΧΙ διαφορετικά. Ακυρώνεται μόνο αν η UEFA αλλάξει ουσιωδώς τη μορφή των διοργανώσεων ώστε να μην μπορεί να προσδιοριστεί καθαρά η συμμετοχή σε league phase.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-sports-panathinaikos-uefa-league-phase-2026-27': {
    question: 'Θα μπει ο Παναθηναϊκός σε league phase διοργάνωσης UEFA το 2026/27;',
    description: 'Ποδοσφαιρική αγορά για το αν ο Παναθηναϊκός θα εμφανιστεί σε league phase του Champions League, Europa League ή Conference League τη σεζόν 2026/27.',
    sourcePrimary: 'Επίσημες κληρώσεις, αποτελέσματα και τελικές λίστες league phase της UEFA για Champions League, Europa League και Conference League 2026/27',
    sourceFallback: 'Επίσημες ανακοινώσεις του Παναθηναϊκού μόνο αν επιβεβαιώνουν καθαρά συμμετοχή σε league phase και συμφωνούν με τις λίστες της UEFA',
    voidRule: 'ΝΑΙ αν ο Παναθηναϊκός εμφανίζεται επίσημα από την UEFA σε league phase του Champions League, Europa League ή Conference League 2026/27. ΟΧΙ διαφορετικά. Ακυρώνεται μόνο αν η UEFA αλλάξει ουσιωδώς τη μορφή των διοργανώσεων ώστε να μην μπορεί να προσδιοριστεί καθαρά η συμμετοχή σε league phase.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-sports-paok-uefa-league-phase-2026-27': {
    question: 'Θα μπει ο ΠΑΟΚ σε league phase διοργάνωσης UEFA το 2026/27;',
    description: 'Ποδοσφαιρική αγορά για το αν ο ΠΑΟΚ θα εμφανιστεί σε league phase του Champions League, Europa League ή Conference League τη σεζόν 2026/27.',
    sourcePrimary: 'Επίσημες κληρώσεις, αποτελέσματα και τελικές λίστες league phase της UEFA για Champions League, Europa League και Conference League 2026/27',
    sourceFallback: 'Επίσημες ανακοινώσεις του ΠΑΟΚ μόνο αν επιβεβαιώνουν καθαρά συμμετοχή σε league phase και συμφωνούν με τις λίστες της UEFA',
    voidRule: 'ΝΑΙ αν ο ΠΑΟΚ εμφανίζεται επίσημα από την UEFA σε league phase του Champions League, Europa League ή Conference League 2026/27. ΟΧΙ διαφορετικά. Ακυρώνεται μόνο αν η UEFA αλλάξει ουσιωδώς τη μορφή των διοργανώσεων ώστε να μην μπορεί να προσδιοριστεί καθαρά η συμμετοχή σε league phase.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-sports-aek-uefa-league-phase-2026-27': {
    question: 'Θα μπει η ΑΕΚ σε league phase διοργάνωσης UEFA το 2026/27;',
    description: 'Ποδοσφαιρική αγορά για το αν η ΑΕΚ θα εμφανιστεί σε league phase του Champions League, Europa League ή Conference League τη σεζόν 2026/27.',
    sourcePrimary: 'Επίσημες κληρώσεις, αποτελέσματα και τελικές λίστες league phase της UEFA για Champions League, Europa League και Conference League 2026/27',
    sourceFallback: 'Επίσημες ανακοινώσεις της ΑΕΚ μόνο αν επιβεβαιώνουν καθαρά συμμετοχή σε league phase και συμφωνούν με τις λίστες της UEFA',
    voidRule: 'ΝΑΙ αν η ΑΕΚ εμφανίζεται επίσημα από την UEFA σε league phase του Champions League, Europa League ή Conference League 2026/27. ΟΧΙ διαφορετικά. Ακυρώνεται μόνο αν η UEFA αλλάξει ουσιωδώς τη μορφή των διοργανώσεων ώστε να μην μπορεί να προσδιοριστεί καθαρά η συμμετοχή σε league phase.',
    yesLabel: 'Ναι',
    noLabel: 'Όχι'
  },
  'gre-sports-zambidis-mayweather-win-jun27-2026': {
    question: 'Θα ανακηρυχθεί επίσημα νικητής ο Μιχάλης Ζαμπίδης απέναντι στον Floyd Mayweather στις 27 Ιουνίου 2026;',
    description: 'Αγορά αθλητικής επικαιρότητας για το αν ο Μιχάλης Ζαμπίδης θα ανακηρυχθεί επίσημα νικητής στον προγραμματισμένο αγώνα επίδειξης μποξ με τον Floyd Mayweather στην Αθήνα.',
    sourcePrimary: 'Επίσημη ανακοίνωση αποτελέσματος από τη διοργάνωση, τον promoter, τη μετάδοση ή αρμόδιο φορέα για τον αγώνα Floyd Mayweather vs. Mike Zambidis στις 27 Ιουνίου 2026',
    sourceFallback: 'Tapology, BoxRec αν καταχωριστεί, Associated Press/AFP/Reuters, ESPN, BBC Sport, Sporting News ή άλλο αξιόπιστο μέσο μαχητικών αθλημάτων που αναφέρει καθαρά το επίσημο αποτέλεσμα',
    voidRule: 'YES μόνο αν ο Μιχάλης Ζαμπίδης ανακηρυχθεί επίσημα νικητής με απόφαση, KO/TKO, DQ, εγκατάλειψη ή άλλη επίσημη μέθοδο νίκης. NO αν νικητής ανακηρυχθεί ο Floyd Mayweather, αν ο αγώνας λήξει ισόπαλος/no contest ή αν δεν ανακοινωθεί επίσημος νικητής. Ακυρώνεται αν ο αγώνας ακυρωθεί, δεν διεξαχθεί έως τις 31 Ιουλίου 2026, αλλάξει ο αντίπαλος ή αλλάξουν ουσιωδώς οι κανόνες πριν την έναρξη.',
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
    description: 'Αγορά πρόκρισης για ελληνική ομάδα στην τελική τετράδα της EuroLeague.',
    sourcePrimary: 'Επίσημη σελίδα αποτελεσμάτων της EuroLeague',
    sourceFallback: 'Επίσημες ανακοινώσεις συλλόγων μαζί με επιβεβαίωση από το bracket της EuroLeague',
    voidRule: 'Ακυρώνεται αν αλλάξει ουσιωδώς η μορφή της διοργάνωσης και δεν μπορεί να προσδιοριστεί καθαρά η πρόκριση στο Final Four.',
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
