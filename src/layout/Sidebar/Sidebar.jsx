import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  TbArticle,
  TbBed,
  TbLayoutDashboardFilled,
  TbMoneybag,
  TbNews,
  TbPlane,
  TbSettingsSearch,
  TbUsers,
  TbReceipt,
  TbBell,
  TbFileText,
  TbApi,
  TbChartBar,
  TbShield,
  TbSettings,
  TbBuildingStore,
  TbMailbox,
  TbReportAnalytics,
  TbCreditCard,
  TbSearch,
  TbWorld,
} from "react-icons/tb";
import { LuSettings2 } from "react-icons/lu";
import { FaQuestion } from "react-icons/fa";
import { MdStickyNote2 } from "react-icons/md";
import { IoChevronForward } from "react-icons/io5";
import logo from "../../assets/Logo.jpg";
import {
  getEffectiveUser,
  getUserRole,
  normalizeRole,
} from "../../utils/authHelper";

const Sidebar = ({ isSideNavOpen, setIsSideNavOpen }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Get user data from Redux store
  const { userData } = useSelector((state) => state.auth);

  // Get effective user from sessionStorage/localStorage
  const effectiveUser = getEffectiveUser(userData);

  // Get role from token payload or sessionStorage (most accurate)
  let userRole = normalizeRole(getUserRole());

  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const handleLinkClick = () => {
    setIsSideNavOpen(false);
  };

  // SUPER ADMIN MENU
  const superAdminMenu = [
    {
      label: "Dashboard",
      path: "/superadmin-dashboard",
      icon: <TbLayoutDashboardFilled size={25} />,
    },
    {
      label: "User Management",
      path: "/admins",
      icon: <TbUsers size={25} />,
    },
    {
      label: "Search Flights and Hotels",
      path: "/admin-search",
      icon: <TbSearch size={25} />,
    },
    {
      label: "Pricing Panel",
      path: "/pricing-config",
      icon: <LuSettings2 size={25} />,
    },
    {
      label: "Transaction Management",
      path: "/transaction-management",
      icon: <TbReceipt size={25} />,
    },
    {
      label: "Notification System",
      path: "/notification-system",
      icon: <TbBell size={25} />,
    },
    {
      label: "Content Management",
      icon: <TbFileText size={25} />,
      // path: "/content-management"
      subItems: [
        { label: "Blog Approval", path: "/blog-content-management" },
        { label: "Campaign Approval", path: "/campaign-content-management" },
      ],
    },
    // {
    //   label: "API Management",
    //   path: "/api-management",
    //   icon: <TbApi size={25} />,
    // },
    {
      label: "Analytics",
      path: "/analytics-system",
      icon: <TbChartBar size={25} />,
    },
    {
      label: "Vedic Wanderers",
      icon: <TbWorld size={25} />,
      subItems: [
        { label: "All Packages", path: "/vedic-packages" },
        { label: "Add Package", path: "/vedic-packages/create" },
      ],
    },
  ];

  // ADMIN MENU
  const adminMenu = [
    {
      label: "Dashboard",
      path: "/",
      icon: <TbLayoutDashboardFilled size={25} />,
    },
    {
      label: "Booking Management",
      icon: <MdStickyNote2 size={25} />,
      subItems: [
        { label: "Hotel Bookings", path: "/booking/hotels" },
        { label: "Flight Bookings", path: "/booking/flights" },
        { label: "All Bookings", path: "/bookings/all" },
      ],
    },
    {
      label: "Room/Category Management",
      icon: <TbBuildingStore size={25} />,
      subItems: [
        {
          label: "Flights",
          path: "/flights-lists",
          icon: <TbPlane size={20} />,
        },
        { label: "Hotels", path: "/hotel-lists", icon: <TbBed size={20} /> },
        { label: "Categories", path: "/categories" },
      ],
    },
    {
      label: "Enquiry Management",
      path: "/enquiries",
      icon: <TbMailbox size={25} />,
    },
    {
      label: "Notification System",
      path: "/notifications",
      icon: <TbBell size={25} />,
    },
    {
      label: "Finance Admin",
      icon: <TbCreditCard size={25} />,
      subItems: [
        { label: "Transactions", path: "/finance/transactions" },
        { label: "Payments", path: "/finance/payments" },
        { label: "Refunds", path: "/finance/refunds" },
      ],
    },
    {
      label: "Content Management",
      icon: <TbFileText size={25} />,
      // path: "/content-management"
      subItems: [
        { label: "Blogs", path: "/blog-and-articles" },
        // { label: "Campaigns", path: "/campaign" },
        { label: "FAQs", path: "/faqs" },
      ],
    },
    {
      label: "Reports",
      icon: <TbReportAnalytics size={25} />,
      subItems: [
        { label: "Booking Reports", path: "/reports/bookings" },
        { label: "Revenue Reports", path: "/reports/revenue" },
        { label: "Performance Reports", path: "/reports/performance" },
      ],
    },
    {
      label: "Offers",
      icon: <TbMoneybag size={25} />,
      subItems: [
        { label: "All Offers", path: "/offers" },
        { label: "Add New Offer", path: "/offers/add" },
        { label: "See Analytics", path: "/offers/analytics" },
      ],
    },
    {
      label: "Vedic Wanderers",
      icon: <TbWorld size={25} />,
      subItems: [
        { label: "All Packages", path: "/vedic-packages" },
        { label: "Add Package", path: "/vedic-packages/create" },
      ],
    },
  ];

  // SEO MENU
  const seoMenu = [
    {
      label: "Dashboard",
      path: "/seo-dashboard",
      icon: <TbLayoutDashboardFilled size={25} />,
    },
    {
      label: "Blog Panel",
      icon: <TbArticle size={25} />,
      subItems: [
        { label: "All Blogs", path: "/blog-and-articles" },
        { label: "Add New Blog", path: "/blog-and-articles/add" },
      ],
    },
    {
      label: "Newsletter Panel",
      icon: <TbNews size={25} />,
      subItems: [
        { label: "All Newsletters", path: "/campaign" },
        { label: "Create Newsletter", path: "/campaign/add" },
        { label: "Subscribers", path: "/subscribers/all" },
      ],
    },
    {
      label: "FAQ Panel",
      icon: <FaQuestion size={25} />,
      subItems: [
        { label: "All FAQs", path: "/faqs" },
        { label: "Add New FAQ", path: "/faq/add" },
      ],
    },
    {
      label: "SEO Tools",
      icon: <TbSettingsSearch size={25} />,
      subItems: [
        // { label: "Meta Tags", path: "/seo/meta-tags" },
        { label: "Sitemap", path: "/sitemap-manager" },
        { label: "Keywords", path: "/web-seo" },
      ],
    },
    // {
    //   label: "Analytics",
    //   path: "/seo/analytics",
    //   icon: <TbChartBar size={25} />,
    // },
  ];

  // Select menu based on user role
  const getMenuByRole = () => {
    switch (userRole) {
      case "superadmin":
        return superAdminMenu;
      case "admin":
        return adminMenu;
      case "seo":
        return seoMenu;
      default:
        return adminMenu;
    }
  };

  const sideBarItems = getMenuByRole();

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 lg:static z-40 flex w-72 flex-col border-r border-r-slate-200 bg-white transition-transform lg:translate-x-0 ${isSideNavOpen ? "translate-x-0" : " -translate-x-full"
        }`}
    >
      {/* Logo */}
      <div className="ps-6 mt-2">
        <div className="min-h-[2rem] w-full flex-col items-start justify-center gap-0 text-center">
          <Link to={`/`} onClick={handleLinkClick}>
            <img className="h-16 rounded" src={logo} alt="Logo" />
          </Link>
        </div>
      </div>

      {/* Role Badge */}
      {/* <div className="px-6 py-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
          {userRole.replace("_", " ")} Panel
        </span>
      </div> */}

      {/* Sidebar Menu */}
      <nav
        aria-label="side navigation"
        className="flex-1 divide-y divide-slate-100 overflow-y-auto"
      >
        <div>
          <ul className="flex flex-1 flex-col gap-1 py-3 text-slate-700">
            {sideBarItems.map((itm) => (
              <li className="px-3" key={itm.label}>
                {itm.subItems ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(itm.label)}
                      onMouseEnter={() => setHoveredItem(itm.label)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`flex w-full items-center gap-3 rounded p-3 transition-colors hover:bg-emerald-50 hover:text-emerald-500 focus:bg-emerald-50 focus:text-emerald-500 ${openDropdown === itm.label
                          ? "bg-emerald-50 text-emerald-500"
                          : ""
                        }`}
                    >
                      <div className="flex items-center">{itm.icon}</div>
                      <div className="flex-1 text-left">{itm.label}</div>
                      <IoChevronForward
                        size={18}
                        className={`transform transition-transform duration-200 ${openDropdown === itm.label ||
                            hoveredItem === itm.label
                            ? "rotate-90"
                            : ""
                          }`}
                      />
                    </button>
                    {openDropdown === itm.label && (
                      <ul className="ml-8 mt-1 flex flex-col gap-1">
                        {itm.subItems.map((sub) => (
                          <li key={sub.label}>
                            <NavLink
                              to={sub.path}
                              onClick={handleLinkClick}
                              className={({ isActive }) =>
                                `block rounded px-3 py-2 text-sm transition-colors hover:bg-emerald-50 hover:text-emerald-500 ${isActive
                                  ? "bg-emerald-50 text-emerald-500"
                                  : ""
                                }`
                              }
                            >
                              <span className="flex items-center gap-2">
                                {sub.icon}
                                {sub.label}
                              </span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={itm.path}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded p-3 transition-colors hover:bg-emerald-50 hover:text-emerald-500 focus:bg-emerald-50 focus:text-emerald-500 ${isActive ? "bg-emerald-50 text-emerald-500" : ""
                      }`
                    }
                  >
                    <div className="flex items-center">{itm.icon}</div>
                    <div className="flex-1">{itm.label}</div>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Footer - Current User Info */}
      {/* <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-semibold">
            {(effectiveUser?.first_name?.charAt(0) || effectiveUser?.name?.charAt(0) || "U").toUpperCase()}
            {(effectiveUser?.last_name?.charAt(0) || "").toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700 capitalize">
              {`${effectiveUser?.first_name || effectiveUser?.name || ""} ${effectiveUser?.last_name || ""}`.trim() || effectiveUser?.username || "User"}
            </p>
            <p className="text-xs text-slate-500 capitalize">
              {userRole.replace("_", " ")}
            </p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Sidebar;
