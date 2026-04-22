import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { api } from '../../services/axiosInterceptor';

const CreateVedicPackage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const existingData = location.state; // will be set when editing

    const isEdit = !!existingData;

    const [form, setForm] = useState({
        title: existingData?.title || '',
        description: existingData?.description || '',
        redirectUrl: existingData?.redirectUrl || '',
        isActive: existingData?.isActive !== undefined ? existingData.isActive : true,
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(existingData?.imageUrl || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.title || !form.description || !form.redirectUrl) {
            setError('All fields are required.');
            return;
        }
        if (!isEdit && !imageFile) {
            setError('Please upload an image.');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('redirectUrl', form.redirectUrl);
            formData.append('isActive', String(form.isActive));
            if (imageFile) {
                formData.append('image', imageFile);
            }

            if (isEdit) {
                await api.put(`/admin/vedic-packages/${existingData._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await api.post('/admin/vedic-packages', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            navigate('/vedic-packages');
        } catch (err) {
            console.error('Submit Error:', err);
            setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-6">
            <div className="mb-6">
                <h3 className="text-gray-800 text-xl font-bold sm:text-2xl">
                    {isEdit ? 'Edit Vedic Package' : 'Create New Vedic Package'}
                </h3>
                <p className="text-gray-500 mt-1 text-sm">
                    {isEdit
                        ? 'Update the details of this Vedic Wanderers package.'
                        : 'Add a new Vedic travel package card for the website homepage.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm p-6 space-y-5">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                        {error}
                    </div>
                )}

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g. Char Dham Yatra 2025"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="A short description of the Vedic travel package..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                    />
                </div>

                {/* Redirect URL */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Package Link (Outbound URL) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="url"
                        name="redirectUrl"
                        value={form.redirectUrl}
                        onChange={handleChange}
                        placeholder="https://vedicwanderers.com/package-name"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <p className="text-xs text-gray-400 mt-1">This link will open in a new tab when the user clicks the card.</p>
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Package Image {!isEdit && <span className="text-red-500">*</span>}
                    </label>
                    <div className="flex items-start gap-4">
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-32 h-24 rounded-lg object-cover border"
                            />
                        )}
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Recommended: 4:3 ratio, min 600×400px. {isEdit && 'Leave empty to keep current image.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={form.isActive}
                        onChange={handleChange}
                        className="w-4 h-4 accent-indigo-600"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                        Show this package on the homepage (Active)
                    </label>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm disabled:opacity-60"
                    >
                        {isSubmitting ? 'Saving...' : isEdit ? 'Update Package' : 'Create Package'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/vedic-packages')}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateVedicPackage;
