# Analytics Setup

## Current status

No Google Analytics, Google Tag Manager, Microsoft Clarity, Plausible, Matomo or other analytics implementation was found in the HTML or JavaScript. No measurement ID, container ID or verification token has been invented or added.

## Recommended GA4 setup

1. Create or confirm a GA4 property for `https://alonsopizarro.cl`.
2. Add the real Google tag measurement ID consistently to all seven canonical pages, ideally through a shared include/build step so it cannot drift.
3. Avoid loading both a direct Google tag and a Google Tag Manager GA4 configuration for the same property.
4. Confirm that page views use the clean URL paths and that local `file://` previews are excluded.
5. Configure internal/developer traffic filters before using the data for decisions.
6. Align cookie/consent behavior with the site's privacy policy and applicable requirements before production activation.

## Enhanced Measurement

After installation, review and enable only the useful GA4 Enhanced Measurement options:

- Page views and browser-history changes.
- Scrolls.
- Outbound clicks.
- File downloads, especially course PDFs.
- Site search only if a real query parameter and search feature are introduced.
- Video engagement only if embedded supported videos are added.

Verify that outbound DOI, Google Scholar, ORCID and institutional links are recorded once, not duplicated by custom tags.

## Contact-form conversion

Record a conversion only after EmailJS confirms delivery. The success point is immediately after this awaited call in `assets/js/main.js`:

```js
await window.emailjs.sendForm(serviceID, templateID, form);
```

Once GA4 exists, add an event after that line and before `form.reset()`:

```js
window.gtag?.("event", "generate_lead", {
  form_name: "contact",
  method: "emailjs"
});
```

Do not fire the event on button click, validation failure, EmailJS loading failure or the `catch` path. Mark `generate_lead` as a key event in GA4 only after a successful test submission appears in DebugView and Realtime.

## Future events and actions

- Course PDF download.
- DOI/publication outbound click.
- Google Scholar and ORCID outbound click.
- Meeting-scheduling click.
- Successful contact-form delivery.

Use descriptive parameters, avoid personally identifiable information and maintain an event dictionary with owner, trigger and validation status.

