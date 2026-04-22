// ViewPricingConfig.jsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { Stack, Skeleton } from "@mui/material";
import Delete from "../../../components/Delete";
import { MdCircle } from "react-icons/md";
import { FaPlane, FaHotel } from "react-icons/fa";
import {
  deletePricingConfig,
  getAllPricingConfig,
} from "../../../features/action/pricingConfig";

export const ViewPricingConfig = () => {
  const { pricingConfigData, isDeleted, isLoading } = useSelector(
    (state) => state.pricingConfig
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("flight");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [id, setId] = useState();

  useEffect(() => {
    dispatch(getAllPricingConfig());
  }, [dispatch]);

  useEffect(() => {
    if (isDeleted) {
      dispatch(getAllPricingConfig());
    }
  }, [isDeleted, dispatch]);

  const handleDelete = () => {
    dispatch(deletePricingConfig(id));
    setShowDeleteModal(false);
    setId("");
  };

  const handleModal = (ID) => {
    setShowDeleteModal(true);
    setId(ID);
  };

  // Filter rules by service type
  const flightRules = Array.isArray(pricingConfigData)
    ? pricingConfigData.filter((rule) => rule.serviceType === "flight")
    : [];

  const hotelRules = Array.isArray(pricingConfigData)
    ? pricingConfigData.filter((rule) => rule.serviceType === "hotel")
    : [];

  const displayRules = activeTab === "flight" ? flightRules : hotelRules;

  return (
    <>
      <div className="mx-auto">
        <div className="items-start justify-between md:flex">
          <div className="max-w-lg">
            <h3 className="text-gray-800 text-xl font-bold sm:text-2xl">
              Manage Pricing Rules
            </h3>
            <p className="text-gray-600 mt-2">
              Create, update, and manage pricing rules for flights and hotels.
            </p>
          </div>
          <div className="mt-3 md:mt-0 flex gap-3">
            <button
              onClick={() => navigate("/add-pricing-config", { state: { serviceType: "flight" } })}
              className="inline-flex items-center gap-2 px-4 py-2 text-white duration-150 font-medium bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-700 md:text-sm"
            >
              <FaPlane /> Add Flight Rule
            </button>
            <button
              onClick={() => navigate("/add-pricing-config", { state: { serviceType: "hotel" } })}
              className="inline-flex items-center gap-2 px-4 py-2 text-white duration-150 font-medium bg-green-600 rounded-lg hover:bg-green-700 active:bg-green-700 md:text-sm"
            >
              <FaHotel /> Add Hotel Rule
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab("flight")}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "flight"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              <span className="flex items-center gap-2">
                <FaPlane /> Flight Rules ({flightRules.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("hotel")}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "hotel"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              <span className="flex items-center gap-2">
                <FaHotel /> Hotel Rules ({hotelRules.length})
              </span>
            </button>
          </nav>
        </div>

        {/* Table */}
        <div className="mt-5 shadow-sm border rounded-lg overflow-x-auto">
          <table className="w-full table-auto text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="py-3 px-6">Rule Name</th>
                <th className="py-3 px-6">Region</th>
                <th className="py-3 px-6">Markup</th>
                <th className="py-3 px-6">Platform Fee</th>
                {activeTab === "flight" && (
                  <>
                    <th className="py-3 px-6">Airlines</th>
                    <th className="py-3 px-6">Routes</th>
                    <th className="py-3 px-6">Fare Categories</th>
                  </>
                )}
                {activeTab === "hotel" && (
                  <>
                    <th className="py-3 px-6">Cities</th>
                    <th className="py-3 px-6">Rating</th>
                  </>
                )}
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center px-6 py-8">
                    <Stack spacing={4}>
                      <Skeleton variant="rounded" height={30} />
                      <Skeleton variant="rounded" height={25} />
                      <Skeleton variant="rounded" height={20} />
                      <Skeleton variant="rounded" height={20} />
                    </Stack>
                  </td>
                </tr>
              ) : displayRules.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center px-6 py-8 text-gray-500">
                    No {activeTab} rules found. Create one to get started.
                  </td>
                </tr>
              ) : (
                displayRules.map((item, idx) => (
                  <tr key={item._id || idx}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {item.name}
                      <div className="text-xs text-gray-500 mt-1">
                        Precedence: {item.precedence}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`uppercase text-white px-3 py-1 rounded-md text-xs font-medium ${item.region === "global"
                            ? "bg-purple-600"
                            : "bg-blue-600"
                          }`}
                      >
                        {item.region}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="bg-slate-100 flex items-center rounded-md px-3 py-1 gap-2 w-fit">
                        <span className="font-bold text-black">
                          {item.markupValue}
                        </span>
                        <span
                          className={`capitalize text-white px-2 py-0.5 rounded text-xs ${item.markupType === "percent"
                              ? "bg-orange-600"
                              : "bg-yellow-600"
                            }`}
                        >
                          {item.markupType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-slate-100 px-3 py-1 rounded-md font-bold text-black">
                        {item.platformFee}
                      </span>
                    </td>

                    {/* Flight Specific */}
                    {activeTab === "flight" && (
                      <>
                        <td className="px-6 py-4">
                          {item.airlines && item.airlines.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.airlines.slice(0, 3).map((airline, i) => (
                                <span
                                  key={i}
                                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                >
                                  {airline}
                                </span>
                              ))}
                              {item.airlines.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{item.airlines.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">All</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {item.routes && item.routes.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {item.routes.slice(0, 2).map((route, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-gray-100 px-2 py-1 rounded"
                                >
                                  {route.from} → {route.to}
                                </span>
                              ))}
                              {item.routes.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{item.routes.length - 2} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">All</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {item.fareCategories && item.fareCategories.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.fareCategories.map((cat, i) => (
                                <span
                                  key={i}
                                  className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">All</span>
                          )}
                        </td>
                      </>
                    )}

                    {/* Hotel Specific */}
                    {activeTab === "hotel" && (
                      <>
                        <td className="px-6 py-4">
                          {item.cities && item.cities.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.cities.slice(0, 3).map((city, i) => (
                                <span
                                  key={i}
                                  className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                                >
                                  {city}
                                </span>
                              ))}
                              {item.cities.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{item.cities.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">All</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {item.ratings && item.ratings.length > 0 ? (
                            <div className="flex gap-1">
                              {item.ratings.map((rating, i) => (
                                <span
                                  key={i}
                                  className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded"
                                >
                                  {rating}★
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">All</span>
                          )}
                        </td>
                      </>
                    )}

                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {item.isActive ? (
                        <span className="bg-green-50 flex gap-2 items-center text-green-600 py-1 px-2 rounded-md w-fit">
                          <MdCircle size={8} /> ACTIVE
                        </span>
                      ) : (
                        <span className="text-red-600 flex gap-2 items-center bg-red-50 py-1 px-2 rounded-md w-fit">
                          <MdCircle size={8} /> INACTIVE
                        </span>
                      )}
                    </td>

                    <td className="px-3 whitespace-nowrap">
                      <button
                        onClick={() => {
                          navigate(`/update-pricing-config`, { state: item });
                        }}
                        className="py-2 px-3 font-semibold text-green-500 hover:text-green-600 duration-150 hover:bg-gray-50 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          handleModal(item._id);
                        }}
                        className="py-2 px-3 leading-none font-semibold text-red-500 hover:text-red-600 duration-150 hover:bg-gray-50 rounded-lg"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showDeleteModal && (
        <Delete setModal={setShowDeleteModal} handleDelete={handleDelete} />
      )}
    </>
  );
};