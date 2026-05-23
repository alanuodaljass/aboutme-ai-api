export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    const { idea } = req.body;

    if (!idea || idea.trim() === "") {
      return res.status(400).json({
        error: "Business idea is required"
      });
    }

    const query = `${idea} Riyadh`;

const fsqResponse = await fetch(
  `https://places-api.foursquare.com/places/search?ll=24.7136,46.6753&radius=30000&query=${encodeURIComponent(query)}&limit=5`,
  {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.FOURSQUARE_API_KEY}`,
      "X-Places-Api-Version": "2025-06-17"
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

    if (places.length >= 8) {
      density = "High";
    } else if (places.length >= 4) {
      density = "Medium";
    }

    const topBrands = places
      .slice(0, 5)
      .map((place) => ({
        name: place.name || "Unknown",
        rating: place.rating || null,
        address: place.location?.formatted_address || ""
      }));

    return res.status(200).json({
      density,
      count: places.length,
      topBrands,
      marketInsight:
        places.length >= 8
          ? "This market looks highly active in Riyadh. A strong niche or unique experience will help the idea stand out."
          : places.length >= 4
          ? "This market has visible activity in Riyadh, but there may still be room for a differentiated concept."
          : "This market currently appears less crowded in Riyadh based on nearby results."
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
}
