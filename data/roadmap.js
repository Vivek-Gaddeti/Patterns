/* Study plans, generated from the catalog's OA frequency.
   Every 7th day is a mock OA; the day before it is a review day. */
window.PLANS = {
  "1w": { label: "1 week", blurb: "Crash course: only the patterns OAs ask most.", days: 7, minFreq: 3 },
  "2w": { label: "2 weeks", blurb: "High and medium frequency patterns, 3 a day.", days: 14, minFreq: 2 },
  "4w": { label: "4 weeks", blurb: "Every pattern, about 2 a day, with weekly mocks.", days: 28, minFreq: 1 },
  "8w": { label: "8 weeks", blurb: "Every pattern at a steady pace, extra practice days.", days: 56, minFreq: 1 }
};

window.buildPlan = function (key) {
  const plan = PLANS[key] || PLANS["2w"];
  const pats = CATALOG.filter((p) => p.freq >= plan.minFreq).map((p) => p.id);
  const days = [];
  for (let d = 1; d <= plan.days; d++) {
    if (d % 7 === 0) days.push({ d, type: "mock", title: "Mock OA", note: "90 minutes, 3 mixed problems, patterns hidden." });
    else if (d % 7 === 6) days.push({ d, type: "review", title: "Review day", note: "Clear your revision queue and redo attempted problems." });
    else days.push({ d, type: "learn", pats: [] });
  }
  const learnDays = days.filter((x) => x.type === "learn");
  pats.forEach((id, i) => learnDays[Math.floor(i * learnDays.length / pats.length)].pats.push(id));
  learnDays.forEach((x) => { x.title = x.pats.map((id) => patternOf(id).title.split(":")[0].split("(")[0].trim()).join(" · "); x.note = `Learn ${x.pats.length} pattern${x.pats.length > 1 ? "s" : ""}, solve ${x.pats.length * 3} problems.`; });
  return days;
};

window.planDay = function () { // which day of the plan is today (1-based), or null
  const start = Store.get("planStart");
  return start == null ? null : today() - start + 1;
};
