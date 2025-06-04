export async function getAQIFromLocationId(locationId) {
  const apiKey = "6008e8dbe6d6f40017aa60b35728a45167687bb05ba9de4df9e63103b5af8cb4";

  try {
    const res = await fetch(`https://api.openaq.org/v3/locations/${locationId}`, {
      headers: {
        "X-API-Key": apiKey
      }
    });

    const data = await res.json();

    // const pm25Sensor = data?.results?.parameters?.find(param => param.parameter === "pm25");
    const correctSensor = data?.results?.[0]?.parameters?.find(param => param.parameter === "pm25");

    return correctSensor?.lastValue ?? null;
  } catch (err) {
    console.error("Failed to fetch AQI by location ID:", err);
    return null;
  }
}
