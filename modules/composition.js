
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
export const round = (n, d = 1) => Number(n.toFixed(d));

export const kmPerSecond = (speedKmh) => speedKmh / 3600;
export const distanceFromSpeed = (speedKmh, seconds) => kmPerSecond(speedKmh) * seconds;
export const fuelUsedFor = (distanceKm, kmPerLiter) => distanceKm / kmPerLiter;
export const projectedRange = (fuelLiters, kmPerLiter) => fuelLiters * kmPerLiter;
