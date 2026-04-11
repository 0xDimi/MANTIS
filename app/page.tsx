import Script from 'next/script';

export default function HomePage() {
  return (
    <>
      <link rel="stylesheet" href="/legacy/styles.css" />
      <div id="app" />
      <Script src="/legacy/app.js" type="module" strategy="afterInteractive" />
    </>
  );
}
