// Admin/src/components/SearchFlightHotel/HotelCards.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaStar, 
  FaHeart, 
  FaRegHeart, 
  FaWifi, 
  FaSwimmingPool,
  FaCar,
  FaCoffee,
  FaDumbbell,
  FaTv,
  FaParking,
  FaUtensils,
  FaSnowflake,
  FaShower,
  FaConciergeBell
} from "react-icons/fa";
import { MdLocalLaundryService, MdRoomService } from "react-icons/md";
import { GiKnifeFork, GiDesk } from "react-icons/gi";
import { IoBedOutline } from "react-icons/io5";

const AMENITY_ICONS = {
  wifi: { icon: <FaWifi className="text-blue-500" />, label: "Free WiFi" },
  internet: { icon: <FaWifi className="text-blue-500" />, label: "Internet" },
  pool: { icon: <FaSwimmingPool className="text-blue-500" />, label: "Swimming Pool" },
  parking: { icon: <FaParking className="text-green-500" />, label: "Parking" },
  breakfast: { icon: <FaUtensils className="text-yellow-500" />, label: "Breakfast" },
  restaurant: { icon: <GiKnifeFork className="text-red-500" />, label: "Restaurant" },
  ac: { icon: <FaSnowflake className="text-blue-300" />, label: "Air Conditioning" },
  "air conditioning": { icon: <FaSnowflake className="text-blue-300" />, label: "Air Conditioning" },
  tv: { icon: <FaTv className="text-purple-500" />, label: "TV" },
  television: { icon: <FaTv className="text-purple-500" />, label: "TV" },
  car: { icon: <FaCar className="text-gray-500" />, label: "Car Rental" },
  coffee: { icon: <FaCoffee className="text-brown-500" />, label: "Coffee Maker" },
  gym: { icon: <FaDumbbell className="text-orange-500" />, label: "Gym" },
  fitness: { icon: <FaDumbbell className="text-orange-500" />, label: "Fitness Center" },
  spa: { icon: <FaShower className="text-pink-500" />, label: "Spa" },
  laundry: { icon: <MdLocalLaundryService className="text-blue-400" />, label: "Laundry" },
  "room service": { icon: <MdRoomService className="text-green-400" />, label: "Room Service" },
  "business center": { icon: <GiDesk className="text-gray-600" />, label: "Business Center" },
  "concierge": { icon: <FaConciergeBell className="text-yellow-600" />, label: "Concierge" },
  "free cancellation": { icon: null, label: "Free Cancellation" }
};

const getAmenityIcon = (amenityName) => {
  const lowerAmenity = amenityName.toLowerCase();
  
  for (const [key, value] of Object.entries(AMENITY_ICONS)) {
    if (lowerAmenity.includes(key)) {
      return value;
    }
  }
  
  return { icon: null, label: amenityName };
};

const HotelCard = ({ hotel, nights = 1, view = "grid", showRating = true }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Extract hotel data with fallbacks
  const hotelData = useMemo(() => {
    const name = hotel?.name || hotel?.hotelName || "Unknown Hotel";
    const rating = Number(hotel?.rating || hotel?.rt || 0);
    const price = Number(hotel?.price || hotel?.minPrice || 0);
    
    // Image handling
    let imageUrl = "/assets/placeholder.png";
    if (hotel?.image) {
      imageUrl = hotel.image;
    } else if (hotel?.images?.[0]?.url) {
      imageUrl = hotel.images[0].url;
    } else if (hotel?.img?.[0]?.url) {
      imageUrl = hotel.img[0].url;
    }
    
    // Location/Address
    const location = hotel?.address || hotel?.ad?.adr || hotel?.popularPlace || "";
    
    // Amenities
    let amenities = [];
    if (Array.isArray(hotel?.amenities)) {
      amenities = hotel.amenities;
    } else if (Array.isArray(hotel?.ops?.[0]?.pops)) {
      amenities = hotel.ops[0].pops;
    } else if (Array.isArray(hotel?.ris?.[0]?.fcs)) {
      amenities = hotel.ris[0].fcs;
    }
    
    // Hotel ID - FIXED: Use the correct ID field
    const hotelId = hotel?.id || hotel?.hotelId || hotel?.hsid || "";
    
    return {
      name,
      rating,
      price,
      imageUrl,
      location,
      amenities: amenities.slice(0, 8),
      hotelId,
      freeCancellation: hotel?.freeCancellation || false,
      refundable: hotel?.refundable !== false
    };
  }, [hotel]);

  // Calculate total price
  const totalPrice = hotelData.price * nights;

  // Handle hotel selection - FIXED navigation
  const handleViewDeal = () => {
    if (!hotelData.hotelId) {
      console.error("No hotel ID found:", hotelData);
      return;
    }

    // Create URL-friendly hotel name
    const hotelNameForUrl = hotelData.name
      .split(/\s{2,}/)[0]
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();

    navigate(`/hotel/${hotelNameForUrl}/${hotelData.hotelId}`, {
      state: {
        hotel: hotelData,
        nights,
        searchParams: {
          location: hotel?.city || "",
          checkIn: hotel?.checkInDate || "",
          checkOut: hotel?.checkOutDate || "",
          adults: hotel?.adults || 2,
          children: hotel?.children || 0,
          rooms: hotel?.rooms || 1
        }
      }
    });
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-500 text-sm" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStar key="half" className="text-yellow-500 text-sm opacity-70" />);
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-gray-300 text-sm" />);
    }

    return stars;
  };

  // Grid vs List view styling
  const containerClass = view === "grid" 
    ? "h-full flex flex-col cursor-pointer"
    : "md:grid md:grid-cols-3 cursor-pointer";

  const contentClass = view === "grid"
    ? "flex-1"
    : "md:col-span-2";

  return (
    <div 
      className={`bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-orange-200 ${containerClass}`}
      onClick={handleViewDeal}
    >
      {/* Image Section */}
      <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden">
        <img
          src={imageError ? "/assets/placeholder.png" : hotelData.imageUrl}
          alt={hotelData.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={() => setImageError(true)}
        />
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          {isFavorite ? (
            <FaHeart className="text-red-500 text-lg" />
          ) : (
            <FaRegHeart className="text-gray-600 text-lg hover:text-red-400" />
          )}
        </button>
      </div>

      {/* Content Section */}
      <div className={`p-4 ${contentClass}`}>
        {/* Hotel Name and Location */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 hover:text-orange-600 transition-colors">
            {hotelData.name}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <IoBedOutline className="text-gray-400 text-sm" />
            <p className="text-sm text-gray-600 line-clamp-1">
              {hotelData.location}
            </p>
          </div>
        </div>

        {/* Star Rating */}
        {showRating && hotelData.rating > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              {renderStars(hotelData.rating)}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {hotelData.rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Amenities */}
        {hotelData.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {hotelData.amenities.slice(0, 3).map((amenity, index) => {
                const amenityInfo = getAmenityIcon(amenity);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg text-xs"
                    title={amenityInfo.label}
                  >
                    {amenityInfo.icon}
                    <span className="text-gray-700 line-clamp-1">
                      {amenityInfo.label.length > 10 
                        ? amenityInfo.label.substring(0, 10) + '...' 
                        : amenityInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Price and CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                ₹{hotelData.price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">/night</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              <span className="font-medium">₹{totalPrice.toLocaleString()}</span> total • {nights} night{nights !== 1 ? 's' : ''}
            </div>
          </div>
          
          <button
            onClick={handleViewDeal}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            View Deal
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;