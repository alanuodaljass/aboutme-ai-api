export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { idea } = req.body;

    if (!idea || idea.trim() === "") {
      return res.status(400).json({ error: "Business idea is required" });
    }

    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.rating,places.formattedAddress"
      },
      body: JSON.stringify({
        textQuery: `${idea} in Riyadh`,
        maxResultCount: 5
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Google Places request failed"
      });
    }

    const places = data.places || [];

    const density =
      places.length >= 5 ? "High" :
      places.length >= 3 ? "Medium" :
      "Low";

    const topBrands = places.map((place) => ({
      name: place.displayName?.text || "Unknown",
      rating: place.rating || null,
      address: place.formattedAddress || ""
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
          : "This idea appears less crowded based on nearby results."
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server error" });
  }
}
