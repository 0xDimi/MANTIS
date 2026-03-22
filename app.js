const STORAGE_KEY = 'xyz-labs-demo-state-v86';
const LEGACY_STORAGE_KEYS = ['xyz-labs-demo-state-v85', 'xyz-labs-demo-state-v84', 'xyz-labs-demo-state-v83', 'xyz-labs-demo-state-v82', 'xyz-labs-demo-state-v81', 'xyz-labs-demo-state-v8', 'xyz-labs-demo-state-v7'];
const ONBOARDING_VERSION = 'v86';
const STARTING_CASH = 25000;
const ACCESS_CODE = 'athens-alpha';
const APP_VERSION = 'v0.8.6.6';

const copy = {
  en: {
    appTitle: 'xyz Labs',
    appSubtitle: 'Greek event markets',
    productIdentity: 'Here, your opinion has value',
    navMarkets: 'Markets',
    navDesk: 'Desk',
    navPortfolio: 'Portfolio',
    sandbox: 'Spring 2026 Greek slate',
    privateBeta: 'Live preview',
    liveBoard: 'Live board lane',
    heroEyebrow: 'A Greek prediction market, with event pricing across politics, economy, sports, culture, and more.',
    heroFeatured: 'Featured market',
    heroPulse: 'Board pulse',
    heroPulseCopy: 'A staged but live-feeling tape for private tester walkthroughs.',
    heroLiveBadge: 'Live demo tape',
    heroFlagshipCopy: 'One main market up front, then the rest of the featured board underneath.',
    flagshipLane: 'Featured markets',
    flagshipLaneCopy: 'High-signal markets near the top of the board.',
    cardFeatured: 'Featured',
    statLiveOdds: 'Featured YES / NO odds',
    statTotalVolume: 'Matched volume',
    statCash: 'Available cash',
    statPositions: 'Open positions',
    boardTitle: 'Greek markets',
    boardCopy: 'A cleaner board for fast YES / NO scanning across politics, economy, sports, culture, and weather.',
    featuredMarketsTitle: 'Featured markets',
    featuredMarketsCopy: 'A short list of lead contracts worth reading first.',
    allMarketsTitle: 'All markets',
    allMarketsCopy: 'Browse the full board by category.',
    deskTitle: 'Desk',
    deskCopy: 'Pulse, movers, and seeded activity live here instead of the main board.',
    boardLiveNote: 'Odds are demo, but the board now behaves like a private market room instead of a static prototype.',
    searchPlaceholder: 'Search markets, teams, cities, or sources',
    filtersLabel: 'Category',
    sortLabel: 'Sort',
    filterAll: 'All',
    sortFeatured: 'Top',
    sortVolume: 'Volume',
    sortClosing: 'Closing soon',
    marketPulse: 'Board pulse',
    recentActivity: 'Recent activity',
    recentActivityCopy: 'Recent fills keep the tape and portfolio warm.',
    liveTape: 'Live tape',
    liveTapeCopy: 'Recent board flow and seeded activity.',
    moversTitle: 'Top movers',
    moversCopy: 'Contracts seeing the biggest price move right now.',
    liveSlate: 'Markets live',
    closingSoon: 'Closing soon',
    testerLane: 'Tracked testers',
    flowLastHour: 'Last hour flow',
    openMarket: 'Open market',
    browseMarkets: 'Browse markets',
    openSource: 'Open source',
    openOfficialSource: 'Open official source',
    yes: 'YES',
    no: 'NO',
    chance: 'Chance',
    close: 'Close',
    resolve: 'Resolve',
    volume: 'Volume',
    source: 'Source',
    liquidity: 'Liquidity',
    dayChange: '24h move',
    held: 'Held',
    detailBack: 'Back to markets',
    detailBackDesk: 'Back to desk',
    detailBackPortfolio: 'Back to portfolio',
    detailOverview: 'Overview',
    resolutionRules: 'Resolution rules',
    resolutionIntegrity: 'Resolution integrity',
    resolutionIntegrityCopy: 'Exactly how this contract will be checked, escalated, or voided if the public record gets messy.',
    resolutionPrimary: 'Primary resolution path',
    resolutionFallback: 'Fallback path',
    resolutionTiming: 'Lock + settlement timing',
    resolutionVoid: 'Void / manual review',
    resolutionSourceRule: 'Source priority',
    resolutionCutoff: 'Market lock',
    resolutionSettleTarget: 'Target settlement',
    trustLayerEyebrow: 'Trust layer',
    trustLayerTitle: 'Why this market is trustworthy',
    trustLayerCopy: 'Named official sources, explicit timing, and a visible void rule so the contract can be audited at a glance.',
    trustSourceStack: 'Source stack',
    trustSourceTitle: 'Official source first',
    trustSourceCopy: 'The contract names the exact public records it will use before anything else.',
    trustSettlementPath: 'Settlement path',
    trustResolutionTitle: 'Clear YES / NO logic',
    trustResolutionCopy: 'The market states what settles it, when trading stops, and when a human steps in.',
    trustCheckedFirst: 'Checked first',
    trustFallbackOnly: 'Fallback only',
    trustOutcomeTest: 'Outcome test',
    trustWhyCredible: 'Why it reads as credible',
    trustTimingWindow: 'Close + resolve window',
    trustManualSafeguard: 'Manual safeguard',
    resolutionManualNote: 'Primary sources win. Fallbacks are only used when they are clearly official and more complete than the primary publication page.',
    voidRule: 'Contract voids if the stated outcome cannot be verified with practical certainty from the named official sources, or if the wording becomes impossible to apply cleanly.',
    whyItMatters: 'Why it matters',
    primarySource: 'Primary source',
    fallbackSource: 'Fallback source',
    marketContext: 'Market context',
    tradeTitle: 'Trade',
    tradeCopy: 'Enter EUR size, pick a side, and review cost, risk, and payout before you place the order.',
    tradeAction: 'Action',
    tradeSide: 'Side',
    tradeAmount: 'Order amount',
    tradeBuy: 'Buy',
    tradeSell: 'Sell',
    contractPrice: 'Selected price',
    estimatedTotal: 'Order value',
    estimatedContracts: 'Estimated contracts',
    availableCash: 'Available cash',
    heldContracts: 'Open contracts',
    maxSellValue: 'Max sell value',
    tradePayout: 'Gross payout if correct',
    tradeEdge: 'Net profit if correct',
    amountPresets: 'Quick size',
    placeTradeBuy: 'Place buy order',
    placeTradeSell: 'Place sell order',
    ticketIntuition: 'Ticket intuition',
    ticketScenarioWin: 'If your side resolves',
    ticketScenarioLose: 'If the other side resolves',
    ticketSpendNow: 'Spend now',
    ticketReceiveNow: 'Receive now',
    ticketMaxLoss: 'Max loss',
    ticketRemaining: 'Contracts left after sell',
    ticketExposureAfter: 'Exposure after sell',
    accountSnapshot: 'Account snapshot',
    accountCopy: 'Updates after each fill.',
    resetAccount: 'Reset portfolio',
    equity: 'Equity',
    cash: 'Cash',
    marketValue: 'Market value',
    exposure: 'Exposure',
    pnl: 'Unrealized P/L',
    portfolioTitle: 'Portfolio',
    portfolioCopy: 'Marked-to-market positions, category exposure, and recent fills in one view.',
    positionsTitle: 'Open positions',
    positionsEmpty: 'No open positions yet. Place a trade from the board.',
    activityEmpty: 'No activity yet.',
    avgEntry: 'Avg entry',
    currentMark: 'Current mark',
    value: 'Value',
    quantity: 'Qty',
    categoryMix: 'Category mix',
    noResultsTitle: 'No markets match that screen.',
    noResultsBody: 'Try a broader category or clear the search input.',
    footer: `xyz Labs · Greek event markets · ${APP_VERSION}`,
    toastExecutedTitle: 'Trade executed',
    toastExecutedBody: 'Your portfolio has been updated.',
    toastResetTitle: 'Portfolio reset',
    toastResetBody: 'Back to the seeded starting portfolio.',
    toastErrorTitle: 'Trade blocked',
    toastCashError: 'Not enough EUR available for that buy order.',
    toastHoldingsError: 'You do not hold enough contracts to sell that EUR amount.',
    toastAmountError: 'Enter at least €1.',
    toastAccessError: 'That access code is not valid for this private demo.',
    activityBuy: 'Bought',
    activitySell: 'Sold',
    statusLive: 'Live',
    statusClosing: 'Closing soon',
    statusNew: 'New',
    shareQuote: 'Market price',
    positionMixCopy: 'Current exposure grouped by category.',
    detailCopy: 'Pricing, sources, and resolution logic for this market.',
    ticketYes: 'Buy YES',
    ticketNo: 'Buy NO',
    chartTitle: 'Price history',
    chartCopy: 'Illustrative market-price path across recent demo marks.',
    chartNow: 'Now',
    chartStart: '7 updates ago',
    chartFrameLabel: 'YES probability framing',
    chartCurrentLabel: 'Current YES probability',
    chartWindowLabel: 'Window',
    chartWindowCopy: 'Last 7 daily demo marks',
    chartMoveSupport: 'Versus the prior board mark',
    chartAxisProbability: 'Probability',
    chartFootnote: 'Illustrative chart for demo review only. Resolution still follows the named source stack.',
    ticketToWin: 'To win',
    gateEyebrow: 'Private access',
    gateTitle: 'Unlock markets',
    gateCopy: 'A Greece-first prediction market board across politics, economy, sports, culture, and weather.',
    gateNameLabel: 'Tester name',
    gateNamePlaceholder: 'Optional, shown locally',
    gateCodeLabel: 'Access code',
    gateCodePlaceholder: 'Enter shared code',
    gateUnlock: 'Unlock markets',
    gateHint: 'Local access only. State is stored in this browser.',
    gatePoint1: '39 live markets across politics, economy, sports, culture, and weather',
    gatePoint2: 'EUR-supported ticketing designed to feel closer to a real consumer product',
    gatePoint3: 'Greek-first market mix built for a sharper private walkthrough',
    onboardingTitle: 'Before you explore',
    onboardingCopy: 'This preview is designed to show why a Greek prediction market could feel local, useful, and habit-forming from day one.',
    onboardingStep1Title: 'Built for Greece first',
    onboardingStep1Body: 'The slate starts from questions Greek users would naturally care about across politics, economy, sports, culture, and weather.',
    onboardingStep2Title: 'Broad enough to revisit',
    onboardingStep2Body: 'One board can hold serious signals and lighter social markets, giving people more than one reason to come back.',
    onboardingStep3Title: 'Opinion turns into price',
    onboardingStep3Body: 'Each market makes crowd conviction legible, so the product feels like a living read on what people believe.',
    onboardingDismiss: 'Got it',
    onboardingGoFeatured: 'Open featured market',
    liveUpdated: 'Updated',
    liveFlow: 'Recent flow',
    liveWatchers: 'Watching',
    justNow: 'just now',
    quoteLabel: 'quote',
    you: 'You'
  },
  el: {
    appTitle: 'xyz Labs',
    appSubtitle: 'Ελληνικές αγορές γεγονότων',
    productIdentity: 'Εδώ, η γνώμη σου έχει αξία.',
    navMarkets: 'Αγορές',
    navDesk: 'Desk',
    navPortfolio: 'Χαρτοφυλάκιο',
    sandbox: 'Άνοιξη 2026 Greek slate',
    privateBeta: 'Live preview',
    liveBoard: 'Ζωντανό board lane',
    heroEyebrow: 'Μια ελληνική αγορά προβλέψεων, με τιμολόγηση γεγονότων σε πολιτική, οικονομία, αθλητισμό, πολιτισμό και πολλά ακόμη.',
    heroFeatured: 'Κύρια αγορά',
    heroPulse: 'Παλμός board',
    heroPulseCopy: 'Staged αλλά πιο live-feeling tape για private tester walkthroughs.',
    heroLiveBadge: 'Live demo tape',
    heroFlagshipCopy: 'Μία κύρια αγορά μπροστά και αμέσως μετά το υπόλοιπο featured board.',
    flagshipLane: 'Featured markets',
    flagshipLaneCopy: 'High-signal αγορές κοντά στην κορυφή του board.',
    cardFeatured: 'Featured',
    statLiveOdds: 'Κύριο YES / NO',
    statTotalVolume: 'Συνολικός όγκος',
    statCash: 'Διαθέσιμα μετρητά',
    statPositions: 'Ανοιχτές θέσεις',
    boardTitle: 'Ελληνικές αγορές',
    boardCopy: 'Καθαρότερο board για γρήγορο YES / NO scanning σε πολιτική, οικονομία, αθλητισμό, πολιτισμό και καιρό.',
    featuredMarketsTitle: 'Featured markets',
    featuredMarketsCopy: 'Μικρό lead set από αγορές που αξίζει να διαβαστούν πρώτα.',
    allMarketsTitle: 'Όλες οι αγορές',
    allMarketsCopy: 'Δες όλο το board ανά κατηγορία.',
    deskTitle: 'Desk',
    deskCopy: 'Pulse, movers και seeded activity μεταφέρονται εδώ και όχι στο κύριο board.',
    boardLiveNote: 'Τα odds είναι demo, αλλά το board πλέον συμπεριφέρεται σαν private market room και όχι σαν στατικό prototype.',
    searchPlaceholder: 'Αναζήτηση αγορών, ομάδων, πόλεων ή πηγών',
    filtersLabel: 'Κατηγορία',
    sortLabel: 'Ταξινόμηση',
    filterAll: 'Όλα',
    sortFeatured: 'Top',
    sortVolume: 'Όγκος',
    sortClosing: 'Κλείνουν σύντομα',
    marketPulse: 'Παλμός αγοράς',
    recentActivity: 'Πρόσφατη δραστηριότητα',
    recentActivityCopy: 'Οι πρόσφατες κινήσεις κρατούν ζωντανά το tape και το portfolio.',
    liveTape: 'Live tape',
    liveTapeCopy: 'Πρόσφατη ροή board και seeded activity.',
    moversTitle: 'Top movers',
    moversCopy: 'Τα contracts με τη μεγαλύτερη μεταβολή τιμής τώρα.',
    liveSlate: 'Αγορές live',
    closingSoon: 'Κλείνουν σύντομα',
    testerLane: 'Tracked testers',
    flowLastHour: 'Ροή τελευταίας ώρας',
    openMarket: 'Άνοιγμα αγοράς',
    browseMarkets: 'Δες αγορές',
    openSource: 'Άνοιγμα πηγής',
    openOfficialSource: 'Άνοιγμα επίσημης πηγής',
    yes: 'YES',
    no: 'NO',
    chance: 'Πιθανότητα',
    close: 'Κλείσιμο',
    resolve: 'Επίλυση',
    volume: 'Όγκος',
    source: 'Πηγή',
    liquidity: 'Ρευστότητα',
    dayChange: 'Μεταβολή 24h',
    held: 'Κατοχή',
    detailBack: 'Επιστροφή στις αγορές',
    detailBackDesk: 'Επιστροφή στο desk',
    detailBackPortfolio: 'Επιστροφή στο χαρτοφυλάκιο',
    detailOverview: 'Σύνοψη',
    resolutionRules: 'Κανόνες resolution',
    resolutionIntegrity: 'Resolution integrity',
    resolutionIntegrityCopy: 'Ακριβώς πώς θα ελεγχθεί, θα γίνει escalate ή θα voidαριστεί αυτό το contract αν το public record γίνει messy.',
    resolutionPrimary: 'Κύριο path resolution',
    resolutionFallback: 'Fallback path',
    resolutionTiming: 'Χρόνος κλειδώματος και settlement',
    resolutionVoid: 'Void / manual review',
    resolutionSourceRule: 'Ιεραρχία πηγών',
    resolutionCutoff: 'Κλείδωμα αγοράς',
    resolutionSettleTarget: 'Στόχος settlement',
    trustLayerEyebrow: 'Trust layer',
    trustLayerTitle: 'Γιατί αυτή η αγορά δείχνει αξιόπιστη',
    trustLayerCopy: 'Ονομασμένες επίσημες πηγές, καθαρό timing και ορατός κανόνας void ώστε το contract να ελέγχεται με μια ματιά.',
    trustSourceStack: 'Ιεραρχία πηγών',
    trustSourceTitle: 'Πρώτα η επίσημη πηγή',
    trustSourceCopy: 'Το contract ορίζει ακριβώς ποια δημόσια records χρησιμοποιεί πριν από οτιδήποτε άλλο.',
    trustSettlementPath: 'Path settlement',
    trustResolutionTitle: 'Καθαρή λογική YES / NO',
    trustResolutionCopy: 'Η αγορά λέει τι την κάνει settle, πότε σταματά το trading και πότε χρειάζεται ανθρώπινος έλεγχος.',
    trustCheckedFirst: 'Ελέγχεται πρώτο',
    trustFallbackOnly: 'Μόνο αν χρειαστεί',
    trustOutcomeTest: 'Outcome test',
    trustWhyCredible: 'Γιατί διαβάζεται ως αξιόπιστη',
    trustTimingWindow: 'Παράθυρο close + resolve',
    trustManualSafeguard: 'Safeguard manual review',
    resolutionManualNote: 'Οι primary πηγές υπερισχύουν. Τα fallback χρησιμοποιούνται μόνο όταν είναι καθαρά επίσημα και πιο πλήρη από την κύρια σελίδα δημοσίευσης.',
    voidRule: 'Το contract γίνεται void αν το δηλωμένο outcome δεν μπορεί να επαληθευτεί με πρακτική βεβαιότητα από τις ονομασμένες επίσημες πηγές ή αν η διατύπωση πάψει να εφαρμόζεται καθαρά.',
    whyItMatters: 'Γιατί μετράει',
    primarySource: 'Κύρια πηγή',
    fallbackSource: 'Εναλλακτική πηγή',
    marketContext: 'Στοιχεία αγοράς',
    tradeTitle: 'Trade',
    tradeCopy: 'Βάλε EUR ποσό, διάλεξε πλευρά και δες κόστος, ρίσκο και πληρωμή πριν περάσεις την εντολή.',
    tradeAction: 'Ενέργεια',
    tradeSide: 'Πλευρά',
    tradeAmount: 'Ποσό εντολής',
    tradeBuy: 'Αγορά',
    tradeSell: 'Πώληση',
    contractPrice: 'Επιλεγμένη τιμή',
    estimatedTotal: 'Αξία εντολής',
    estimatedContracts: 'Εκτιμώμενα contracts',
    availableCash: 'Διαθέσιμα μετρητά',
    heldContracts: 'Ανοιχτά contracts',
    maxSellValue: 'Μέγιστη αξία πώλησης',
    tradePayout: 'Μικτή πληρωμή αν βγει σωστό',
    tradeEdge: 'Καθαρό κέρδος αν βγει σωστό',
    amountPresets: 'Γρήγορο ποσό',
    placeTradeBuy: 'Καταχώριση buy order',
    placeTradeSell: 'Καταχώριση sell order',
    ticketIntuition: 'Intuition ticket',
    ticketScenarioWin: 'Αν βγει η πλευρά σου',
    ticketScenarioLose: 'Αν βγει η άλλη πλευρά',
    ticketSpendNow: 'Πληρώνεις τώρα',
    ticketReceiveNow: 'Παίρνεις τώρα',
    ticketMaxLoss: 'Μέγιστη ζημιά',
    ticketRemaining: 'Contracts που μένουν μετά το sell',
    ticketExposureAfter: 'Έκθεση μετά το sell',
    accountSnapshot: 'Στιγμιότυπο λογαριασμού',
    accountCopy: 'Ενημερώνεται μετά από κάθε fill.',
    resetAccount: 'Επαναφορά χαρτοφυλακίου',
    equity: 'Συνολική αξία',
    cash: 'Μετρητά',
    marketValue: 'Αξία θέσεων',
    exposure: 'Έκθεση',
    pnl: 'Μη πραγματοποιημένο P/L',
    portfolioTitle: 'Χαρτοφυλάκιο',
    portfolioCopy: 'Marked-to-market θέσεις, category exposure και πρόσφατα fills σε ένα view.',
    positionsTitle: 'Ανοιχτές θέσεις',
    positionsEmpty: 'Δεν υπάρχουν ανοιχτές θέσεις ακόμα. Κάνε μία κίνηση από το board.',
    activityEmpty: 'Δεν υπάρχει δραστηριότητα ακόμα.',
    avgEntry: 'Μέση είσοδος',
    currentMark: 'Τρέχουσα τιμή',
    value: 'Αξία',
    quantity: 'Ποσότητα',
    categoryMix: 'Μείγμα κατηγοριών',
    noResultsTitle: 'Δεν υπάρχουν αγορές για αυτό το screen.',
    noResultsBody: 'Δοκίμασε πιο ευρύ φίλτρο ή καθάρισε την αναζήτηση.',
    footer: `xyz Labs · Ελληνικές αγορές γεγονότων · ${APP_VERSION}`,
    toastExecutedTitle: 'Το trade εκτελέστηκε',
    toastExecutedBody: 'Το portfolio ενημερώθηκε.',
    toastResetTitle: 'Έγινε reset portfolio',
    toastResetBody: 'Επιστροφή στο αρχικό seeded portfolio.',
    toastErrorTitle: 'Το trade μπλοκαρίστηκε',
    toastCashError: 'Δεν υπάρχουν αρκετά EUR για αυτή την αγορά.',
    toastHoldingsError: 'Δεν κρατάς αρκετά contracts για να πουλήσεις αυτό το EUR ποσό.',
    toastAmountError: 'Βάλε τουλάχιστον €1.',
    toastAccessError: 'Αυτός ο κωδικός δεν είναι έγκυρος για αυτό το private demo.',
    activityBuy: 'Αγόρασες',
    activitySell: 'Πούλησες',
    statusLive: 'Live',
    statusClosing: 'Κλείνει σύντομα',
    statusNew: 'Νέα',
    shareQuote: 'Τιμή αγοράς',
    positionMixCopy: 'Τρέχουσα έκθεση ομαδοποιημένη ανά κατηγορία.',
    detailCopy: 'Pricing, πηγές και λογική επίλυσης για αυτή την αγορά.',
    ticketYes: 'Αγορά YES',
    ticketNo: 'Αγορά NO',
    chartTitle: 'Ιστορικό τιμής',
    chartCopy: 'Ενδεικτική διαδρομή τιμής αγοράς στα πρόσφατα demo marks.',
    chartNow: 'Τώρα',
    chartStart: '7 updates πριν',
    chartFrameLabel: 'YES probability framing',
    chartCurrentLabel: 'Τρέχουσα πιθανότητα YES',
    chartWindowLabel: 'Παράθυρο',
    chartWindowCopy: 'Τελευταία 7 ημερήσια demo marks',
    chartMoveSupport: 'Σε σχέση με το προηγούμενο board mark',
    chartAxisProbability: 'Πιθανότητα',
    chartFootnote: 'Ενδεικτικό chart μόνο για demo review. Το resolution συνεχίζει να ακολουθεί την ονομασμένη ιεραρχία πηγών.',
    ticketToWin: 'Κέρδος',
    gateEyebrow: 'Private access',
    gateTitle: 'Άνοιγμα αγορών',
    gateCopy: 'Greece-first board αγορών προβλέψεων σε πολιτική, οικονομία, αθλητισμό, πολιτισμό και καιρό.',
    gateNameLabel: 'Όνομα tester',
    gateNamePlaceholder: 'Προαιρετικό, φαίνεται μόνο τοπικά',
    gateCodeLabel: 'Access code',
    gateCodePlaceholder: 'Βάλε το shared code',
    gateUnlock: 'Ξεκλείδωμα αγορών',
    gateHint: 'Η πρόσβαση είναι local-only και αποθηκεύεται σε αυτόν τον browser.',
    gatePoint1: '39 live αγορές σε πολιτική, οικονομία, αθλητισμό, πολιτισμό και καιρό',
    gatePoint2: 'EUR-supported ticketing σχεδιασμένο να θυμίζει πιο πολύ πραγματικό consumer product',
    gatePoint3: 'Greek-first market mix για πιο καθαρό private walkthrough',
    onboardingTitle: 'Πριν μπεις στο board',
    onboardingCopy: 'Αυτό το preview δείχνει γιατί μια ελληνική αγορά προβλέψεων μπορεί να νιώθει τοπική, χρήσιμη και με λόγο να επιστρέφεις.',
    onboardingStep1Title: 'Χτισμένο πρώτα για την Ελλάδα',
    onboardingStep1Body: 'Το slate ξεκινά από ερωτήματα που οι χρήστες στην Ελλάδα όντως θα ήθελαν να συζητούν σε πολιτική, οικονομία, αθλητισμό, πολιτισμό και καιρό.',
    onboardingStep2Title: 'Αρκετά πλατύ για συνήθεια',
    onboardingStep2Body: 'Στο ίδιο board χωρούν σοβαρά signals και πιο ανάλαφρες social αγορές, ώστε να υπάρχει παραπάνω από ένας λόγος επιστροφής.',
    onboardingStep3Title: 'Η γνώμη γίνεται τιμή',
    onboardingStep3Body: 'Κάθε αγορά κάνει ορατή τη συλλογική πεποίθηση, ώστε το προϊόν να μοιάζει με ζωντανή ένδειξη του τι πιστεύει ο κόσμος.',
    onboardingDismiss: 'Το έπιασα',
    onboardingGoFeatured: 'Άνοιγμα featured market',
    liveUpdated: 'Ενημέρωση',
    liveFlow: 'Πρόσφατη ροή',
    liveWatchers: 'Παρακολουθούν',
    justNow: 'μόλις τώρα',
    quoteLabel: 'τιμή',
    you: 'Εσύ'
  }
};

const CATEGORY_LABELS = {
  politics: { en: 'Politics', el: 'Πολιτική' },
  macro: { en: 'Macro', el: 'Μακρο' },
  social: { en: 'Social', el: 'Social' },
  showbiz: { en: 'Showbiz', el: 'Showbiz' },
  sports: { en: 'Sports', el: 'Αθλητισμός' },
  weather: { en: 'Weather', el: 'Καιρός' }
};

const MARKETS = [
  {
    id: 'MAC-01',
    categoryKey: 'macro',
    status: 'closing',
    featured: false,
    probability: 61,
    change: 4,
    volume: 24840,
    closeDate: '2026-04-15T11:59:00+02:00',
    resolveDate: '2026-04-15T13:00:00+02:00',
    sourceLink: 'https://www.statistics.gr/en/calendar',
    poster: {
      eyebrow: { en: 'Greece inflation', el: 'Πληθωρισμός Ελλάδας' },
      label: { en: 'CPI watch', el: 'Παρακολούθηση ΔΤΚ' },
      emoji: '📈',
      art: 'art-chart',
      gradient: 'linear-gradient(135deg, #071a34 0%, #0b2f5a 48%, #2f6df6 100%)'
    },
    question: {
      en: "Will Greece's March 2026 CPI inflation print above 2.5% year on year?",
      el: 'Θα τυπώσει ο πληθωρισμός ΔΤΚ της Ελλάδας για τον Μάρτιο 2026 πάνω από 2,5% σε ετήσια βάση;'
    },
    summary: {
      en: 'Lead macro market with a simple threshold and a very legible investor story.',
      el: 'Lead macro αγορά με απλό threshold και πολύ καθαρό investor story.'
    },
    resolution: {
      en: 'YES if ELSTAT reports annual CPI inflation above 2.5% for March 2026. NO otherwise.',
      el: 'YES αν η ΕΛΣΤΑΤ δημοσιεύσει ετήσιο πληθωρισμό ΔΤΚ πάνω από 2,5% για τον Μάρτιο 2026. NO σε κάθε άλλη περίπτωση.'
    },
    why: {
      en: 'This is the kind of macro question that grounds the product in real information markets.',
      el: 'Αυτό είναι το είδος macro ερώτησης που γειώνει το προϊόν σε πραγματικές information markets.'
    },
    primarySource: 'ELSTAT CPI release',
    fallbackSource: 'Same-day ELSTAT CPI tables'
  },
  {
    id: 'MAC-02',
    categoryKey: 'macro',
    status: 'live',
    featured: false,
    probability: 66,
    change: 2,
    volume: 18960,
    closeDate: '2026-04-01T08:59:00+02:00',
    resolveDate: '2026-04-01T12:00:00+02:00',
    sourceLink: 'https://www.statistics.gr/en/calendar',
    poster: {
      eyebrow: { en: 'Labour market', el: 'Αγορά εργασίας' },
      label: { en: 'Jobs pulse', el: 'Jobs pulse' },
      emoji: '💼',
      gradient: 'linear-gradient(135deg, #0b1f1a 0%, #0f4d3e 55%, #31c48d 100%)'
    },
    question: {
      en: "Will Greece's seasonally adjusted unemployment rate for February 2026 be below 8.5%?",
      el: 'Θα είναι το εποχικά διορθωμένο ποσοστό ανεργίας της Ελλάδας για τον Φεβρουάριο 2026 κάτω από 8,5%;'
    },
    summary: {
      en: 'A clean monthly macro read that is easy to explain in one sentence.',
      el: 'Καθαρό μηνιαίο macro read που εξηγείται εύκολα σε μία πρόταση.'
    },
    resolution: {
      en: 'YES if ELSTAT reports a seasonally adjusted unemployment rate strictly below 8.5%.',
      el: 'YES αν η ΕΛΣΤΑΤ δημοσιεύσει εποχικά διορθωμένη ανεργία αυστηρά κάτω από 8,5%.'
    },
    why: {
      en: 'Keeps the board anchored to an official Greek data series with obvious economic meaning.',
      el: 'Κρατά το board δεμένο σε επίσημη ελληνική σειρά δεδομένων με προφανές οικονομικό νόημα.'
    },
    primarySource: 'ELSTAT labour force survey',
    fallbackSource: 'ELSTAT release page and same-day tables'
  },
  {
    id: 'MAC-03',
    categoryKey: 'macro',
    status: 'new',
    featured: false,
    probability: 73,
    change: 1,
    volume: 16420,
    closeDate: '2026-06-05T11:59:00+02:00',
    resolveDate: '2026-06-05T13:00:00+02:00',
    sourceLink: 'https://www.statistics.gr/en/calendar',
    poster: {
      eyebrow: { en: 'Growth print', el: 'Ανάπτυξη' },
      label: { en: 'GDP tracker', el: 'GDP tracker' },
      emoji: '🏛️',
      gradient: 'linear-gradient(135deg, #1a1133 0%, #3b1d78 52%, #8b5cf6 100%)'
    },
    question: {
      en: "Will Greece's Q1 2026 real GDP growth be positive year on year?",
      el: 'Θα είναι θετική η πραγματική αύξηση ΑΕΠ της Ελλάδας στο Q1 2026 σε ετήσια βάση;'
    },
    summary: {
      en: 'A longer-dated market that helps the board feel like a real series instead of a one-off listing.',
      el: 'Πιο μακρινή αγορά που κάνει το board να μοιάζει με πραγματική σειρά και όχι με μεμονωμένο listing.'
    },
    resolution: {
      en: 'YES if ELSTAT reports positive year-on-year real GDP growth for Q1 2026.',
      el: 'YES αν η ΕΛΣΤΑΤ δημοσιεύσει θετική ετήσια πραγματική αύξηση ΑΕΠ για το Q1 2026.'
    },
    why: {
      en: 'Important because it signals repeatable templates around major macro releases.',
      el: 'Σημαντικό γιατί δείχνει επαναλαμβανόμενα templates γύρω από μεγάλες macro ανακοινώσεις.'
    },
    primarySource: 'ELSTAT quarterly national accounts',
    fallbackSource: 'Same-day ELSTAT quarterly tables'
  },
  {
    id: 'MAC-04',
    categoryKey: 'macro',
    status: 'live',
    featured: false,
    probability: 58,
    change: 3,
    volume: 13840,
    closeDate: '2026-05-12T11:59:00+02:00',
    resolveDate: '2026-05-12T13:00:00+02:00',
    sourceLink: 'https://www.statistics.gr/en/calendar',
    poster: {
      eyebrow: { en: 'Industrial output', el: 'Βιομηχανική παραγωγή' },
      label: { en: 'Factory pulse', el: 'Factory pulse' },
      emoji: '🏭',
      gradient: 'linear-gradient(135deg, #1f2937 0%, #0f766e 50%, #22c55e 100%)'
    },
    question: {
      en: "Will Greece's industrial production index for April 2026 rise year on year?",
      el: 'Θα αυξηθεί ο δείκτης βιομηχανικής παραγωγής της Ελλάδας για τον Απρίλιο 2026 σε ετήσια βάση;'
    },
    summary: {
      en: 'Adds a second-tier macro release that still feels official and easy to explain on the board.',
      el: 'Προσθέτει δεύτερης γραμμής macro release που παραμένει επίσημο και εύκολο να εξηγηθεί πάνω στο board.'
    },
    resolution: {
      en: 'YES if ELSTAT reports positive year-on-year industrial production growth for April 2026.',
      el: 'YES αν η ΕΛΣΤΑΤ δημοσιεύσει θετική ετήσια μεταβολή στη βιομηχανική παραγωγή για τον Απρίλιο 2026.'
    },
    why: {
      en: 'Helps the macro shelf feel broader without becoming niche or hard to explain.',
      el: 'Βοηθά το macro shelf να μοιάζει πιο πλατύ χωρίς να γίνεται niche ή δύσκολο στην εξήγηση.'
    },
    primarySource: 'ELSTAT industrial production release',
    fallbackSource: 'Same-day ELSTAT production tables'
  },
  {
    id: 'MAC-05',
    categoryKey: 'macro',
    status: 'new',
    featured: false,
    probability: 52,
    change: -1,
    volume: 12610,
    closeDate: '2026-06-30T11:59:00+02:00',
    resolveDate: '2026-06-30T13:00:00+02:00',
    sourceLink: 'https://www.statistics.gr/en/calendar',
    poster: {
      eyebrow: { en: 'Consumer demand', el: 'Κατανάλωση' },
      label: { en: 'Retail tape', el: 'Retail tape' },
      emoji: '🛍️',
      gradient: 'linear-gradient(135deg, #2a0f26 0%, #7c2d92 48%, #ec4899 100%)'
    },
    question: {
      en: "Will Greece's retail sales volume for May 2026 post positive year-on-year growth?",
      el: 'Θα εμφανίσει ο όγκος λιανικών πωλήσεων της Ελλάδας για τον Μάιο 2026 θετική ετήσια μεταβολή;'
    },
    summary: {
      en: 'Consumer-facing macro market that keeps the demo readable for non-specialists.',
      el: 'Consumer-facing macro αγορά που κρατά το demo αναγνώσιμο και για μη ειδικούς.'
    },
    resolution: {
      en: 'YES if ELSTAT reports positive year-on-year retail sales volume growth for May 2026.',
      el: 'YES αν η ΕΛΣΤΑΤ δημοσιεύσει θετική ετήσια μεταβολή στον όγκο λιανικών πωλήσεων για τον Μάιο 2026.'
    },
    why: {
      en: 'Useful because it broadens macro inventory with a metric investors instantly understand.',
      el: 'Χρήσιμο γιατί διευρύνει το macro inventory με metric που οι investors καταλαβαίνουν αμέσως.'
    },
    primarySource: 'ELSTAT retail trade release',
    fallbackSource: 'Same-day ELSTAT retail tables'
  },
  {
    id: 'SOC-01',
    categoryKey: 'social',
    status: 'live',
    featured: false,
    probability: 57,
    change: 6,
    volume: 14210,
    closeDate: '2026-04-30T19:00:00+02:00',
    resolveDate: '2026-05-02T12:00:00+02:00',
    sourceLink: 'https://www.tiktok.com/@eurovision',
    poster: {
      eyebrow: { en: 'Eurovision social', el: 'Eurovision social' },
      label: { en: 'TikTok momentum', el: 'TikTok momentum' },
      emoji: '🎤',
      gradient: 'linear-gradient(135deg, #111827 0%, #1f2937 46%, #ec4899 100%)'
    },
    question: {
      en: 'Will the official Greece Eurovision rehearsal clip pass 1.5M TikTok views before the semi-final?',
      el: 'Θα περάσει το επίσημο rehearsal clip της Ελλάδας για τη Eurovision τα 1,5M views στο TikTok πριν από τον ημιτελικό;'
    },
    summary: {
      en: 'A social-attention market with a native internet feel and a simple public metric.',
      el: 'Αγορά social attention με native internet αίσθηση και απλό public metric.'
    },
    resolution: {
      en: 'YES if the official rehearsal clip view count is above 1.5M before the semi-final starts.',
      el: 'YES αν το view count του επίσημου rehearsal clip είναι πάνω από 1,5M πριν ξεκινήσει ο ημιτελικός.'
    },
    why: {
      en: 'Shows how the interface can handle public web metrics without losing structure.',
      el: 'Δείχνει πώς το interface μπορεί να χειριστεί public web metrics χωρίς να χάνει δομή.'
    },
    primarySource: 'Official Eurovision TikTok account',
    fallbackSource: 'Official Eurovision social recap page'
  },
  {
    id: 'POL-01',
    categoryKey: 'politics',
    status: 'live',
    featured: true,
    probability: 57,
    change: 5,
    volume: 28840,
    closeDate: '2027-06-30T18:59:00+03:00',
    resolveDate: '2027-07-01T18:00:00+03:00',
    sourceLink: 'https://ekloges.ypes.gr/',
    poster: {
      eyebrow: { en: 'Next Greek election', el: 'Επόμενες εθνικές εκλογές' },
      label: { en: 'Leading party', el: 'Πρώτο κόμμα' },
      emoji: '🗳️',
      art: 'art-ballot',
      gradient: 'linear-gradient(135deg, #061a33 0%, #1d4ed8 48%, #93c5fd 100%)'
    },
    question: {
      en: "Will New Democracy finish first in Greece's next national election?",
      el: 'Θα έρθει πρώτη η Νέα Δημοκρατία στις επόμενες εθνικές εκλογές στην Ελλάδα;'
    },
    summary: {
      en: 'A clean, consumer-friendly politics market that instantly tells people this board is built for Greece, not just translated into Greek.',
      el: 'Καθαρή, consumer-friendly πολιτική αγορά που δείχνει αμέσως ότι αυτό το board είναι φτιαγμένο για την Ελλάδα και όχι απλώς μεταφρασμένο στα ελληνικά.'
    },
    resolution: {
      en: 'YES if New Democracy records the highest nationwide vote share in the next Greek parliamentary election officially published by the Ministry of Interior. NO otherwise.',
      el: 'YES αν η Νέα Δημοκρατία καταγράψει το υψηλότερο πανελλαδικό ποσοστό ψήφων στις επόμενες βουλευτικές εκλογές, όπως θα δημοσιευτεί επίσημα από το Υπουργείο Εσωτερικών. NO διαφορετικά.'
    },
    why: {
      en: 'It adds the one politics contract mainstream Greek users would understand in a second and argue about immediately.',
      el: 'Προσθέτει το ένα πολιτικό contract που ο mainstream Έλληνας χρήστης καταλαβαίνει σε ένα δευτερόλεπτο και θα το συζητήσει αμέσως.'
    },
    primarySource: 'Greek Ministry of Interior official national election results',
    fallbackSource: 'Official ministry nationwide vote-share table or final certified result'
  },
  {
    id: 'SOC-03',
    categoryKey: 'social',
    status: 'live',
    featured: false,
    probability: 48,
    change: -2,
    volume: 11810,
    closeDate: '2026-03-28T23:59:00+02:00',
    resolveDate: '2026-03-31T23:59:00+02:00',
    sourceLink: 'https://www.youtube.com/',
    poster: {
      eyebrow: { en: 'Creator economy', el: 'Creator economy' },
      label: { en: 'Mega-collab watch', el: 'Mega-collab watch' },
      emoji: '📺',
      gradient: 'linear-gradient(135deg, #2a1111 0%, #7f1d1d 50%, #f97316 100%)'
    },
    question: {
      en: 'Will a MrBeast x Cristiano Ronaldo collaboration video pass 50M YouTube views within 72 hours?',
      el: 'Θα περάσει ένα collaboration video MrBeast x Cristiano Ronaldo τα 50M views στο YouTube μέσα σε 72 ώρες;'
    },
    summary: {
      en: 'Fast-resolution attention market with obvious mainstream appeal.',
      el: 'Αγορά attention με γρήγορο resolution και προφανές mainstream appeal.'
    },
    resolution: {
      en: 'YES if the public view count on the official upload exceeds 50M within 72 hours.',
      el: 'YES αν το public view count στο επίσημο upload ξεπεράσει τα 50M μέσα σε 72 ώρες.'
    },
    why: {
      en: 'Adds breadth and shows how the product could handle social attention arcs.',
      el: 'Προσθέτει breadth και δείχνει πώς το προϊόν θα μπορούσε να χειριστεί social attention arcs.'
    },
    primarySource: 'Official YouTube upload',
    fallbackSource: 'Creator channel public page'
  },
  {
    id: 'SOC-04',
    categoryKey: 'social',
    status: 'new',
    featured: false,
    probability: 45,
    change: 5,
    volume: 10940,
    closeDate: '2026-05-10T23:59:00+02:00',
    resolveDate: '2026-05-13T23:59:00+02:00',
    sourceLink: 'https://www.instagram.com/',
    poster: {
      eyebrow: { en: 'Live music social', el: 'Live music social' },
      label: { en: 'Athens reel watch', el: 'Athens reel watch' },
      emoji: '🎶',
      gradient: 'linear-gradient(135deg, #111827 0%, #7c3aed 46%, #f43f5e 100%)'
    },
    question: {
      en: 'Will a major Athens summer-concert teaser pass 2M Instagram Reel views within 72 hours?',
      el: 'Θα περάσει teaser για μεγάλο καλοκαιρινό concert στην Αθήνα τα 2M views σε Instagram Reel μέσα σε 72 ώρες;'
    },
    summary: {
      en: 'Adds another social card that feels native to entertainment marketing and easy to pitch.',
      el: 'Προσθέτει άλλη μία social κάρτα που νιώθει native στο entertainment marketing και εύκολη στο pitch.'
    },
    resolution: {
      en: 'YES if the official teaser reel exceeds 2M public views within 72 hours of posting.',
      el: 'YES αν το επίσημο teaser reel ξεπεράσει τα 2M public views μέσα σε 72 ώρες από το post.'
    },
    why: {
      en: 'Helps the demo show more than one flavour of attention market without changing the UI grammar.',
      el: 'Βοηθά το demo να δείξει πάνω από μία γεύση attention market χωρίς να αλλάζει το UI grammar.'
    },
    primarySource: 'Official artist or promoter Instagram account',
    fallbackSource: 'Official promoter recap or social dashboard'
  },
  {
    id: 'SOC-05',
    categoryKey: 'social',
    status: 'live',
    featured: false,
    probability: 51,
    change: 2,
    volume: 10160,
    closeDate: '2026-06-02T23:59:00+02:00',
    resolveDate: '2026-06-05T23:59:00+02:00',
    sourceLink: 'https://www.tiktok.com/',
    poster: {
      eyebrow: { en: 'Sports social', el: 'Sports social' },
      label: { en: 'Clip velocity', el: 'Clip velocity' },
      emoji: '📱',
      gradient: 'linear-gradient(135deg, #08111f 0%, #0f766e 48%, #38bdf8 100%)'
    },
    question: {
      en: 'Will the official EuroLeague Final Four trophy-lift clip pass 3M TikTok views within 48 hours?',
      el: 'Θα περάσει το επίσημο clip της απονομής στο EuroLeague Final Four τα 3M views στο TikTok μέσα σε 48 ώρες;'
    },
    summary: {
      en: 'Crosses sports and social in a way that still resolves off one very clear public metric.',
      el: 'Ενώνει sports και social με τρόπο που πάλι κάνει resolve από ένα πολύ καθαρό public metric.'
    },
    resolution: {
      en: 'YES if the official trophy-lift clip exceeds 3M public TikTok views within 48 hours of upload.',
      el: 'YES αν το επίσημο clip της απονομής ξεπεράσει τα 3M public TikTok views μέσα σε 48 ώρες από το upload.'
    },
    why: {
      en: 'Useful for showing adjacent category overlap while keeping one simple resolution path.',
      el: 'Χρήσιμο για να δείχνει overlap γειτονικών κατηγοριών ενώ κρατά ένα απλό path resolution.'
    },
    primarySource: 'Official EuroLeague TikTok account',
    fallbackSource: 'Official EuroLeague short-form recap'
  },
  {
    id: 'SHW-01',
    categoryKey: 'showbiz',
    status: 'closing',
    featured: false,
    probability: 68,
    change: 5,
    volume: 17190,
    closeDate: '2026-03-22T23:59:00+02:00',
    resolveDate: '2026-03-26T23:59:00+02:00',
    sourceLink: 'https://www.youtube.com/',
    poster: {
      eyebrow: { en: 'Trailer market', el: 'Trailer market' },
      label: { en: 'Epic release', el: 'Epic release' },
      emoji: '🎬',
      gradient: 'linear-gradient(135deg, #1f1738 0%, #5b21b6 52%, #f59e0b 100%)'
    },
    question: {
      en: 'Will the official trailer for "The Odyssey" pass 20M YouTube views in its first 72 hours?',
      el: 'Θα περάσει το επίσημο trailer του "The Odyssey" τα 20M views στο YouTube στις πρώτες 72 ώρες;'
    },
    summary: {
      en: 'Showbiz market with a cinematic poster feel and a straightforward public outcome.',
      el: 'Showbiz αγορά με cinematic poster feel και ευθύ public outcome.'
    },
    resolution: {
      en: 'YES if the official trailer exceeds 20M public YouTube views within 72 hours of upload.',
      el: 'YES αν το επίσημο trailer ξεπεράσει τα 20M public views στο YouTube μέσα σε 72 ώρες από το upload.'
    },
    why: {
      en: 'Good for board polish because the card can feel visual without relying on licensed assets.',
      el: 'Καλό για board polish γιατί το card μπορεί να μοιάζει οπτικό χωρίς licensed assets.'
    },
    primarySource: 'Official studio YouTube channel',
    fallbackSource: 'Studio press release or website embed'
  },
  {
    id: 'SHW-02',
    categoryKey: 'showbiz',
    status: 'new',
    featured: false,
    probability: 41,
    change: 1,
    volume: 9680,
    closeDate: '2026-05-24T18:59:00+02:00',
    resolveDate: '2026-05-24T22:00:00+02:00',
    sourceLink: 'https://www.festival-cannes.com/en/',
    poster: {
      eyebrow: { en: 'Awards season', el: 'Awards season' },
      label: { en: 'Cannes check', el: 'Cannes check' },
      emoji: '🏆',
      gradient: 'linear-gradient(135deg, #111827 0%, #374151 45%, #fbbf24 100%)'
    },
    question: {
      en: "Will the 2026 Cannes Palme d'Or go to an English-language film?",
      el: 'Θα πάει ο Χρυσός Φοίνικας των Καννών 2026 σε αγγλόφωνη ταινία;'
    },
    summary: {
      en: 'Award-result market that adds a more cultured, festival-style vertical to the slate.',
      el: 'Αγορά αποτελέσματος βραβείου που προσθέτει πιο festival-style vertical στο slate.'
    },
    resolution: {
      en: "YES if the official Palme d'Or winner is primarily an English-language film.",
      el: 'YES αν ο επίσημος νικητής του Χρυσού Φοίνικα είναι κυρίως αγγλόφωνη ταινία.'
    },
    why: {
      en: 'Useful for showing that not every market has to look like finance or sports to feel structured.',
      el: 'Χρήσιμο για να δείχνει ότι δεν χρειάζεται κάθε αγορά να μοιάζει με finance ή sports για να νιώθει δομημένη.'
    },
    primarySource: 'Festival de Cannes official awards results',
    fallbackSource: 'Official Cannes press release'
  },
  {
    id: 'SHW-03',
    categoryKey: 'showbiz',
    status: 'live',
    featured: false,
    probability: 36,
    change: -1,
    volume: 11290,
    closeDate: '2026-05-16T21:59:00+02:00',
    resolveDate: '2026-05-17T01:00:00+02:00',
    sourceLink: 'https://eurovision.tv/',
    poster: {
      eyebrow: { en: 'Eurovision result', el: 'Αποτέλεσμα Eurovision' },
      label: { en: 'Final night', el: 'Βραδιά τελικού' },
      emoji: '✨',
      gradient: 'linear-gradient(135deg, #081326 0%, #1d4ed8 48%, #7c3aed 100%)'
    },
    question: {
      en: 'Will Eurovision 2026 be won by a Scandinavian country?',
      el: 'Θα κερδίσει τη Eurovision 2026 σκανδιναβική χώρα;'
    },
    summary: {
      en: 'Entertainment-result market with instantly recognisable event framing.',
      el: 'Entertainment-result αγορά με άμεσα αναγνωρίσιμο event framing.'
    },
    resolution: {
      en: 'YES if the official Eurovision winner represents Sweden, Norway, Denmark, Finland, or Iceland.',
      el: 'YES αν ο επίσημος νικητής της Eurovision εκπροσωπεί τη Σουηδία, τη Νορβηγία, τη Δανία, τη Φινλανδία ή την Ισλανδία.'
    },
    why: {
      en: 'Strong market because most people instantly understand both the event and the resolution path.',
      el: 'Δυνατή αγορά γιατί οι περισσότεροι καταλαβαίνουν αμέσως και το event και το path του resolution.'
    },
    primarySource: 'Official Eurovision final results',
    fallbackSource: 'Official Eurovision live results page'
  },
  {
    id: 'SHW-04',
    categoryKey: 'showbiz',
    status: 'new',
    featured: false,
    probability: 64,
    change: 4,
    volume: 12480,
    closeDate: '2026-04-24T23:59:00+02:00',
    resolveDate: '2026-04-29T23:59:00+02:00',
    sourceLink: 'https://www.youtube.com/',
    poster: {
      eyebrow: { en: 'Streaming trailer', el: 'Streaming trailer' },
      label: { en: 'Franchise teaser', el: 'Franchise teaser' },
      emoji: '🍿',
      gradient: 'linear-gradient(135deg, #1f172a 0%, #9333ea 52%, #f97316 100%)'
    },
    question: {
      en: 'Will a major streaming-franchise teaser pass 25M YouTube views within 5 days?',
      el: 'Θα περάσει teaser μεγάλου streaming franchise τα 25M views στο YouTube μέσα σε 5 ημέρες;'
    },
    summary: {
      en: 'Adds another polished entertainment card that feels instantly understandable in a live demo.',
      el: 'Προσθέτει άλλη μία polished entertainment κάρτα που γίνεται αμέσως κατανοητή σε live demo.'
    },
    resolution: {
      en: 'YES if the official teaser exceeds 25M public YouTube views within 5 days of upload.',
      el: 'YES αν το επίσημο teaser ξεπεράσει τα 25M public YouTube views μέσα σε 5 ημέρες από το upload.'
    },
    why: {
      en: 'Creates a cleaner showbiz shelf with multiple visual, internet-native outcomes.',
      el: 'Δημιουργεί καθαρότερο showbiz shelf με πολλαπλά οπτικά, internet-native outcomes.'
    },
    primarySource: 'Official streamer or studio YouTube upload',
    fallbackSource: 'Official press room or trailer page'
  },
  {
    id: 'SHW-05',
    categoryKey: 'showbiz',
    status: 'live',
    featured: false,
    probability: 47,
    change: -3,
    volume: 10720,
    closeDate: '2026-03-16T23:59:00+02:00',
    resolveDate: '2026-03-17T08:00:00+02:00',
    sourceLink: 'https://www.oscars.org/',
    poster: {
      eyebrow: { en: 'Oscars market', el: 'Oscars market' },
      label: { en: 'First-time winner', el: 'First-time winner' },
      emoji: '🎭',
      gradient: 'linear-gradient(135deg, #111827 0%, #7c2d12 46%, #f59e0b 100%)'
    },
    question: {
      en: 'Will the 2026 Oscar for Best Actor go to a first-time winner?',
      el: 'Θα πάει το Όσκαρ Α΄ Ανδρικού Ρόλου 2026 σε πρώτο νικητή;'
    },
    summary: {
      en: 'A clean outcome market that adds awards-night flavour without complicating the resolution path.',
      el: 'Καθαρή outcome αγορά που προσθέτει awards-night χαρακτήρα χωρίς να περιπλέκει το resolution path.'
    },
    resolution: {
      en: 'YES if the official 2026 Best Actor Oscar winner has never previously won that category.',
      el: 'YES αν ο επίσημος νικητής του Όσκαρ Α΄ Ανδρικού Ρόλου 2026 δεν έχει ξανακερδίσει την κατηγορία.'
    },
    why: {
      en: 'Good board inventory because it shows simple binary rules on a globally familiar event.',
      el: 'Καλό inventory για το board γιατί δείχνει απλούς binary κανόνες πάνω σε globally familiar event.'
    },
    primarySource: 'The Academy official winners page',
    fallbackSource: 'Official Oscars telecast result recap'
  },
  {
    id: 'SPT-01',
    categoryKey: 'sports',
    status: 'live',
    featured: false,
    surfaced: true,
    probability: 58,
    change: 7,
    volume: 22310,
    closeDate: '2026-05-21T18:00:00+02:00',
    resolveDate: '2026-05-21T23:30:00+02:00',
    sourceLink: 'https://www.euroleaguebasketball.net/euroleague/',
    poster: {
      eyebrow: { en: 'EuroLeague', el: 'EuroLeague' },
      label: { en: 'Olympiacos run', el: 'Πορεία Ολυμπιακού' },
      emoji: '🏀',
      art: 'art-court',
      gradient: 'linear-gradient(135deg, #200b0b 0%, #7f1d1d 52%, #ef4444 100%)'
    },
    question: {
      en: 'Will Olympiacos reach the 2026 EuroLeague Final Four?',
      el: 'Θα φτάσει ο Ολυμπιακός στο Final Four της EuroLeague 2026;'
    },
    summary: {
      en: 'EuroLeague exposure adds instant Greek relevance and gives the board a sharper sports identity.',
      el: 'Η έκθεση στην EuroLeague προσθέτει άμεση ελληνική συνάφεια και δίνει στο board πιο καθαρή sports ταυτότητα.'
    },
    resolution: {
      en: 'YES if Olympiacos qualifies for the official 2026 EuroLeague Final Four.',
      el: 'YES αν ο Ολυμπιακός προκριθεί στο επίσημο Final Four της EuroLeague 2026.'
    },
    why: {
      en: 'This is the kind of market investors immediately imagine people sharing and debating.',
      el: 'Είναι το είδος αγοράς που οι investors φαντάζονται αμέσως ότι ο κόσμος θα μοιράζεται και θα συζητά.'
    },
    primarySource: 'EuroLeague official bracket and results',
    fallbackSource: 'EuroLeague official standings page'
  },
  {
    id: 'SPT-02',
    categoryKey: 'sports',
    status: 'live',
    featured: true,
    probability: 55,
    change: 4,
    volume: 23640,
    closeDate: '2027-04-16T22:59:00+03:00',
    resolveDate: '2027-04-17T12:00:00+03:00',
    sourceLink: 'https://www.euroleaguebasketball.net/euroleague/standings/',
    poster: {
      eyebrow: { en: 'EuroLeague rivalry', el: 'Rivalry EuroLeague' },
      label: { en: 'Panathinaikos vs Olympiacos', el: 'Παναθηναϊκός vs Ολυμπιακός' },
      emoji: '☘️',
      art: 'art-court',
      gradient: 'linear-gradient(135deg, #082032 0%, #14532d 42%, #dc2626 100%)'
    },
    question: {
      en: 'Will Panathinaikos finish above Olympiacos in the 2026-27 EuroLeague regular season?',
      el: 'Θα τερματίσει ο Παναθηναϊκός πάνω από τον Ολυμπιακό στην κανονική περίοδο της EuroLeague 2026-27;'
    },
    summary: {
      en: 'A sharper Greek basketball market than a generic top-four chase because the rivalry and the outcome both read instantly.',
      el: 'Πιο κοφτερή ελληνική μπασκετική αγορά από ένα generic top-four chase, γιατί και το rivalry και το outcome διαβάζονται αμέσως.'
    },
    resolution: {
      en: 'YES if the final official 2026-27 EuroLeague regular-season standings place Panathinaikos above Olympiacos. NO otherwise.',
      el: 'YES αν η τελική επίσημη βαθμολογία της κανονικής περιόδου της EuroLeague 2026-27 τοποθετεί τον Παναθηναϊκό πάνω από τον Ολυμπιακό. NO διαφορετικά.'
    },
    why: {
      en: 'This is the kind of local sports contract that feels obvious, premium, and shareable in a Greek consumer product.',
      el: 'Αυτό είναι το είδος τοπικού sports contract που μοιάζει αυτονόητο, premium και shareable σε ελληνικό consumer product.'
    },
    primarySource: 'EuroLeague official regular-season standings',
    fallbackSource: 'EuroLeague official game centre and final standings recap'
  },
  {
    id: 'SPT-03',
    categoryKey: 'sports',
    status: 'new',
    featured: false,
    probability: 46,
    change: 4,
    volume: 21440,
    closeDate: '2026-05-30T20:59:00+02:00',
    resolveDate: '2026-05-30T23:59:00+02:00',
    sourceLink: 'https://www.uefa.com/uefachampionsleague/',
    poster: {
      eyebrow: { en: 'Champions League', el: 'Champions League' },
      label: { en: 'Final spot', el: 'Θέση στον τελικό' },
      emoji: '⚽',
      art: 'art-pitch',
      gradient: 'linear-gradient(135deg, #06142a 0%, #1d4ed8 44%, #0f172a 100%)'
    },
    question: {
      en: 'Will the 2026 UEFA Champions League final feature an English club?',
      el: 'Θα έχει ο τελικός του UEFA Champions League 2026 αγγλική ομάδα;'
    },
    summary: {
      en: 'Champions League coverage is essential if the board is meant to feel like a broad consumer market product.',
      el: 'Η κάλυψη Champions League είναι βασική αν το board πρέπει να μοιάζει με broad consumer market product.'
    },
    resolution: {
      en: 'YES if at least one finalist in the official 2026 Champions League final is an English club.',
      el: 'YES αν τουλάχιστον ένας φιναλίστ στον επίσημο τελικό Champions League 2026 είναι αγγλική ομάδα.'
    },
    why: {
      en: 'Adds globally legible sports inventory for investors who do not follow Greek basketball.',
      el: 'Προσθέτει globally legible sports inventory για investors που δεν παρακολουθούν ελληνικό μπάσκετ.'
    },
    primarySource: 'UEFA official fixtures and results',
    fallbackSource: 'UEFA Champions League competition page'
  },
  {
    id: 'SPT-04',
    categoryKey: 'sports',
    status: 'live',
    featured: false,
    probability: 52,
    change: -3,
    volume: 14730,
    closeDate: '2026-04-29T21:59:00+02:00',
    resolveDate: '2026-04-29T23:59:00+02:00',
    sourceLink: 'https://www.uefa.com/uefachampionsleague/',
    poster: {
      eyebrow: { en: 'UCL knockout', el: 'UCL knockout' },
      label: { en: 'Semi-final race', el: 'Κούρσα για ημιτελικά' },
      emoji: '🌃',
      gradient: 'linear-gradient(135deg, #1f2937 0%, #111827 45%, #6366f1 100%)'
    },
    question: {
      en: 'Will Bayern Munich reach the 2026 Champions League semi-finals?',
      el: 'Θα φτάσει η Bayern Munich στα ημιτελικά του Champions League 2026;'
    },
    summary: {
      en: 'A second Champions League card creates more believable board depth inside the sports category.',
      el: 'Μια δεύτερη κάρτα Champions League δημιουργεί πιο πειστικό βάθος μέσα στην sports κατηγορία.'
    },
    resolution: {
      en: 'YES if Bayern Munich officially qualifies for the 2026 Champions League semi-finals.',
      el: 'YES αν η Bayern Munich προκριθεί επίσημα στα ημιτελικά του Champions League 2026.'
    },
    why: {
      en: 'Helps the board look like a shelf with repeatable sports inventory instead of isolated examples.',
      el: 'Βοηθά το board να μοιάζει με shelf επαναλαμβανόμενου sports inventory και όχι με μεμονωμένα παραδείγματα.'
    },
    primarySource: 'UEFA official bracket',
    fallbackSource: 'UEFA match centre'
  },
  {
    id: 'SPT-05',
    categoryKey: 'sports',
    status: 'live',
    featured: false,
    probability: 43,
    change: 6,
    volume: 13620,
    closeDate: '2026-05-10T22:30:00+02:00',
    resolveDate: '2026-05-11T01:00:00+02:00',
    sourceLink: 'https://www.slgr.gr/',
    poster: {
      eyebrow: { en: 'Greek football', el: 'Ελληνικό ποδόσφαιρο' },
      label: { en: 'Title race', el: 'Κούρσα τίτλου' },
      emoji: '🏟️',
      art: 'art-pitch',
      gradient: 'linear-gradient(135deg, #082f49 0%, #0f766e 46%, #22c55e 100%)'
    },
    question: {
      en: 'Will AEK win the 2025-26 Greek Super League title?',
      el: 'Θα κατακτήσει η ΑΕΚ το πρωτάθλημα της Greek Super League 2025-26;'
    },
    summary: {
      en: 'Adds local football relevance and makes the sports shelf feel more Greek, not only EuroLeague-heavy.',
      el: 'Προσθέτει τοπική ποδοσφαιρική συνάφεια και κάνει το sports shelf να νιώθει πιο ελληνικό, όχι μόνο EuroLeague-heavy.'
    },
    resolution: {
      en: 'YES if AEK officially finishes first in the 2025-26 Greek Super League title race.',
      el: 'YES αν η ΑΕΚ τερματίσει επίσημα πρώτη στην κούρσα τίτλου της Greek Super League 2025-26.'
    },
    why: {
      en: 'Important because it widens the demo into a more believable mass-market sports product.',
      el: 'Σημαντικό γιατί ανοίγει το demo σε πιο πειστικό mass-market sports product.'
    },
    primarySource: 'Greek Super League official standings',
    fallbackSource: 'Official league match centre'
  },
  {
    id: 'SPT-06',
    categoryKey: 'sports',
    status: 'new',
    featured: false,
    probability: 49,
    change: 2,
    volume: 11970,
    closeDate: '2026-06-01T16:00:00+02:00',
    resolveDate: '2026-06-01T20:00:00+02:00',
    sourceLink: 'https://www.rolandgarros.com/en-us/',
    poster: {
      eyebrow: { en: 'Tennis major', el: 'Grand Slam' },
      label: { en: 'Tsitsipas check', el: 'Tsitsipas check' },
      emoji: '🎾',
      art: 'art-tennis',
      gradient: 'linear-gradient(135deg, #1c1917 0%, #b45309 48%, #facc15 100%)'
    },
    question: {
      en: 'Will Stefanos Tsitsipas reach the 2026 Roland-Garros quarter-finals?',
      el: 'Θα φτάσει ο Στέφανος Τσιτσιπάς στα προημιτελικά του Roland-Garros 2026;'
    },
    summary: {
      en: 'Individual-sport inventory gives the slate more shape and broadens the audience story.',
      el: 'Το inventory ατομικού αθλήματος δίνει περισσότερο σχήμα στο slate και ανοίγει το audience story.'
    },
    resolution: {
      en: 'YES if Tsitsipas officially qualifies for the quarter-finals of the 2026 Roland-Garros men’s singles draw.',
      el: 'YES αν ο Τσιτσιπάς προκριθεί επίσημα στα προημιτελικά του ταμπλό ανδρών του Roland-Garros 2026.'
    },
    why: {
      en: 'Good investor-demo market because the athlete, event, and binary result are all immediately legible.',
      el: 'Καλό investor-demo market γιατί ο αθλητής, το event και το binary αποτέλεσμα είναι όλα άμεσα κατανοητά.'
    },
    primarySource: 'Roland-Garros official draw and results',
    fallbackSource: 'ATP official match records'
  },
  {
    id: 'SPT-07',
    categoryKey: 'sports',
    status: 'live',
    featured: false,
    probability: 39,
    change: -2,
    volume: 11340,
    closeDate: '2026-04-20T20:00:00+02:00',
    resolveDate: '2026-04-21T04:00:00+02:00',
    sourceLink: 'https://www.nba.com/',
    poster: {
      eyebrow: { en: 'NBA season', el: 'NBA season' },
      label: { en: 'Giannis ladder', el: 'Giannis ladder' },
      emoji: '🦌',
      gradient: 'linear-gradient(135deg, #052e16 0%, #166534 48%, #84cc16 100%)'
    },
    question: {
      en: 'Will Giannis Antetokounmpo finish top 3 in 2026 NBA MVP voting?',
      el: 'Θα τερματίσει ο Γιάννης Αντετοκούνμπο στην πρώτη τριάδα της ψηφοφορίας για το NBA MVP 2026;'
    },
    summary: {
      en: 'A globally legible sports market with obvious Greek relevance and a clean public result.',
      el: 'Globally legible sports αγορά με προφανή ελληνική συνάφεια και καθαρό public result.'
    },
    resolution: {
      en: 'YES if the official NBA MVP vote results list Giannis inside the top three finishers.',
      el: 'YES αν τα επίσημα αποτελέσματα της ψηφοφορίας MVP του NBA βάζουν τον Γιάννη μέσα στην πρώτη τριάδα.'
    },
    why: {
      en: 'Strong deck market because even non-fans understand the prestige and the outcome path.',
      el: 'Δυνατή αγορά για deck γιατί ακόμα και μη φίλαθλοι καταλαβαίνουν το prestige και το outcome path.'
    },
    primarySource: 'NBA official awards announcement',
    fallbackSource: 'Official NBA awards recap'
  },
  {
    id: 'SPT-08',
    categoryKey: 'sports',
    status: 'new',
    featured: false,
    probability: 55,
    change: 3,
    volume: 12180,
    closeDate: '2026-04-09T21:59:00+02:00',
    resolveDate: '2026-04-09T23:59:00+02:00',
    sourceLink: 'https://www.uefa.com/uefachampionsleague/',
    poster: {
      eyebrow: { en: 'UCL bracket', el: 'UCL bracket' },
      label: { en: 'Quarter-final push', el: 'Push για προημιτελικά' },
      emoji: '🌍',
      gradient: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 46%, #38bdf8 100%)'
    },
    question: {
      en: 'Will Inter Milan reach the 2026 Champions League quarter-finals?',
      el: 'Θα φτάσει η Inter Milan στα προημιτελικά του Champions League 2026;'
    },
    summary: {
      en: 'More football depth makes the board feel fuller and more believable for mainstream users.',
      el: 'Περισσότερο βάθος στο ποδόσφαιρο κάνει το board να μοιάζει πιο γεμάτο και πιο πειστικό για mainstream χρήστες.'
    },
    resolution: {
      en: 'YES if Inter Milan officially qualifies for the 2026 Champions League quarter-finals.',
      el: 'YES αν η Inter Milan προκριθεί επίσημα στα προημιτελικά του Champions League 2026.'
    },
    why: {
      en: 'Useful because it rounds out sports inventory without changing any of the trading rules.',
      el: 'Χρήσιμο γιατί ολοκληρώνει το sports inventory χωρίς να αλλάζει καθόλου τους trading κανόνες.'
    },
    primarySource: 'UEFA official fixtures and bracket',
    fallbackSource: 'UEFA match centre'
  },
  {
    id: 'WTH-01',
    categoryKey: 'weather',
    status: 'live',
    featured: false,
    probability: 44,
    change: 2,
    volume: 10540,
    closeDate: '2026-05-15T20:00:00+02:00',
    resolveDate: '2026-05-15T23:00:00+02:00',
    sourceLink: 'https://www.emy.gr/',
    poster: {
      eyebrow: { en: 'Athens weather', el: 'Καιρός Αθήνας' },
      label: { en: 'Heat watch', el: 'Heat watch' },
      emoji: '☀️',
      art: 'art-sun',
      gradient: 'linear-gradient(135deg, #3f2b0b 0%, #d97706 52%, #fde68a 100%)'
    },
    question: {
      en: 'Will Athens record a daily maximum temperature above 30°C before 15 May 2026?',
      el: 'Θα καταγράψει η Αθήνα ημερήσια μέγιστη θερμοκρασία πάνω από 30°C πριν από τις 15 Μαΐου 2026;'
    },
    summary: {
      en: 'Weather adds a broad consumer angle and resolves from a public, familiar data source.',
      el: 'Ο καιρός προσθέτει broad consumer γωνία και κάνει resolve από δημόσια, οικεία πηγή δεδομένων.'
    },
    resolution: {
      en: 'YES if the official Athens daily maximum exceeds 30°C on any day before 15 May 2026.',
      el: 'YES αν η επίσημη ημερήσια μέγιστη θερμοκρασία της Αθήνας ξεπεράσει τους 30°C οποιαδήποτε ημέρα πριν από τις 15 Μαΐου 2026.'
    },
    why: {
      en: 'Strong category because the outcome is intuitive even for people new to prediction markets.',
      el: 'Δυνατή κατηγορία γιατί το outcome είναι διαισθητικό ακόμα και για όσους είναι νέοι στα prediction markets.'
    },
    primarySource: 'Hellenic National Meteorological Service',
    fallbackSource: 'National Observatory weather archive'
  },
  {
    id: 'WTH-02',
    categoryKey: 'weather',
    status: 'closing',
    featured: false,
    probability: 37,
    change: -4,
    volume: 9420,
    closeDate: '2026-04-01T09:00:00+02:00',
    resolveDate: '2026-04-01T23:30:00+02:00',
    sourceLink: 'https://www.emy.gr/',
    poster: {
      eyebrow: { en: 'Thessaloniki rain', el: 'Βροχή Θεσσαλονίκης' },
      label: { en: 'Rain spike', el: 'Rain spike' },
      emoji: '🌧️',
      art: 'art-rain',
      gradient: 'linear-gradient(135deg, #0f172a 0%, #334155 48%, #38bdf8 100%)'
    },
    question: {
      en: 'Will Thessaloniki record more than 25mm of rain on 1 April 2026?',
      el: 'Θα καταγράψει η Θεσσαλονίκη πάνω από 25mm βροχής την 1η Απριλίου 2026;'
    },
    summary: {
      en: 'Short-dated weather market that shows the board can host fast-resolution public data questions.',
      el: 'Βραχυπρόθεσμη αγορά καιρού που δείχνει ότι το board μπορεί να φιλοξενήσει fast-resolution public data ερωτήσεις.'
    },
    resolution: {
      en: 'YES if the official Thessaloniki daily precipitation total exceeds 25mm on 1 April 2026.',
      el: 'YES αν το επίσημο ημερήσιο ύψος βροχής της Θεσσαλονίκης ξεπεράσει τα 25mm την 1η Απριλίου 2026.'
    },
    why: {
      en: 'Adds a quick-settling market type that is easy to show in a live walkthrough.',
      el: 'Προσθέτει γρήγορα settling τύπο αγοράς που είναι εύκολο να φανεί σε live walkthrough.'
    },
    primarySource: 'Hellenic National Meteorological Service daily station data',
    fallbackSource: 'National Observatory historical data'
  },
  {
    id: 'WTH-03',
    categoryKey: 'weather',
    status: 'new',
    featured: false,
    probability: 49,
    change: 1,
    volume: 8860,
    closeDate: '2026-04-12T12:00:00+02:00',
    resolveDate: '2026-04-12T23:30:00+02:00',
    sourceLink: 'https://www.meteo.gr/',
    poster: {
      eyebrow: { en: 'Santorini wind', el: 'Άνεμοι Σαντορίνης' },
      label: { en: 'Aegean gusts', el: 'Aegean gusts' },
      emoji: '🌬️',
      art: 'art-aegean',
      gradient: 'linear-gradient(135deg, #082f49 0%, #0369a1 50%, #7dd3fc 100%)'
    },
    question: {
      en: 'Will Santorini record winds above 8 Beaufort on Easter Sunday 2026?',
      el: 'Θα καταγράψει η Σαντορίνη ανέμους πάνω από 8 μποφόρ την Κυριακή του Πάσχα 2026;'
    },
    summary: {
      en: 'Travel-friendly weather market that gives the slate a more local and seasonal flavour.',
      el: 'Travel-friendly αγορά καιρού που δίνει στο slate πιο τοπικό και seasonal χαρακτήρα.'
    },
    resolution: {
      en: 'YES if the official Santorini wind reading exceeds 8 Beaufort during Easter Sunday 2026.',
      el: 'YES αν η επίσημη μέτρηση ανέμου στη Σαντορίνη ξεπεράσει τα 8 μποφόρ μέσα στην Κυριακή του Πάσχα 2026.'
    },
    why: {
      en: 'Good category bridge between travel, lifestyle, and public data resolution.',
      el: 'Καλή γέφυρα κατηγορίας ανάμεσα σε travel, lifestyle και public data resolution.'
    },
    primarySource: 'National Observatory / Meteo station data',
    fallbackSource: 'HNMS island weather bulletin'
  },
  {
    id: 'WTH-04',
    categoryKey: 'weather',
    status: 'live',
    featured: true,
    probability: 29,
    change: 4,
    volume: 21420,
    closeDate: '2026-08-31T20:00:00+03:00',
    resolveDate: '2026-08-31T23:30:00+03:00',
    sourceLink: 'https://www.meteo.gr/',
    poster: {
      eyebrow: { en: 'Athens heatwave', el: 'Καύσωνας στην Αθήνα' },
      label: { en: '43°C watch', el: 'Όριο 43°C' },
      emoji: '🥵',
      art: 'art-sun',
      gradient: 'linear-gradient(135deg, #431407 0%, #ea580c 46%, #facc15 100%)'
    },
    question: {
      en: 'Will the 2026 summer heatwave in Athens break 43°C?',
      el: 'Θα σπάσει ο καύσωνας του καλοκαιριού 2026 στην Αθήνα το όριο των 43°C;'
    },
    summary: {
      en: 'Big-threshold weather market with instant consumer relevance and a much cleaner headline than a routine warm-day contract.',
      el: 'Weather market με μεγάλο threshold, άμεση consumer συνάφεια και πολύ καθαρότερο headline από ένα routine contract ζέστης.'
    },
    resolution: {
      en: 'YES if the official daily maximum temperature for the named Athens city station rises above 43.0°C on any day from 1 June through 31 August 2026. NO otherwise.',
      el: 'YES αν η επίσημη ημερήσια μέγιστη θερμοκρασία για τον ονομασμένο σταθμό πόλης της Αθήνας ανέβει πάνω από 43,0°C σε οποιαδήποτε ημέρα από 1 Ιουνίου έως 31 Αυγούστου 2026. NO διαφορετικά.'
    },
    why: {
      en: 'It is locally intuitive, high-signal for Greeks, and strong enough to anchor the weather category.',
      el: 'Είναι τοπικά διαισθητικό, high-signal για την Ελλάδα και αρκετά δυνατό ώστε να αγκυρώνει την κατηγορία καιρού.'
    },
    primarySource: 'National Observatory Athens city station daily maximum temperature',
    fallbackSource: 'Hellenic National Meteorological Service Athens daily bulletin'
  },
  {
    id: 'WTH-05',
    categoryKey: 'weather',
    status: 'new',
    featured: false,
    probability: 31,
    change: -2,
    volume: 8120,
    closeDate: '2026-03-25T08:00:00+02:00',
    resolveDate: '2026-03-25T23:30:00+02:00',
    sourceLink: 'https://www.meteo.gr/',
    poster: {
      eyebrow: { en: 'Holiday weather', el: 'Αργία και καιρός' },
      label: { en: 'March 25 rain', el: 'Βροχή 25ης Μαρτίου' },
      emoji: '☔',
      gradient: 'linear-gradient(135deg, #111827 0%, #1d4ed8 44%, #94a3b8 100%)'
    },
    question: {
      en: 'Will central Athens record measurable rain on 25 March 2026?',
      el: 'Θα καταγράψει το κέντρο της Αθήνας μετρήσιμη βροχή στις 25 Μαρτίου 2026;'
    },
    summary: {
      en: 'A short-dated weather contract that is easy to explain and easy to demonstrate live.',
      el: 'Βραχυπρόθεσμο weather contract που εξηγείται εύκολα και δείχνεται εύκολα live.'
    },
    resolution: {
      en: 'YES if the official central Athens station records measurable precipitation on 25 March 2026.',
      el: 'YES αν ο επίσημος σταθμός του κέντρου της Αθήνας καταγράψει μετρήσιμη βροχόπτωση στις 25 Μαρτίου 2026.'
    },
    why: {
      en: 'Helps the board show quick public-data contracts that feel local and seasonal.',
      el: 'Βοηθά το board να δείξει γρήγορα public-data contracts που νιώθουν τοπικά και seasonal.'
    },
    primarySource: 'National Observatory / Meteo Athens station data',
    fallbackSource: 'HNMS Athens daily bulletin'
  },
  {
    id: 'MAC-06',
    categoryKey: 'macro',
    status: 'new',
    featured: false,
    probability: 64,
    change: 3,
    volume: 26340,
    closeDate: '2026-05-07T11:59:00+02:00',
    resolveDate: '2026-05-07T13:00:00+02:00',
    sourceLink: 'https://www.aia.gr/company-and-business/airport/company-information-and-financial-results/traffic-statistics/',
    poster: {
      eyebrow: { en: 'Athens travel data', el: 'Travel data Αθήνας' },
      label: { en: 'AIA traffic', el: 'AIA traffic' },
      emoji: '🛫',
      art: 'art-airport',
      gradient: 'linear-gradient(135deg, #071630 0%, #12386a 50%, #38bdf8 100%)'
    },
    question: {
      en: 'Will Athens International Airport passenger traffic in May 2026 beat May 2025?',
      el: 'Θα ξεπεράσει η επιβατική κίνηση του Διεθνούς Αερολιμένα Αθηνών τον Μάιο 2026 το επίπεδο του Μαΐου 2025;'
    },
    summary: {
      en: 'Travel demand is a very Greek macro signal and reads instantly in an investor demo.',
      el: 'Η ταξιδιωτική ζήτηση είναι πολύ ελληνικό macro σήμα και διαβάζεται αμέσως σε investor demo.'
    },
    resolution: {
      en: 'YES if AIA reports total May 2026 passenger traffic above the official May 2025 figure. NO otherwise.',
      el: 'YES αν ο ΔΑΑ ανακοινώσει συνολική επιβατική κίνηση Μαΐου 2026 πάνω από το επίσημο μέγεθος του Μαΐου 2025. NO διαφορετικά.'
    },
    why: {
      en: 'It makes the board feel more local, seasonal, and tied to observable Greek demand.',
      el: 'Κάνει το board να νιώθει πιο τοπικό, seasonal και δεμένο με παρατηρήσιμη ελληνική ζήτηση.'
    },
    primarySource: 'Athens International Airport monthly traffic statistics',
    fallbackSource: 'AIA investor relations traffic release'
  },
  {
    id: 'MAC-07',
    categoryKey: 'macro',
    status: 'live',
    featured: false,
    probability: 56,
    change: 4,
    volume: 17640,
    closeDate: '2026-04-01T11:59:00+02:00',
    resolveDate: '2026-04-01T23:00:00+02:00',
    sourceLink: 'https://ypergasias.gov.gr/',
    poster: {
      eyebrow: { en: 'Minimum wage', el: 'Κατώτατος μισθός' },
      label: { en: '€950 watch', el: 'Στόχος €950' },
      emoji: '💶',
      gradient: 'linear-gradient(135deg, #131c2e 0%, #1d4ed8 46%, #34d399 100%)'
    },
    question: {
      en: "Will Greece's new statutory monthly minimum wage be confirmed at €950 by 1 April 2026?",
      el: 'Θα επιβεβαιωθεί ο νέος νόμιμος μηνιαίος κατώτατος μισθός στην Ελλάδα στα €950 έως την 1η Απριλίου 2026;'
    },
    summary: {
      en: 'A very legible Greek wage-policy market with immediate relevance beyond finance-native users.',
      el: 'Πολύ καθαρή αγορά για την ελληνική μισθολογική πολιτική με άμεση συνάφεια και πέρα από finance-native χρήστες.'
    },
    resolution: {
      en: 'YES if by 1 April 2026 the Greek government officially confirms a gross statutory monthly minimum wage of exactly €950 for the new rate. NO if the confirmed figure differs or no official confirmation is issued by then.',
      el: 'YES αν έως την 1η Απριλίου 2026 η ελληνική κυβέρνηση επιβεβαιώσει επίσημα μικτό νόμιμο μηνιαίο κατώτατο μισθό ακριβώς €950 για τη νέα τιμή. NO αν το επιβεβαιωμένο ποσό είναι διαφορετικό ή δεν υπάρξει επίσημη επιβεβαίωση έως τότε.'
    },
    why: {
      en: 'Useful because it is local, political, economic, and instantly understandable in one read.',
      el: 'Χρήσιμο γιατί είναι τοπικό, πολιτικό, οικονομικό και γίνεται αμέσως κατανοητό με μία ματιά.'
    },
    primarySource: 'Greek Ministry of Labour official announcement',
    fallbackSource: 'Government Gazette or Prime Minister office release'
  },
  {
    id: 'MAC-08',
    categoryKey: 'macro',
    status: 'live',
    featured: false,
    probability: 61,
    change: 2,
    volume: 16880,
    closeDate: '2027-02-12T11:59:00+02:00',
    resolveDate: '2027-02-26T18:00:00+02:00',
    sourceLink: 'https://insete.gr/statistical-bulletin/',
    poster: {
      eyebrow: { en: 'Greek tourism', el: 'Ελληνικός τουρισμός' },
      label: { en: '2026 record watch', el: 'Ρεκόρ 2026' },
      emoji: '🏝️',
      art: 'art-aegean',
      gradient: 'linear-gradient(135deg, #082032 0%, #0f766e 46%, #38bdf8 100%)'
    },
    question: {
      en: 'Will Greece\'s international tourist arrivals in 2026 exceed the 2025 total?',
      el: 'Θα ξεπεράσουν οι διεθνείς τουριστικές αφίξεις της Ελλάδας το 2026 το σύνολο του 2025;'
    },
    summary: {
      en: 'A longer-duration Greek demand market that gives the category a full-season arc.',
      el: 'Αγορά μεγαλύτερης διάρκειας πάνω στην ελληνική ζήτηση που δίνει full-season τόξο στην κατηγορία.'
    },
    resolution: {
      en: 'YES if the official full-year 2026 total for international tourist arrivals in Greece is higher than the official full-year 2025 total. NO otherwise.',
      el: 'YES αν το επίσημο σύνολο διεθνών τουριστικών αφίξεων της Ελλάδας για όλο το 2026 είναι υψηλότερο από το επίσημο σύνολο του 2025. NO διαφορετικά.'
    },
    why: {
      en: 'It adds a credible long-dated Greek macro contract without drifting into niche finance language.',
      el: 'Προσθέτει αξιόπιστο μακρινό ελληνικό macro contract χωρίς να γλιστρά σε niche finance γλώσσα.'
    },
    primarySource: 'INSETE statistical bulletin or Bank of Greece annual travel data',
    fallbackSource: 'Greek tourism ministry or ELSTAT annual arrivals release'
  },
  {
    id: 'MAC-09',
    categoryKey: 'macro',
    status: 'live',
    featured: true,
    probability: 46,
    change: 3,
    volume: 24980,
    closeDate: '2026-12-31T18:59:00+02:00',
    resolveDate: '2026-12-31T23:59:00+02:00',
    sourceLink: 'https://www.fuelprices.gr/',
    poster: {
      eyebrow: { en: 'Everyday prices', el: 'Τιμές καθημερινότητας' },
      label: { en: 'Petrol watch', el: 'Παρακολούθηση βενζίνης' },
      emoji: '⛽',
      art: 'art-fuel',
      gradient: 'linear-gradient(135deg, #081826 0%, #0f4c81 42%, #14b8a6 100%)'
    },
    question: {
      en: 'Will petrol in Greece go above €2 per litre again before the end of 2026?',
      el: 'Θα πάει ξανά η βενζίνη στην Ελλάδα πάνω από €2 το λίτρο πριν από το τέλος του 2026;'
    },
    summary: {
      en: 'Consumer-price market with instant everyday relevance and a headline mainstream users understand without any financial translation layer.',
      el: 'Αγορά consumer τιμών με άμεση καθημερινή συνάφεια και headline που ο mainstream χρήστης καταλαβαίνει χωρίς καμία financial μετάφραση.'
    },
    resolution: {
      en: 'YES if the official nationwide average price for unleaded petrol in Greece exceeds €2.00 per litre on any publication before 31 December 2026. NO otherwise.',
      el: 'YES αν η επίσημη πανελλαδική μέση τιμή αμόλυβδης βενζίνης στην Ελλάδα ξεπεράσει τα €2,00 ανά λίτρο σε οποιαδήποτε δημοσίευση πριν από τις 31 Δεκεμβρίου 2026. NO διαφορετικά.'
    },
    why: {
      en: 'It anchors the macro shelf in a question ordinary people actually notice in real life, not just on data calendars.',
      el: 'Αγκυρώνει το macro shelf σε ερώτημα που ο κόσμος παρατηρεί στην πραγματική ζωή και όχι μόνο στα data calendars.'
    },
    primarySource: 'Official Greek Fuel Price Observatory nationwide unleaded average',
    fallbackSource: 'European Commission weekly oil bulletin for Greece'
  },
  {
    id: 'SOC-07',
    categoryKey: 'social',
    status: 'live',
    featured: false,
    probability: 53,
    change: 4,
    volume: 13440,
    closeDate: '2026-04-08T23:59:00+02:00',
    resolveDate: '2026-04-10T23:59:00+02:00',
    sourceLink: 'https://www.youtube.com/',
    poster: {
      eyebrow: { en: 'Greek derby social', el: 'Greek derby social' },
      label: { en: 'Recap velocity', el: 'Recap velocity' },
      emoji: '📹',
      gradient: 'linear-gradient(135deg, #0f172a 0%, #065f46 45%, #22c55e 100%)'
    },
    question: {
      en: 'Will the first official Olympiacos vs Panathinaikos derby highlight package pass 1M YouTube views within 48 hours?',
      el: 'Θα περάσει το πρώτο επίσημο highlight package από ντέρμπι Ολυμπιακός vs Παναθηναϊκός το 1M YouTube views μέσα σε 48 ώρες;'
    },
    summary: {
      en: 'Adds a distinctly local social card with a mainstream sports-internet feel.',
      el: 'Προσθέτει μια καθαρά τοπική social κάρτα με mainstream sports-internet αίσθηση.'
    },
    resolution: {
      en: 'YES if the official derby recap upload exceeds 1M public YouTube views within 48 hours.',
      el: 'YES αν το επίσημο derby recap upload ξεπεράσει το 1M public YouTube views μέσα σε 48 ώρες.'
    },
    why: {
      en: 'Helps the board feel like it belongs in Greece, not just translated for Greece.',
      el: 'Βοηθά το board να μοιάζει σαν να ανήκει στην Ελλάδα και όχι απλώς να έχει μεταφραστεί για την Ελλάδα.'
    },
    primarySource: 'Official broadcaster or league YouTube upload',
    fallbackSource: 'Official match-centre video recap'
  },
  {
    id: 'SHW-06',
    categoryKey: 'showbiz',
    status: 'closing',
    featured: false,
    probability: 59,
    change: 6,
    volume: 18790,
    closeDate: '2026-05-16T20:59:00+02:00',
    resolveDate: '2026-05-17T23:30:00+02:00',
    sourceLink: 'https://eurovision.tv/',
    poster: {
      eyebrow: { en: 'Greece on stage', el: 'Η Ελλάδα στη σκηνή' },
      label: { en: 'Top 10 watch', el: 'Top 10 watch' },
      emoji: '🌟',
      art: 'art-stage',
      gradient: 'linear-gradient(135deg, #111827 0%, #4f46e5 48%, #f472b6 100%)'
    },
    question: {
      en: 'Will Greece finish inside the top 10 at Eurovision 2026?',
      el: 'Θα τερματίσει η Ελλάδα μέσα στην πρώτη δεκάδα της Eurovision 2026;'
    },
    summary: {
      en: 'A clean entertainment-result market with obvious Greek relevance and instant demo appeal.',
      el: 'Καθαρή entertainment-result αγορά με προφανή ελληνική συνάφεια και άμεσο demo appeal.'
    },
    resolution: {
      en: 'YES if Greece places 10th or better in the official Eurovision 2026 grand-final scoreboard.',
      el: 'YES αν η Ελλάδα τερματίσει στη 10η θέση ή υψηλότερα στον επίσημο πίνακα του τελικού της Eurovision 2026.'
    },
    why: {
      en: 'This is exactly the kind of pop-culture question that makes a Greek board feel shareable.',
      el: 'Αυτό είναι ακριβώς το είδος pop-culture ερώτησης που κάνει ένα ελληνικό board να μοιάζει shareable.'
    },
    primarySource: 'Official Eurovision final scoreboard',
    fallbackSource: 'Official Eurovision results page'
  },
  {
    id: 'SPT-09',
    categoryKey: 'sports',
    status: 'live',
    featured: false,
    probability: 57,
    change: 4,
    volume: 20620,
    closeDate: '2026-06-18T20:00:00+02:00',
    resolveDate: '2026-06-22T23:30:00+02:00',
    sourceLink: 'https://www.esake.gr/',
    poster: {
      eyebrow: { en: 'Greek basketball', el: 'Ελληνικό μπάσκετ' },
      label: { en: 'League title', el: 'League title' },
      emoji: '🏆',
      art: 'art-court',
      gradient: 'linear-gradient(135deg, #082032 0%, #14532d 45%, #84cc16 100%)'
    },
    question: {
      en: 'Will Panathinaikos win the 2025-26 Greek Basket League title?',
      el: 'Θα κατακτήσει ο Παναθηναϊκός τον τίτλο της Greek Basket League 2025-26;'
    },
    summary: {
      en: 'A local-sports market that makes the sports slate feel built for Greece first.',
      el: 'Local-sports αγορά που κάνει το sports slate να μοιάζει χτισμένο πρώτα για την Ελλάδα.'
    },
    resolution: {
      en: 'YES if Panathinaikos is the official 2025-26 Greek Basket League champion.',
      el: 'YES αν ο Παναθηναϊκός είναι ο επίσημος πρωταθλητής της Greek Basket League 2025-26.'
    },
    why: {
      en: 'It gives the board a premium local-sports anchor beyond EuroLeague qualification markets.',
      el: 'Δίνει στο board premium local-sports anchor πέρα από αγορές πρόκρισης της EuroLeague.'
    },
    primarySource: 'Greek Basket League official finals results',
    fallbackSource: 'ESAKE standings and championship recap'
  },
  {
    id: 'SPT-10',
    categoryKey: 'sports',
    status: 'new',
    featured: true,
    probability: 38,
    change: 3,
    volume: 20780,
    closeDate: '2027-05-30T21:30:00+03:00',
    resolveDate: '2027-05-31T23:59:00+03:00',
    sourceLink: 'https://www.uefa.com/',
    poster: {
      eyebrow: { en: 'Greek clubs in Europe', el: 'Ελληνικές ομάδες στην Ευρώπη' },
      label: { en: 'European final watch', el: 'Παρουσία σε τελικό' },
      emoji: '🏆',
      art: 'art-awards',
      gradient: 'linear-gradient(135deg, #081826 0%, #0f4c81 42%, #f59e0b 100%)'
    },
    question: {
      en: 'Will a Greek club reach a major European football or basketball final in the 2026-27 season?',
      el: 'Θα φτάσει ελληνικός σύλλογος σε μεγάλο ευρωπαϊκό τελικό ποδοσφαίρου ή μπάσκετ τη σεζόν 2026-27;'
    },
    summary: {
      en: 'A broad Greek-clubs contract that feels mainstream on first read while still settling off a named competition list.',
      el: 'Ευρύ contract για ελληνικούς συλλόγους που διαβάζεται mainstream με την πρώτη, αλλά εξακολουθεί να κάνει settle πάνω σε ονομασμένη λίστα διοργανώσεων.'
    },
    resolution: {
      en: 'YES if a Greek club reaches the final of the 2026-27 UEFA Champions League, Europa League, Conference League, EuroLeague, EuroCup, or Basketball Champions League. NO otherwise.',
      el: 'YES αν ελληνικός σύλλογος φτάσει στον τελικό του UEFA Champions League, Europa League, Conference League, EuroLeague, EuroCup ή Basketball Champions League της σεζόν 2026-27. NO διαφορετικά.'
    },
    why: {
      en: 'It gives the board one big-picture Greek-Europe sports contract without forcing mainstream users to care about a single competition upfront.',
      el: 'Δίνει στο board ένα big-picture ελληνικό ευρωπαϊκό sports contract χωρίς να αναγκάζει τον mainstream χρήστη να νοιάζεται από πριν για μία μόνο διοργάνωση.'
    },
    primarySource: 'Official UEFA, EuroLeague, EuroCup, and Basketball Champions League final fixtures',
    fallbackSource: 'Official competition result pages for the named tournaments'
  },
  {
    id: 'SPT-11',
    categoryKey: 'sports',
    status: 'live',
    featured: false,
    probability: 44,
    change: -1,
    volume: 12960,
    closeDate: '2026-07-04T17:00:00+02:00',
    resolveDate: '2026-07-06T23:00:00+02:00',
    sourceLink: 'https://www.wimbledon.com/',
    poster: {
      eyebrow: { en: 'Greek tennis', el: 'Ελληνικό τένις' },
      label: { en: 'Sakkari check', el: 'Sakkari check' },
      emoji: '🎾',
      gradient: 'linear-gradient(135deg, #18230f 0%, #3f6212 46%, #a3e635 100%)'
    },
    question: {
      en: 'Will Maria Sakkari reach the Wimbledon 2026 round of 16?',
      el: 'Θα φτάσει η Μαρία Σάκκαρη στους 16 του Wimbledon 2026;'
    },
    summary: {
      en: 'Adds another recognisable Greek-athlete contract without changing any of the trading grammar.',
      el: 'Προσθέτει άλλο ένα αναγνωρίσιμο contract Έλληνα αθλητή χωρίς να αλλάζει καθόλου το trading grammar.'
    },
    resolution: {
      en: 'YES if Maria Sakkari officially qualifies for the round of 16 in the 2026 Wimbledon singles draw.',
      el: 'YES αν η Μαρία Σάκκαρη προκριθεί επίσημα στους 16 του ταμπλό singles του Wimbledon 2026.'
    },
    why: {
      en: 'Useful because the name is familiar, the event is global, and the relevance is still clearly Greek.',
      el: 'Χρήσιμο γιατί το όνομα είναι οικείο, το event global και η συνάφεια παραμένει καθαρά ελληνική.'
    },
    primarySource: 'Wimbledon official draw and results',
    fallbackSource: 'WTA official match records'
  },
  {
    id: 'SPT-12',
    categoryKey: 'sports',
    status: 'live',
    featured: false,
    probability: 39,
    change: 2,
    volume: 11740,
    closeDate: '2026-12-17T10:59:00+02:00',
    resolveDate: '2026-12-17T23:59:00+02:00',
    sourceLink: 'https://inside.fifa.com/fifa-world-ranking/men',
    poster: {
      eyebrow: { en: 'National team', el: 'Εθνική ομάδα' },
      label: { en: 'FIFA top 35', el: 'FIFA top 35' },
      emoji: '🇬🇷',
      gradient: 'linear-gradient(135deg, #06142a 0%, #0f4c81 48%, #60a5fa 100%)'
    },
    question: {
      en: 'Will Greece finish 2026 inside the FIFA men\'s top 35 rankings?',
      el: 'Θα κλείσει η Ελλάδα το 2026 μέσα στο FIFA men\'s top 35 rankings;'
    },
    summary: {
      en: 'Long-horizon national-team market that adds Greek sports relevance without repeating the club shelf.',
      el: 'Αγορά εθνικής ομάδας με μακρύ ορίζοντα που προσθέτει ελληνική sports συνάφεια χωρίς να επαναλαμβάνει το club shelf.'
    },
    resolution: {
      en: 'YES if Greece is ranked 35th or higher in the final official FIFA men\'s ranking published in 2026.',
      el: 'YES αν η Ελλάδα βρίσκεται στη θέση 35 ή υψηλότερα στην τελευταία επίσημη κατάταξη FIFA ανδρών που θα δημοσιευτεί μέσα στο 2026.'
    },
    why: {
      en: 'It gives the sports slate a credible longer-duration arc that feels Greek but not repetitive.',
      el: 'Δίνει στο sports slate ένα αξιόπιστο μακρύτερο τόξο που νιώθει ελληνικό αλλά όχι επαναλαμβανόμενο.'
    },
    primarySource: 'Official FIFA men\'s world ranking release',
    fallbackSource: 'Hellenic Football Federation ranking recap'
  },
  {
    id: 'WTH-06',
    categoryKey: 'weather',
    status: 'new',
    featured: false,
    probability: 47,
    change: 2,
    volume: 9480,
    closeDate: '2026-08-31T18:00:00+02:00',
    resolveDate: '2026-08-31T23:30:00+02:00',
    sourceLink: 'https://www.meteo.gr/',
    poster: {
      eyebrow: { en: 'Cyclades wind', el: 'Άνεμοι Κυκλάδων' },
      label: { en: 'Mykonos gusts', el: 'Mykonos gusts' },
      emoji: '🌊',
      art: 'art-aegean',
      gradient: 'linear-gradient(135deg, #082f49 0%, #0f766e 46%, #67e8f9 100%)'
    },
    question: {
      en: 'Will Mykonos record winds above 9 Beaufort on any day before 31 August 2026?',
      el: 'Θα καταγράψει η Μύκονος ανέμους πάνω από 9 μποφόρ σε οποιαδήποτε ημέρα πριν από τις 31 Αυγούστου 2026;'
    },
    summary: {
      en: 'A very Greek island-weather contract that instantly changes the board’s texture in a good way.',
      el: 'Ένα πολύ ελληνικό island-weather contract που αλλάζει αμέσως την υφή του board προς τη σωστή κατεύθυνση.'
    },
    resolution: {
      en: 'YES if an official Mykonos wind reading exceeds 9 Beaufort on any day before 31 August 2026.',
      el: 'YES αν επίσημη μέτρηση ανέμου στη Μύκονο ξεπεράσει τα 9 μποφόρ σε οποιαδήποτε ημέρα πριν από τις 31 Αυγούστου 2026.'
    },
    why: {
      en: 'It adds a premium-feeling local weather card without relying on any branded imagery.',
      el: 'Προσθέτει premium local weather κάρτα χωρίς να βασίζεται σε branded imagery.'
    },
    primarySource: 'National Observatory / Meteo island station data',
    fallbackSource: 'HNMS island weather bulletin'
  }
];

const HERO_SURFACED_COUNT = 1;
const FLAGSHIP_SURFACED_COUNT = 4;
const UPPER_SURFACED_COUNT = HERO_SURFACED_COUNT + FLAGSHIP_SURFACED_COUNT;
const FEATURED_MARKET_COUNT = 3;

const SEED_TRANSACTION_BLUEPRINTS = [
  { id: 'seed-1', minutesAgo: 46 * 60, marketId: 'MAC-01', action: 'buy', side: 'yes', qty: 1600, price: 0.58 },
  { id: 'seed-2', minutesAgo: 31 * 60, marketId: 'MAC-07', action: 'buy', side: 'yes', qty: 1100, price: 0.54 },
  { id: 'seed-3', minutesAgo: 24 * 60 + 20, marketId: 'WTH-02', action: 'buy', side: 'no', qty: 920, price: 0.62 },
  { id: 'seed-4', minutesAgo: 17 * 60 + 40, marketId: 'SOC-02', action: 'buy', side: 'yes', qty: 720, price: 0.51 },
  { id: 'seed-5', minutesAgo: 6 * 60 + 15, marketId: 'MAC-01', action: 'sell', side: 'yes', qty: 280, price: 0.61 },
  { id: 'seed-6', minutesAgo: 95, marketId: 'SHW-02', action: 'buy', side: 'yes', qty: 460, price: 0.47 }
];

function createSeedTransactions(anchor = Date.now()) {
  return SEED_TRANSACTION_BLUEPRINTS.map((tx) => ({
    id: tx.id,
    ts: new Date(anchor - tx.minutesAgo * 60000).toISOString(),
    marketId: tx.marketId,
    action: tx.action,
    side: tx.side,
    qty: tx.qty,
    price: tx.price
  }));
}

const LIVE_TESTER_NAMES = ['Athens desk', 'North desk', 'Cyclades desk', 'Maria', 'Nikos', 'Courtside'];

let appState = loadState();
let uiState = createUiState();
let toasts = [];
let navigationState = createNavigationState();

const app = document.querySelector('#app');

window.addEventListener('hashchange', render);
document.addEventListener('click', handleClick);
document.addEventListener('keydown', handleKeydown);
document.addEventListener('input', handleInput);
document.addEventListener('submit', handleSubmit);

render();

function createAppState(overrides = {}) {
  return {
    language: overrides.language === 'el' ? 'el' : 'en',
    transactions: Array.isArray(overrides.transactions) ? overrides.transactions : createSeedTransactions(),
    access: {
      granted: Boolean(overrides.access?.granted),
      testerName: overrides.access?.testerName || '',
      grantedAt: overrides.access?.grantedAt || null
    },
    onboardingSeen: overrides.onboardingVersionSeen === ONBOARDING_VERSION
  };
}

function createUiState() {
  return {
    search: '',
    filter: 'all',
    sort: 'volume',
    detailTab: 'context',
    tradeAction: 'buy',
    tradeSide: 'yes',
    tradeAmount: 100,
    accessName: '',
    accessCode: ''
  };
}

function createNavigationState() {
  return {
    detailOriginRoute: { name: 'markets' },
    lastRouteKey: '',
    pendingRestoreKey: null,
    pendingScrollTop: false,
    scrollByRoute: {}
  };
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) || LEGACY_STORAGE_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean);
    if (!raw) return createAppState();
    const parsed = JSON.parse(raw);
    return createAppState(parsed);
  } catch {
    return createAppState();
  }
}

function saveState() {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      language: appState.language,
      transactions: appState.transactions,
      access: appState.access,
      onboardingVersionSeen: appState.onboardingSeen ? ONBOARDING_VERSION : null
    })
  );
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function t(key) {
  return copy[appState.language][key] ?? key;
}

function getRoute() {
  const raw = window.location.hash.replace(/^#\/?/, '');
  if (!raw || raw === 'markets') return { name: 'markets' };
  if (raw === 'desk') return { name: 'desk' };
  if (raw === 'portfolio') return { name: 'portfolio' };
  if (raw.startsWith('market/')) return { name: 'market', id: raw.split('/')[1] };
  return { name: 'markets' };
}

function getRouteKey(route = getRoute()) {
  return route.name === 'market' ? `market:${route.id}` : route.name;
}

function getRouteHash(route) {
  if (route.name === 'market') return `#/market/${route.id}`;
  return route.name === 'markets' ? '#/markets' : `#/${route.name}`;
}

function rememberScrollPosition(route = getRoute()) {
  if (route.name === 'market') return;
  navigationState.scrollByRoute[getRouteKey(route)] = window.scrollY || window.pageYOffset || 0;
}

function scheduleScrollBehavior(route) {
  if (route.name === 'market') {
    navigationState.pendingRestoreKey = null;
    navigationState.pendingScrollTop = true;
    return;
  }

  const restoreKey = getRouteKey(route);
  if (typeof navigationState.scrollByRoute[restoreKey] === 'number') {
    navigationState.pendingRestoreKey = restoreKey;
    navigationState.pendingScrollTop = false;
    return;
  }

  navigationState.pendingRestoreKey = null;
  navigationState.pendingScrollTop = true;
}

function applyPendingScrollBehavior() {
  const restoreKey = navigationState.pendingRestoreKey;
  const shouldScrollTop = navigationState.pendingScrollTop;

  navigationState.pendingRestoreKey = null;
  navigationState.pendingScrollTop = false;

  if (!restoreKey && !shouldScrollTop) return;

  window.requestAnimationFrame(() => {
    if (restoreKey) {
      window.scrollTo(0, navigationState.scrollByRoute[restoreKey] || 0);
      return;
    }

    window.scrollTo(0, 0);
  });
}

function navigateTo(route, options = {}) {
  const { setDetailOrigin = false } = options;
  const currentRoute = getRoute();

  rememberScrollPosition(currentRoute);

  if (setDetailOrigin && currentRoute.name !== 'market') {
    navigationState.detailOriginRoute = { name: currentRoute.name };
  }

  scheduleScrollBehavior(route);

  const nextHash = getRouteHash(route);
  if (window.location.hash === nextHash) {
    render();
    return;
  }

  window.location.hash = nextHash;
}

function getDetailBackTarget() {
  const originName = navigationState.detailOriginRoute?.name;
  if (originName === 'portfolio') return { name: 'portfolio', label: t('detailBackPortfolio') };
  if (originName === 'desk') return { name: 'desk', label: t('detailBackDesk') };
  return { name: 'markets', label: t('detailBack') };
}

function syncScrollableActiveControl(selector) {
  if (!window.matchMedia('(max-width: 860px)').matches) return;
  const activeControl = app.querySelector(selector);
  if (!activeControl) return;
  activeControl.scrollIntoView({ block: 'nearest', inline: 'center' });
}

function runPostRenderPass(route) {
  applyPendingScrollBehavior();
  navigationState.lastRouteKey = getRouteKey(route);
  syncScrollableActiveControl('.detail-info-tab.active');
}

function getMarket(id) {
  return MARKETS.find((market) => market.id === id) || MARKETS[0];
}

function getCategoryLabel(categoryKey) {
  return CATEGORY_LABELS[categoryKey]?.[appState.language] || categoryKey;
}

function getStatusLabel(status) {
  if (status === 'closing') return t('statusClosing');
  if (status === 'new') return t('statusNew');
  return t('statusLive');
}

function getTesterName() {
  return appState.access?.testerName?.trim() || (appState.language === 'el' ? 'Private tester' : 'Private tester');
}

function formatCurrency(value, options = {}) {
  const { minimumFractionDigits = 0, maximumFractionDigits = 2, signDisplay = 'auto' } = options;
  return new Intl.NumberFormat(appState.language === 'el' ? 'el-GR' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits,
    maximumFractionDigits,
    signDisplay
  }).format(value);
}

function formatQuantity(value) {
  const safe = Math.abs(value - Math.round(value)) < 0.0001 ? Math.round(value) : value;
  return new Intl.NumberFormat(appState.language === 'el' ? 'el-GR' : 'en-GB', {
    minimumFractionDigits: Number.isInteger(safe) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(safe) ? 0 : 2
  }).format(safe);
}

function formatPrice(value) {
  return formatCurrency(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercentValue(value, options = {}) {
  const { minimumFractionDigits = 0, maximumFractionDigits = 0, signDisplay = 'auto' } = options;
  return `${new Intl.NumberFormat(appState.language === 'el' ? 'el-GR' : 'en-GB', {
    minimumFractionDigits,
    maximumFractionDigits,
    signDisplay
  }).format(value)}%`;
}

function formatPercent(value) {
  return formatPercentValue(value);
}

function formatSignedCurrency(value) {
  return formatCurrency(value, { minimumFractionDigits: 0, maximumFractionDigits: 2, signDisplay: 'always' });
}

function formatProbabilityDelta(market) {
  const previousProbability = market.probability - market.change;
  if (previousProbability <= 0) {
    return formatPercentValue(market.change, { signDisplay: 'always' });
  }

  const relativeMove = (market.change / previousProbability) * 100;
  return formatPercentValue(relativeMove, { signDisplay: 'always' });
}

function formatDate(value) {
  return new Intl.DateTimeFormat(appState.language === 'el' ? 'el-GR' : 'en-GB', {
    day: '2-digit',
    month: 'short'
  }).format(new Date(value));
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat(appState.language === 'el' ? 'el-GR' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function formatClockTime(value) {
  return new Intl.DateTimeFormat(appState.language === 'el' ? 'el-GR' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function formatRelativeMinutes(minutes) {
  if (minutes <= 0) return t('justNow');
  if (minutes < 60) return appState.language === 'el' ? `${minutes}λ πριν` : `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return appState.language === 'el' ? `${hours}ω πριν` : `${hours}h ago`;
  const days = Math.round(hours / 24);
  return appState.language === 'el' ? `${days}η πριν` : `${days}d ago`;
}

function formatActivityTimestamp(value) {
  const ts = new Date(value).getTime();
  const minutes = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (minutes < 360) return formatRelativeMinutes(minutes);

  const date = new Date(ts);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

  if (ts >= startOfToday) {
    return appState.language === 'el' ? `Σήμερα · ${formatClockTime(ts)}` : `Today · ${formatClockTime(ts)}`;
  }

  if (ts >= startOfYesterday) {
    return appState.language === 'el' ? `Χθες · ${formatClockTime(ts)}` : `Yesterday · ${formatClockTime(ts)}`;
  }

  return `${formatDate(ts)} · ${formatClockTime(ts)}`;
}

function getPrice(market, side) {
  return getChance(market, side) / 100;
}

function getChance(market, side) {
  return side === 'yes' ? market.probability : 100 - market.probability;
}

function createBlankPosition() {
  return { qty: 0, avg: 0 };
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundContracts(value) {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hashString(value) {
  return [...value].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 100000, 7);
}

function buildPortfolio(transactions) {
  const positions = {};
  let cash = STARTING_CASH;

  for (const tx of transactions) {
    const total = roundMoney(tx.qty * tx.price);
    cash = roundMoney(cash + (tx.action === 'buy' ? -total : total));
    const marketPositions = positions[tx.marketId] || { yes: createBlankPosition(), no: createBlankPosition() };
    const current = marketPositions[tx.side];

    if (tx.action === 'buy') {
      const nextQty = roundContracts(current.qty + tx.qty);
      const nextCost = roundMoney(current.avg * current.qty + total);
      current.qty = nextQty;
      current.avg = nextQty > 0 ? roundMoney(nextCost / nextQty) : 0;
    } else {
      current.qty = roundContracts(Math.max(0, current.qty - tx.qty));
      if (current.qty === 0) current.avg = 0;
    }

    positions[tx.marketId] = marketPositions;
  }

  const rows = [];
  let marketValue = 0;
  let basis = 0;

  for (const market of MARKETS) {
    const marketPositions = positions[market.id];
    if (!marketPositions) continue;
    for (const side of ['yes', 'no']) {
      const position = marketPositions[side];
      if (!position || position.qty <= 0) continue;
      const mark = getPrice(market, side);
      const value = roundMoney(position.qty * mark);
      const costBasis = roundMoney(position.qty * position.avg);
      marketValue = roundMoney(marketValue + value);
      basis = roundMoney(basis + costBasis);
      rows.push({
        market,
        side,
        qty: position.qty,
        avg: position.avg,
        mark,
        value,
        pnl: roundMoney(value - costBasis)
      });
    }
  }

  rows.sort((a, b) => b.value - a.value);

  return {
    cash,
    rows,
    marketValue,
    equity: roundMoney(cash + marketValue),
    exposure: basis,
    pnl: roundMoney(marketValue - basis),
    openPositions: rows.length,
    holdings: positions
  };
}

function getHeldQty(portfolio, marketId, side) {
  return portfolio.holdings[marketId]?.[side]?.qty || 0;
}

function isSurfacedMarket(market) {
  return market.surfaced !== false;
}

function getSurfacedMarkets() {
  return MARKETS.filter(isSurfacedMarket);
}

function getUpperSurfacedMarkets(limit = UPPER_SURFACED_COUNT) {
  return getSurfacedMarkets()
    .filter((market) => market.featured)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit);
}

function getUpperSurfacedMarketIds(limit = UPPER_SURFACED_COUNT) {
  return new Set(getUpperSurfacedMarkets(limit).map((market) => market.id));
}

function getRegularSurfacedMarkets() {
  const upperSurfacedIds = getUpperSurfacedMarketIds(UPPER_SURFACED_COUNT);
  return getSurfacedMarkets().filter((market) => !upperSurfacedIds.has(market.id));
}

function getFilteredMarkets() {
  const query = uiState.search.trim().toLowerCase();
  const filtered = getSurfacedMarkets().filter((market) => {
    if (uiState.filter !== 'all' && market.categoryKey !== uiState.filter) return false;
    if (!query) return true;
    const haystack = [
      market.id,
      market.question.en,
      market.question.el,
      market.summary.en,
      market.summary.el,
      market.poster.eyebrow.en,
      market.poster.eyebrow.el,
      market.poster.label.en,
      market.poster.label.el,
      CATEGORY_LABELS[market.categoryKey]?.en,
      CATEGORY_LABELS[market.categoryKey]?.el,
      market.primarySource,
      market.fallbackSource
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  });

  filtered.sort((a, b) => {
    if (uiState.sort === 'featured') return Number(b.featured) - Number(a.featured) || b.volume - a.volume;
    if (uiState.sort === 'volume') return b.volume - a.volume;
    if (uiState.sort === 'closing') return new Date(a.closeDate) - new Date(b.closeDate);
    return b.volume - a.volume;
  });

  return filtered;
}

function getFeaturedMarkets(limit = FEATURED_MARKET_COUNT) {
  return getUpperSurfacedMarkets(limit);
}

function getFlagshipMarkets(limit = FLAGSHIP_SURFACED_COUNT) {
  return getUpperSurfacedMarkets(limit + 1).slice(1, limit + 1);
}

function getFeaturedMarket() {
  return getUpperSurfacedMarkets(1)[0] || getSurfacedMarkets()[0] || MARKETS[0];
}

function getLiveSignal(market) {
  const seed = hashString(market.id);
  const cadence = [4, 7, 11, 16, 23, 31, 44, 58, 76];
  return {
    updatedMin: cadence[seed % cadence.length] + (seed % 3),
    flowSide: seed % 2 === 0 ? 'yes' : 'no',
    flowEur: 180 + (seed % 9) * 55,
    watchers: 4 + (seed % 7),
    activeTesters: 2 + (seed % 4),
    tickerPrice: getPrice(market, seed % 2 === 0 ? 'yes' : 'no')
  };
}

function buildLiveTape(limit = 8) {
  const surfacedIds = new Set(getSurfacedMarkets().map((market) => market.id));
  const synthetic = getSurfacedMarkets()
    .filter((market) => market.featured || market.volume > 14000)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10)
    .map((market, index) => {
      const signal = getLiveSignal(market);
      const ts = Date.now() - signal.updatedMin * 60000;
      return {
        id: `desk-${market.id}`,
        ts,
        market,
        side: signal.flowSide,
        amount: signal.flowEur,
        price: signal.tickerPrice,
        actor: LIVE_TESTER_NAMES[index % LIVE_TESTER_NAMES.length],
        kind: 'desk'
      };
    });

  const user = [...appState.transactions]
    .slice(-6)
    .map((tx, index) => ({
      id: `${tx.id}-${index}`,
      ts: new Date(tx.ts).getTime(),
      market: getMarket(tx.marketId),
      side: tx.side,
      amount: roundMoney(tx.qty * tx.price),
      price: tx.price,
      actor: getTesterName(),
      kind: 'user',
      action: tx.action
    }))
    .filter((item) => item.market && surfacedIds.has(item.market.id));

  return [...synthetic, ...user].sort((a, b) => b.ts - a.ts).slice(0, limit);
}

function buildMarketTape(market, limit = 4) {
  return buildLiveTape(12).filter((item) => item.market.id === market.id).slice(0, limit);
}

function getBoardMetrics() {
  const surfacedMarkets = getSurfacedMarkets();
  const tape = buildLiveTape(8);
  return {
    totalMarkets: surfacedMarkets.length,
    closingSoon: surfacedMarkets.filter((market) => market.status === 'closing').length,
    totalVolume: surfacedMarkets.reduce((sum, market) => sum + market.volume, 0),
    recentFlow: roundMoney(tape.reduce((sum, item) => sum + item.amount, 0)),
    testerCount: LIVE_TESTER_NAMES.length + (appState.access?.granted ? 1 : 0)
  };
}

function buildCategoryMix(rows) {
  const byCategory = new Map();
  for (const row of rows) {
    const current = byCategory.get(row.market.categoryKey) || { label: getCategoryLabel(row.market.categoryKey), value: 0 };
    current.value += row.value;
    byCategory.set(row.market.categoryKey, current);
  }
  return [...byCategory.values()].sort((a, b) => b.value - a.value);
}

function buildIndicativeSeries(market) {
  const seed = hashString(market.id);
  const start = clamp(market.probability - market.change - 6, 18, 82);
  const series = [];

  for (let index = 0; index < 8; index += 1) {
    const progress = index / 7;
    const wobble = Math.sin(progress * Math.PI * 1.6 + seed / 37) * 2.2 + Math.cos(progress * Math.PI * 2.4 + seed / 19) * 0.9;
    const drift = (market.probability - start) * progress;
    const value = clamp(start + drift + wobble, 10, 90);
    series.push(Math.round(value));
  }

  series[series.length - 1] = market.probability;
  return series;
}

function buildIndicativeTimeline(count) {
  const anchor = Date.now();
  return Array.from({ length: count }, (_, index) => new Date(anchor - (count - 1 - index) * 24 * 60 * 60 * 1000));
}

function buildSmoothPath(points) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const point = points[index];
    const midX = (previous.x + point.x) / 2;
    path += ` C ${midX} ${previous.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
  }

  return path;
}

function buildMovers(limit = 5) {
  return [...getSurfacedMarkets()]
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change) || b.volume - a.volume)
    .slice(0, limit)
    .map((market) => ({
      market,
      signal: getLiveSignal(market)
    }));
}


function getPosterArtClass(market) {
  if (market.poster?.art) return market.poster.art;
  const label = `${market.poster?.eyebrow?.en || ''} ${market.poster?.label?.en || ''} ${market.question?.en || ''}`.toLowerCase();

  if (market.categoryKey === 'politics') {
    return 'art-ballot';
  }

  if (market.categoryKey === 'macro') {
    if (label.includes('airport') || label.includes('traffic') || label.includes('travel')) return 'art-airport';
    if (label.includes('petrol') || label.includes('fuel') || label.includes('gas')) return 'art-fuel';
    if (label.includes('factory') || label.includes('industrial')) return 'art-factory';
    return 'art-chart';
  }

  if (market.categoryKey === 'social') {
    if (label.includes('tiktok') || label.includes('youtube') || label.includes('instagram') || label.includes('views') || label.includes('clip') || label.includes('reel')) {
      return 'art-screen';
    }
    return 'art-stage';
  }

  if (market.categoryKey === 'showbiz') {
    if (label.includes('cannes') || label.includes('oscar') || label.includes('award')) return 'art-awards';
    if (label.includes('trailer') || label.includes('teaser') || label.includes('franchise')) return 'art-screen';
    return 'art-stage';
  }

  if (market.categoryKey === 'sports') {
    if (label.includes('tennis') || label.includes('tsitsipas') || label.includes('sakkari') || label.includes('roland') || label.includes('wimbledon')) {
      return 'art-tennis';
    }
    if (label.includes('basket') || label.includes('euroleague') || label.includes('olympiacos') || label.includes('panathinaikos')) {
      return 'art-court';
    }
    return 'art-pitch';
  }

  if (market.categoryKey === 'weather') {
    if (label.includes('rain')) return 'art-rain';
    if (label.includes('heat') || label.includes('temperature') || label.includes('summer')) return 'art-sun';
    return 'art-aegean';
  }

  return '';
}

function getPosterThemeClass(market) {
  const map = {
    politics: 'poster-theme-politics',
    macro: 'poster-theme-data',
    social: 'poster-theme-social',
    showbiz: 'poster-theme-showbiz',
    sports: 'poster-theme-sports',
    weather: 'poster-theme-weather'
  };
  return map[market.categoryKey] || '';
}

function buildResolutionPack(market) {
  const categoryRule = {
    politics: {
      en: 'Official Ministry of Interior election results control. Polls, projections, or TV estimates never resolve the contract.',
      el: 'Τα επίσημα αποτελέσματα του Υπουργείου Εσωτερικών υπερισχύουν. Polls, projections ή τηλεοπτικές εκτιμήσεις δεν κάνουν ποτέ resolve το contract.'
    },
    macro: {
      en: 'The first official data publication controls. Mirrors or media summaries never outrank the underlying release.',
      el: 'Η πρώτη επίσημη δημοσίευση δεδομένων υπερισχύει. Mirrors ή media summaries δεν υπερισχύουν ποτέ της αρχικής ανακοίνωσης.'
    },
    social: {
      en: 'Resolution keys off the public counter on the official platform upload. Unofficial reposts do not count.',
      el: 'Το resolution βασίζεται στο public counter του επίσημου upload στην πλατφόρμα. Unofficial reposts δεν μετρούν.'
    },
    showbiz: {
      en: 'Official result pages or official broadcaster scoreboards control. Press commentary is secondary.',
      el: 'Οι επίσημες σελίδες αποτελεσμάτων ή τα επίσημα scoreboards υπερισχύουν. Η press commentary είναι δευτερεύουσα.'
    },
    sports: {
      en: 'Official competition brackets, standings, and final result pages control settlement.',
      el: 'Τα επίσημα brackets, standings και final result pages της διοργάνωσης ελέγχουν το settlement.'
    },
    weather: {
      en: 'Official station or national bulletin readings control. Forecasts never resolve the market.',
      el: 'Οι επίσημες μετρήσεις σταθμού ή τα εθνικά bulletins υπερισχύουν. Τα forecasts δεν κάνουν resolve την αγορά.'
    }
  };

  const trustProfile = {
    politics: {
      authorityLabel: { en: 'Official election result', el: 'Επίσημο εκλογικό αποτέλεσμα' },
      authorityBody: { en: 'The Ministry of Interior nationwide result table controls.', el: 'Ο πανελλαδικός πίνακας αποτελεσμάτων του Υπουργείου Εσωτερικών υπερισχύει.' },
      credibilityBody: { en: 'One official result table, one nationwide winner test.', el: 'Ένας επίσημος πίνακας αποτελεσμάτων, ένα nationwide test για τον νικητή.' }
    },
    macro: {
      authorityLabel: { en: 'Official data release', el: 'Επίσημη δημοσίευση δεδομένων' },
      authorityBody: { en: 'One named publisher prints the number directly.', el: 'Ένας ονομασμένος φορέας δημοσιεύει απευθείας το metric.' },
      credibilityBody: { en: 'Single publisher, single metric, simple threshold.', el: 'Ένας publisher, ένα metric, καθαρό threshold.' }
    },
    social: {
      authorityLabel: { en: 'Official platform upload', el: 'Επίσημο upload πλατφόρμας' },
      authorityBody: { en: 'The public counter on the official post controls.', el: 'Το public counter του επίσημου post υπερισχύει.' },
      credibilityBody: { en: 'One official upload, one public counter, fixed window.', el: 'Ένα επίσημο upload, ένα public counter, fixed window.' }
    },
    showbiz: {
      authorityLabel: { en: 'Official result record', el: 'Επίσημο record αποτελέσματος' },
      authorityBody: { en: 'The official results page or scoreboard controls.', el: 'Η επίσημη σελίδα αποτελεσμάτων ή το scoreboard ελέγχει το settlement.' },
      credibilityBody: { en: 'Named official result page, binary outcome, public record.', el: 'Ονομασμένη επίσημη σελίδα, binary outcome, δημόσιο record.' }
    },
    sports: {
      authorityLabel: { en: 'Official competition record', el: 'Επίσημο record διοργάνωσης' },
      authorityBody: { en: 'Official brackets, standings, or finals pages settle the trade.', el: 'Επίσημα brackets, standings ή finals pages κάνουν settle το trade.' },
      credibilityBody: { en: 'Named competition record, simple binary settlement.', el: 'Ονομασμένο competition record, απλό binary settlement.' }
    },
    weather: {
      authorityLabel: { en: 'Official station data', el: 'Επίσημα station data' },
      authorityBody: { en: 'Official station readings or national bulletins control.', el: 'Επίσημες μετρήσεις σταθμού ή national bulletins υπερισχύουν.' },
      credibilityBody: { en: 'Named station reading, public data, fixed observation window.', el: 'Ονομασμένη μέτρηση σταθμού, δημόσια δεδομένα, fixed window παρατήρησης.' }
    }
  };

  const profile = trustProfile[market.categoryKey] || {
    authorityLabel: { en: 'Official source stack', el: 'Επίσημη ιεραρχία πηγών' },
    authorityBody: { en: 'Named public records control settlement.', el: 'Ονομασμένα δημόσια records ελέγχουν το settlement.' },
    credibilityBody: { en: 'Named source stack, visible timing, explicit void clause.', el: 'Ονομασμένη ιεραρχία πηγών, ορατό timing, ρητός κανόνας void.' }
  };

  const fallbackCopy = {
    en: `Consulted only if ${market.primarySource} is delayed, incomplete, or the first official figure is published via ${market.fallbackSource}.`,
    el: `Ελέγχεται μόνο αν το ${market.primarySource} καθυστερεί, είναι ελλιπές ή αν το πρώτο επίσημο figure δημοσιευτεί μέσω του ${market.fallbackSource}.`
  };

  return {
    sourceRule: categoryRule[market.categoryKey]?.[appState.language] || t('resolutionManualNote'),
    authorityLabel: profile.authorityLabel[appState.language],
    authorityBody: profile.authorityBody[appState.language],
    credibilityBody: profile.credibilityBody[appState.language],
    primaryBody:
      appState.language === 'el'
        ? `Το contract ελέγχει πρώτα το ${market.primarySource}. Αν αυτό το record δίνει καθαρό outcome, αυτό κάνει settle την αγορά.`
        : `This contract checks ${market.primarySource} first. If that record gives a clean outcome, it settles the market.`,
    fallbackBody: fallbackCopy[appState.language],
    lockBody:
      appState.language === 'el'
        ? `Μετά τις ${formatDateTime(market.closeDate)} δεν μπαίνουν νέες εντολές. Το settlement ακολουθεί την ονομασμένη ιεραρχία πηγών και όχι την τελευταία traded τιμή.`
        : `After ${formatDateTime(market.closeDate)}, no new orders can enter. Settlement follows the named source stack, not the last traded price.`,
    settleBody:
      appState.language === 'el'
        ? `Στόχος settlement στις ${formatDateTime(market.resolveDate)} αφού ελεγχθεί πρώτα η primary πηγή και μόνο αν χρειαστεί το fallback.`
        : `Target settlement is ${formatDateTime(market.resolveDate)} after checking the primary source first and consulting the fallback only if needed.`,
    timingBody:
      appState.language === 'el'
        ? `Το trading κλειδώνει στις ${formatDateTime(market.closeDate)} και ο στόχος resolution είναι ${formatDateTime(market.resolveDate)} μετά από σύντομο source check.`
        : `Trading locks at ${formatDateTime(market.closeDate)} and targets resolution at ${formatDateTime(market.resolveDate)} after a short source check.`,
    voidHeadline: appState.language === 'el' ? 'Μόνο αν το επίσημο αποτέλεσμα μείνει ασαφές' : 'Only if the official record stays unclear',
    voidBody: t('voidRule')
  };
}

function buildTradePreview(market, portfolio) {
  const amount = roundMoney(Number(uiState.tradeAmount || 0));
  const side = uiState.tradeSide;
  const action = uiState.tradeAction;
  const price = getPrice(market, side);
  const contracts = price > 0 ? roundContracts(amount / price) : 0;
  const total = roundMoney(contracts * price);
  const grossPayout = roundMoney(contracts);
  const netIfCorrect = roundMoney(grossPayout - total);
  const heldQty = getHeldQty(portfolio, market.id, side);
  const maxSellValue = roundMoney(heldQty * price);
  const remainingQty = roundContracts(Math.max(0, heldQty - contracts));
  const exposureAfter = roundMoney(remainingQty * price);
  const oppositeSide = side === 'yes' ? 'no' : 'yes';
  const selectedLabel = side === 'yes' ? t('yes') : t('no');
  const oppositeLabel = oppositeSide === 'yes' ? t('yes') : t('no');

  const narrative =
    action === 'buy'
      ? appState.language === 'el'
        ? `Βάζεις ${formatCurrency(total)} στο ${selectedLabel} και παίρνεις περίπου ${formatQuantity(contracts)} contracts. Αν βγει ${selectedLabel}, η μικτή πληρωμή είναι ${formatCurrency(grossPayout)}.`
        : `You put ${formatCurrency(total)} into ${selectedLabel} for about ${formatQuantity(contracts)} contracts. If ${selectedLabel} resolves, gross payout is ${formatCurrency(grossPayout)}.`
      : appState.language === 'el'
        ? `Πουλάς ${formatCurrency(total)} από τη θέση ${selectedLabel}. Κλείνεις περίπου ${formatQuantity(contracts)} contracts και μένουν ${formatQuantity(remainingQty)} ανοιχτά.`
        : `You sell ${formatCurrency(total)} of ${selectedLabel}. That closes about ${formatQuantity(contracts)} contracts and leaves ${formatQuantity(remainingQty)} open.`;

  return {
    amount,
    side,
    action,
    price,
    contracts,
    total,
    grossPayout,
    netIfCorrect,
    heldQty,
    maxSellValue,
    remainingQty,
    exposureAfter,
    selectedLabel,
    oppositeLabel,
    narrative
  };
}

function renderProbabilityPair(market, className = '') {
  const classes = ['probability-pair', className].filter(Boolean).join(' ');
  return `
    <div class="${classes}">
      <div class="probability-pill yes">
        <span>${t('yes')}</span>
        <strong>${formatPercent(getChance(market, 'yes'))}</strong>
      </div>
      <div class="probability-pill no">
        <span>${t('no')}</span>
        <strong>${formatPercent(getChance(market, 'no'))}</strong>
      </div>
    </div>
  `;
}

function render() {
  const route = getRoute();
  const portfolio = buildPortfolio(appState.transactions);
  const currentMarket = route.name === 'market' ? getMarket(route.id) : getFeaturedMarket();

  if (!appState.access?.granted) {
    app.innerHTML = `${renderAccessGate()}${renderToasts()}`;
    return;
  }

  app.innerHTML = `
    <div class="shell">
      ${renderTopbar(route)}
      ${
        route.name === 'portfolio'
          ? renderPortfolioPage(portfolio)
          : route.name === 'market'
            ? renderMarketDetailPage(currentMarket, portfolio)
            : route.name === 'desk'
              ? renderDeskPage()
              : renderBoardPage(portfolio)
      }
      <footer class="footer-note">${t('footer')}</footer>
      ${renderMobileBottomNav(route)}
    </div>
    ${renderToasts()}
  `;

  runPostRenderPass(route);
}

function renderAccessGate() {
  return `
    <div class="gate-shell">
      <section class="gate-card">
        <div class="gate-copy">
          <span class="eyebrow">${t('gateEyebrow')}</span>
          <div class="brand gate-brand">
            <div class="brand-mark">xyz</div>
            <div class="brand-copy">
              <strong>${t('appTitle')} ${APP_VERSION}</strong>
              <span>${t('privateBeta')}</span>
            </div>
          </div>
          <h1>${t('gateTitle')}</h1>
          <p>${t('gateCopy')}</p>
          <ul class="bullet-list gate-points">
            <li>${t('gatePoint1')}</li>
            <li>${t('gatePoint2')}</li>
            <li>${t('gatePoint3')}</li>
          </ul>
        </div>
        <form class="gate-form" data-access-form="true">
          <div>
            <small class="field-label">${t('gateNameLabel')}</small>
            <label class="number-input">
              <input type="text" autocomplete="nickname" value="${escapeHtml(uiState.accessName)}" data-field="accessName" placeholder="${t('gateNamePlaceholder')}" />
            </label>
          </div>
          <div>
            <small class="field-label">${t('gateCodeLabel')}</small>
            <label class="number-input">
              <input type="password" autocomplete="current-password" value="${escapeHtml(uiState.accessCode)}" data-field="accessCode" placeholder="${t('gateCodePlaceholder')}" />
            </label>
          </div>
          <button class="cta full-width" type="submit">${t('gateUnlock')}</button>
          <p class="gate-hint">${t('gateHint')}</p>
        </form>
      </section>
    </div>
  `;
}

function renderOnboardingOverlay() {
  const featured = getFeaturedMarket();
  return `
    <div class="overlay-backdrop">
      <section class="overlay-card onboarding-card">
        <div class="surface-header compact-header">
          <div>
            <h3>${t('onboardingTitle')}</h3>
            <p>${t('onboardingCopy')}</p>
          </div>
        </div>
        <div class="onboarding-grid">
          <article class="info-card onboarding-step">
            <h3>${t('onboardingStep1Title')}</h3>
            <p>${t('onboardingStep1Body')}</p>
          </article>
          <article class="info-card onboarding-step">
            <h3>${t('onboardingStep2Title')}</h3>
            <p>${t('onboardingStep2Body')}</p>
          </article>
          <article class="info-card onboarding-step">
            <h3>${t('onboardingStep3Title')}</h3>
            <p>${t('onboardingStep3Body')}</p>
          </article>
        </div>
        <div class="row overlay-actions">
          <button class="ghost" data-onboarding="dismiss">${t('onboardingDismiss')}</button>
          <button class="cta" data-onboarding-market="${featured.id}">${t('onboardingGoFeatured')}</button>
        </div>
      </section>
    </div>
  `;
}

function renderTopbar(route) {
  const isMarketsRoute = route.name === 'markets' || route.name === 'market';
  return `
    <header class="topbar">
      <a class="brand" href="#/markets" aria-label="${t('navMarkets')}">
        <div class="brand-mark">xyz</div>
        <div class="brand-copy">
          <strong>${t('appTitle')}</strong>
          <span>${t('appSubtitle')}</span>
        </div>
      </a>
      <div class="nav-switch">
        <button type="button" class="${isMarketsRoute ? 'active' : ''}" data-nav="markets" aria-current="${isMarketsRoute ? 'page' : 'false'}">${t('navMarkets')}</button>
        <button type="button" class="${route.name === 'desk' ? 'active' : ''}" data-nav="desk" aria-current="${route.name === 'desk' ? 'page' : 'false'}">${t('navDesk')}</button>
        <button type="button" class="${route.name === 'portfolio' ? 'active' : ''}" data-nav="portfolio" aria-current="${route.name === 'portfolio' ? 'page' : 'false'}">${t('navPortfolio')}</button>
      </div>
      <div class="topbar-actions">
        <span class="topbar-badge topbar-status"><span class="live-dot"></span>${t('privateBeta')} · ${APP_VERSION}</span>
        <div class="lang-switch" aria-label="Language switch">
          <button class="${appState.language === 'en' ? 'active' : ''}" data-lang="en">EN</button>
          <button class="${appState.language === 'el' ? 'active' : ''}" data-lang="el">ΕΛ</button>
        </div>
      </div>
    </header>
  `;
}

function renderMobileBottomNav(route) {
  const isMarketsRoute = route.name === 'markets' || route.name === 'market';
  return `
    <nav class="mobile-bottom-nav" aria-label="Mobile primary navigation">
      <button type="button" class="mobile-bottom-nav-link ${isMarketsRoute ? 'active' : ''}" data-nav="markets" aria-current="${isMarketsRoute ? 'page' : 'false'}">
        <small>${appState.language === 'el' ? 'Board' : 'Board'}</small>
        <strong>${t('navMarkets')}</strong>
      </button>
      <button type="button" class="mobile-bottom-nav-link ${route.name === 'desk' ? 'active' : ''}" data-nav="desk" aria-current="${route.name === 'desk' ? 'page' : 'false'}">
        <small>${appState.language === 'el' ? 'Pulse' : 'Pulse'}</small>
        <strong>${t('navDesk')}</strong>
      </button>
      <button type="button" class="mobile-bottom-nav-link ${route.name === 'portfolio' ? 'active' : ''}" data-nav="portfolio" aria-current="${route.name === 'portfolio' ? 'page' : 'false'}">
        <small>${appState.language === 'el' ? 'Θέσεις' : 'Positions'}</small>
        <strong>${t('navPortfolio')}</strong>
      </button>
    </nav>
  `;
}

function renderHero(portfolio) {
  const featured = getFeaturedMarket();
  const featuredSignal = getLiveSignal(featured);
  const metrics = getBoardMetrics();
  return `
    <section class="hero-grid">
      <article class="hero-panel">
        <div class="hero-overlay">
          <div class="hero-copy-cluster">
            <div class="hero-copy hero-copy-clean">
              <span class="eyebrow">${t('heroEyebrow')}</span>
              <h1>${t('productIdentity')}</h1>
            </div>
            <div class="live-ribbon">
              <span class="ghost-pill">${t('testerLane')}: ${metrics.testerCount}</span>
              <span class="ghost-pill">${t('flowLastHour')}: ${formatCurrency(metrics.recentFlow)}</span>
            </div>
          </div>
          <div class="hero-feature-card" data-category="${featured.categoryKey}">
            <div class="hero-feature-top">
              <div class="pill-row">
                <span class="status-pill ${featured.status}">${getStatusLabel(featured.status)}</span>
                <span class="ghost-pill">${t('heroFeatured')}</span>
                <span class="ghost-pill">${getCategoryLabel(featured.categoryKey)}</span>
              </div>
              <button class="cta compact" data-open-market="${featured.id}">${t('openMarket')}</button>
            </div>
            <div class="hero-feature-label">${featured.poster.eyebrow[appState.language]} · ${featured.poster.label[appState.language]}</div>
            <h2>${featured.question[appState.language]}</h2>
            <div class="hero-feature-meta">
              <div class="odds-stat-block">
                <small>${t('statLiveOdds')}</small>
                ${renderProbabilityPair(featured, 'compact on-dark')}
              </div>
              <div>
                <small>${t('volume')}</small>
                <strong>${formatCurrency(featured.volume)}</strong>
              </div>
              <div>
                <small>${t('close')}</small>
                <strong>${formatDate(featured.closeDate)}</strong>
              </div>
            </div>
            <div class="hero-feature-boardline">
              <span class="feature-stat-pill">${t('dayChange')} <strong class="${featured.change >= 0 ? 'positive' : 'negative'}">${formatProbabilityDelta(featured)}</strong></span>
              <span class="feature-stat-pill">${t('liveFlow')} <strong>${featuredSignal.flowSide === 'yes' ? t('yes') : t('no')} ${formatCurrency(featuredSignal.flowEur)}</strong></span>
              <span class="feature-stat-pill">${t('liveWatchers')} <strong>${featuredSignal.watchers}</strong></span>
            </div>
          </div>
        </div>
      </article>
    </section>
  `;
}

function renderFlagshipLane(markets) {
  if (!markets.length) return '';
  return `
    <section class="featured-lane">
      <div class="board-section-head featured-lane-header">
        <h2>${t('featuredMarketsTitle')}</h2>
        <div class="board-results-meta">
          <span class="ghost-pill board-result-pill">${markets.length} ${t('liveSlate').toLowerCase()}</span>
        </div>
      </div>
      <div class="featured-lane-grid featured-lane-grid-clean">
        ${markets.map((market, index) => renderFlagshipCard(market, index)).join('')}
      </div>
    </section>
  `;
}

function renderFlagshipCard(market, index) {
  const signal = getLiveSignal(market);
  return `
    <button class="featured-strip-card featured-strip-card-clean ${index === 0 ? 'primary' : ''}" data-open-market="${market.id}" data-category="${market.categoryKey}">
      <div class="market-card-accent"></div>
      <div class="featured-strip-top featured-strip-top-clean">
        <div class="card-kickers">
          <span class="soft-pill category-pill">${getCategoryLabel(market.categoryKey)}</span>
          <span class="status-pill ${market.status}">${getStatusLabel(market.status)}</span>
        </div>
      </div>
      <div class="featured-strip-body featured-strip-body-clean">
        <strong>${market.question[appState.language]}</strong>
      </div>
      <div class="featured-strip-footer featured-strip-footer-clean">
        ${renderProbabilityPair(market, 'compact')}
        <div class="featured-strip-metrics featured-strip-metrics-clean">
          <span>
            <small>${t('volume')}</small>
            <strong>${formatCurrency(market.volume)}</strong>
          </span>
          <span>
            <small>${t('close')}</small>
            <strong>${formatDate(market.closeDate)}</strong>
          </span>
          <span>
            <small>${t('liveUpdated')}</small>
            <strong>${formatRelativeMinutes(signal.updatedMin)}</strong>
          </span>
        </div>
      </div>
    </button>
  `;
}

function renderBoardPage(portfolio) {
  const filteredMarkets = getFilteredMarkets();
  const flagshipMarkets = getFlagshipMarkets();
  const activeFilterLabel = uiState.filter === 'all' ? t('filterAll') : getCategoryLabel(uiState.filter);
  return `
    <section class="page-grid board-layout board-layout-clean">
      <div class="board-flow-shell">
        ${renderHero(portfolio)}
        ${renderFlagshipLane(flagshipMarkets)}
        <article class="surface board-surface board-surface-clean">
          <div class="board-results-head board-results-head-top">
            <div>
              <h2>${t('allMarketsTitle')}</h2>
            </div>
            <div class="board-results-meta">
              <span class="soft-pill board-result-pill">${activeFilterLabel}</span>
              <span class="ghost-pill board-result-pill">${filteredMarkets.length} ${t('liveSlate').toLowerCase()}</span>
            </div>
          </div>

          <section class="board-toolbar">
            <div class="toolbar-group toolbar-group-categories">
              <span class="toolbar-label">${t('filtersLabel')}</span>
              <div class="category-filter-bar">
                <button class="${uiState.filter === 'all' ? 'active' : ''}" data-filter="all">${t('filterAll')}</button>
                ${Object.entries(CATEGORY_LABELS)
                  .map(
                    ([key, label]) =>
                      `<button class="${uiState.filter === key ? 'active' : ''}" data-filter="${key}">${label[appState.language]}</button>`
                  )
                  .join('')}
              </div>
            </div>
            <label class="search-input board-search-input">
              <span>⌕</span>
              <input type="search" value="${escapeHtml(uiState.search)}" data-field="search" placeholder="${t('searchPlaceholder')}" />
            </label>
          </section>

          <div class="market-grid market-grid-clean">
            ${
              filteredMarkets.length
                ? filteredMarkets.map((market) => renderMarketCard(market, portfolio)).join('')
                : `<div class="empty-state"><strong>${t('noResultsTitle')}</strong><span>${t('noResultsBody')}</span></div>`
            }
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderMarketOddsBlocks(market) {
  return `
    <div class="market-odds-grid">
      <div class="odds-slab yes">
        <div class="odds-slab-head">
          <span>${t('yes')}</span>
        </div>
        <strong>${formatPercent(getChance(market, 'yes'))}</strong>
      </div>
      <div class="odds-slab no">
        <div class="odds-slab-head">
          <span>${t('no')}</span>
        </div>
        <strong>${formatPercent(getChance(market, 'no'))}</strong>
      </div>
    </div>
  `;
}

function renderMarketMetaLine(market, signal) {
  return `
    <div class="market-meta-line">
      <span>${t('close')} <strong>${formatDate(market.closeDate)}</strong></span>
      <span>${t('volume')} <strong>${formatCurrency(market.volume)}</strong></span>
      <span>${t('liveUpdated')} <strong>${formatRelativeMinutes(signal.updatedMin)}</strong></span>
    </div>
  `;
}

function renderHeldLine(heldYes, heldNo) {
  if (!heldYes && !heldNo) return '<div class="held-row held-row-empty"></div>';
  return `
    <div class="held-row">
      ${heldYes ? `<span class="held-pill">${t('held')} ${t('yes')}: ${formatQuantity(heldYes)}</span>` : ''}
      ${heldNo ? `<span class="held-pill">${t('held')} ${t('no')}: ${formatQuantity(heldNo)}</span>` : ''}
    </div>
  `;
}

function renderFeaturedMarketCard(market, portfolio) {
  const signal = getLiveSignal(market);
  const heldYes = getHeldQty(portfolio, market.id, 'yes');
  const heldNo = getHeldQty(portfolio, market.id, 'no');
  return `
    <article class="featured-market-card" data-category="${market.categoryKey}">
      <div class="featured-market-top">
        <div class="card-kickers">
          <span class="soft-pill category-pill">${getCategoryLabel(market.categoryKey)}</span>
          <span class="status-pill ${market.status}">${getStatusLabel(market.status)}</span>
        </div>
        <span class="ghost-pill market-id-pill">${market.id}</span>
      </div>
      <div class="featured-market-copy">
        <h3>${market.question[appState.language]}</h3>
      </div>
      ${renderMarketOddsBlocks(market)}
      ${renderMarketMetaLine(market, signal)}
      <div class="card-actions compact-card-actions">
        ${renderHeldLine(heldYes, heldNo)}
        <button class="secondary" data-open-market="${market.id}">${t('openMarket')}</button>
      </div>
    </article>
  `;
}

function renderDeskPage() {
  const metrics = getBoardMetrics();
  return `
    <section class="page-grid desk-layout">
      <article class="surface desk-surface">
        <div class="board-intro">
          <div>
            <h1>${t('deskTitle')}</h1>
            <p>${t('deskCopy')}</p>
          </div>
        </div>
        <div class="desk-metric-grid">
          <article class="desk-metric-card">
            <small>${t('liveSlate')}</small>
            <strong>${metrics.totalMarkets}</strong>
          </article>
          <article class="desk-metric-card">
            <small>${t('closingSoon')}</small>
            <strong>${metrics.closingSoon}</strong>
          </article>
          <article class="desk-metric-card">
            <small>${t('flowLastHour')}</small>
            <strong>${formatCurrency(metrics.recentFlow)}</strong>
          </article>
          <article class="desk-metric-card">
            <small>${t('testerLane')}</small>
            <strong>${metrics.testerCount}</strong>
          </article>
        </div>
        <div class="desk-grid">
          <article class="surface desk-panel">
            <div class="surface-header compact-header">
              <div>
                <h3>${t('moversTitle')}</h3>
                <p>${t('moversCopy')}</p>
              </div>
            </div>
            ${renderMoversList()}
          </article>
          <article class="surface desk-panel">
            <div class="surface-header compact-header">
              <div>
                <h3>${t('liveTape')}</h3>
                <p>${t('liveTapeCopy')}</p>
              </div>
            </div>
            ${renderLiveTapeList(buildLiveTape(10))}
          </article>
          <article class="surface desk-panel">
            <div class="surface-header compact-header">
              <div>
                <h3>${t('recentActivity')}</h3>
                <p>${t('recentActivityCopy')}</p>
              </div>
            </div>
            ${renderActivityList(10)}
          </article>
        </div>
      </article>
    </section>
  `;
}


function renderPosterArt(market, variant = 'card') {
  const artClass = getPosterArtClass(market);
  const themeClass = getPosterThemeClass(market);
  if (!artClass && !themeClass) return '';
  return `
    <div class="poster-art-shell ${themeClass} ${variant === 'hero' ? 'hero-shell' : variant === 'detail' ? 'detail-shell' : ''}" aria-hidden="true">
      <div class="poster-art ${artClass}"></div>
      <div class="poster-grain"></div>
      <div class="poster-vignette"></div>
    </div>
  `;
}

function renderMarketCard(market, portfolio) {
  const heldYes = getHeldQty(portfolio, market.id, 'yes');
  const heldNo = getHeldQty(portfolio, market.id, 'no');
  const signal = getLiveSignal(market);
  return `
    <article class="market-card market-card-clean market-card-link ${market.featured ? 'featured-card' : ''}" data-category="${market.categoryKey}" data-open-market="${market.id}" role="link" tabindex="0" aria-label="${escapeHtml(market.question[appState.language])}">
      <div class="market-card-accent"></div>
      <div class="market-card-body clean-market-card-body">
        <div class="market-card-head market-card-head-clean">
          <div class="card-kickers">
            <span class="soft-pill category-pill">${getCategoryLabel(market.categoryKey)}</span>
            <span class="status-pill ${market.status}">${getStatusLabel(market.status)}</span>
          </div>
        </div>

        <div class="market-card-copy">
          <h3>${market.question[appState.language]}</h3>
        </div>

        ${renderMarketOddsBlocks(market)}
        ${renderMarketMetaLine(market, signal)}

        <div class="card-actions clean-card-actions">
          ${renderHeldLine(heldYes, heldNo)}
          <span class="card-open-indicator">${t('openMarket')} <span aria-hidden="true">→</span></span>
        </div>
      </div>
    </article>
  `;
}

function renderTicketSupportStat(label, value) {
  return `
    <div class="ticket-support-stat">
      <small>${label}</small>
      <strong>${value}</strong>
    </div>
  `;
}

function buildTicketOutcomeNote(preview) {
  if (preview.action === 'buy') {
    return appState.language === 'el'
      ? `Αν βγει ${preview.selectedLabel}, η συνολική επιστροφή είναι ${formatCurrency(preview.grossPayout)}.`
      : `If ${preview.selectedLabel} resolves, total return is ${formatCurrency(preview.grossPayout)}.`;
  }

  return appState.language === 'el'
    ? `${formatQuantity(preview.remainingQty)} contracts μένουν μετά την πώληση.`
    : `${formatQuantity(preview.remainingQty)} contracts remain after the sale.`;
}

function renderTradeTicket(market, portfolio, preview, variant = 'desktop') {
  const outcomeLabel = preview.action === 'buy' ? t('ticketToWin') : t('ticketReceiveNow');
  const outcomeValue = preview.action === 'buy' ? formatCurrency(preview.netIfCorrect) : formatCurrency(preview.total);
  const selectedPrice = formatPercent(getChance(market, preview.side));
  return `
    <article class="trade-surface trade-surface-v0860 detail-ticket-panel detail-ticket-panel-${variant}">
      <div class="detail-ticket-top">
        <div class="detail-ticket-heading">
          <span class="detail-ticket-kicker">${uiState.tradeAction === 'buy' ? t('tradeBuy') : t('tradeSell')}</span>
          <h3>${t('tradeTitle')}</h3>
        </div>
        <div class="detail-ticket-price-tag ${preview.side}">
          <span>${t('shareQuote')}</span>
          <strong>${selectedPrice}</strong>
        </div>
      </div>
      <form class="trade-form trade-form-v0860" data-trade-form="true">
        <div>
          <small class="field-label">${t('tradeAction')}</small>
          <div class="segmented full-width trade-action-tabs">
            <button type="button" class="${uiState.tradeAction === 'buy' ? 'active' : ''}" data-trade-action="buy">${t('tradeBuy')}</button>
            <button type="button" class="${uiState.tradeAction === 'sell' ? 'active' : ''}" data-trade-action="sell">${t('tradeSell')}</button>
          </div>
        </div>
        <div>
          <small class="field-label">${t('tradeSide')}</small>
          <div class="trade-side-grid">
            ${renderTradeSideButton(market, 'yes')}
            ${renderTradeSideButton(market, 'no')}
          </div>
        </div>
        <div>
          <small class="field-label">${t('tradeAmount')}</small>
          <label class="number-input money-input detail-money-input">
            <div class="money-field">
              <span class="money-prefix">€</span>
              <input type="number" min="1" step="1" value="${preview.amount}" data-field="tradeAmount" />
            </div>
          </label>
        </div>
        <div>
          <small class="field-label">${t('amountPresets')}</small>
          <div class="trade-preset-row detail-preset-row">
            ${[50, 100, 250, 500]
              .map(
                (size) =>
                  `<button type="button" class="preset-chip ${uiState.tradeAmount === size ? 'active' : ''}" data-trade-amount-preset="${size}">${formatCurrency(size, { maximumFractionDigits: 0 })}</button>`
              )
              .join('')}
          </div>
        </div>
        <div class="ticket-box ticket-box-v0860">
          <div class="detail-ticket-outcome ${preview.side}">
            <small>${outcomeLabel}</small>
            <strong>${outcomeValue}</strong>
            <p>${buildTicketOutcomeNote(preview)}</p>
          </div>
          <div class="ticket-support-grid detail-ticket-support-grid">
            ${renderTicketSupportStat(t('availableCash'), formatCurrency(portfolio.cash))}
            ${renderTicketSupportStat(t('heldContracts'), formatQuantity(preview.heldQty))}
          </div>
        </div>
        <button class="cta detail-ticket-submit" type="submit">${uiState.tradeAction === 'buy' ? t('tradeBuy') : t('tradeSell')} ${preview.selectedLabel}</button>
      </form>
    </article>
  `;
}

function renderAccountSnapshot(portfolio) {
  return `
    <article class="surface side-rail-surface detail-rail-account-v0860">
      <div class="detail-compact-head">
        <h3>${t('accountSnapshot')}</h3>
      </div>
      <div class="pulse-grid detail-position-grid">
        <div class="pulse-card">
          <small>${t('equity')}</small>
          <strong>${formatCurrency(portfolio.equity)}</strong>
        </div>
        <div class="pulse-card">
          <small>${t('cash')}</small>
          <strong>${formatCurrency(portfolio.cash)}</strong>
        </div>
        <div class="pulse-card">
          <small>${t('marketValue')}</small>
          <strong>${formatCurrency(portfolio.marketValue)}</strong>
        </div>
        <div class="pulse-card">
          <small>${t('pnl')}</small>
          <strong>${formatSignedCurrency(portfolio.pnl)}</strong>
        </div>
      </div>
      <button class="ghost full-width" data-reset="true">${t('resetAccount')}</button>
    </article>
  `;
}

function renderMarketDetailPage(market, portfolio) {
  const preview = buildTradePreview(market, portfolio);
  const pack = buildResolutionPack(market);
  const signal = getLiveSignal(market);
  const backTarget = getDetailBackTarget();
  return `
    <section class="page-grid detail-layout detail-layout-v0860" data-category="${market.categoryKey}">
      <article class="surface detail-surface detail-surface-v0860">
        <button type="button" class="ghost detail-back-button" data-nav="${backTarget.name}">← ${backTarget.label}</button>

        <header class="detail-title-shell">
          <div class="detail-title-meta-row">
            <span class="soft-pill">${getCategoryLabel(market.categoryKey)}</span>
            <span class="status-pill ${market.status}">${getStatusLabel(market.status)}</span>
            <span class="soft-pill live-soft-pill"><span class="live-dot"></span>${formatRelativeMinutes(signal.updatedMin)}</span>
          </div>
          <h1>${market.question[appState.language]}</h1>
          <div class="detail-market-strip">
            <div class="detail-market-strip-primary">
              <small>${t('shareQuote')}</small>
              <strong>${formatPercent(market.probability)}</strong>
              <span>${appState.language === 'el' ? 'τελευταίο board mark' : 'latest board mark'}</span>
            </div>
            <div class="detail-market-strip-stat">
              <small>${t('dayChange')}</small>
              <strong class="${market.change >= 0 ? 'positive' : 'negative'}">${formatProbabilityDelta(market)}</strong>
            </div>
            <div class="detail-market-strip-stat">
              <small>${t('volume')}</small>
              <strong>${formatCurrency(market.volume)}</strong>
            </div>
            <div class="detail-market-strip-stat">
              <small>${t('resolutionCutoff')}</small>
              <strong>${formatDateTime(market.closeDate)}</strong>
            </div>
          </div>
        </header>

        ${renderTradeTicket(market, portfolio, preview, 'mobile')}
        ${renderOddsChartShell(market)}
        ${renderDetailInfoTabs(market, pack)}
      </article>

      <aside class="side-rail detail-rail detail-rail-v0860">
        ${renderTradeTicket(market, portfolio, preview, 'desktop')}
        ${renderAccountSnapshot(portfolio)}
      </aside>
    </section>
  `;
}

function getDetailTabSections(market, pack) {
  return [
    {
      id: 'context',
      label: t('marketContext'),
      content: `
        <p class="detail-info-lead">${market.summary[appState.language]}</p>
        <div class="detail-info-block">
          <small>${t('whyItMatters')}</small>
          <p>${market.why[appState.language]}</p>
        </div>
        <div class="detail-info-rows">
          <div class="detail-info-row">
            <span>${t('volume')}</span>
            <strong>${formatCurrency(market.volume)}</strong>
          </div>
          <div class="detail-info-row">
            <span>${t('dayChange')}</span>
            <strong class="${market.change >= 0 ? 'positive' : 'negative'}">${formatProbabilityDelta(market)}</strong>
          </div>
          <div class="detail-info-row">
            <span>${t('resolutionCutoff')}</span>
            <strong>${formatDateTime(market.closeDate)}</strong>
          </div>
          <div class="detail-info-row">
            <span>${t('resolutionSettleTarget')}</span>
            <strong>${formatDateTime(market.resolveDate)}</strong>
          </div>
        </div>
      `
    },
    {
      id: 'rules',
      label: t('resolutionRules'),
      content: `
        <div class="detail-info-block detail-info-block-first">
          <small>${t('trustOutcomeTest')}</small>
          <p>${market.resolution[appState.language]}</p>
        </div>
        <div class="detail-info-mini-grid">
          <div class="detail-info-mini-item">
            <small>${t('primarySource')}</small>
            <strong>${market.primarySource}</strong>
          </div>
          <div class="detail-info-mini-item">
            <small>${t('fallbackSource')}</small>
            <strong>${market.fallbackSource}</strong>
          </div>
        </div>
      `
    },
    {
      id: 'integrity',
      label: t('resolutionIntegrity'),
      content: `
        <p class="detail-info-lead">${t('resolutionIntegrityCopy')}</p>
        <div class="detail-info-block">
          <small>${pack.authorityLabel}</small>
          <p>${pack.authorityBody}</p>
        </div>
        <div class="detail-info-block">
          <small>${t('resolutionSourceRule')}</small>
          <p>${pack.sourceRule}</p>
        </div>
        <div class="detail-info-block warning">
          <small>${t('resolutionVoid')}</small>
          <p>${pack.voidBody}</p>
        </div>
        <a class="secondary-link secondary-link-quiet" href="${market.sourceLink}" target="_blank" rel="noreferrer">${t('openOfficialSource')}</a>
      `
    }
  ];
}

function renderDetailInfoTabs(market, pack) {
  const tabs = getDetailTabSections(market, pack);
  const activeTab = tabs.find((tab) => tab.id === uiState.detailTab) || tabs[0];
  const tabsetId = market.id.toLowerCase();

  return `
    <section class="detail-info-tabs-shell">
      <div class="detail-info-tabs" role="tablist" aria-label="${appState.language === 'el' ? 'Ενότητες αγοράς' : 'Market sections'}">
        ${tabs
          .map(
            (tab) => `
              <button
                type="button"
                class="detail-info-tab ${tab.id === activeTab.id ? 'active' : ''}"
                role="tab"
                id="detail-tab-${tabsetId}-${tab.id}"
                aria-selected="${tab.id === activeTab.id}"
                aria-controls="detail-panel-${tabsetId}-${tab.id}"
                data-detail-tab="${tab.id}"
              >
                ${tab.label}
              </button>
            `
          )
          .join('')}
      </div>
      <article
        class="detail-info-card detail-info-panel"
        role="tabpanel"
        id="detail-panel-${tabsetId}-${activeTab.id}"
        aria-labelledby="detail-tab-${tabsetId}-${activeTab.id}"
      >
        <div class="detail-info-head">
          <h3>${activeTab.label}</h3>
        </div>
        ${activeTab.content}
      </article>
    </section>
  `;
}

function renderTradeSideButton(market, side) {
  const active = uiState.tradeSide === side;
  const chance = getChance(market, side);
  return `
    <button
      type="button"
      class="trade-side-button ${side} ${active ? 'active' : ''}"
      data-trade-side="${side}"
    >
      <span class="trade-side-label">${side === 'yes' ? t('yes') : t('no')}</span>
      <strong>${formatPercent(chance)}</strong>
      <small>${t('shareQuote')}</small>
    </button>
  `;
}

function renderOddsChartShell(market) {
  const series = buildIndicativeSeries(market);
  const timeline = buildIndicativeTimeline(series.length);
  const isPhoneChart = window.innerWidth <= 480;
  const width = 760;
  const height = isPhoneChart ? 236 : 280;
  const paddingLeft = isPhoneChart ? 42 : 54;
  const paddingRight = isPhoneChart ? 14 : 18;
  const paddingTop = isPhoneChart ? 14 : 18;
  const paddingBottom = isPhoneChart ? 34 : 42;
  const yTicks = [75, 50, 25];
  const stepX = (width - paddingLeft - paddingRight) / (series.length - 1);
  const points = series.map((value, index) => {
    const x = paddingLeft + stepX * index;
    const y = paddingTop + (height - paddingTop - paddingBottom) * (1 - value / 100);
    return { x, y, value };
  });
  const latestPoint = points[points.length - 1];
  const xTickIndexes = isPhoneChart
    ? [...new Set([0, Math.floor((series.length - 1) / 2), series.length - 1])]
    : [...new Set([0, Math.floor((series.length - 1) / 3), Math.floor(((series.length - 1) * 2) / 3), series.length - 1])];
  const xTicks = xTickIndexes.map((index) => ({ x: points[index].x, label: formatDate(timeline[index]) }));
  const linePath = buildSmoothPath(points);
  const slug = market.id.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const calloutWidth = isPhoneChart ? 48 : 54;
  const calloutHeight = isPhoneChart ? 22 : 24;
  const calloutY = Math.max(8, latestPoint.y - (isPhoneChart ? 30 : 34));

  return `
    <section class="chart-shell detail-chart-shell">
      <div class="detail-chart-head">
        <div class="chart-head-copy detail-chart-copy">
          <h3>${t('chartTitle')}</h3>
        </div>
        <div class="detail-chart-stat-row">
          <span class="detail-chart-stat"><small>${t('currentMark')}</small><strong>${formatPercent(market.probability)}</strong></span>
          <span class="detail-chart-stat"><small>${t('dayChange')}</small><strong class="${market.change >= 0 ? 'positive' : 'negative'}">${formatProbabilityDelta(market)}</strong></span>
          <span class="detail-chart-stat"><small>${t('volume')}</small><strong>${formatCurrency(market.volume)}</strong></span>
        </div>
      </div>
      <div class="detail-chart-card">
        <div class="detail-chart-frame">
          <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${t('chartTitle')}">
            ${yTicks
              .map((tick) => {
                const y = paddingTop + (height - paddingTop - paddingBottom) * (1 - tick / 100);
                return `
                  <line class="chart-grid ${tick === 50 ? 'emphasis' : ''}" x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" />
                  <text class="chart-y-label" x="${paddingLeft - 10}" y="${y + 4}">${tick}%</text>
                `;
              })
              .join('')}
            ${xTicks
              .map(
                (tick) => `
                  <line class="chart-x-tick" x1="${tick.x}" y1="${height - paddingBottom}" x2="${tick.x}" y2="${height - paddingBottom + 6}" />
                  <text class="chart-axis-label ${tick.x === width - paddingRight ? 'chart-axis-label-right' : ''}" x="${tick.x}" y="${height - 14}">${tick.label}</text>
                `
              )
              .join('')}
            <path class="chart-line-shadow" d="${linePath}" />
            <path class="chart-line" d="${linePath}" />
            <line class="chart-guide" x1="${latestPoint.x}" y1="${latestPoint.y}" x2="${latestPoint.x}" y2="${height - paddingBottom}" />
            <circle class="chart-dot latest" cx="${latestPoint.x}" cy="${latestPoint.y}" r="5.5" />
            <rect class="chart-callout" x="${latestPoint.x - calloutWidth / 2}" y="${calloutY}" rx="10" width="${calloutWidth}" height="${calloutHeight}" />
            <text class="chart-callout-text" x="${latestPoint.x}" y="${calloutY + (isPhoneChart ? 15 : 16)}">${formatPercent(latestPoint.value)}</text>
          </svg>
          <div class="detail-chart-footer">
            <span>${formatDate(timeline[0])}</span>
            <span>${t('resolutionCutoff')} ${formatDateTime(market.closeDate)}</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderPortfolioPage(portfolio) {
  const categoryMix = buildCategoryMix(portfolio.rows);
  return `
    <section class="page-grid portfolio-layout">
      <article class="surface">
        <div class="surface-header">
          <div>
            <h2>${t('portfolioTitle')}</h2>
            <p>${t('portfolioCopy')}</p>
          </div>
          <button class="ghost" data-reset="true">${t('resetAccount')}</button>
        </div>

        <div class="summary-grid">
          <div class="summary-tile">
            <small>${t('equity')}</small>
            <strong>${formatCurrency(portfolio.equity)}</strong>
          </div>
          <div class="summary-tile">
            <small>${t('cash')}</small>
            <strong>${formatCurrency(portfolio.cash)}</strong>
          </div>
          <div class="summary-tile">
            <small>${t('marketValue')}</small>
            <strong>${formatCurrency(portfolio.marketValue)}</strong>
          </div>
          <div class="summary-tile">
            <small>${t('exposure')}</small>
            <strong>${formatCurrency(portfolio.exposure)}</strong>
          </div>
          <div class="summary-tile">
            <small>${t('pnl')}</small>
            <strong>${formatSignedCurrency(portfolio.pnl)}</strong>
          </div>
          <div class="summary-tile">
            <small>${t('statPositions')}</small>
            <strong>${portfolio.openPositions}</strong>
          </div>
        </div>

        <div class="mix-card">
          <div class="surface-header compact-header">
            <div>
              <h3>${t('categoryMix')}</h3>
              <p>${t('positionMixCopy')}</p>
            </div>
          </div>
          ${
            categoryMix.length
              ? categoryMix
                  .map((item) => {
                    const total = categoryMix.reduce((sum, row) => sum + row.value, 0) || 1;
                    const share = (item.value / total) * 100;
                    return `
                      <div class="mix-row">
                        <div class="row">
                          <span>${item.label}</span>
                          <strong>${share.toFixed(0)}%</strong>
                        </div>
                        <div class="mix-bar"><span style="width:${share}%;"></span></div>
                      </div>
                    `;
                  })
                  .join('')
              : `<div class="empty-state compact-empty"><strong>${t('positionsEmpty')}</strong></div>`
          }
        </div>

        <div class="positions-grid">
          ${
            portfolio.rows.length
              ? portfolio.rows.map((row) => renderPositionCard(row)).join('')
              : `<div class="empty-state"><strong>${t('positionsEmpty')}</strong><button class="secondary" data-nav="markets">${t('browseMarkets')}</button></div>`
          }
        </div>
      </article>

      <aside class="side-rail">
        <article class="surface">
          <div class="surface-header compact-header">
            <div>
              <h3>${t('recentActivity')}</h3>
              <p>${t('recentActivityCopy')}</p>
            </div>
          </div>
          ${renderActivityList(8)}
        </article>
      </aside>
    </section>
  `;
}

function renderPositionCard(row) {
  return `
    <article class="position-card">
      <div class="position-card-top">
        <div>
          <div class="card-kickers">
            <span class="soft-pill">${getCategoryLabel(row.market.categoryKey)}</span>
            <span class="soft-pill ${row.side === 'yes' ? 'yes-label' : 'no-label'}">${row.side === 'yes' ? t('yes') : t('no')}</span>
          </div>
          <h3>${row.market.question[appState.language]}</h3>
          <p>${row.market.summary[appState.language]}</p>
        </div>
        <button class="secondary" data-open-market="${row.market.id}">${t('openMarket')}</button>
      </div>
      <div class="position-stats">
        <div>
          <small>${t('quantity')}</small>
          <strong>${formatQuantity(row.qty)}</strong>
        </div>
        <div>
          <small>${t('avgEntry')}</small>
          <strong>${formatPrice(row.avg)}</strong>
        </div>
        <div>
          <small>${t('currentMark')}</small>
          <strong>${formatPrice(row.mark)}</strong>
        </div>
        <div>
          <small>${t('value')}</small>
          <strong>${formatCurrency(row.value)}</strong>
        </div>
        <div>
          <small>${t('exposure')}</small>
          <strong>${formatCurrency(row.qty * row.avg)}</strong>
        </div>
        <div>
          <small>${t('pnl')}</small>
          <strong class="${row.pnl >= 0 ? 'positive' : 'negative'}">${formatSignedCurrency(row.pnl)}</strong>
        </div>
      </div>
    </article>
  `;
}

function renderActivityList(limit) {
  const items = [...appState.transactions].reverse().slice(0, limit);
  if (!items.length) return `<div class="empty-state compact-empty"><strong>${t('activityEmpty')}</strong></div>`;
  return `
    <ul class="activity-list">
      ${items.map((tx) => renderHistoryItem(tx)).join('')}
    </ul>
  `;
}

function renderHistoryItem(tx) {
  const market = getMarket(tx.marketId);
  const total = roundMoney(tx.qty * tx.price);
  return `
    <li>
      <div>
        <strong>${tx.action === 'buy' ? t('activityBuy') : t('activitySell')} ${formatQuantity(tx.qty)} ${tx.side === 'yes' ? t('yes') : t('no')}</strong>
        <div class="mini-copy">${market.id} · ${market.question[appState.language]}</div>
        <div class="mini-copy">${formatActivityTimestamp(tx.ts)}</div>
      </div>
      <div class="activity-amount">
        <strong>${formatCurrency(total)}</strong>
        <span>@ ${formatPrice(tx.price)}</span>
      </div>
    </li>
  `;
}

function renderMoversList() {
  return `
    <ul class="mover-list">
      ${buildMovers(5)
        .map(({ market, signal }) => {
          const selectedSide = market.change >= 0 ? 'yes' : 'no';
          return `
            <li>
              <button class="mover-item" data-open-market="${market.id}">
                <div>
                  <strong>${market.id}</strong>
                  <span>${market.question[appState.language]}</span>
                </div>
                <div class="mover-right">
                  <strong class="${market.change >= 0 ? 'positive' : 'negative'}">${formatProbabilityDelta(market)}</strong>
                  <span class="mover-odds">${selectedSide === 'yes' ? t('yes') : t('no')} ${formatPercent(getChance(market, selectedSide))}</span>
                </div>
              </button>
            </li>
          `;
        })
        .join('')}
    </ul>
  `;
}

function renderLiveTapeList(items) {
  if (!items.length) return `<div class="empty-state compact-empty"><strong>${t('activityEmpty')}</strong></div>`;
  return `
    <ul class="tape-list">
      ${items.map((item) => renderTapeItem(item)).join('')}
    </ul>
  `;
}

function getLiveTapeInline(item) {
  return `${item.actor} · ${item.side === 'yes' ? t('yes') : t('no')} ${formatCurrency(item.amount)}`;
}

function renderTapeItem(item) {
  return `
    <li>
      <div>
        <strong>${getTapeHeadline(item)}</strong>
        <div class="mini-copy">${item.market.id} · ${item.market.question[appState.language]}</div>
        <div class="mini-copy">${formatRelativeMinutes(Math.max(0, Math.round((Date.now() - item.ts) / 60000)))}</div>
      </div>
      <div class="activity-amount">
        <strong>${formatCurrency(item.amount)}</strong>
        <span>@ ${formatPrice(item.price)}</span>
      </div>
    </li>
  `;
}

function getTapeHeadline(item) {
  const side = item.side === 'yes' ? t('yes') : t('no');
  if (appState.language === 'el') {
    return `${item.actor === getTesterName() ? t('you') : item.actor} ${item.kind === 'user' && item.action === 'sell' ? 'πούλησε' : 'αγόρασε'} ${side}`;
  }
  return `${item.actor === getTesterName() ? t('you') : item.actor} ${item.kind === 'user' && item.action === 'sell' ? 'sold' : 'bought'} ${side}`;
}

function renderToasts() {
  if (!toasts.length) return '';
  return `
    <div class="toast-wrap">
      ${toasts
        .map(
          (toast) => `
            <div class="toast ${toast.type}">
              <strong>${toast.title}</strong>
              <span>${toast.body}</span>
            </div>
          `
        )
        .join('')}
    </div>
  `;
}

function handleClick(event) {
  const langButton = event.target.closest('[data-lang]');
  if (langButton) {
    appState.language = langButton.dataset.lang;
    saveState();
    render();
    return;
  }

  const onboardingDismiss = event.target.closest('[data-onboarding="dismiss"]');
  if (onboardingDismiss) {
    appState.onboardingSeen = true;
    saveState();
    render();
    return;
  }

  const onboardingMarket = event.target.closest('[data-onboarding-market]');
  if (onboardingMarket) {
    appState.onboardingSeen = true;
    saveState();
    navigateTo({ name: 'market', id: onboardingMarket.dataset.onboardingMarket });
    return;
  }

  const navButton = event.target.closest('[data-nav]');
  if (navButton) {
    navigateTo({ name: navButton.dataset.nav });
    return;
  }

  const filterButton = event.target.closest('[data-filter]');
  if (filterButton) {
    uiState.filter = filterButton.dataset.filter;
    render();
    return;
  }

  const sortButton = event.target.closest('[data-sort]');
  if (sortButton) {
    uiState.sort = sortButton.dataset.sort;
    render();
    return;
  }

  const openMarket = event.target.closest('[data-open-market]');
  if (openMarket) {
    uiState.detailTab = 'context';
    navigateTo({ name: 'market', id: openMarket.dataset.openMarket }, { setDetailOrigin: true });
    return;
  }

  const tradeAction = event.target.closest('[data-trade-action]');
  if (tradeAction) {
    uiState.tradeAction = tradeAction.dataset.tradeAction;
    render();
    return;
  }

  const tradeSide = event.target.closest('[data-trade-side]');
  if (tradeSide) {
    uiState.tradeSide = tradeSide.dataset.tradeSide;
    render();
    return;
  }

  const detailTab = event.target.closest('[data-detail-tab]');
  if (detailTab) {
    uiState.detailTab = detailTab.dataset.detailTab;
    render();
    return;
  }

  const tradeAmountPreset = event.target.closest('[data-trade-amount-preset]');
  if (tradeAmountPreset) {
    uiState.tradeAmount = Number(tradeAmountPreset.dataset.tradeAmountPreset);
    render();
    return;
  }

  const resetButton = event.target.closest('[data-reset]');
  if (resetButton) {
    appState.transactions = createSeedTransactions();
    saveState();
    showToast('success', t('toastResetTitle'), t('toastResetBody'));
    render();
  }
}

function handleKeydown(event) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const openMarket = event.target.closest('.market-card-link[data-open-market]');
  if (!openMarket) return;
  event.preventDefault();
  uiState.detailTab = 'context';
  navigateTo({ name: 'market', id: openMarket.dataset.openMarket }, { setDetailOrigin: true });
}

function handleInput(event) {
  const field = event.target.dataset.field;
  if (!field) return;
  if (field === 'search') {
    uiState.search = event.target.value;
    render();
    return;
  }
  if (field === 'tradeAmount') {
    uiState.tradeAmount = Math.max(0, Number(event.target.value || 0));
    render();
    return;
  }
  if (field === 'accessName') {
    uiState.accessName = event.target.value;
    return;
  }
  if (field === 'accessCode') {
    uiState.accessCode = event.target.value;
  }
}

function handleSubmit(event) {
  const accessForm = event.target.closest('[data-access-form]');
  if (accessForm) {
    event.preventDefault();
    handleAccessSubmit();
    return;
  }

  const tradeForm = event.target.closest('[data-trade-form]');
  if (!tradeForm) return;
  event.preventDefault();
  const route = getRoute();
  const market = getMarket(route.id);
  executeTrade(market);
}

function handleAccessSubmit() {
  if (uiState.accessCode.trim().toLowerCase() !== ACCESS_CODE) {
    showToast('error', t('toastErrorTitle'), t('toastAccessError'));
    render();
    return;
  }

  appState.access = {
    granted: true,
    testerName: uiState.accessName.trim(),
    grantedAt: new Date().toISOString()
  };
  appState.onboardingSeen = false;
  saveState();
  render();
}

function executeTrade(market) {
  const amount = roundMoney(Number(uiState.tradeAmount || 0));
  if (!amount || amount < 1) {
    showToast('error', t('toastErrorTitle'), t('toastAmountError'));
    render();
    return;
  }

  const portfolio = buildPortfolio(appState.transactions);
  const price = getPrice(market, uiState.tradeSide);
  const qty = roundContracts(amount / price);
  const total = roundMoney(qty * price);
  const heldQty = getHeldQty(portfolio, market.id, uiState.tradeSide);

  if (uiState.tradeAction === 'buy' && total > portfolio.cash) {
    showToast('error', t('toastErrorTitle'), t('toastCashError'));
    render();
    return;
  }

  if (uiState.tradeAction === 'sell' && qty > heldQty + 0.0001) {
    showToast('error', t('toastErrorTitle'), t('toastHoldingsError'));
    render();
    return;
  }

  appState.transactions.push({
    id: `tx-${Date.now()}`,
    ts: new Date().toISOString(),
    marketId: market.id,
    action: uiState.tradeAction,
    side: uiState.tradeSide,
    qty,
    price
  });
  saveState();
  showToast('success', t('toastExecutedTitle'), t('toastExecutedBody'));
  render();
}

function showToast(type, title, body) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  toasts = [...toasts, { id, type, title, body }];
  setTimeout(() => {
    toasts = toasts.filter((toast) => toast.id !== id);
    render();
  }, 2400);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
