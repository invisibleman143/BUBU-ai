export const detectMemory = (text: string): Record<string, string> => {
  const memory: Record<string, string> = {};
  const lower = text.toLowerCase();

  // 🧍 NAME
  const nameRegexes = [
    /mera naam ([a-zA-Z\s]+)(?: hai)?/i,
    /my name is ([a-zA-Z\s]+)/i,
    /i am ([a-zA-Z\s]+)/i,
    /mujhe ([a-zA-Z\s]+) (?:kehte|bolte) hain/i,
  ];
  for (const regex of nameRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      const name = match[1].trim();
      if (name.split(/\s+/).length <= 3) {
        memory.name = name;
        break;
      }
    }
  }

  // ❤️ LIKES & INTERESTS
  if (
    lower.includes("pasand") ||
    lower.includes("like") ||
    lower.includes("love") ||
    lower.includes("hobby")
  ) {
    memory.likes = text;
  }

  // 🔁 HABITS / DAILY ROUTINE
  if (
    lower.includes("roz") ||
    lower.includes("daily") ||
    lower.includes("hamesha") ||
    lower.includes("habit") ||
    lower.includes("aadat")
  ) {
    memory.habit = text;
  }

  // 🎂 BIRTHDAY / AGE
  if (
    lower.includes("birthday") ||
    lower.includes("janamdin") ||
    lower.includes("saal ka") ||
    lower.includes("age is")
  ) {
    memory.birthday_age = text;
  }

  return memory;
};

