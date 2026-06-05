import { api as openRouterApiKey } from "../config.js";

const IA_CATEGORIES = [
  "Pédagogie",
  "Événement",
  "Vie de campus",
  "Amélioration technique"
];

const CATEGORIE_PAR_DEFAUT = "Vie de campus";


export async function suggererCategorieIA({ titre, description }) {
  // Si pas de clé, on renvoie une catégorie par défaut
  if (!openRouterApiKey) {
    console.warn("OpenRouter: aucune clé, fallback catégorie par défaut.");
    return CATEGORIE_PAR_DEFAUT;
  }

  try {
    const prompt = `
      Tu es un classificateur d'idées pour une université.
      Tu dois choisir UNE seule catégorie parmi la liste suivante :

      - Pédagogie
      - Événement
      - Vie de campus
      - Amélioration technique

      Titre : ${titre}
      Description : ${description}

      Réponds uniquement par le nom EXACT d'une catégorie parmi cette liste, sans phrase supplémentaire.
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "poolside/laguna-m.1:free",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      console.error("OpenRouter HTTP error:", await response.text());
      return CATEGORIE_PAR_DEFAUT;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "";

    if (!content) {
      console.warn("OpenRouter: réponse vide, fallback par défaut.");
      return CATEGORIE_PAR_DEFAUT;
    }

    const categorieTrouvee = IA_CATEGORIES.find((c) =>
      content.toLowerCase().includes(c.toLowerCase())
    );

    if (!categorieTrouvee) {
      console.warn("OpenRouter: catégorie inconnue, réponse:", content);
      return CATEGORIE_PAR_DEFAUT;
    }

    return categorieTrouvee;
  } catch (error) {
    console.error("OpenRouter: exception réseau/JS:", error);
    return CATEGORIE_PAR_DEFAUT;
  }
}