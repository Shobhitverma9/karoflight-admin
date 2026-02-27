export const extractFiltersFromHotels = (hotels = []) => {
  const stars = [];
  const propertyTypes = [];
  const mealBasis = [];
  const places = [];
  const prices = [];

  hotels.forEach((h) => {
    // STAR RATING
    if (h?.rt && !stars.includes(h.rt)) {
      stars.push(h.rt);
    }

    // PROPERTY TYPE
    if (h?.pt && !propertyTypes.includes(h.pt)) {
      propertyTypes.push(h.pt);
    }

    // PRICE
    const p =
      h?.ris?.[0]?.tp ||
      h?.ops?.[0]?.tp ||
      null;

    if (p) prices.push(Number(p));

    // MEAL BASIS
    if (h?.ris?.[0]?.mb && !mealBasis.includes(h.ris[0].mb)) {
      mealBasis.push(h.ris[0].mb);
    }

    if (Array.isArray(h?.pops?.[0]?.fc)) {
      h.pops[0].fc.forEach((x) => {
        if (!mealBasis.includes(x)) mealBasis.push(x);
      });
    }

    // POPULAR PLACES
    const adrList = [
      h?.ad?.adr2,
      h?.ad?.adr,
      h?.ad?.city?.name,
    ];

    adrList.forEach((item) => {
      if (item && typeof item === "string") {
        item
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
          .forEach((x) => {
            if (!places.includes(x)) places.push(x);
          });
      }
    });
  });

  return {
    stars: stars.sort((a, b) => b - a),
    propertyTypes,
    mealBasis,
    places,
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
  };
};