# BFit Editorial Voice Audit
**Date:** November 12, 2026  
**Source reviewed:** `vtrackstar/bfit` main at commit `c6de7de451f416b27ab2c1c4c973effd851de405`  
**Scope:** Hub, Foundation, Athleticism, Gamer Fit, Run Strong. Coaching availability page was checked as a related navigation context.  
**Status:** Proposals only. No public guide wording, programs, exercise IDs, or site navigation changed by this audit.

**Community feedback comparison:** [Reader complaints about AI-slop writing and BFit-specific edits](COMMUNITY_AI_SLOP_LANGUAGE_AUDIT_2026-11-12.md).

## Purpose

Protect the voice behind the BFit programs. The owner's concepts and training decisions should be recognizable without adding sales clichés or text that sounds mechanically generated. This is **an editorial and factual-authorship review**, not a test of whether AI helped with writing. No vocabulary test, pattern count, or AI detector can certify human authorship or prevent allegations.

I inspected all five source files, including source-embedded prose and instructional blocks, and sampled representative passages and repeated expressions. Foundation and Athleticism render significant material through JavaScript, so an automated count is **not** a substitute for manually reading every interactive state and workout.

## Executive finding

- **Hub: low stylistic concern.** Clear calls to action, first-person coaching, and user-selected "Find your way to better training" headline work well. Some generic benefit phrases and repeated "more frequent" coaching descriptions could be tightened.
- **Foundation: low to moderate.** Strong teaching voice and actual coaching decisions. The calorie-estimate section stacks multiple qualifications, and some educational paragraphs are longer than needed. Preserve its calculations, exercise instructions, safety language, and "How I built this guide" authorship explanation.
- **Athleticism: low to moderate.** The distinguishing language is technical and specific: separate sprint, jump, cutting, braking, and strength demands. The Week 4 continuation note repeats the same direction twice and can be cut substantially. Most em dashes appear in workout notation, missing-value placeholders, or developer notes, not marketing copy.
- **Gamer Fit: highest editorial priority.** It is by far the longest guide. There are roughly 18 unique chapter "Key takeaway" summaries, most also followed by "Do this." Consistent chapter summaries are useful, but the same template across every topic becomes repetitive. The teaching itself is often practical and grounded in gaming habits, such as queues, chat, tilt, and streamer break cues.
- **Run Strong: low stylistic concern.** Concrete pace examples, a real coaching case with historical 37/47-second surge targets, and explanation of how running and lifting fit together give it an identifiable coaching voice. Its scientific boundaries belong in the guide. There are a few awkward spacing/punctuation artifacts and some overlong explanatory notes.

The absence of obvious buzzwords is encouraging, but does **not** prove or disprove AI involvement.

## Exact passages and proposed edits

These are editorial proposals, **not automatically approved replacements**. Preserve source citations and any surrounding numerical instructions.

### 1. Hub: remove one outdated sentence

**Current:** "See the questionnaire for check-in schedules, video-review limits, calls, and prices."

**Why:** The form is currently closed. This also contradicts the paused-intake message a few paragraphs later.

**Proposed:** "Full check-in schedules, video-review limits, calls, and prices will be available when coaching applications reopen."

**Priority:** P0 factual consistency. Do this even if every other suggestion is rejected.

### 2. Hub: cut benefit stacking in coaching

**Current:** "Premium gives you a plan and scheduled feedback. Elite has more frequent check-ins and chances to review your technique together."

The next cards and comparison table repeat "more frequent," "more check-ins," "more chances," and "feedback" in several places.

**Proposed for the lead:** "With Premium, I build your training plan and review it at scheduled check-ins. Elite adds more frequent reviews and exercise feedback."

**Decision:** Keep the factual tier table. Remove repetition in the surrounding sales paragraphs rather than eliminating information visitors need.

### 3. Foundation: simplify the calorie estimate follow-up

**Current:** "This estimate gives you a starting point, not an exact calorie requirement. Your actual needs vary with your activity and how your body responds over time. Looking at your food intake alongside those patterns helps you decide whether an adjustment is useful. Individual coaching can help you interpret that information and make adjustments based on your goals."

**Proposed:** "Use this as a starting estimate. Compare it with your intake, weight trend, and training over time before adjusting. With coaching, we'd review those patterns together and decide what to change."

**Check first:** Confirm that nearby context still explains Mifflin-St Jeor, activity factors, and limitations. Keep necessary uncertainty and avoid making a calorie calculator sound exact.

### 4. Athleticism: remove repeated Week 4 instructions

**Current:** "Week 4 reduces training volume and gives you a chance to review how the block went." The note later says both "Use these four weeks to practice the movements and track how you respond" and "At Week 4, review how the sessions felt and what you can repeat well."

**Proposed:** "Week 4 lowers the workload so you can review the block. Check what you completed, how your technique held up, and how you recovered. If those were consistent, repeat the block and progress one appropriate variable: load, execution, or a sprint or jump progression. Otherwise, repeat your current level or reduce the work that caused problems."

**Check first:** Do not change the prescribed volume, weekly set/contact totals, or athlete-readiness gates.

### 5. Gamer Fit: compress formulaic chapter summaries without removing their function

**Current:** "Key takeaway: Food, water, light movement, and a short break often help more than another energy drink. Do this: Check whether you are hungry, thirsty, tired, or mentally overloaded before adding caffeine."

**Proposed:** "Before another energy drink, check the basics: have you eaten, had water, moved around, or taken a break?"

**Current:** "Key takeaway: Fast food can fit your plan. The goal is a more balanced order, not a perfect one. Do this: Add protein and produce when available, choose a reasonable portion, and drink water."

**Proposed:** "Ordering fast food? Start with a portion that fits your hunger. Include protein, add fruit or vegetables when available, and have water with it."

**Decision:** Keep a predictable short summary at the beginning of each chapter, but avoid mechanical "Key takeaway / Do this / Continue with" triplets when a single actionable sentence communicates the idea. Preserve any chapter navigation that depends on the existing HTML structure.

### 6. Run Strong: polish the few rough edges, keep the author's examples

**Current examples of typography/spacing:** "with 2 easy minutes between efforts ;" and "See how to set priorities ."

**Proposed:** Remove the spaces before the semicolon and period, respectively, with a targeted source change that does not touch script logic.

**Keep:** The "I worked backward from postseason time goals..." coaching case and the distinction between the observed athlete-specific 37/47-second targets and general prescriptions. That is exactly the kind of practical reasoning that gives this guide a real authorial point of view.

## What to preserve

- The owner's preferred headline and emphasis on **choosing a plan and learning the why as you go**.
- "I" in coaching sections, without naming or listing credentials unnecessarily.
- Specific decisions: planned versus completed work, RIR, exact training volume, what is counted as a jump contact, what to change after missed sessions, and how sport practice affects the week.
- Clear technique warnings and genuine limitations. A phrase like "not just your arms" can be a useful exercise cue. Do **not** delete every negative construction or every em dash automatically.
- Honest source credits and uncertainty, especially research summaries and safety advice.
- Fictional client examples labeled as illustrative, and real experience only where it is accurate. Never invent testimonials, athlete results, or coaching stories.
- Functional chapter summaries, menus, glossary terms, buttons, numerical workout notation, and exported workout labels. Do not make their wording less usable merely to create variation.

## Editorial standard for future revisions

1. **State the action and the reason.** Prefer "Keep the load the same this week and see whether all sets stay clean" over abstract encouragement.
2. **One useful point per sentence.** Split long strings of hedges, examples, and qualifications without dropping important conditions.
3. **Write like a coach talking to a person.** Direct, practical, calm, and professional. Do not add hype or forced conversational slang.
4. **Use first person where it is genuinely personal.** "I review..." belongs in coaching. Exercise science explanations do not need an "I" in every paragraph.
5. **Use real examples rather than empty benefit claims.** An adjusted squat set, a gaming break between queues, or a sprint-contact audit carries more identity than "better results."
6. **Avoid stock advertising language.** Skip "unlock," "transform," "journey," "train smarter," and "take it to the next level" unless it is truly the owner's preferred phrasing.
7. **Avoid unnecessary contrast.** Use "not X, but Y" only when the distinction actually teaches something or prevents a safety mistake.
8. **Keep punctuation natural.** Default to commas and periods in prose. Retain meaningful mathematical punctuation, interval notation, and necessary terminology.
9. **Keep list style consistent.** Pick one serial-comma convention and apply it to prose, while leaving existing code identifiers and data schemas alone.
10. **No defensive authorship disclaimers.** Let the programming, specific examples, version history, and source notes show the owner's contribution.

## Authorship documentation

A linguistic audit cannot substantiate who originated an idea. Preserve the substantive records that can:

- Original programming outlines and versioned source files.
- The coaching logic behind program choices, exercise IDs, set budgets, readiness notes, and progression rules.
- GitHub commit history, change logs, and the existing "How I built this guide" explanation.
- Real coaching examples and research notes with accurate sourcing.

If asked whether software or AI was involved, the response should be truthful about the type of assistance used. There is no need to claim every sentence was typed without tools in order to take ownership of the training concepts.

## Suggested execution order

1. Approve the smallest high-impact changes: the stale hub questionnaire sentence and obvious typography.
2. Tighten the redundant Hub coaching lead and Athleticism Week 4 note.
3. Selectively edit Gamer Fit chapter summaries while retaining the action-first navigation.
4. Review longer Foundation nutrition paragraphs in context; preserve the calculator's limitations.
5. Review Run Strong for formatting only, keeping its first-person coaching example intact.
6. Make approved copy changes in a pull request. Run existing static, data, navigation, mobile, accessibility, and export tests. Check a few actual rendered states where text lives in JavaScript templates.
7. Ask one reader whether the guide sounds like a specific coach rather than a generic fitness brand. Do not ask them to guess whether AI wrote it; that does not measure clarity, authenticity, or educational value.

**Release recommendation:** Do not rebuild any guide for "AI allegations." Apply the targeted editorial improvements, retain the evidence of original coaching decisions, and use the next blind visitor test to identify actual comprehension problems.
