---
description: Run the copy lint and explain the findings in plain language. Does not edit anything.
---

Run `npm run lint:copy -- --json` and read the output.

For each error and warning, explain in plain language — don't just repeat the raw lint line:
- What's wrong.
- Why it matters for conversion (e.g. why a generic CTA loses signups, why filler words read as untrustworthy).
- A concrete suggested fix, specific to the actual text, not a generic tip.

Group errors first, then warnings. If there are 0 errors and 0 warnings, say so clearly and stop.

Do not edit any files — this command only explains findings. If the user wants them fixed, tell them to run `/write-copy`.
