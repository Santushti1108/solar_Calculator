export async function getSolarData(
  lat: number,
  lon: number
) {
  const response = await fetch(
    `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN,T2M&community=RE&longitude=${longitude}&latitude=${latitude}&format=JSON`
  );

  if (!response.ok) {
    throw new Error("NASA API request failed");
  }

  return response.json();
}