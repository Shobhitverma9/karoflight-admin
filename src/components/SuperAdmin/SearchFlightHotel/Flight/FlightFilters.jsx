// FlightFilters.jsx
import { useEffect, useState, useRef } from "react";
import { FaChevronDown, FaChevronUp, FaLeaf } from "react-icons/fa";

// Two-thumb range slider component with blue theme
const RangeSlider = ({ min, max, values, onChange, formatValue }) => {
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(null);

  // Ensure values is always defined and valid
  const safeValues = values || [min, max];
  const validValues = [
    Math.max(min, Math.min(max, safeValues[0] || min)),
    Math.max(min, Math.min(max, safeValues[1] || max)),
  ];


  const handleMouseDown = (index) => (e) => {
    e.preventDefault();
    setIsDragging(index);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (isDragging === null) return;

    const slider = sliderRef.current;
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const percentage = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width)
    );
    const newValue = Math.round(min + percentage * (max - min));

    const newValues = [...validValues];

    if (isDragging === 0) {
      // Left thumb - can't go past right thumb
      newValues[0] = Math.min(newValue, validValues[1] - 1);
    } else {
      // Right thumb - can't go below left thumb
      newValues[1] = Math.max(newValue, validValues[0] + 1);
    }

    onChange(newValues);
  };

  const handleMouseUp = () => {
    setIsDragging(null);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const leftPos = ((validValues[0] - min) / (max - min)) * 100;
  const rightPos = ((validValues[1] - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      <div
        ref={sliderRef}
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
        onMouseDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const percentage = (e.clientX - rect.left) / rect.width;
          const newValue = Math.round(min + percentage * (max - min));

          // Determine which thumb to move based on click position
          const leftDistance = Math.abs(newValue - validValues[0]);
          const rightDistance = Math.abs(newValue - validValues[1]);

          if (leftDistance < rightDistance) {
            // Move left thumb
            onChange([Math.min(newValue, validValues[1] - 1), validValues[1]]);
          } else {
            // Move right thumb
            onChange([validValues[0], Math.max(newValue, validValues[0] + 1)]);
          }
        }}
      >
        {/* Selected range */}
        <div
          className="absolute h-2 bg-blue-600 rounded-full"
          style={{
            left: `${leftPos}%`,
            width: `${rightPos - leftPos}%`,
          }}
        />

        {/* Left thumb */}
        <div
          className="absolute w-4 h-4 bg-white border-2 border-blue-600 rounded-full -top-1 -ml-2 cursor-grab active:cursor-grabbing shadow-md"
          style={{ left: `${leftPos}%` }}
          onMouseDown={handleMouseDown(0)}
        />

        {/* Right thumb */}
        <div
          className="absolute w-4 h-4 bg-white border-2 border-blue-600 rounded-full -top-1 -ml-2 cursor-grab active:cursor-grabbing shadow-md"
          style={{ left: `${rightPos}%` }}
          onMouseDown={handleMouseDown(1)}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>
          {formatValue ? formatValue(validValues[0]) : validValues[0]}
        </span>
        <span>
          {formatValue ? formatValue(validValues[1]) : validValues[1]}
        </span>
      </div>
    </div>
  );
};

// Enhanced Flight Filters Component with Blue Theme
const FlightFilters = ({
  flights = [],
  selectedStops,
  setSelectedStops,
  selectedTime,
  setSelectedTime,
  selectedAirlines,
  setSelectedAirlines,
  lowCO2,
  setLowCO2,
  selectedArrivalTime,
  setSelectedArrivalTime,
  selectedFlightNumbers,
  setSelectedFlightNumbers,
  selectedFareTypes,
  setSelectedFareTypes,
  selectedTerminals,
  setSelectedTerminals,
  selectedAirports,
  setSelectedAirports,
  selectedLayoverAirports,
  setSelectedLayoverAirports,
  popularFilters,
  setPopularFilters,
  priceValues,
  setPriceValues,
  durationValues,
  setDurationValues,
}) => {
  const [priceRange, setPriceRange] = useState({ min: 1000, max: 15000 });
  const [durationRange, setDurationRange] = useState({ min: 0, max: 1440 });

  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    popularFilters: false,
    stops: true,
    departureTime: true,
    arrivalTime: false,
    flightNumber: false,
    airlines: true,
    fareType: false,
    terminal: false,
    airport: false,
    layoverAirport: false,
    duration: false,
    environmental: true,
  });

  // Calculate price range from flights
  useEffect(() => {
    if (flights.length > 0) {
     const prices = flights
  .map(f => f?.pricing?.totalFare || 0)
  .filter(p => p > 0);

      if (prices.length > 0) {
        const minPrice = Math.floor(Math.min(...prices) / 100) * 100;
        const maxPrice = Math.ceil(Math.max(...prices) / 100) * 100;
        setPriceRange({ min: minPrice, max: maxPrice });
        
        // Only set initial values if they haven't been set yet
        if (!priceValues || (priceValues[0] === 1000 && priceValues[1] === 15000)) {
          setPriceValues([minPrice, maxPrice]);
        }
      }
    }
  }, [flights]);

  // Calculate duration range
  useEffect(() => {
    if (flights.length > 0) {
      const durations = flights
  .map(f =>
    (f?.segments || []).reduce((s, seg) => s + (seg.duration || 0), 0)
  )
  .filter(d => d > 0);


      if (durations.length > 0) {
        const minDur = Math.min(...durations);
        const maxDur = Math.max(...durations);
        setDurationRange({ min: minDur, max: maxDur });
        
        // Only set initial values if they haven't been set yet
        if (!durationValues || (durationValues[0] === 0 && durationValues[1] === 1440)) {
          setDurationValues([minDur, maxDur]);
        }
      }
    }
  }, [flights]);

  // Handle price range change
  const handlePriceChange = (newValues) => {
    setPriceValues(newValues);
  };

  // Handle duration range change
  const handleDurationChange = (newValues) => {
    setDurationValues(newValues);
  };

  // Get unique flight numbers
  const getFlightNumbers = () => {
    const numbers = new Set();
    flights.forEach((flight) => {
      const segments = flight?.segments || [];
      segments.forEach((segment) => {
        const flightNum = segment?.fD?.fN;
        if (flightNum) numbers.add(flightNum);
      });
    });
    return Array.from(numbers).sort();
  };

  // Get unique terminals
  const getTerminals = () => {
    const terminals = new Set();
    flights.forEach((flight) => {
      const segments = flight?.segments || [];
      segments.forEach((segment) => {
        const depTerminal = segment?.da?.terminal;
        const arrTerminal = segment?.aa?.terminal;
        if (depTerminal) terminals.add(`Dep: ${depTerminal}`);
        if (arrTerminal) terminals.add(`Arr: ${arrTerminal}`);
      });
    });
    return Array.from(terminals).sort();
  };

  // Get unique airports
  const getAirports = () => {
    const airports = new Map();
    flights.forEach((flight) => {
      const segments = flight?.segments || [];
      segments.forEach((segment) => {
        const depAirport = segment?.da;
        const arrAirport = segment?.aa;
        if (depAirport?.code) {
          airports.set(depAirport.code, {
            code: depAirport.code,
            name: depAirport.name || depAirport.city,
          });
        }
        if (arrAirport?.code) {
          airports.set(arrAirport.code, {
            code: arrAirport.code,
            name: arrAirport.name || arrAirport.city,
          });
        }
      });
    });
    return Array.from(airports.values());
  };

  // Get layover airports
  const getLayoverAirports = () => {
    const layovers = new Map();
    flights.forEach((flight) => {
      const segments = flight?.segments || [];
      if (segments.length > 1) {
        for (let i = 0; i < segments.length - 1; i++) {
          const layoverAirport = segments[i]?.aa;
          if (layoverAirport?.code) {
            layovers.set(layoverAirport.code, {
              code: layoverAirport.code,
              name: layoverAirport.name || layoverAirport.city,
            });
          }
        }
      }
    });
    return Array.from(layovers.values());
  };

  // Get fare types
  const getFareTypes = () => {
    const fareTypes = new Set();
    flights.forEach((flight) => {
      const fareIdentifier = flight?.totalPriceList?.[0]?.fareIdentifier;
      if (fareIdentifier) {
        if (fareIdentifier.includes("REFUNDABLE")) fareTypes.add("Refundable");
        if (fareIdentifier.includes("NON_REFUNDABLE"))
          fareTypes.add("Non-Refundable");
        fareTypes.add(fareIdentifier.split("_")[0]);
      }
    });
    return Array.from(fareTypes);
  };

  // Get airlines
  const getAirlines = () => {
    const airlinesMap = new Map();
    flights.forEach((flight) => {
      const segments = flight?.segments || [];
      segments.forEach((segment) => {
        const airline = segment?.fD?.aI;
        if (airline) {
const prices = flights
  .map(f => f?.pricing?.totalFare || 0)
  .filter(p => p > 0);
          if (
            !airlinesMap.has(airline.name) ||
            price < airlinesMap.get(airline.name).price
          ) {
            airlinesMap.set(airline.name, {
              name: airline.name,
              code: airline.code,
              price: price,
            });
          } 
        }
      });
    });
    return Array.from(airlinesMap.values()).sort((a, b) => a.price - b.price);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleStop = (option) => {
    setSelectedStops((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const toggleAirline = (airline) => {
    setSelectedAirlines((prev) =>
      prev.includes(airline)
        ? prev.filter((a) => a !== airline)
        : [...prev, airline]
    );
  };

  const toggleFlightNumber = (number) => {
    setSelectedFlightNumbers((prev) =>
      prev.includes(number)
        ? prev.filter((n) => n !== number)
        : [...prev, number]
    );
  };

  const toggleFareType = (type) => {
    setSelectedFareTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleTerminal = (terminal) => {
    setSelectedTerminals((prev) =>
      prev.includes(terminal)
        ? prev.filter((t) => t !== terminal)
        : [...prev, terminal]
    );
  };

  const toggleAirport = (code) => {
    setSelectedAirports((prev) =>
      prev.includes(code) ? prev.filter((a) => a !== code) : [...prev, code]
    );
  };

  const toggleLayoverAirport = (code) => {
    setSelectedLayoverAirports((prev) =>
      prev.includes(code) ? prev.filter((a) => a !== code) : [...prev, code]
    );
  };

  const togglePopularFilter = (filter) => {
    setPopularFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const resetAllFilters = () => {
    setPriceValues([priceRange.min, priceRange.max]);
    setDurationValues([durationRange.min, durationRange.max]);
    setSelectedStops([]);
    setSelectedTime("");
    setSelectedArrivalTime("");
    setSelectedAirlines([]);
    setSelectedFlightNumbers([]);
    setSelectedFareTypes([]);
    setSelectedTerminals([]);
    setSelectedAirports([]);
    setSelectedLayoverAirports([]);
    setLowCO2(false);
    setPopularFilters({
      earlyMorning: false,
      refundable: false,
      directOnly: false,
      shortDuration: false,
    });
  };

  const times = [
    { label: "Morning", range: "06:00–12:00" },
    { label: "Afternoon", range: "12:00–18:00" },
    { label: "Evening", range: "18:00–00:00" },
    { label: "Night", range: "00:00–06:00" },
  ];

  const stopOptions = [
    {
      label: "Direct",
      count: flights.filter((f) => (f?.segments?.length || 0) === 1).length,
    },
    {
      label: "1 stop",
      count: flights.filter((f) => (f?.segments?.length || 0) === 2).length,
    },
    {
      label: "2+ stops",
      count: flights.filter((f) => (f?.segments?.length || 0) > 2).length,
    },
  ];

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatPrice = (price) => `₹${price.toLocaleString()}`;

  const FilterSection = ({
    title,
    isExpanded,
    onToggle,
    children,
    clearText,
    onClear,
  }) => (
    <div className="border-b border-gray-200 pb-4">
      <div
        className="flex justify-between items-center cursor-pointer hover:bg-blue-50 px-2 py-2 rounded-lg transition-colors"
        onClick={onToggle}
      >
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        <div className="flex items-center gap-2">
          {clearText && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-xs text-blue-600 hover:text-blue-700 uppercase font-medium"
            >
              {clearText}
            </button>
          )}
          {isExpanded ? (
            <FaChevronUp className="text-blue-500 text-xs" />
          ) : (
            <FaChevronDown className="text-blue-500 text-xs" />
          )}
        </div>
      </div>
      {isExpanded && <div className="mt-3 px-2">{children}</div>}
    </div>
  );

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-sm space-y-4 border border-blue-100">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-blue-100">
        <h2 className="text-lg font-bold text-gray-800">Filters</h2>
        <button
          onClick={resetAllFilters}
          className="text-sm cursor-pointer text-blue-600 hover:text-blue-700 uppercase font-medium"
        >
          RESET ALL
        </button>
      </div>

      {/* Price Filter */}
      <FilterSection
        title="Price"
        isExpanded={expandedSections.price}
        onToggle={() => toggleSection("price")}
        clearText="RESET"
        onClear={() => {
          setPriceValues([priceRange.min, priceRange.max]);
        }}
      >
        {priceRange.min === priceRange.max ? (
          <div className="text-center text-sm text-gray-500 py-2">
            All flights are {formatPrice(priceRange.min)}
          </div>
        ) : (
          <RangeSlider
            min={priceRange.min}
            max={priceRange.max}
            values={priceValues}
            onChange={handlePriceChange}
            formatValue={formatPrice}
          />
        )}
      </FilterSection>

      {/* Popular Filters */}
      <FilterSection
        title="Popular Filters"
        isExpanded={expandedSections.popularFilters}
        onToggle={() => toggleSection("popularFilters")}
      >
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-700 transition-colors">
            <input
              type="checkbox"
              checked={popularFilters.earlyMorning}
              onChange={() => togglePopularFilter("earlyMorning")}
              className="w-4 h-4 accent-blue-600"
            />
            <span>Early Morning (Before 8 AM)</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-700 transition-colors">
            <input
              type="checkbox"
              checked={popularFilters.refundable}
              onChange={() => togglePopularFilter("refundable")}
              className="w-4 h-4 accent-blue-600"
            />
            <span>Refundable</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-700 transition-colors">
            <input
              type="checkbox"
              checked={popularFilters.directOnly}
              onChange={() => togglePopularFilter("directOnly")}
              className="w-4 h-4 accent-blue-600"
            />
            <span>Direct Flights Only</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-700 transition-colors">
            <input
              type="checkbox"
              checked={popularFilters.shortDuration}
              onChange={() => togglePopularFilter("shortDuration")}
              className="w-4 h-4 accent-blue-600"
            />
            <span>Short Duration (&lt; 3hrs)</span>
          </label>
        </div>
      </FilterSection>

      {/* Stops */}
      <FilterSection
        title="Stops"
        isExpanded={expandedSections.stops}
        onToggle={() => toggleSection("stops")}
      >
        <div className="space-y-2">
          {stopOptions.map(({ label, count }) => (
            <label
              key={label}
              className="flex justify-between items-center text-sm cursor-pointer hover:text-blue-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedStops.includes(label)}
                  onChange={() => toggleStop(label)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span>{label}</span>
              </div>
              <span className="text-gray-500">({count})</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Departure Time */}
      <FilterSection
        title="Departure Time"
        isExpanded={expandedSections.departureTime}
        onToggle={() => toggleSection("departureTime")}
      >
        <div className="grid grid-cols-2 gap-2">
          {times.map((t) => (
            <div
              key={t.label}
              onClick={() =>
                setSelectedTime(selectedTime === t.label ? "" : t.label)
              }
              className={`border rounded px-2 py-2 text-xs text-center cursor-pointer transition ${
                selectedTime === t.label
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-200"
              }`}
            >
              <div className="font-medium">{t.label}</div>
              <div className="text-[10px] mt-0.5">{t.range}</div>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Arrival Time */}
      <FilterSection
        title="Arrival Time"
        isExpanded={expandedSections.arrivalTime}
        onToggle={() => toggleSection("arrivalTime")}
      >
        <div className="grid grid-cols-2 gap-2">
          {times.map((t) => (
            <div
              key={t.label}
              onClick={() =>
                setSelectedArrivalTime(
                  selectedArrivalTime === t.label ? "" : t.label
                )
              }
              className={`border rounded px-2 py-2 text-xs text-center cursor-pointer transition ${
                selectedArrivalTime === t.label
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-200"
              }`}
            >
              <div className="font-medium">{t.label}</div>
              <div className="text-[10px] mt-0.5">{t.range}</div>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Flight Number */}
      <FilterSection
        title="Flight Number"
        isExpanded={expandedSections.flightNumber}
        onToggle={() => toggleSection("flightNumber")}
        clearText="CLEAR"
        onClear={() => setSelectedFlightNumbers([])}
      >
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {getFlightNumbers().map((number) => (
            <label
              key={number}
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-700 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedFlightNumbers.includes(number)}
                onChange={() => toggleFlightNumber(number)}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-xs">{number}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Airlines */}
      <FilterSection
        title="Airlines"
        isExpanded={expandedSections.airlines}
        onToggle={() => toggleSection("airlines")}
        clearText="CLEAR"
        onClear={() => setSelectedAirlines([])}
      >
        <div className="space-y-2">
          {getAirlines().map(({ name, price }) => (
            <label
              key={name}
              className="flex justify-between items-center text-sm cursor-pointer hover:text-blue-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedAirlines.includes(name)}
                  onChange={() => toggleAirline(name)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-xs">{name}</span>
              </div>
              <span className="text-gray-500 text-xs">
                ₹{price.toLocaleString()}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Fare Type */}
      <FilterSection
        title="Fare Type"
        isExpanded={expandedSections.fareType}
        onToggle={() => toggleSection("fareType")}
      >
        <div className="space-y-2">
          {getFareTypes().map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-700 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedFareTypes.includes(type)}
                onChange={() => toggleFareType(type)}
                className="w-4 h-4 accent-blue-600"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Terminal */}
      <FilterSection
        title="Terminal"
        isExpanded={expandedSections.terminal}
        onToggle={() => toggleSection("terminal")}
      >
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {getTerminals().map((terminal) => (
            <label
              key={terminal}
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-700 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedTerminals.includes(terminal)}
                onChange={() => toggleTerminal(terminal)}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-xs">{terminal}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Airport */}
      <FilterSection
        title="Airport"
        isExpanded={expandedSections.airport}
        onToggle={() => toggleSection("airport")}
      >
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {getAirports().map(({ code, name }) => (
            <label
              key={code}
              className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-700 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedAirports.includes(code)}
                onChange={() => toggleAirport(code)}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-xs">
                {code} - {name}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Layover Airport */}
      <FilterSection
        title="Layover Airport"
        isExpanded={expandedSections.layoverAirport}
        onToggle={() => toggleSection("layoverAirport")}
      >
        {getLayoverAirports().length === 0 ? (
          <p className="text-sm text-gray-500">No layovers in results</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {getLayoverAirports().map(({ code, name }) => (
              <label
                key={code}
                className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-700 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedLayoverAirports.includes(code)}
                  onChange={() => toggleLayoverAirport(code)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-xs">
                  {code} - {name}
                </span>
              </label>
            ))}
          </div>
        )}
      </FilterSection>

      {/* Duration */}
      <FilterSection
        title="Duration"
        isExpanded={expandedSections.duration}
        onToggle={() => toggleSection("duration")}
        clearText="RESET"
        onClear={() => {
          setDurationValues([durationRange.min, durationRange.max]);
        }}
      >
        {durationRange.min === durationRange.max ? (
          <div className="text-center text-sm text-gray-500 py-2">
            All flights: {formatDuration(durationRange.min)}
          </div>
        ) : (
          <RangeSlider
            min={durationRange.min}
            max={durationRange.max}
            values={durationValues}
            onChange={handleDurationChange}
            formatValue={formatDuration}
          />
        )}
      </FilterSection>

      {/* Environmental */}
      <FilterSection
        title="Environmental"
        isExpanded={expandedSections.environmental}
        onToggle={() => toggleSection("environmental")}
      >
        <div className="flex items-center gap-2 hover:text-green-700 transition-colors">
          <input
            type="checkbox"
            checked={lowCO2}
            onChange={() => setLowCO2(!lowCO2)}
            className="w-4 h-4 accent-green-600"
          />
          <label className="flex items-center gap-2 text-green-600 cursor-pointer text-sm">
            <FaLeaf /> Lower CO₂ emissions
          </label>
        </div>
      </FilterSection>

      {/* Active Filters Count */}
      <div className="pt-4 border-t border-blue-100">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {Object.values(expandedSections).filter(v => v).length} sections expanded
          </span>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightFilters;