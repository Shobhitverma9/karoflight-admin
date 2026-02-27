import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Stack, Skeleton } from "@mui/material";
import Delete from "../../Delete";
import {
  deleteAdminUser,
  getAdminUsers,
  toggleStaffStatus,
  createAdminUser,
  editAdminUser,
} from "../../../features/action/auth";
import {
  MdCircle,
  MdEdit,
  MdDelete,
  MdAdd,
  MdRefresh,
  MdSearch,
  MdFilterList,
} from "react-icons/md";
import { toast } from "react-hot-toast";
import UpdateAdminUser from "./UpdateAdminUser";

const ViewAdminUsers = () => {
  const { adminsData, isDeleted, isLoading, userData } = useSelector(
    (state) => state.auth
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isSuperAdmin = userData?.role === "superadmin";

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    dispatch(getAdminUsers());
  }, [dispatch]);

  useEffect(() => {
    if (isDeleted) {
      dispatch(getAdminUsers());
      toast.success("Staff member deleted successfully");
    }
  }, [isDeleted, dispatch]);

  // CRUD Operations
  const handleStatusToggle = async (admin) => {
    if (!isSuperAdmin) {
      toast.error("Only superadmin can modify staff status");
      return;
    }

    if (admin.role === "superadmin") {
      toast.error("Cannot modify superadmin status");
      return;
    }

    try {
      await dispatch(
        toggleStaffStatus({
          staffId: admin._id,
          is_active: !admin.is_active,
        })
      ).unwrap();

      toast.success(
        `Staff ${!admin.is_active ? "activated" : "suspended"} successfully`
      );
    } catch (error) {
      toast.error(error || "Failed to update status");
    }
  };

  const handleDelete = () => {
    if (selectedAdmin) {
      dispatch(deleteAdminUser(selectedAdmin._id));
      setShowDeleteModal(false);
      setSelectedAdmin(null);
    }
  };

  const handleModal = (admin) => {
    if (!isSuperAdmin) {
      toast.error("Only superadmin can delete staff members");
      return;
    }

    if (admin.role === "superadmin") {
      toast.error("Cannot delete superadmin");
      return;
    }

    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  const handleAdd = () => {
    if (!isSuperAdmin) {
      toast.error("Only superadmin can create staff members");
      return;
    }
    navigate("/create-new-admin");
  };

  const handleEditClick = (admin) => {
    if (!isSuperAdmin) {
      toast.error("Only superadmin can edit staff members");
      return;
    }

    if (admin.role === "superadmin") {
      toast.error("Cannot edit superadmin profile");
      return;
    }

    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  const handleRefresh = () => {
    dispatch(getAdminUsers());
    toast.success("Staff list refreshed");
  };

  // Filter and search functionality
  const filteredAdmins =
    adminsData?.filter((admin) => {
      const matchesSearch =
        admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && admin.is_active) ||
        (statusFilter === "inactive" && !admin.is_active);
      const matchesRole = roleFilter === "all" || admin.role === roleFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole &&
        admin._id !== userData?._id
      );
    }) || [];

  // Quick actions for superadmin
  const quickActions = [
    {
      label: "Create Staff",
      icon: <MdAdd className="w-4 h-4 sm:w-5 sm:h-5" />,
      onClick: handleAdd,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      label: "Refresh",
      icon: <MdRefresh className="w-4 h-4 sm:w-5 sm:h-5" />,
      onClick: handleRefresh,
      color: "bg-gray-600 hover:bg-gray-700",
    },
  ];

  // Mobile Filter Component
  const MobileFilters = () => (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 transition-all duration-300 ${
        showMobileFilters ? "block" : "hidden"
      }`}
    >
      <div className="space-y-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="seo">SEO Specialist</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
              Staff Management
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base break-words">
              {isSuperAdmin
                ? "Manage staff members and their permissions"
                : "View staff members in the system"}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`px-3 sm:px-4 py-2 text-white font-medium rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${action.color}`}
              >
                {action.icon}
                <span className="hidden xs:inline">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Staff
              </label>
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="sm:hidden">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filters
              </label>
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2 text-sm"
              >
                <MdFilterList className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>

            {/* Desktop Filters */}
            <div className="hidden sm:grid sm:grid-cols-2 gap-3 sm:gap-4 flex-1">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="superadmin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="seo">SEO Specialist</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
          <MobileFilters />
        </div>

        {/* Stats Summary */}
        {isSuperAdmin && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-medium text-gray-600">
                Total Staff
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {filteredAdmins.length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-medium text-gray-600">
                Active
              </div>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {filteredAdmins.filter((a) => a.is_active).length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-medium text-gray-600">
                Inactive
              </div>
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {filteredAdmins.filter((a) => !a.is_active).length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-medium text-gray-600">
                Admins
              </div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {filteredAdmins.filter((a) => a.role === "admin").length}
              </div>
            </div>
          </div>
        )}

        {/* Staff Table */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Mobile Card View */}
          <div className="sm:hidden">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="text-gray-500">
                  <svg
                    className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No staff members found
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    roleFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Get started by creating a new staff member."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <div
                    key={admin._id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {admin.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {admin.email}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                          admin.role === "superadmin"
                            ? "bg-purple-100 text-purple-800"
                            : admin.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {admin.role === "superadmin" && "Super Admin"}
                        {admin.role === "admin" && "Admin"}
                        {admin.role === "seo" && "SEO"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <button
                        onClick={() => handleStatusToggle(admin)}
                        disabled={!isSuperAdmin || admin.role === "superadmin"}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          admin.is_active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                      >
                        <MdCircle
                          className={`mr-1 w-2 h-2 ${
                            admin.is_active ? "text-green-500" : "text-red-500"
                          }`}
                        />
                        {admin.is_active ? "ACTIVE" : "SUSPENDED"}
                      </button>
                      <div className="text-xs text-gray-500">
                        Last:{" "}
                        {admin.last_login
                          ? new Date(admin.last_login).toLocaleDateString()
                          : "Never"}
                      </div>
                    </div>

                    {isSuperAdmin && (
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          Created:{" "}
                          {admin.created_at
                            ? new Date(admin.created_at).toLocaleDateString()
                            : "N/A"}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditClick(admin)}
                            disabled={admin.role === "superadmin"}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Edit Staff"
                          >
                            <MdEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleModal(admin)}
                            disabled={admin.role === "superadmin"}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Delete Staff"
                          >
                            <MdDelete className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-900">
                    Staff Member
                  </th>
                  <th className="py-3 px-4 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-900">
                    Role
                  </th>
                  <th className="py-3 px-4 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="py-3 px-4 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-900">
                    Last Active
                  </th>
                  {isSuperAdmin && (
                    <th className="py-3 px-4 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={isSuperAdmin ? 5 : 4}
                      className="px-4 sm:px-6 py-6"
                    >
                      <Stack spacing={2}>
                        {[...Array(5)].map((_, index) => (
                          <Skeleton key={index} variant="rounded" height={40} />
                        ))}
                      </Stack>
                    </td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isSuperAdmin ? 5 : 4}
                      className="px-4 sm:px-6 py-8 text-center"
                    >
                      <div className="text-gray-500">
                        <svg
                          className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No staff members found
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">
                          {searchTerm ||
                          statusFilter !== "all" ||
                          roleFilter !== "all"
                            ? "Try adjusting your filters"
                            : "Get started by creating a new staff member."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr
                      key={admin._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 sm:px-6">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            {admin.name}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate">
                            {admin.email}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Created:{" "}
                            {admin.created_at
                              ? new Date(admin.created_at).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 sm:px-6">
                        <span
                          className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                            admin.role === "superadmin"
                              ? "bg-purple-100 text-purple-800"
                              : admin.role === "admin"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {admin.role === "superadmin" && "Super Admin"}
                          {admin.role === "admin" && "Admin"}
                          {admin.role === "seo" && "SEO Specialist"}
                        </span>
                      </td>
                      <td className="py-3 px-4 sm:px-6">
                        <button
                          onClick={() => handleStatusToggle(admin)}
                          disabled={
                            !isSuperAdmin || admin.role === "superadmin"
                          }
                          className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                            admin.is_active
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                        >
                          <MdCircle
                            className={`mr-1 w-2 h-2 sm:w-3 sm:h-3 ${
                              admin.is_active
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          />
                          {admin.is_active ? "ACTIVE" : "SUSPENDED"}
                        </button>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-xs sm:text-sm text-gray-500">
                        {admin.last_login
                          ? new Date(admin.last_login).toLocaleDateString()
                          : "Never"}
                      </td>
                      {isSuperAdmin && (
                        <td className="py-3 px-4 sm:px-6">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <button
                              onClick={() => handleEditClick(admin)}
                              disabled={admin.role === "superadmin"}
                              className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              title="Edit Staff"
                            >
                              <MdEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleModal(admin)}
                              disabled={admin.role === "superadmin"}
                              className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              title="Delete Staff"
                            >
                              <MdDelete className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination (if needed in future) */}
        {filteredAdmins.length > 0 && (
          <div className="flex items-center justify-between mt-4 sm:mt-6">
            <div className="text-xs sm:text-sm text-gray-700">
              Showing {filteredAdmins.length} of {filteredAdmins.length} staff
              members
            </div>
            {/* Add pagination buttons here if needed */}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAdmin && (
        <Delete
          setModal={setShowDeleteModal}
          handleDelete={handleDelete}
          title="Delete Staff Member"
          message={`Are you sure you want to delete ${selectedAdmin.name}? This action cannot be undone.`}
        />
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedAdmin && (
        <UpdateAdminUser
          setModal={setShowEditModal}
          handleEdit={(formData) => {
            dispatch(
              editAdminUser({
                id: selectedAdmin._id,
                ...formData,
              })
            ).then((result) => {
              if (result.type === "staff/update/fulfilled") {
                toast.success("Staff member updated successfully");
                setShowEditModal(false);
                setSelectedAdmin(null);
                dispatch(getAdminUsers()); // Refresh the list
              }
            });
          }}
          staff={selectedAdmin}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default ViewAdminUsers;
