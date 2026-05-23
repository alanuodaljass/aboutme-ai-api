export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { idea, city, category } = req.body;

    if (!idea) {
      return res.status(400).json({ error: "Business idea is required" });
    }

    const query = `${idea} ${category || ""} ${city || "Riyadh"}`;

    const fsqResponse = await fetch(
      `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(query)}&near=Riyadh&limit=10`,
      {
        headers: {
          Accept: "application/json",
          Authorization: process.env.FOURSQUARE_API_KEY,
        },
      }
    );

    const fsqData = await fsqResponse.json();

    if (!fsqResponse.ok) {
      return res.status(fsqResponse.status).json({
        error: fsqData.message || "Foursquare request failed",
      });
    }

    const places = fsqData.results || [];

    let density = "Low";
    if (places.length >= 8) density = "High";
    else if (places.length >= 4) density = "Medium";

 const popularBrands = places
  .slice(0, 6)
  .map((place) => place.name)
  .filter(Boolean);

    const areas = places
      .map((place) => place.location?.locality || place.location?.neighborhood?.[0])
      .filter(Boolean);

    const uniqueAreas = [...new Set(areas)].slice(0, 4);

    return res.status(200).json({
      density,
      count: places.length,
      popularBrands,
      suggestedAreas: uniqueAreas,
      marketInsight:
        places.length >= 8
          ? "This idea appears to be highly active in Riyadh. A strong niche or unique experience will be important."
          : places.length >= 4
          ? "This idea has visible activity in Riyadh, but there may still be room for a clear and differentiated concept."
          : "This idea looks less crowded based on available results, which may create an opportunity for early positioning.",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
}
