import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ClipLoader } from "react-spinners";
import { MdClose } from "react-icons/md";

const UpdateAdminUser = ({ setModal, handleEdit, staff, isLoading }) => {
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name: staff?.name || "",
      email: staff?.email || "",
      roleType: staff?.role || "admin",
      is_active: staff?.is_active ?? true,
    },
  });

  useEffect(() => {
    // Set form values from staff data
    if (staff) {
      setValue("name", staff.name || "");
      setValue("email", staff.email || "");
      setValue("roleType", staff.role || "admin");
      setValue("is_active", staff.is_active ?? true);
    }
  }, [staff, setValue]);

  const onSubmit = async (data) => {
    // Validate passwords if changing
    if (showPasswordFields && data.password) {
      if (data.password !== data.confirmPassword) {
        // You can use toast here or set an error state
        alert("Passwords do not match");
        return;
      }
    }

    const payload = {
      name: data.name,
      email: data.email,
      roleType: data.roleType,
      is_active: data.is_active,
    };

    // Only include password if changed
    if (showPasswordFields && data.password) {
      payload.password = data.password;
    }

    handleEdit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 backdrop-blur-xs bg-opacity-50 transition-opacity"
        onClick={() => setModal(false)}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Update Staff Member
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Update details for {staff?.name}
              </p>
            </div>
            <button
              onClick={() => setModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <MdClose className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register("name", { 
                      required: "Name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters"
                      }
                    })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Role and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Role Type *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start p-3 sm:p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        {...register("roleType", {
                          required: "Role type is required",
                        })}
                        type="radio"
                        value="admin"
                        className="mt-1 accent-blue-600"
                        disabled={isLoading}
                      />
                      <div className="ml-3">
                        <span className="font-medium text-gray-900 text-sm sm:text-base">
                          Admin
                        </span>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          Full administrative access
                        </p>
                      </div>
                    </label>
                    
                    <label className="flex items-start p-3 sm:p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        {...register("roleType", {
                          required: "Role type is required",
                        })}
                        type="radio"
                        value="seo"
                        className="mt-1 accent-blue-600"
                        disabled={isLoading}
                      />
                      <div className="ml-3">
                        <span className="font-medium text-gray-900 text-sm sm:text-base">
                          SEO Specialist
                        </span>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          Content and SEO management
                        </p>
                      </div>
                    </label>
                  </div>
                  {errors.roleType && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">
                      {errors.roleType.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Status *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 sm:p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        value="true"
                        {...register("is_active")}
                        className="accent-green-600"
                        disabled={isLoading}
                        onChange={(e) => setValue("is_active", true)}
                      />
                      <div className="ml-3">
                        <span className="font-medium text-gray-900 text-sm sm:text-base">
                          Active
                        </span>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          User can access the system
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center p-3 sm:p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        value="false"
                        {...register("is_active")}
                        className="accent-red-600"
                        disabled={isLoading}
                        onChange={(e) => setValue("is_active", false)}
                      />
                      <div className="ml-3">
                        <span className="font-medium text-gray-900 text-sm sm:text-base">
                          Suspended
                        </span>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          User access is blocked
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Password Update Section */}
              <div className="border-t pt-6">
                {!showPasswordFields ? (
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(true)}
                    className="px-4 py-2 text-sm sm:text-base text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    disabled={isLoading}
                  >
                    Change Password
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                        Change Password
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordFields(false);
                          setValue("password", "");
                          setValue("confirmPassword", "");
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          {...register("password", {
                            minLength: {
                              value: 6,
                              message: "Password must be at least 6 characters"
                            }
                          })}
                          type="password"
                          placeholder="Enter new password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                          disabled={isLoading}
                        />
                        {errors.password && (
                          <p className="text-red-600 text-xs sm:text-sm mt-1">
                            {errors.password.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <input
                          {...register("confirmPassword")}
                          type="password"
                          placeholder="Confirm new password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={() => setModal(false)}
                disabled={isLoading}
                className="w-full sm:flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !isDirty}
                className="w-full sm:flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <ClipLoader color="#ffffff" size={20} className="mr-2" />
                    <span>Updating...</span>
                  </>
                ) : (
                  "Update Staff Member"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateAdminUser;