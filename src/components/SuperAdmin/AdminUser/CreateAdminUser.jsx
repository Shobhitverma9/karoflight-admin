import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { createAdminUser } from "../../../features/action/auth";
import { toast } from "react-hot-toast";

const CreateAdminUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, userData } = useSelector((state) => state.auth);

  // Check if current user is superadmin
  const isSuperAdmin = userData?.role === "superadmin";

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
    setValue
  } = useForm({
    mode: "onChange",
    defaultValues: {
      role: "admin", // Changed from roleType to role
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      suspended: false
    }
  });

  const selectedRole = watch("role");
  const firstName = watch("first_name");
  const lastName = watch("last_name");
  const email = watch("email");

  // Auto-generate username from first name and last name
  useEffect(() => {
    if (firstName && lastName) {
      const generatedUsername = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
      setValue("username", generatedUsername);
    }
  }, [firstName, lastName, setValue]);

  // Auto-generate username from email if no name provided
  useEffect(() => {
    if (email && !firstName && !lastName) {
      const usernameFromEmail = email.split('@')[0];
      setValue("username", usernameFromEmail);
    }
  }, [email, firstName, lastName, setValue]);

  useEffect(() => {
    // Redirect if not superadmin
    if (!isSuperAdmin) {
      toast.error("Access denied. Superadmin privileges required.");
      navigate("/admins");
    }
  }, [isSuperAdmin, navigate]);

  const onSubmit = async (data) => {
    if (!isSuperAdmin) {
      toast.error("Only superadmin can create staff members");
      return;
    }

    // Ensure username is properly formatted
    const finalData = {
      ...data,
      username: data.username.toLowerCase().replace(/\s+/g, '.')
    };

    const result = await dispatch(createAdminUser(finalData));
    
    if (result.type === "staff/create/fulfilled") {
      toast.success("Staff member created successfully");
      reset();
      navigate("/admins");
    }
  };

  // Don't render form if not superadmin
  if (!isSuperAdmin) {
    return (
      <div className="flex justify-center items-center h-64 p-4">
        <div className="text-center">
          <ClipLoader size={40} />
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center break-words">
          Create New Staff Member
        </h1>
        <p className="text-gray-600 text-center mt-2 text-sm sm:text-base break-words">
          Add new staff members to the admin panel
        </p>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          {/* Personal Information Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                {...register("first_name", { 
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "First name must be at least 2 characters"
                  },
                  pattern: {
                    value: /^[a-zA-Z\s]{2,}$/,
                    message: "First name can only contain letters and spaces"
                  }
                })}
                type="text"
                placeholder="Enter first name"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                disabled={isLoading}
              />
              {errors.first_name && (
                <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                {...register("last_name", { 
                  required: "Last name is required",
                  minLength: {
                    value: 1,
                    message: "Last name is required"
                  },
                  pattern: {
                    value: /^[a-zA-Z\s]{1,}$/,
                    message: "Last name can only contain letters and spaces"
                  }
                })}
                type="text"
                placeholder="Enter last name"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                disabled={isLoading}
              />
              {errors.last_name && (
                <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Username and Email Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                {...register("username", { 
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters"
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9._]+$/,
                    message: "Username can only contain letters, numbers, dots and underscores"
                  }
                })}
                type="text"
                placeholder="Enter username"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.username.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Username will be auto-generated from first and last name
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                type="email"
                placeholder="Enter email address"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Role and Security Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Role Type *
              </label>
              <div className="space-y-2 sm:space-y-3">
                <label className="flex items-start p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    {...register("role", {
                      required: "Role type is required",
                    })}
                    type="radio"
                    value="admin"
                    className="mt-0.5 sm:mt-1 accent-blue-600 flex-shrink-0"
                    disabled={isLoading}
                  />
                  <div className="ml-2 sm:ml-3 min-w-0">
                    <span className="font-medium text-gray-900 text-sm sm:text-base">Admin</span>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
                      Manage bookings, content, and reports
                    </p>
                  </div>
                </label>
                
                <label className="flex items-start p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    {...register("role", {
                      required: "Role type is required",
                    })}
                    type="radio"
                    value="seo"
                    className="mt-0.5 sm:mt-1 accent-blue-600 flex-shrink-0"
                    disabled={isLoading}
                  />
                  <div className="ml-2 sm:ml-3 min-w-0">
                    <span className="font-medium text-gray-900 text-sm sm:text-base">SEO Specialist</span>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
                      Manage blogs, newsletters, and SEO content
                    </p>
                  </div>
                </label>
              </div>
              {errors.role && (
                <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.role.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 4,
                    message: "Password must be at least 6 characters"
                  },
                  // pattern: {
                  //   value: /^(?=.*[a-zA-Z])(?=.*\d)/,
                  //   message: "Password should contain both letters and numbers"
                  // }
                })}
                type="password"
                placeholder="Enter secure password"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.password.message}</p>
              )}
              
              <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 sm:p-3 rounded-lg">
                <p className="font-medium mb-1 sm:mb-2">Password Requirements:</p>
                <ul className="space-y-1">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 flex-shrink-0"></span>
                    <span>At least 6 characters</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 flex-shrink-0"></span>
                    <span>Mix of letters and numbers</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
            <label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
              <input
                {...register("suspended")}
                type="checkbox"
                className="w-4 h-4 accent-red-600 mt-0.5 flex-shrink-0"
                disabled={isLoading}
              />
              <div className="min-w-0">
                <span className="font-medium text-gray-900 text-sm sm:text-base">Suspend Account</span>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
                  User will not be able to login until activated
                </p>
              </div>
            </label>
          </div>

          {/* Role Information */}
          {selectedRole && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <h4 className="font-semibold text-blue-900 mb-2 sm:mb-3 text-sm sm:text-base">
                {selectedRole === "admin" && "Admin Permissions"}
                {selectedRole === "seo" && "SEO Specialist Permissions"}
              </h4>
              <ul className="text-xs sm:text-sm text-blue-800 space-y-1 sm:space-y-2">
                {selectedRole === "admin" && (
                  <>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 sm:mr-3 mt-1 flex-shrink-0"></span>
                      <span>Booking and reservation management</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 sm:mr-3 mt-1 flex-shrink-0"></span>
                      <span>Room and category management</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 sm:mr-3 mt-1 flex-shrink-0"></span>
                      <span>Financial reports and analytics</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 sm:mr-3 mt-1 flex-shrink-0"></span>
                      <span>User and content management</span>
                    </li>
                  </>
                )}
                {selectedRole === "seo" && (
                  <>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 sm:mr-3 mt-1 flex-shrink-0"></span>
                      <span>Blog and article management</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 sm:mr-3 mt-1 flex-shrink-0"></span>
                      <span>Newsletter creation and distribution</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 sm:mr-3 mt-1 flex-shrink-0"></span>
                      <span>SEO optimization and analytics</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 sm:mr-3 mt-1 flex-shrink-0"></span>
                      <span>FAQ and content management</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col xs:flex-row gap-3 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/admins")}
              disabled={isLoading}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm sm:text-base order-2 xs:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm sm:text-base order-1 xs:order-2"
            >
              {isLoading ? (
                <>
                  <ClipLoader color="#ffffff" size={16} className="mr-2" />
                  <span>Creating...</span>
                </>
              ) : (
                "Create Staff Member"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdminUser;