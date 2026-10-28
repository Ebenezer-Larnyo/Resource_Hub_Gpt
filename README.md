# ASD Resource Hub

A research-informed prototype resource directory for autistic people and caregivers. It combines a static, GitHub Pages-compatible front end with a scheduled Python link monitor that writes discoveries to a human-review queue.

## Current scope

- Accessible responsive website, resource search and topic filters.
- Curated starter resources with source attribution and check dates.
- Scripted, local Talk & Connect demo. It is **not live AI**, not a clinician, and not clinically validated.
- Optional browser-local preferences; no chat transcript is persisted by the application.
- Browser speech recognition and speech synthesis where supported. Recognition may involve browser-vendor processing and permissions.
- Python crawler checks approved URLs and writes only to `crawler/review_queue.json`. It never publishes crawled entries.
- GitHub Actions schedule and manual workflow dispatch.

## Run locally

The static site can be opened through a local HTTP server (recommended so JSON loading works):

```bash
python -m http.server 8000
```

Open http://localhost:8000.

Run crawler and tests (Python 3.10+):

```bash
python -m pip install -r requirements.txt
python -m unittest discover -s tests -v
python crawler/crawler.py
```

The crawler uses Python standard-library modules; `requirements.txt` is intentionally minimal.

## GitHub Pages deployment

1. Open repository **Settings → Pages**.
2. Choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
3. Wait for the Pages deployment, then use the URL displayed in Settings → Pages.
4. The site is static. The crawler workflow commits review-queue changes only when GitHub Actions has repository contents write permission. Review the workflow permissions and Actions settings before enabling.
5. The queue file is a draft review artifact, not a production database or secure admin panel.

## Crawler review process

- Edit `crawler/sources.json` to add approved source URLs. Keep the list limited to websites you are allowed to check; respect robots.txt, terms, rate limits, and site owners.
- Scheduled workflow runs weekly and can also be started manually.
- Results are stored in `crawler/review_queue.json` with status `pending_review`. The crawler records URL status and limited page metadata only; it does not copy article bodies.
- A human must verify the publisher, relevance, currency, accessibility, and suitability before manually adding a resource to `data/resources.json`.
- The included crawler is a link/metadata monitor, not an intelligent quality or clinical-evidence assessor. HTTP success does not mean a resource is trustworthy or medically accurate.

## Talk & Connect: free demo and future integration

The current companion uses deterministic scripted responses in `app.js`. It does not call an AI provider, so no API key is required and no live conversational AI should be advertised.

To add live AI later, use a server-side proxy (never place a provider secret in browser JavaScript), a disclosed privacy policy, rate limits, abuse protection, and safety evaluations. Any hosted model may have cost or usage limits. A human-like 3D avatar typically needs a separate rendering/animation solution and may not be reliably available at zero cost. Build and test text support first; make voice and animation optional.

## Privacy and safety

- No login is implemented.
- Chat messages exist in the current page session only and are not sent to a backend by this demo.
- Preferences are stored in localStorage only after opt-in; the user can delete them. They never contain chat text.
- Browser speech recognition can process audio through the browser/provider. Explain this clearly before enabling it for a public launch.
- Do not collect identifiable health details unnecessarily. Add a privacy notice, accessibility testing, security review, and community review before production.
- For US crisis support, the prototype provides 988 information when relevant. It is not monitored and must not imply that a human is watching the conversation.

## Tests and release checklist

Run `python -m unittest discover -s tests -v`. These tests cover resource JSON shape and crawler URL validation without making external network requests.

Before public release:
- [ ] Verify all resource links, source authority, regional relevance, and dates manually.
- [ ] Run crawler once manually and inspect review queue.
- [ ] Run GitHub Actions workflow and confirm commit permissions.
- [ ] Test keyboard-only navigation, focus visibility, screen-reader labels, contrast, mobile layout, and reduced motion.
- [ ] Test voice controls on supported browsers and ensure text-only use remains possible.
- [ ] If a live model is added, conduct privacy, safety, prompt-injection, crisis-response, and hallucination testing.
- [ ] Add real human moderation and escalation process if any user-generated content or live AI is deployed.

## Research provenance

The project is informed by Larnyo et al. (2024), “Sentiment analysis of post-COVID-19 health information needs of autism spectrum disorder community: insights from social media discussions,” *Frontiers in Psychiatry*, 15:1441349. The study's social-media analysis motivates attention to information needs and community experiences; it does not validate this website, crawler, AI companion, or any clinical outcome.

## License

See [LICENSE](LICENSE). Review whether that license is appropriate for any future third-party content and branding before publication.