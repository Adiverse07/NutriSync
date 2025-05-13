// src/api/edamam.js

const appId = "f704bd03";
const appKey = "fb7b87573ca7ed4a3992a663500055a3";
const edamamUserId = "Adiverse07";  // your Edamam user ID

export const fetchRecipes = async (query) => {
  if (!query) return [];

  const url =
    `https://api.edamam.com/api/recipes/v2?type=public` +
    `&q=${encodeURIComponent(query)}` +
    `&app_id=${appId}` +
    `&app_key=${appKey}` +
    `&to=6`;

  const res = await fetch(url, {
    headers: {
      "Edamam-Account-User": edamamUserId
    }
  });

  if (res.status === 401) {
    throw new Error("Edamam Unauthorized: check your app_id/app_key or user header");
  }
  if (res.status === 404) {
    throw new Error("Edamam API error 404: endpoint not found");
  }
  if (!res.ok) {
    throw new Error(`Edamam API error ${res.status}`);
  }

  const data = await res.json();
  return data.hits.map(hit => hit.recipe);
};
