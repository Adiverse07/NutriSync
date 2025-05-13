// src/api/gemini.js

const GEMINI_API_KEY = "AIzaSyBz3VSSl_wRq2DtcjmYuz_D0mXa8eRb3Ek";

/**
 * Returns an object:
 * {
 *   foods: ["Oatmeal", "Salmon", ...],      // exactly 6 items
 *   targets: {
 *     calories: 2000,
 *     protein: 75,
 *     fat: 70,
 *     carbs: 250
 *   }
 * }
 */
export const getSuggestedFoods = async (userHealthData) => {
  const prompt = `
Based on this user's health data:
${JSON.stringify(userHealthData, null, 2)}

1) Suggest exactly 6 healthy food items they should eat today (comma-separated).
2) Provide daily targets as integers for:
   - calories (kcal)
   - protein (g)
   - fat (g)
   - carbs (g)

Return ONLY valid JSON, e.g.:

{
  "foods": ["Oatmeal", "Salmon", "Avocado", "Broccoli", "Almonds", "Quinoa"],
  "targets": {
    "calories": 2000,
    "protein": 75,
    "fat": 70,
    "carbs": 250
  }
}
`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini API error ${res.status}`);

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

  // Strip any ```json fences before parsing
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse Gemini response:", cleaned);
    throw new Error("Invalid JSON received from Gemini API");
  }
};

/**
 * Returns a plain-text detailed daily meal plan based on:
 *   { targets: {...}, vegetarian: boolean }
 */
export const generateMealPlan = async (userData) => {
  const { targets, vegetarian } = userData;

  // Conditionally add a vegetarian-only instruction
  const vegInstruction = vegetarian
    ? "\n**All meals must be vegetarian (no meat, poultry or fish).**"
    : "";

  const prompt = `
Create a detailed daily meal plan based on this data:
${JSON.stringify({ targets, vegetarian }, null, 2)}

Include:
- Meal names (breakfast, lunch, dinner, snacks)
- Portion sizes
- Nutritional breakdown (kcal, protein, carbs, fat)
- Brief description for each meal
${vegInstruction}

Return as plain text with line breaks.
Use hyphens (-) for lists, and do NOT use asterisks (*) or any markdown formatting.
`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini API error ${res.status}`);

  const json = await res.json();
  let text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

  // Clean up any stray fences or markdown
  text = text
    .replace(/```/g, "")
    .replace(/^\s*\*\s*/gm, "- ")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*/g, "")
    .trim();

  return text;
};
