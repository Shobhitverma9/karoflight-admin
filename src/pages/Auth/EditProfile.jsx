import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { ClipLoader } from "react-spinners";
import { editAdminUser } from "../../features/action/auth";
import { clearReduxStore } from "../../features/slices/auth";

const EditProfile = () => {
  const dispatch = useDispatch();
  const { userData, adminsData, isLoading } = useSelector((state) => state.auth);

  // 👇 show/hide password fields
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: userData?.name || "",
      email: userData?.email || ""
    },
  });

  const onSubmit = (data) => {
    // ✅ If password fields are shown, validate them
    if (showPasswordFields) {
      if (!data.password) {
        setError("password", {
          type: "manual",
          message: "Password is required",
        });
        return;
      }
      if (data.password !== data.confirmPassword) {
        setError("confirmPassword", {
          type: "manual",
          message: "Passwords do not match",
        });
        return;
      }
    }

    dispatch(
      editAdminUser({
        id: userData?._id,
        ...data,
        ...(showPasswordFields ? { password: data.password } : {}), // 👈 only send if updated
      })
    );
  };

  useEffect(() => {
    if (adminsData?.status) {
      dispatch(clearReduxStore())
    }
  }, [adminsData])

  return (
    <div>
      <div className="text-gray-600">
        <div className="flex justify-center">
          <h3 className="text-[#0A0A4A] text-2xl font-semibold sm:text-3xl">
            Update Admin Details
          </h3>
        </div>
        <div className="bg-white rounded-lg shadow p-4 py-6 sm:rounded-lg sm:max-w-5xl mt-8 mx-auto">
          <form
            className="space-y-6 mx-8 sm:mx-2"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Row 1: Name + Email */}
            <div className="sm:flex space-y-6 sm:space-y-0 justify-between gap-10">
              <div className="w-full">
                <label className="font-medium text-[#0A0A4A]">Name</label>
                <input
                  {...register("name", { required: "Name is required" })}
                  type="text"
                  className="w-full mt-2 px-5 py-2 border-[#808080] bg-transparent outline-none border focus:border-[#FF671F] shadow-sm rounded-lg"
                />
                <span className="text-[#FF671F]">{errors?.name?.message}</span>
              </div>

              <div className="w-full">
                <label className="font-medium text-[#0A0A4A]">Email</label>
                <input
                  {...register("email", { required: "Email is required" })}
                  type="email"
                  className="w-full mt-2 px-5 py-2 border-[#808080] bg-transparent outline-none border focus:border-[#FF671F] shadow-sm rounded-lg"
                />
                <span className="text-[#FF671F]">{errors?.email?.message}</span>
              </div>
            </div>

            {/* Change Password Button */}
            <div className="mt-6">
              {!showPasswordFields ? (
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(true)}
                  className="px-4 py-2 text-[#0A0A4A] border border-[#0A0A4A] rounded-lg hover:bg-[#0A0A4A] hover:text-white transition-colors duration-200"
                >
                  Change Password
                </button>
              ) : (
                <>
                  <div className="sm:flex space-y-6 sm:space-y-0 justify-between gap-10">
                    <div className="w-full">
                      <label className="font-medium text-[#0A0A4A]">New Password</label>
                      <div className="relative">
                        <input
                          {...register("password")}
                          type={showPassword ? "text" : "password"}
                          className="w-full mt-2 px-5 py-2 pr-12 border-[#808080] bg-transparent outline-none border focus:border-[#FF671F] shadow-sm rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 mt-1 text-[#808080] hover:text-[#0A0A4A] transition-colors"
                        >
                          {showPassword ? (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      <span className="text-[#FF671F]">
                        {errors?.password?.message}
                      </span>
                    </div>
                    <div className="w-full">
                      <label className="font-medium text-[#0A0A4A]">Confirm Password</label>
                      <div className="relative">
                        <input
                          {...register("confirmPassword")}
                          type={showConfirmPassword ? "text" : "password"}
                          className="w-full mt-2 px-5 py-2 pr-12 border-[#808080] bg-transparent outline-none border focus:border-[#FF671F] shadow-sm rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 mt-1 text-[#808080] hover:text-[#0A0A4A] transition-colors"
                        >
                          {showConfirmPassword ? (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      <span className="text-[#FF671F]">
                        {errors?.confirmPassword?.message}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Submit */}
            <div style={{ marginTop: "2rem" }}>
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-[#FF671F] font-medium hover:bg-[#e55a1a] active:bg-[#cc4e15] rounded-lg duration-150 transition-colors"
              >
                {isLoading ? <ClipLoader color="#FFFFFF" size={20} /> : <>Update</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;