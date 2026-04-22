// UpdatePricingConfig.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, useFieldArray } from "react-hook-form";
import { ClipLoader } from "react-spinners";
import { useLocation, useNavigate } from "react-router-dom";
import { FaPlane, FaHotel, FaPlus, FaTrash } from "react-icons/fa";
import { updatePricingConfig } from "../../../features/action/pricingConfig";

export const UpdatePricingConfig = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { pricingConfigData, isLoading } = useSelector(
    (state) => state.pricingConfig
  );

  const { state: item } = location || {};
  const serviceType = item?.serviceType || "flight";

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm();

  // Field arrays
  const {
    fields: routeFields,
    append: appendRoute,
    remove: removeRoute,
  } = useFieldArray({
    control,
    name: "routes",
  });

  const {
    fields: airlineFields,
    append: appendAirline,
    remove: removeAirline,
  } = useFieldArray({
    control,
    name: "airlines",
  });

  const {
    fields: cityFields,
    append: appendCity,
    remove: removeCity,
  } = useFieldArray({
    control,
    name: "cities",
  });

  const {
    fields: countryFields,
    append: appendCountry,
    remove: removeCountry,
  } = useFieldArray({
    control,
    name: "countries",
  });

  const {
    fields: ratingFields,
    append: appendRating,
    remove: removeRating,
  } = useFieldArray({
    control,
    name: "ratings",
  });

  useEffect(() => {
    if (item) {
      reset({
        name: item.name || "",
        serviceType: item.serviceType || "flight",
        region: item.region || "global",
        isActive: item.isActive ? "true" : "false",
        markupType: item.markupType || "percent",
        markupValue: item.markupValue || "",
        platformFee: item.platformFee || "0",
        minFare: item.conditions?.minFare || "0",
        maxFare: item.conditions?.maxFare || "99999999",
        precedence: item.precedence || "1",
        airlines: item.airlines?.map((a) => ({ value: a })) || [],
        routes:
          item.routes?.map((r) => ({ from: r.from, to: r.to })) || [
            { from: "", to: "" },
          ],
        fareCategories: item.fareCategories || [],
        cities: item.cities?.map((c) => ({ value: c })) || [],
        countries: item.countries?.map((c) => ({ value: c })) || [],
        ratings: item.ratings?.map((r) => ({ value: r.toString() })) || [],
      });
    }
  }, [item, reset]);

  const onSubmit = (data) => {
    const payload = {
      id: item._id,
      name: data.name,
      serviceType: serviceType,
      markupType: data.markupType,
      markupValue: Number(data.markupValue),
      platformFee: Number(data.platformFee),
      region: data.region,
      conditions: {
        minFare: Number(data.minFare),
        maxFare: Number(data.maxFare),
      },
      precedence: Number(data.precedence),
      isActive: data.isActive === "true",
    };

    if (serviceType === "flight") {
      payload.airlines = data.airlines
        .map((a) => a.value)
        .filter((v) => v.trim() !== "");
      payload.routes = data.routes
        .filter((r) => r.from.trim() !== "" && r.to.trim() !== "")
        .map((r) => ({ from: r.from.trim(), to: r.to.trim() }));
      payload.fareCategories = data.fareCategories || [];
    }

    if (serviceType === "hotel") {
      payload.hotelIds = data.hotelIds
        ?.map((h) => h.value)
        .filter((v) => v.trim() !== "") || [];
      payload.cities = data.cities
        .map((c) => c.value)
        .filter((v) => v.trim() !== "");
      payload.countries = data.countries
        .map((c) => c.value)
        .filter((v) => v.trim() !== "");
      payload.ratings = data.ratings
        .map((r) => Number(r.value))
        .filter((v) => !isNaN(v) && v >= 1 && v <= 5);
    }

    dispatch(updatePricingConfig(payload));
  };

  useEffect(() => {
    if (pricingConfigData?.success) {
      navigate("/pricing-config");
    }
  }, [pricingConfigData, navigate]);

  if (!item) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No data to update. Redirecting...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-gray-600">
        <div className="flex justify-center items-center gap-3">
          {serviceType === "flight" ? (
            <FaPlane className="text-blue-600" size={28} />
          ) : (
            <FaHotel className="text-green-600" size={28} />
          )}
          <h3 className="text-gray-600 text-2xl font-semibold sm:text-3xl">
            Update {serviceType === "flight" ? "Flight" : "Hotel"} Pricing Rule
          </h3>
        </div>
        <div className="bg-white rounded-lg shadow p-4 py-6 sm:rounded-lg sm:max-w-5xl mt-8 mx-auto">
          <form
            className="space-y-6 mx-8 sm:mx-2"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Basic Info */}
            <div className="border-b pb-4">
              <h4 className="font-semibold text-lg mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="font-medium">
                    Rule Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("name", { required: "Rule name is required" })}
                    className="w-full mt-2 border border-slate-300 rounded-md p-2"
                  />
                  {errors.name && (
                    <span className="text-red-500 text-sm">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="font-medium">Region</label>
                  <select
                    {...register("region")}
                    className="w-full mt-2 border border-slate-300 rounded-md p-2 h-10"
                  >
                    <option value="global">Global</option>
                    <option value="India">India</option>
                    <option value="United Arab Emirates">
                      United Arab Emirates
                    </option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="France">France</option>
                    <option value="Spain">Spain</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium">
                    Precedence <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("precedence", {
                      required: "Precedence is required",
                    })}
                    className="w-full mt-2 border border-slate-300 rounded-md p-2"
                  />
                  <span className="text-xs text-gray-500">
                    Lower number = higher priority
                  </span>
                  {errors.precedence && (
                    <span className="text-red-500 text-sm block">
                      {errors.precedence.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="font-medium">Status</label>
                  <div className="flex mt-2 gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        {...register("isActive")}
                        type="radio"
                        value="true"
                        className="accent-pink-700"
                      />
                      Active
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        {...register("isActive")}
                        type="radio"
                        value="false"
                        className="accent-pink-700"
                      />
                      Inactive
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-b pb-4">
              <h4 className="font-semibold text-lg mb-4">Pricing Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="font-medium">
                    Markup Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("markupValue", {
                      required: "Markup value is required",
                    })}
                    className="w-full mt-2 border border-slate-300 rounded-md p-2"
                  />
                  {errors.markupValue && (
                    <span className="text-red-500 text-sm">
                      {errors.markupValue.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="font-medium">Markup Type</label>
                  <select
                    {...register("markupType")}
                    className="w-full mt-2 border border-slate-300 rounded-md p-2"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium">Platform Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("platformFee")}
                    className="w-full mt-2 border border-slate-300 rounded-md p-2"
                  />
                </div>
              </div>
            </div>

            {/* Fare Conditions */}
            <div className="border-b pb-4">
              <h4 className="font-semibold text-lg mb-4">Fare Conditions</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="font-medium">Minimum Fare</label>
                  <input
                    type="number"
                    {...register("minFare")}
                    className="w-full mt-2 border border-slate-300 rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="font-medium">Maximum Fare</label>
                  <input
                    type="number"
                    {...register("maxFare")}
                    className="w-full mt-2 border border-slate-300 rounded-md p-2"
                  />
                </div>
              </div>
            </div>

            {/* Flight Specific Fields */}
            {serviceType === "flight" && (
              <>
                <div className="border-b pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-lg">
                      Airlines (Optional)
                    </h4>
                    <button
                      type="button"
                      onClick={() => appendAirline({ value: "" })}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                    >
                      <FaPlus /> Add Airline
                    </button>
                  </div>
                  <div className="space-y-3">
                    {airlineFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <input
                          type="text"
                          {...register(`airlines.${index}.value`)}
                          className="flex-1 border border-slate-300 rounded-md p-2"
                          placeholder="e.g., Air India, IndiGo"
                        />
                        <button
                          type="button"
                          onClick={() => removeAirline(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                    {airlineFields.length === 0 && (
                      <p className="text-sm text-gray-500">
                        No airlines specified - applies to all
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-b pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-lg">Routes (Optional)</h4>
                    <button
                      type="button"
                      onClick={() => appendRoute({ from: "", to: "" })}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                    >
                      <FaPlus /> Add Route
                    </button>
                  </div>
                  <div className="space-y-3">
                    {routeFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <input
                          type="text"
                          {...register(`routes.${index}.from`)}
                          className="flex-1 border border-slate-300 rounded-md p-2"
                          placeholder="From (e.g., DEL)"
                        />
                        <span className="flex items-center px-2">→</span>
                        <input
                          type="text"
                          {...register(`routes.${index}.to`)}
                          className="flex-1 border border-slate-300 rounded-md p-2"
                          placeholder="To (e.g., BOM)"
                        />
                        <button
                          type="button"
                          onClick={() => removeRoute(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fare Categories */}
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-lg mb-4">Fare Categories</h4>
                  <div className="flex flex-wrap gap-6 mt-2">
                    {[
                      { id: "OFFER_WITH_PNR", label: "Offer Fare (With PNR)" },
                      { id: "OFFER_WITHOUT_PNR", label: "Offer Fare (Without PNR)" },
                      { id: "SME", label: "SME Fares" },
                      { id: "CORPORATE", label: "Corporate Fares" },
                      { id: "PUBLISHED", label: "Published Fares" },
                    ].map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          value={cat.id}
                          {...register("fareCategories")}
                          className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {cat.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Leave all unchecked to apply to all fare types
                  </p>
                </div>
              </>
            )}

            {/* Hotel Specific Fields */}
            {serviceType === "hotel" && (
              <>
                <div className="border-b pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-lg">Cities (Optional)</h4>
                    <button
                      type="button"
                      onClick={() => appendCity({ value: "" })}
                      className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                    >
                      <FaPlus /> Add City
                    </button>
                  </div>
                  <div className="space-y-3">
                    {cityFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <input
                          type="text"
                          {...register(`cities.${index}.value`)}
                          className="flex-1 border border-slate-300 rounded-md p-2"
                          placeholder="e.g., New Delhi, Mumbai"
                        />
                        <button
                          type="button"
                          onClick={() => removeCity(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                    {cityFields.length === 0 && (
                      <p className="text-sm text-gray-500">
                        No cities specified - applies to all
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-b pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-lg">
                      Countries (Optional)
                    </h4>
                    <button
                      type="button"
                      onClick={() => appendCountry({ value: "" })}
                      className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                    >
                      <FaPlus /> Add Country
                    </button>
                  </div>
                  <div className="space-y-3">
                    {countryFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <input
                          type="text"
                          {...register(`countries.${index}.value`)}
                          className="flex-1 border border-slate-300 rounded-md p-2"
                          placeholder="e.g., India, UAE"
                        />
                        <button
                          type="button"
                          onClick={() => removeCountry(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                    {countryFields.length === 0 && (
                      <p className="text-sm text-gray-500">
                        No countries specified - applies to all
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-b pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-lg">
                      Hotel Ratings (Optional)
                    </h4>
                    <button
                      type="button"
                      onClick={() => appendRating({ value: "" })}
                      className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                    >
                      <FaPlus /> Add Rating
                    </button>
                  </div>
                  <div className="space-y-3">
                    {ratingFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <select
                          {...register(`ratings.${index}.value`)}
                          className="flex-1 border border-slate-300 rounded-md p-2"
                        >
                          <option value="">Select Rating</option>
                          <option value="1">1 Star</option>
                          <option value="2">2 Stars</option>
                          <option value="3">3 Stars</option>
                          <option value="4">4 Stars</option>
                          <option value="5">5 Stars</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeRating(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                    {ratingFields.length === 0 && (
                      <p className="text-sm text-gray-500">
                        No ratings specified - applies to all
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/pricing-config")}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 font-medium hover:bg-gray-300 rounded-lg duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-white bg-pink-700 font-medium hover:bg-pink-800 active:bg-pink-700 rounded-lg duration-150 disabled:opacity-50"
              >
                {isLoading ? (
                  <ClipLoader color="#c4c2c2" size={20} />
                ) : (
                  "Update Rule"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};