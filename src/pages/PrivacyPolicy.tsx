import SEO from '../components/SEO';

export default function PrivacyPolicy() {
  return (
    <>
      <SEO title="Privacy Policy" />
      <div className="container px-4 py-5">
        <h1 className="display-5 fw-bold text-body-emphasis mb-4">Privacy Policy</h1>
        <div className="col-lg-8 mx-auto">
          <p className="text-body-secondary">Last updated: 6 July 2026</p>
          <p>
            This website (corbinr40.com) is the personal portfolio of Corbin Richardson.
            The short version: it does not use cookies, does not collect personal
            information, does not show ads, and does not track you across the web.
            The longer version follows.
          </p>

          <h2 className="mt-4">Analytics</h2>
          <p>
            I use{' '}
            <a href="https://www.cloudflare.com/web-analytics/" target="_blank" rel="noopener noreferrer">
              Cloudflare Web Analytics
            </a>{' '}
            to understand how the site is used. It is cookieless by design: it collects
            anonymous, aggregated statistics — page views, referrers, country-level
            location, and page performance timings — without cookies, without storing
            anything in your browser, and without any persistent identifier that could
            follow you between visits or across other sites.
          </p>

          <h2 className="mt-4">Hosting</h2>
          <p>
            The site is hosted on GitHub Pages. Like most web hosts, GitHub may log
            technical request data (such as IP addresses) for security and operational
            purposes. See the{' '}
            <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">
              GitHub Privacy Statement
            </a>{' '}
            for details. I do not have access to, and do not use, these logs.
          </p>

          <h2 className="mt-4">Stored in Your Browser</h2>
          <p>
            The only thing this site stores on your device is your light/dark theme
            preference, kept in your browser's local storage. It never leaves your
            device, and clearing your browser data removes it.
          </p>

          <h2 className="mt-4">Embedded Content</h2>
          <p>
            Some project pages may embed videos hosted on YouTube or Vimeo. Embedded
            content loads directly from the provider when you view such a page and is
            subject to that provider's own privacy policy. Pages without embeds load
            nothing from these providers.
          </p>

          <h2 className="mt-4">External Links</h2>
          <p>
            The site links out to third-party services such as GitHub, LinkedIn, and
            Itch.io. Once you follow a link, you are on their site under their privacy
            policy — I have no control over, and no responsibility for, what they do
            with your data.
          </p>

          <h2 className="mt-4">Contact</h2>
          <p>
            The contact page is a plain email link — there are no forms, and nothing is
            submitted through this site. If you email me at{' '}
            <a href="mailto:corbinr40@live.com">corbinr40@live.com</a>, I will use your
            address only to reply and will not share it with anyone.
          </p>

          <h2 className="mt-4">Changes to This Policy</h2>
          <p>
            If the site's behaviour changes — for example, if I add a service that
            processes personal data — this page will be updated to describe it before
            the change goes live.
          </p>
        </div>
      </div>
    </>
  );
}
