const DAY = 86400000;

export const dayKey = (date: Date, tz: number) =>
  new Date(date.getTime() - tz * 60000).toISOString().slice(0, 10);

export const daysBetween = (from: string, to: string) => {
  const out: string[] = [];
  const end = Date.parse(to);
  for (let t = Date.parse(from); t <= end && out.length < 1000; t += DAY) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
};
