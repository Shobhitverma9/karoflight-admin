import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  TbArticle,
  TbUsers,
  TbMail,
  TbQuestionMark,
  TbDiscount,
  TbChartBar,
  TbTrendingUp,
  TbEye,
  TbChevronDown,
  TbChevronUp,
  TbFolder,
  TbClock,
  TbCheck,
  TbFileText,
} from "react-icons/tb";
import { ClipLoader } from "react-spinners";
import { toast } from "react-hot-toast";
import { getAllCampaigns } from "../../features/slices/campaignSlice";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const SEODashboard = () => {
  const dispatch = useDispatch();
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [showAllBlogs, setShowAllBlogs] = useState(false);
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  const [showAllCampaigns, setShowAllCampaigns] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [stats, setStats] = useState({
    blogs: {},
    faqs: {},
    campaigns: {},
    subscribers: {},
  });

  const { userData, token } = useSelector((state) => state.auth);

  // Safe selector for campaigns
  const campaignsState = useSelector(
    (state) => state.campaigns || state.campaign || state.newsletter || {}
  );
  const campaignsList = campaignsState.campaigns || [];

  const baseURL = import.meta.env.VITE_RENDER_API_BASE_URL;

  // Chart colors
  const COLORS = {
    primary: "#3B82F6",
    success: "#22C55E",
    warning: "#EAB308",
    danger: "#EF4444",
    gray: "#9CA3AF",
    purple: "#A855F7",
    indigo: "#6366F1",
  };

  const PIE_COLORS = [COLORS.success, COLORS.warning, COLORS.gray];
  const STATUS_COLORS = [COLORS.success, COLORS.danger];

  // Get token
  const getToken = () => {
    return (
      token || sessionStorage.getItem("token") || localStorage.getItem("token")
    );
  };

  // Fetch individual blog details
  const fetchBlogDetails = async (blogId) => {
    try {
      const response = await fetch(`${baseURL}/blogs/one/${blogId}`);
      if (!response.ok) throw new Error("Failed to fetch blog details");
      const data = await response.json();

      // Try multiple paths to find the blog data
      const blogData = data.blog || data.data || data;

      // Debug: Log the entire response structure for first blog only
      if (blogId === "69158b35259106185c2e9cda") {
        console.log(
          "Full API Response Structure:",
          JSON.stringify(data, null, 2)
        );
        console.log("Blog Data:", blogData);
        console.log("Available keys:", Object.keys(blogData || {}));
      }

      // Check all possible view field names
      const views =
        blogData?.views ||
        blogData?.viewCount ||
        blogData?.view_count ||
        blogData?.totalViews ||
        blogData?.pageViews ||
        0; // Default to 0 if not found

      console.log(`Blog ${blogId} - Found views:`, views);

      return {
        ...blogData,
        views: views, // Ensure views is always set
      };
    } catch (error) {
      console.error(`Error fetching blog ${blogId}:`, error);
      return null;
    }
  };

  // Fetch subscribers
  const fetchSubscribers = async () => {
    try {
      const authToken = getToken();
      if (!authToken) throw new Error("Authentication required. Please login.");

      const response = await fetch(`${baseURL}/subscriptions/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401)
        throw new Error("Unauthorized. Please login again.");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch subscribers: ${response.status}`
        );
      }

      const data = await response.json();
      let subscribersList = [];

      if (data.subscribers && Array.isArray(data.subscribers)) {
        subscribersList = data.subscribers;
      } else if (data.data && Array.isArray(data.data)) {
        subscribersList = data.data;
      } else if (Array.isArray(data)) {
        subscribersList = data;
      }

      return subscribersList;
    } catch (error) {
      console.error("❌ Error fetching subscribers:", error);
      toast.error(error.message || "Failed to load subscribers");
      return [];
    }
  };

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${baseURL}/blogs/list`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch blogs: ${response.status}`
        );
      }

      const data = await response.json();
      let blogsList = [];

      if (data.blogs && Array.isArray(data.blogs)) {
        blogsList = data.blogs;
      } else if (data.data && Array.isArray(data.data)) {
        blogsList = data.data;
      } else if (Array.isArray(data)) {
        blogsList = data;
      }

      console.log("Initial blogs list count:", blogsList.length);
      console.log("Sample blog from list:", blogsList[0]);

      // Check if views already exist in the list response
      const hasViewsInList = blogsList.some(
        (blog) =>
          blog.views !== undefined ||
          blog.viewCount !== undefined ||
          blog.view_count !== undefined
      );

      if (hasViewsInList) {
        console.log("✅ Views found in list response, using directly");
        return blogsList.map((blog) => ({
          ...blog,
          views: blog.views || blog.viewCount || blog.view_count || 0,
        }));
      }

      // If views not in list, fetch details for each blog
      console.log("⚠️ Views not in list response, fetching details...");
      const blogsWithDetails = await Promise.all(
        blogsList.map(async (blog) => {
          const blogId = blog._id || blog.id;
          if (!blogId) {
            console.warn("Blog missing ID:", blog);
            return { ...blog, views: 0 };
          }

          try {
            const details = await fetchBlogDetails(blogId);
            return details || { ...blog, views: 0 };
          } catch (error) {
            console.error(`Failed to fetch details for blog ${blogId}:`, error);
            return { ...blog, views: 0 };
          }
        })
      );

      return blogsWithDetails;
    } catch (error) {
      console.error("❌ Error fetching blogs:", error);
      toast.error(error.message || "Failed to load blogs");
      return [];
    }
  };
  // Fetch FAQs
  const fetchFAQs = async () => {
    try {
      const response = await fetch(`${baseURL}/faqs`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch FAQs: ${response.status}`
        );
      }

      const data = await response.json();
      let faqsList = [];

      if (data.faqs && Array.isArray(data.faqs)) {
        faqsList = data.faqs;
      } else if (data.data && Array.isArray(data.data)) {
        faqsList = data.data;
      } else if (Array.isArray(data)) {
        faqsList = data;
      }

      return faqsList;
    } catch (error) {
      console.error("❌ Error fetching FAQs:", error);
      toast.error(error.message || "Failed to load FAQs");
      return [];
    }
  };

  // Calculate blog statistics
  const calculateBlogStats = (blogs) => {
    const total = blogs.length;
    const published = blogs.filter(
      (blog) => blog.status === "published" || blog.isPublished
    ).length;
    const drafts = blogs.filter(
      (blog) => blog.status === "draft" || !blog.isPublished
    ).length;
    const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);

    const allBlogs = [...blogs]
      .filter((blog) => blog.status === "published" || blog.isPublished)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .map((blog) => ({
        title: blog.title,
        views: blog.views || 0,
        createdAt: blog.createdAt,
        comments: blog.commentsCount || blog.comments?.length || 0,
      }));

    const topPerforming = allBlogs.slice(0, 5);

    return {
      total,
      published,
      drafts,
      views: totalViews,
      topPerforming,
      allBlogs,
    };
  };

  // Calculate FAQ statistics
  const calculateFAQStats = (faqs) => {
    const allFAQItems = faqs.flatMap((faq) =>
      (faq.faqs || []).map((item) => ({
        ...item,
        documentTitle: faq.title || "Untitled FAQ",
        documentSlug: faq.slug || "uncategorized",
        documentId: faq._id,
      }))
    );

    const total = allFAQItems.length;
    const published = allFAQItems.filter((item) => !item.is_hidden).length;
    const hidden = allFAQItems.filter((item) => item.is_hidden).length;
    const totalViews = allFAQItems.reduce(
      (sum, item) => sum + (item.views || 0),
      0
    );

    const categorizedFAQs = faqs.reduce((acc, faq) => {
      const slug = faq.slug || "uncategorized";
      const title = faq.title || "Untitled FAQ";

      if (!acc[slug]) {
        acc[slug] = {
          title,
          slug,
          items: [],
          totalItems: 0,
          publishedItems: 0,
          totalViews: 0,
        };
      }

      const items = (faq.faqs || []).map((item) => ({
        ...item,
        documentTitle: title,
        documentSlug: slug,
      }));

      acc[slug].items.push(...items);
      acc[slug].totalItems += items.length;
      acc[slug].publishedItems += items.filter(
        (item) => !item.is_hidden
      ).length;
      acc[slug].totalViews += items.reduce(
        (sum, item) => sum + (item.views || 0),
        0
      );

      return acc;
    }, {});

    return {
      total,
      published,
      hidden,
      views: totalViews,
      categorized: categorizedFAQs,
      totalDocuments: faqs.length,
    };
  };

  // Calculate campaign statistics
  const calculateCampaignStats = (campaigns) => {
    if (!campaigns || !Array.isArray(campaigns)) {
      return {
        total: 0,
        sent: 0,
        scheduled: 0,
        drafts: 0,
        totalSubscribers: 0,
        successRate: 0,
        recent: [],
        allCampaigns: [],
      };
    }

    const total = campaigns.length;
    const sent = campaigns.filter((c) => c.status === "sent").length;
    const scheduled = campaigns.filter((c) => c.status === "scheduled").length;
    const drafts = campaigns.filter((c) => c.status === "draft").length;

    const totalSubscribers = campaigns.reduce(
      (sum, campaign) => sum + (campaign.stats?.totalSubscribers || 0),
      0
    );

    const totalSuccess = campaigns.reduce(
      (sum, campaign) => sum + (campaign.stats?.successCount || 0),
      0
    );
    const totalSent = campaigns.reduce(
      (sum, campaign) => sum + (campaign.stats?.sentCount || 0),
      0
    );
    const successRate =
      totalSent > 0 ? ((totalSuccess / totalSent) * 100).toFixed(1) : 0;

    const recentCampaigns = [...campaigns]
      .filter((c) => c.status === "sent")
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
      .map((campaign) => ({
        name: campaign.name,
        type: campaign.type,
        sentDate: campaign.updatedAt,
        subscribers: campaign.stats?.totalSubscribers || 0,
        successCount: campaign.stats?.successCount || 0,
        failedCount: campaign.stats?.failedCount || 0,
      }));

    const allCampaigns = [...campaigns]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((campaign) => ({
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        createdAt: campaign.createdAt,
        stats: campaign.stats,
      }));

    return {
      total,
      sent,
      scheduled,
      drafts,
      totalSubscribers,
      successRate,
      recent: recentCampaigns,
      allCampaigns,
    };
  };

  // Calculate subscriber statistics
  const calculateSubscriberStats = (subscribers) => {
    const total = subscribers.length;
    const active = subscribers.filter((sub) => sub.status === "active").length;
    const inactive = subscribers.filter(
      (sub) => sub.status === "unsubscribed"
    ).length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = subscribers.filter((sub) => {
      const subDate = new Date(sub.subscribedAt || sub.createdAt);
      return (
        subDate.getMonth() === currentMonth &&
        subDate.getFullYear() === currentYear &&
        sub.status === "active"
      );
    }).length;

    const growthRate =
      total > 0 ? ((newThisMonth / total) * 100).toFixed(1) : 0;
    const engagementRate = total > 0 ? ((active / total) * 100).toFixed(1) : 0;

    // Generate monthly growth data for the last 6 months
    const monthlyGrowth = [];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();

      const count = subscribers.filter((sub) => {
        const subDate = new Date(sub.subscribedAt || sub.createdAt);
        return subDate.getMonth() === month && subDate.getFullYear() === year;
      }).length;

      monthlyGrowth.push({
        month: monthNames[month],
        subscribers: count,
      });
    }

    return {
      total,
      active,
      inactive,
      newThisMonth,
      growthRate,
      engagement: engagementRate,
      monthlyGrowth,
    };
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      try {
        await dispatch(getAllCampaigns()).unwrap();
      } catch (campaignError) {
        console.error("Error fetching campaigns:", campaignError);
      }

      const [subscribersData, blogsData, faqsData] = await Promise.all([
        fetchSubscribers(),
        fetchBlogs(),
        fetchFAQs(),
      ]);

      const subscriberStats = calculateSubscriberStats(subscribersData);
      const blogStats = calculateBlogStats(blogsData);
      const faqStats = calculateFAQStats(faqsData);
      const campaignStats = calculateCampaignStats(campaignsList);

      const mockData = {
        blogs: blogStats,
        faqs: faqStats,
        campaigns: campaignStats,
        subscribers: subscriberStats,
      };

      setStats(mockData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (slug) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  useEffect(() => {
    if (
      campaignsList &&
      Array.isArray(campaignsList) &&
      campaignsList.length > 0
    ) {
      const campaignStats = calculateCampaignStats(campaignsList);
      setStats((prev) => ({
        ...prev,
        campaigns: campaignStats,
      }));
    }
  }, [campaignsList]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <ClipLoader size={40} color="#3B82F6" />
          <p className="mt-4 text-gray-600">Loading SEO Dashboard...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const campaignStatusData = [
    { name: "Sent", value: stats.campaigns.sent || 0, color: COLORS.success },
    {
      name: "Scheduled",
      value: stats.campaigns.scheduled || 0,
      color: COLORS.warning,
    },
    { name: "Drafts", value: stats.campaigns.drafts || 0, color: COLORS.gray },
  ];

  const subscriberStatusData = [
    {
      name: "Active",
      value: stats.subscribers.active || 0,
      color: COLORS.success,
    },
    {
      name: "Inactive",
      value: stats.subscribers.inactive || 0,
      color: COLORS.danger,
    },
  ];

  const blogPerformanceData =
    stats.blogs.topPerforming?.map((blog) => ({
      name:
        blog.title.length > 25
          ? blog.title.substring(0, 25) + "..."
          : blog.title,
      views: blog.views,
    })) || [];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-gray-600">
              {entry.name}:{" "}
              <span className="font-semibold" style={{ color: entry.color }}>
                {entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              SEO Manager Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Analytics and performance metrics for your SEO content
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Blogs"
          value={stats.blogs.total}
          change="+12%"
          icon={<TbArticle className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Total FAQs"
          value={stats.faqs.total}
          change="+8%"
          icon={<TbFolder className="w-6 h-6" />}
          color="red"
        />
        <MetricCard
          title="Total Campaigns"
          value={stats.campaigns.total}
          change={`${stats.campaigns.sent} sent`}
          icon={<TbMail className="w-6 h-6" />}
          color="purple"
        />
        <MetricCard
          title="Total Subscribers"
          value={stats.subscribers.total?.toLocaleString()}
          change={`+${stats.subscribers.growthRate}%`}
          icon={<TbUsers className="w-6 h-6" />}
          color="indigo"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Subscriber Growth Chart */}
        <DashboardCard
          title="Subscriber Growth (6 Months)"
          icon={<TbChartBar />}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.subscribers.monthlyGrowth}>
              <defs>
                <linearGradient
                  id="colorSubscribers"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={COLORS.primary}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={COLORS.primary}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="subscribers"
                stroke={COLORS.primary}
                strokeWidth={2}
                fill="url(#colorSubscribers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardCard>

        {/* Campaign Status Chart */}
        <DashboardCard title="Campaign Status Distribution" icon={<TbMail />}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={campaignStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {campaignStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </DashboardCard>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Blog Performance Chart */}
        <DashboardCard title="Top 5 Blog Posts by Views" icon={<TbArticle />}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={blogPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                style={{ fontSize: "11px" }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="views"
                fill={COLORS.primary}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>

        {/* Subscriber Status Chart */}
        <DashboardCard title="Subscriber Status" icon={<TbUsers />}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={subscriberStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                innerRadius={40}
              >
                {subscriberStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </DashboardCard>
      </div>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardCard title="Campaign Analytics" icon={<TbMail />}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Campaigns</span>
              <span className="font-semibold">{stats.campaigns.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="font-semibold text-green-600">
                {stats.campaigns.successRate}%
              </span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">Recent Campaigns</h4>
                {stats.campaigns.allCampaigns &&
                  stats.campaigns.allCampaigns.length > 3 && (
                    <button
                      onClick={() => setShowAllCampaigns(!showAllCampaigns)}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <span>
                        {showAllCampaigns ? "Show Less" : "View More"}
                      </span>
                      {showAllCampaigns ? (
                        <TbChevronUp className="w-4 h-4" />
                      ) : (
                        <TbChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
              </div>
              {stats.campaigns.allCampaigns &&
              stats.campaigns.allCampaigns.length > 0 ? (
                (showAllCampaigns
                  ? stats.campaigns.allCampaigns
                  : stats.campaigns.recent
                ).map((campaign, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {campaign.name}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span className="flex items-center capitalize">
                          {campaign.status === "sent" && (
                            <TbCheck className="w-3 h-3 mr-1 text-green-600" />
                          )}
                          {campaign.status === "scheduled" && (
                            <TbClock className="w-3 h-3 mr-1 text-yellow-600" />
                          )}
                          {campaign.status === "draft" && (
                            <TbFileText className="w-3 h-3 mr-1 text-gray-600" />
                          )}
                          {campaign.status}
                        </span>
                        <span className="capitalize">{campaign.type}</span>
                        {campaign.status === "sent" && campaign.stats && (
                          <>
                            <span className="text-green-600">
                              {campaign.stats.successCount || 0} sent
                            </span>
                            {campaign.stats.failedCount > 0 && (
                              <span className="text-red-600">
                                {campaign.stats.failedCount} failed
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No campaign data available
                </p>
              )}
            </div>
          </div>
        </DashboardCard>

        {/* Campaign Performance Details */}
        <DashboardCard title="Campaign Performance" icon={<TbChartBar />}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Total Subscribers Reached
              </span>
              <span className="font-semibold">
                {stats.campaigns.totalSubscribers?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Campaigns Sent</span>
              <span className="font-semibold text-green-600">
                {stats.campaigns.sent}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Scheduled Campaigns</span>
              <span className="font-semibold text-yellow-600">
                {stats.campaigns.scheduled}
              </span>
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Campaign Status Breakdown
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm text-green-700 flex items-center">
                    <TbCheck className="w-4 h-4 mr-2" />
                    Sent
                  </span>
                  <span className="text-sm font-semibold text-green-700">
                    {stats.campaigns.sent}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span className="text-sm text-yellow-700 flex items-center">
                    <TbClock className="w-4 h-4 mr-2" />
                    Scheduled
                  </span>
                  <span className="text-sm font-semibold text-yellow-700">
                    {stats.campaigns.scheduled}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700 flex items-center">
                    <TbFileText className="w-4 h-4 mr-2" />
                    Drafts
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    {stats.campaigns.drafts}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, change, icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className="flex items-center mt-1">
            <TbTrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">{change}</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

// Dashboard Card Component
const DashboardCard = ({ title, icon, children }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
};

export default SEODashboard;
