const KEY = "habittrack:celebrated";

export const readCelebrated = () => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return new Set<string>(Array.isArray(list) ? list : []);
  } catch {
    return new Set<string>();
  }
};

export const markCelebrated = (key: string) => {
  const next = readCelebrated();
  next.add(key);
  try {
    localStorage.setItem(KEY, JSON.stringify([...next]));
  } catch {}
  return next;
};
