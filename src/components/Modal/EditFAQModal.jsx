import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiX, FiPlus, FiTrash2, FiSave } from "react-icons/fi";
import Swal from "sweetalert2";

export default function EditFAQModal({ isOpen, onClose, faqData, onUpdate }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.faq);

  const [formData, setFormData] = useState({
    pageSlugs: [""],
    status: "draft",
    faqs: [{ question: "", answer: "" }],
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && faqData) {
      setFormData({
        pageSlugs: faqData.pageSlugs?.length > 0 ? [...faqData.pageSlugs] : [""],
        status: faqData.status || "draft",
        faqs: faqData.faqs?.length > 0 
          ? faqData.faqs.map(f => ({ question: f.question, answer: f.answer, _id: f._id }))
          : [{ question: "", answer: "" }],
      });
      setValidationErrors({});
    }
  }, [isOpen, faqData]);

  // Handle page slug changes
  const handlePageSlugChange = (index, value) => {
    const newPageSlugs = [...formData.pageSlugs];
    newPageSlugs[index] = value;
    setFormData({ ...formData, pageSlugs: newPageSlugs });

    if (validationErrors[`pageSlug${index}`]) {
      const newErrors = { ...validationErrors };
      delete newErrors[`pageSlug${index}`];
      setValidationErrors(newErrors);
    }
  };

  const addPageSlug = () =>
    setFormData({ ...formData, pageSlugs: [...formData.pageSlugs, ""] });

  const removePageSlug = async (index) => {
    if (formData.pageSlugs.length > 1) {
      const result = await Swal.fire({
        title: "Remove this slug?",
        text: "Are you sure you want to remove this page slug?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DC2626",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, remove it",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        setFormData({
          ...formData,
          pageSlugs: formData.pageSlugs.filter((_, i) => i !== index),
        });
      }
    }
  };

  // Handle FAQ item changes
  const handleFAQChange = (index, field, value) => {
    const newFAQs = [...formData.faqs];
    newFAQs[index][field] = value;
    setFormData({ ...formData, faqs: newFAQs });

    if (validationErrors[`faq${index}${field}`]) {
      const newErrors = { ...validationErrors };
      delete newErrors[`faq${index}${field}`];
      setValidationErrors(newErrors);
    }
  };

  const addFAQItem = () =>
    setFormData({
      ...formData,
      faqs: [...formData.faqs, { question: "", answer: "" }],
    });

  const removeFAQItem = async (index) => {
    if (formData.faqs.length > 1) {
      const result = await Swal.fire({
        title: "Remove this question?",
        text: "Are you sure you want to remove this FAQ item?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DC2626",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, remove it",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        setFormData({
          ...formData,
          faqs: formData.faqs.filter((_, i) => i !== index),
        });
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    formData.pageSlugs.forEach((slug, index) => {
      if (!slug.trim()) errors[`pageSlug${index}`] = "Page slug is required";
    });

    formData.faqs.forEach((faq, index) => {
      if (!faq.question.trim())
        errors[`faq${index}question`] = "Question is required";
      if (!faq.answer.trim())
        errors[`faq${index}answer`] = "Answer is required";
    });

    return { isValid: Object.keys(errors).length === 0, errors };
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors } = validateForm();

    if (!isValid) {
      setValidationErrors(errors);
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill in all required fields correctly.",
        confirmButtonColor: "#DC2626",
      });
      return;
    }

    setValidationErrors({});

    const result = await Swal.fire({
      title: "Update FAQ?",
      html: `Are you sure you want to update this FAQ?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563EB",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      const updatedData = {
        pageSlugs: formData.pageSlugs.filter((slug) => slug.trim()),
        faqs: formData.faqs.filter(
          (faq) => faq.question.trim() && faq.answer.trim()
        ),
        status: formData.status,
      };

      // Call the onUpdate callback with the updated data
      onUpdate(faqData._id, updatedData);
    }
  };

  // Handle close with unsaved changes
  const handleClose = async () => {
    // Check if there are changes
    const hasChanges =
      JSON.stringify(formData.pageSlugs) !== JSON.stringify(faqData.pageSlugs) ||
      formData.status !== faqData.status ||
      JSON.stringify(formData.faqs) !== JSON.stringify(faqData.faqs);

    if (hasChanges) {
      const result = await Swal.fire({
        title: "Discard changes?",
        text: "You have unsaved changes. Are you sure you want to close?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DC2626",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, discard",
        cancelButtonText: "Keep editing",
      });

      if (result.isConfirmed) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit FAQ</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Page Slugs */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Page Slugs</h3>
              <button
                type="button"
                onClick={addPageSlug}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                <FiPlus size={16} />
                Add Slug
              </button>
            </div>
            <div className="space-y-3">
              {formData.pageSlugs.map((slug, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => handlePageSlugChange(index, e.target.value)}
                      placeholder="e.g., home, about, contact"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors[`pageSlug${index}`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {validationErrors[`pageSlug${index}`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors[`pageSlug${index}`]}
                      </p>
                    )}
                  </div>
                  {formData.pageSlugs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePageSlug(index)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Status</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={formData.status === "draft"}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">Draft</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={formData.status === "published"}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">Published</span>
              </label>
            </div>
          </div>

          {/* FAQ Items */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Questions & Answers
              </h3>
              <button
                type="button"
                onClick={addFAQItem}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                <FiPlus size={16} />
                Add Question
              </button>
            </div>
            <div className="space-y-4">
              {formData.faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">
                      Question {index + 1}
                    </h4>
                    {formData.faqs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFAQItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question
                      </label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) =>
                          handleFAQChange(index, "question", e.target.value)
                        }
                        placeholder="Enter your question"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors[`faq${index}question`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {validationErrors[`faq${index}question`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors[`faq${index}question`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Answer
                      </label>
                      <textarea
                        value={faq.answer}
                        onChange={(e) =>
                          handleFAQChange(index, "answer", e.target.value)
                        }
                        placeholder="Enter your answer"
                        rows={3}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors[`faq${index}answer`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {validationErrors[`faq${index}answer`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors[`faq${index}answer`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-4 justify-end p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Updating...
              </>
            ) : (
              <>
                <FiSave size={18} />
                Update FAQ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}