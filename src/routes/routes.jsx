import { createBrowserRouter } from "react-router-dom";
import Layout from "../layout/Layout";
import Dashboard from "../pages/Dashboard/Dashboard";
import Login from "../pages/Auth/Login";
import ViewAdminUsers from "../components/SuperAdmin/AdminUser/ViewAdminUsers";
import ViewTours from "../pages/Tour/ViewTour";
import CreateTour from "../pages/Tour/createTour";
import ViewContactUs from "../pages/ContactUs/ViewContactUs";
import ViewOrder from "../pages/Order/ViewOrder";
import CreateAdminUser from "../components/SuperAdmin/AdminUser/CreateAdminUser";
import UpdateAdminUser from "../components/SuperAdmin/AdminUser/UpdateAdminUser";
import EditProfile from "../pages/Auth/EditProfile";
import { ViewPricingConfig } from "../pages/SuperAdmin/PricingConfig/ViewPricingConfig";
import { CreatePricingConfig } from "../pages/SuperAdmin/PricingConfig/CreatePricingConfig";
import FlightsList from "../components/Flights/FlightLists";
import AddFlight from "../components/Flights/AddFlights";
import HotelLists from "../components/Hotels/HotelLists";
import AddHotelPage from "../components/Hotels/AddHotels";
import AddNewOffersPage from "../components/Offers/AddNewOffers";
import AllBookings from "../components/Bookings/AllBookings";
import { UpdatePricingConfig } from "../pages/SuperAdmin/PricingConfig/UpdatePricingConfig";
import HotelBooking from "../pages/GeneralAdmin/Booking/HotelBooking";
import OffersListPage from "../components/Offers/OffersListPage";
import OfferAnalytics from "../components/Offers/Analytics";
import TransactionManagement from "../components/TransactionManagement/TransactionManagement";
import NotificationSystem from "../components/NotificationSystem/NotificationSystem";
import AnalyticsDashboard from "../components/AnalyticsDashboard/AnalyticsDashboard";
import SecurityAuditLogs from "../components/SecurityAudit/SecurityAuditLogs";
// import ContentApproval from "../components/SuperAdmin/ContentApproval/ContentApproval";
import CreateBlogPage from "../components/SEO/Blogs/CreateNewBlog";
import BlogListPage from "../components/SEO/Blogs/AllBlogs";
import AllFAQ from "../components/SEO/FAQs/AllFAQs";
import CreateNewFAQ from "../components/SEO/FAQs/CreateNewFAQ";
import BlogEditPage from "../components/SEO/Blogs/BlogEditPage";
import SitemapManager from "../components/SEO/Sitemap/SitemapManager";
import SEODashboard from "../pages/SEO/SEODashboard";
import SubscribersPage from "../components/SEO/NewsLetters/SubscribersPage";
import AddNewsletterPage from "../components/SEO/NewsLetters/AddNewsletter";
import CampaignsListPage from "../components/SEO/NewsLetters/AllNewsletter";
import EditCampaignPage from "../components/SEO/NewsLetters/EditCampaign";
import BlogContentManagement from "../components/SuperAdmin/ContentApproval/BlogContentApproval";
import CampaignApproval from "../components/SuperAdmin/ContentApproval/CampaignApproval";
import SEOAdminPanel from "../components/SEO/WebSeo/SEOAdminPanel";
import OneWayFlightBooking from "../components/SuperAdmin/SearchFlightHotel/Flight/OneWayFlightBooked";
import RoundTripFlightBooking from "../components/SuperAdmin/SearchFlightHotel/Flight/RoundWayFlightBooked";
import MultiCityFlightBooking from "../components/SuperAdmin/SearchFlightHotel/Flight/MultiWayFlightBooked";
import FlightSearch from "../components/SuperAdmin/SearchFlightHotel/Flight/FlightSearchCard";
import AdminSearch from "../pages/SuperAdmin/AdminSearch/AdminSearch";
import ListVedicPackages from "../pages/VedicPackages/ListVedicPackages";
import CreateVedicPackage from "../pages/VedicPackages/CreateVedicPackage";

export const appRouter = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/superadmin-dashboard",
        element: <Dashboard />,
      },
      {
        path: "/update-profile",
        element: <EditProfile />,
      },
      {
        path: "/admins",
        element: <ViewAdminUsers />,
      },
      {
        path: "/create-new-admin",
        element: <CreateAdminUser />,
      },
      {
        path: "/update-admin",
        element: <UpdateAdminUser />,
      },
      {
        path: "/pricing-config",
        element: <ViewPricingConfig />,
      },
      {
        path: "/add-pricing-config",
        element: <CreatePricingConfig />,
      },
      {
        path: "/update-pricing-config",
        element: <UpdatePricingConfig />,
      },
      {
        path: "/tour",
        element: <ViewTours />,
      },
      {
        path: "/createTour",
        element: <CreateTour />,
      },
      {
        path: "/contactUs",
        element: <ViewContactUs />,
      },

      {
        path: "/order",
        element: <ViewOrder />,
      },
      {
        path: "/flights-lists",
        element: <FlightsList />,
      },
      {
        path: "/flights/add",
        element: <AddFlight />,
      },
      {
        path: "/hotel-lists",
        element: <HotelLists />,
      },
      {
        path: "/hotels/add",
        element: <AddHotelPage />,
      },
      {
        path: "/offers",
        element: <OffersListPage />,
      },
      {
        path: "/offers/add",
        element: <AddNewOffersPage />,
      },
      {
        path: "/offers/analytics",
        element: <OfferAnalytics />,
      },
      {
        path: "/blog-and-articles",
        element: <BlogListPage />,
      },
      {
        path: "/blog-and-articles/add",
        element: <CreateBlogPage />,
      },
      {
        path: "/blog-and-articles/:id/edit",
        element: <BlogEditPage />,
      },
      {
        path: "/campaign",
        element: <CampaignsListPage />,
      },
      {
        path: "/campaign/add",
        element: <AddNewsletterPage />,
      },
      {
        path: "/campaign/:id/edit",
        element: <EditCampaignPage />,
      },
      {
        path: "/subscribers/all",
        element: <SubscribersPage />,
      },
      {
        path: "/all-booking",
        element: <AllBookings />,
      },
      {
        path: "/booking/hotels",
        element: <HotelBooking />,
      },
      {
        path: "/faqs",
        element: <AllFAQ />,
      },
      {
        path: "/faq/add",
        element: <CreateNewFAQ />,
      },
      {
        path: "/transaction-management",
        element: <TransactionManagement />,
      },
      {
        path: "/notification-system",
        element: <NotificationSystem />,
      },
      {
        path: "/analytics-system",
        element: <AnalyticsDashboard />,
      },
      {
        path: "/security-audit-logs",
        element: <SecurityAuditLogs />,
      },
      {
        path: "/blog-content-management",
        element: <BlogContentManagement />,
      },
      // {
      //   path: "/faq-content-management",
      //   element: <ContentApproval />,
      // },
      {
        path: "/campaign-content-management",
        element: <CampaignApproval />,
      },
      {
        path: "/sitemap-manager",
        element: <SitemapManager />,
      },
      {
        path: "/seo-dashboard",
        element: <SEODashboard />,
      },
      {
        path: "/web-seo",
        element: <SEOAdminPanel />,
      },
      /* ================= FLIGHT & HOTEL BOOKINGS ================= */

      {
        path: "/admin-search",
        element: <AdminSearch />,
      },

      {
        path: "/booking/flight/oneway",
        element: <OneWayFlightBooking />,
      },
      {
        path: "/booking/flight/roundtrip",
        element: <RoundTripFlightBooking />,
      },
      {
        path: "/booking/flight/multicity",
        element: <MultiCityFlightBooking />,
      },
      {
        path: "/flight-search-results",
        element: <FlightSearch />,
      },
      {
        path: "/single-flight-search",
        element: <OneWayFlightBooking />,
      },
      // Vedic Packages
      {
        path: "/vedic-packages",
        element: <ListVedicPackages />,
      },
      {
        path: "/vedic-packages/create",
        element: <CreateVedicPackage />,
      },
    ],
  },
], {});

