# BFit coaching funnel — release verification

Historical review. See the [current site handoff](README.md) for the published catalog, coaching intake, social links, and open checks.
**Checked:** November 5, 2026  
**Public site:** https://vtrackstar.github.io/bfit/  
**Inquiry form:** https://forms.gle/f11PGA7PCUKaxrgq9  
**Browser check:** https://github.com/vtrackstar/bfit/actions/runs/42054851913

## Confirmed without submitting an application

The public form opened in headless Chromium from a signed-out session with HTTP 200, no login gate, and the title **BFit Individual Coaching Questionnaire**. The form contained two named options with monthly pricing displayed there (not duplicated on public website pages):

- **Premium:** written check-ins every other week, up to two technique-video submissions per month, initial nutrition-habit support, clarifying messages answered within two business days (Monday–Friday), an onboarding call but no recurring calls.
- **Elite:** weekly check-ins, ongoing nutrition-habit review, messaging replies by the next business day (Monday–Friday), follow-up for missed check-ins, an onboarding call and one monthly progress call up to 45 minutes.

A visitor can select **Premium** or **Elite**, and the form visibly offers the alternative of requesting a brief inquiry call before deciding. The hub and all four guides point to this form. Public pages intentionally do not display plan prices.

This is a **read-only inspection** of the public visitor experience. The automated report summarizes relevant visible lines rather than storing a completed form or visitor data.

## Manual end-to-end tests still required

Perform tests with an email account you control, not a fabricated lead. If any test creates a response, label it as a test and remove it after verification.

- [ ] Submit a **Premium** test inquiry from a private/signed-out browser, using a real test email address you control.
- [ ] Verify the Google Form records the submission, the intended Zapier path runs once, and any email reaches the test inbox with accurate Premium details.
- [ ] Submit an **Elite** test inquiry and verify the corresponding follow-up uses the correct plan information.
- [ ] Submit the **brief inquiry call** choice and confirm it follows the right scheduling/reply path rather than automatically enrolling the person.
- [ ] Check email content, timing, spam delivery, broken calendar/enrollment links, duplicate messages, and behavior when a required field is blank.
- [ ] Confirm no payment is taken before the applicant has knowingly accepted terms.

## Not established by the automated checks

Zapier configuration and triggers, actual email deliverability, response notifications, private Discord access, service agreement, payment collection, consent/privacy disclosures, and usability with a physical phone or screen reader.

**Release assessment:** The public inquiry page is readable and consistent with the site's two-plan messaging; end-to-end enrollment is **not yet signed off** until the submission and email-routing checks above succeed.
