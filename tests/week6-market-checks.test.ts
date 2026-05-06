import assert from 'node:assert/strict';
import test from 'node:test';
import {
  articleConfirmsFinalQualification,
  articleConfirmsQualification,
  detectEarlyResolutionDecision,
  extractAnchorCandidates,
  hasEarlyResolutionDetector,
  normalizeForMatch,
  pickFinalArticleCandidates,
  pickFinalFourArticleCandidates
} from '../lib/ops-early-resolution.ts';
import { resolveSchedule } from '../lib/ops-market-checks.ts';

test('resolveSchedule treats early-resolution candidates as high risk all day', () => {
  assert.deepEqual(
    resolveSchedule({
      hourAthens: 4,
      hasHighRiskWindow: false,
      hasEarlyResolutionCandidates: true
    }),
    { mode: 'high_risk', intervalMinutes: 20 }
  );

  assert.equal(
    resolveSchedule({
      hourAthens: 4,
      hasHighRiskWindow: false,
      hasEarlyResolutionCandidates: false
    }),
    null
  );
});

test('anchor extraction resolves relative hrefs and keeps visible text', () => {
  const html = `
    <div>
      <a href="/el/nea/game-news/19497-monaco-olympiacos-3.html">Ο Θρύλος με 100άρα ξανά στο Final Four!</a>
      <a href="https://example.com/other">Other link</a>
    </div>
  `;

  assert.deepEqual(extractAnchorCandidates(html, 'https://www.olympiacosbc.gr/el/'), [
    {
      href: 'https://www.olympiacosbc.gr/el/nea/game-news/19497-monaco-olympiacos-3.html',
      text: 'Ο Θρύλος με 100άρα ξανά στο Final Four!'
    },
    {
      href: 'https://example.com/other',
      text: 'Other link'
    }
  ]);
});

test('final four article picker filters unrelated anchors', () => {
  const html = `
    <div>
      <a href="/one">Regular season update</a>
      <a href="/two">Ο Θρύλος με 100άρα ξανά στο Final Four!</a>
    </div>
  `;

  assert.deepEqual(pickFinalFourArticleCandidates(html, 'https://www.olympiacosbc.gr/el/'), [
    {
      href: 'https://www.olympiacosbc.gr/two',
      text: 'Ο Θρύλος με 100άρα ξανά στο Final Four!'
    }
  ]);
});

test('final article picker finds title-game candidates without matching Final Four only copy', () => {
  const html = `
    <div>
      <a href="/one">Ο Θρύλος ξανά στο Final Four!</a>
      <a href="/two">Ο Ολυμπιακός στον τελικό της EuroLeague!</a>
    </div>
  `;

  assert.deepEqual(pickFinalArticleCandidates(html, 'https://www.olympiacosbc.gr/el/'), [
    {
      href: 'https://www.olympiacosbc.gr/two',
      text: 'Ο Ολυμπιακός στον τελικό της EuroLeague!'
    }
  ]);
});

test('article qualification matcher accepts official Greek and English phrasing', () => {
  const greekText =
    'Δημοσιεύθηκε 05 Μάι 2026 Ο Θρύλος με 100άρα ξανά στο Final Four! Ο Ολυμπιακός κέρδισε την Μονακό και εξασφαλίζοντας έτσι την πρόκρισή του στο Final Four της Αθήνας.';
  const englishText =
    'Panathinaikos BC official report: Panathinaikos booked a Final Four ticket after the playoff win and secured its place in the EuroLeague Final Four.';

  assert.equal(articleConfirmsQualification(greekText, /(olympiacos|ολυμπιακ)/i), true);
  assert.equal(articleConfirmsQualification(englishText, /(panathinaikos|παναθηναικ)/i), true);
  assert.equal(articleConfirmsQualification('Olympiacos won, but the Final Four race stays open.', /(olympiacos|ολυμπιακ)/i), false);
});

test('final qualification matcher accepts official title-game phrasing and rejects final-four only copy', () => {
  const greekFinalText =
    'Ο Ολυμπιακός νίκησε στον ημιτελικό και εξασφάλισε την πρόκρισή του στον τελικό της EuroLeague.';
  const englishFinalText =
    'Panathinaikos BC official report confirms Panathinaikos secured its place in the EuroLeague final after the semifinal win.';
  const falsePositive = 'Olympiacos booked its place in the EuroLeague Final Four after the playoff sweep.';

  assert.equal(articleConfirmsFinalQualification(greekFinalText, /(olympiacos|ολυμπιακ)/i), true);
  assert.equal(articleConfirmsFinalQualification(englishFinalText, /(panathinaikos|παναθηναικ)/i), true);
  assert.equal(articleConfirmsFinalQualification(falsePositive, /(olympiacos|ολυμπιακ)/i), false);
});

test('early resolution detector returns YES with official club evidence for final four', async () => {
  const homepageHtml = `
    <html>
      <body>
        <a href="/el/nea/eidiseis/19499-oi-diloseis-ton-proedron-meta-tin-prokrisi-sto-final-four-tis-athinas.html">Οι δηλώσεις των Προέδρων μετά την πρόκριση στο Final Four της Αθήνας</a>
        <a href="/el/nea/game-news/19497-monaco-olympiacos-3.html">Ο Θρύλος με 100άρα ξανά στο Final Four!</a>
      </body>
    </html>
  `;
  const articleHtml = `
    <html>
      <body>
        <article>
          <h1>Ο Θρύλος με 100άρα ξανά στο Final Four!</h1>
          <p>Ο Ολυμπιακός κέρδισε την Μονακό με 105-82 και εξασφάλισε την πρόκρισή του στο Final Four της Αθήνας.</p>
        </article>
      </body>
    </html>
  `;

  const fetcher: typeof fetch = async (input) => {
    const url = String(input);

    if (url === 'https://www.olympiacosbc.gr/el/') {
      return new Response(homepageHtml, { status: 200 });
    }

    if (url === 'https://www.olympiacosbc.gr/el/nea/eidiseis/19499-oi-diloseis-ton-proedron-meta-tin-prokrisi-sto-final-four-tis-athinas.html') {
      return new Response(articleHtml, { status: 200 });
    }

    if (url === 'https://www.olympiacosbc.gr/el/nea/game-news/19497-monaco-olympiacos-3.html') {
      return new Response(articleHtml, { status: 200 });
    }

    throw new Error(`unexpected url: ${url}`);
  };

  const decision = await detectEarlyResolutionDecision(
    {
      slug: 'gre-sports-euroleague-final4',
      question: 'Will a Greek team reach the EuroLeague Final Four?'
    },
    fetcher
  );

  assert.equal(hasEarlyResolutionDetector('gre-sports-euroleague-final4'), true);
  assert.equal(decision?.outcome, 'yes');
  assert.match(decision?.evidenceSummary ?? '', /official report confirms/i);
  assert.equal(
    decision?.evidenceUrl,
    'https://www.olympiacosbc.gr/el/nea/eidiseis/19499-oi-diloseis-ton-proedron-meta-tin-prokrisi-sto-final-four-tis-athinas.html'
  );
});

test('early resolution detector returns YES with official club evidence for the final market', async () => {
  const homepageHtml = `
    <html>
      <body>
        <a href="/el/nea/game-news/19540-olympiacos-in-the-euroleague-final.html">Ο Ολυμπιακός στον τελικό της EuroLeague!</a>
      </body>
    </html>
  `;
  const articleHtml = `
    <html>
      <body>
        <article>
          <h1>Ο Ολυμπιακός στον τελικό της EuroLeague!</h1>
          <p>Ο Ολυμπιακός κέρδισε στον ημιτελικό και εξασφάλισε την πρόκρισή του στον τελικό της EuroLeague.</p>
        </article>
      </body>
    </html>
  `;

  const fetcher: typeof fetch = async (input) => {
    const url = String(input);

    if (url === 'https://www.olympiacosbc.gr/el/') {
      return new Response(homepageHtml, { status: 200 });
    }

    if (url === 'https://www.olympiacosbc.gr/el/nea/game-news/19540-olympiacos-in-the-euroleague-final.html') {
      return new Response(articleHtml, { status: 200 });
    }

    throw new Error(`unexpected url: ${url}`);
  };

  const decision = await detectEarlyResolutionDecision(
    {
      slug: 'gre-sports-euroleague-final',
      question: 'Will a Greek team reach the EuroLeague Final?'
    },
    fetcher
  );

  assert.equal(hasEarlyResolutionDetector('gre-sports-euroleague-final'), true);
  assert.equal(decision?.outcome, 'yes');
  assert.match(decision?.evidenceSummary ?? '', /qualified for the title game/i);
  assert.equal(
    decision?.evidenceUrl,
    'https://www.olympiacosbc.gr/el/nea/game-news/19540-olympiacos-in-the-euroleague-final.html'
  );
});

test('normalizeForMatch strips accents and collapses whitespace', () => {
  assert.equal(normalizeForMatch('  πρόκριση\nστο   Final Four  '), 'προκριση στο final four');
});
