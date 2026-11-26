# BFit reader walkthrough

Ask 3–5 people to try the guides, including a new exerciser, a recreational athlete, and someone with a screen-heavy routine. Do not explain the navigation first. This is a qualitative usability check, not proof of training outcomes.

## Tasks

1. Find a guide that fits what you want to do and explain why you chose it.
2. Find a suitable session and identify the equipment and time needed.
3. Explain the first exercise or running interval, the amount, rest, and effort in your own words.
4. Find help for something unfamiliar, then return to the session.
5. Show how you would record the session and decide what to do next.
6. Return to the hub and find another guide.

## Prompts for the published guides

- “You want to get stronger at home. Show me what you’d do first.” Observe whether the reader can leave Foundation’s goals blank, choose equipment, start warming up, and explain the first exercise.
- “You have five minutes between games.” See which Gamer Fit route they take. For Run Strong, ask how they would choose their starting session.
- “You want a plan around your workweek.” On a phone, see whether the reader discovers both cards in the training-plan row and knows which workout comes next.
- “What does a dead hang look like? What would you do without a safe place to hang?” Let the reader find the Pull-Up equipment choices and the Foundation link.
- On the reader’s own phone, try a milestone backup download and restore using test data. Record the device and whether their next session and log survive.

## Observe

Record device/browser, chosen guide, task, completed without help (yes/no), where they hesitated, exact wording they misunderstood, and any assistance provided. Do not put personal health details in this public repository. Use anonymous participant labels. Ask “What did you expect that to do?” instead of teaching the interface during a task.

## Real-phone check

Try an initial load on mobile data and a slower connection. Record whether content appears promptly, controls respond, text jumps during loading, and navigation covers content. Check saving, reload, downloads, and printing on an actual phone. Automated desktop browser tests do not replace this check. Prioritize observed failures before splitting large HTML files.

## Decision

Fix blocked tasks and repeated confusion. Preserve routes readers use successfully. Re-test changed tasks with someone who has not already learned the interface.

## Keep Moving: 50+ guide reader check

For this guide, recruit at least one adult aged 50–64 and one aged 65+ if possible. Give them the published guide link and ask them to complete these tasks without coaching or hints. The four pages should show a clear place in the sequence, but readers can skip the educational material:

1. Pick an everyday priority, such as carrying groceries or climbing stairs, and explain what it means.
2. Select one or two enjoyable activities. Find the option that matches your age, schedule, and preferred exercise location.
3. Find the first strength session. Name a warm-up, choose three appropriate exercises, and explain a set, a rep, and the suggested effort.
4. Read a research explanation and tell us which benefit matters most. Then open a movement demonstration, identify the correct variation, and return to the guide.
5. Find the personalized week, save a copy, reload, and explain whether the routine is still there.
6. Say what you would do if you felt unsteady, had recently fallen, or became dizzy.
7. Find the BFit Hub link and return to the guide.

On a physical phone, also try the exercise demonstration links, expandable activity descriptions, browser saving, download and print/save-as-PDF. If a reader chooses the recent-falls or unexplained-dizziness option, confirm the page shows professional assessment as the next step, not an unsupervised strength routine.

Do **not** ask participants to perform unfamiliar exercises, disclose medical histories, or test their physical capability just to evaluate the website. The exercise task is about understanding instructions, not physical clearance.

**Open items:** Independent-reader observation and a real iPhone/Android walkthrough are still outstanding. Automated Chromium tests cover all four pages, key responsive widths, exercise references, cross-page storage, printing, research-source links, and fall-risk routing. They do not substitute for those tests.
