import { cities } from "../Data/citiesAndNationalities";

/**
 * Returns readable city name based on TripJack city code.
 * @param {string} cityId
 * @returns {string}
 */
export const getCityName = (cityId) => {
  if (!cityId) return "";

  // Find city in provided list
  const found = cities.find((c) => String(c.city) === String(cityId));

  return found ? found.cityName : cityId;
};

/**
 * Converts DD-MM-YYYY into formatted date string.
 * Example: "11-12-2025" → "11 Dec 2025"
 *
 * @param {string} dateString
 * @returns {string}
 */
export const formatDisplayDate = (dateString) => {
  if (!dateString || typeof dateString !== "string") return "";

  const [day, month, year] = dateString.split("-");

  if (!day || !month || !year) return dateString;

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const monthName = months[parseInt(month, 10) - 1] || month;

  return `${day} ${monthName} ${year}`;
};