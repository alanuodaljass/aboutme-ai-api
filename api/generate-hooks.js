export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { idea } = req.body;

    if (!idea || idea.trim() === "") {
      return res.status(400).json({ error: "Business idea is required" });
    }

    const query = `${idea} Riyadh`;

    const url =
      `https://places-api.foursquare.com/places/search` +
      `?ll=24.7136,46.6753` +
      `&radius=30000` +
      `&query=${encodeURIComponent(query)}` +
      `&limit=5` +
      `&fields=name,rating,location`;

    const fsqResponse = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${process.env.FOURSQUARE_API_KEY}`,
        "X-Places-Api-Version": "2025-06-17"
      }
    });

    const fsqData = await fsqResponse.json();

    if (!fsqResponse.ok) {
      return res.status(fsqResponse.status).json({
        error: fsqData.message || fsqData.error || "Foursquare request failed"
      });
    }

    const places = fsqData.results || [];

    const density =
      places.length >= 5 ? "High" :
      places.length >= 3 ? "Medium" :
      "Low";

    const topBrands = places.map((place) => ({
      name: place.name || "Unknown",
      rating: place.rating || null,
      address: place.location?.formatted_address || ""
    }));

    return res.status(200).json({
      density,
      count: places.length,
      topBrands,
      marketInsight:
        places.length >= 5
          ? "This idea appears active in Riyadh. A clear niche or unique experience will help it stand out."
          : places.length >= 3
          ? "There is visible activity in Riyadh, but a differentiated concept can still find space."
          : "This idea appears less crowded based on available nearby results."
    });

  } catch (error) {
    return res.status(500).json({ error: error.message || "Server error" });
  }
}
