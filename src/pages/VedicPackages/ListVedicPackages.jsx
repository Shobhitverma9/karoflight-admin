import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../../services/axiosInterceptor';
import { Stack, Skeleton } from '@mui/material';

const ListVedicPackages = () => {
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const fetchPackages = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/admin/vedic-packages');
            setPackages(res.data.data || []);
        } catch (err) {
            console.error('Error fetching packages:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleDelete = async () => {
        try {
            await api.delete(`/admin/vedic-packages/${deleteId}`);
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchPackages();
        } catch (err) {
            console.error('Delete Error:', err);
        }
    };

    const handleToggleActive = async (pkg) => {
        try {
            const formData = new FormData();
            formData.append('title', pkg.title);
            formData.append('description', pkg.description);
            formData.append('redirectUrl', pkg.redirectUrl);
            formData.append('isActive', String(!pkg.isActive));
            await api.put(`/admin/vedic-packages/${pkg._id}`, formData);
            fetchPackages();
        } catch (err) {
            console.error('Toggle Error:', err);
        }
    };

    return (
        <>
            <div className="max-w-screen-xl mx-auto px-4 md:px-8 text-sm">
                <div className="items-start justify-between md:flex">
                    <div className="max-w-lg">
                        <h3 className="text-gray-800 text-xl font-bold sm:text-2xl">
                            Vedic Wanderers Packages
                        </h3>
                        <p className="text-gray-600 mt-2">
                            Manage external Vedic travel packages displayed on the homepage.
                        </p>
                    </div>
                    <div className="mt-3 md:mt-0">
                        <button
                            onClick={() => navigate('/vedic-packages/create')}
                            className="inline-block px-4 py-2 text-white duration-150 font-medium bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-700 md:text-sm"
                        >
                            + Add Package
                        </button>
                    </div>
                </div>

                <div className="mt-5 shadow-sm border rounded-lg overflow-x-auto">
                    <table className="w-full table-auto text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                            <tr>
                                <th className="py-3 px-6">#</th>
                                <th className="py-3 px-6">Image</th>
                                <th className="py-3 px-6">Title</th>
                                <th className="py-3 px-6">Description</th>
                                <th className="py-3 px-6">Redirect URL</th>
                                <th className="py-3 px-6">Active</th>
                                <th className="py-3 px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 divide-y">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="text-center px-6 py-8">
                                        <Stack spacing={4}>
                                            <Skeleton variant="rounded" height={30} />
                                            <Skeleton variant="rounded" height={25} />
                                            <Skeleton variant="rounded" height={20} />
                                        </Stack>
                                    </td>
                                </tr>
                            ) : packages.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center px-6 py-8 text-gray-400">
                                        No packages found. Create your first one!
                                    </td>
                                </tr>
                            ) : (
                                packages.map((pkg, idx) => (
                                    <tr key={pkg._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{idx + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <img
                                                src={pkg.imageUrl}
                                                alt={pkg.title}
                                                className="w-24 h-16 rounded-lg object-cover"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{pkg.title}</td>
                                        <td className="px-6 py-4 max-w-xs truncate">{pkg.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <a
                                                href={pkg.redirectUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-indigo-600 hover:underline"
                                            >
                                                {pkg.redirectUrl.length > 30
                                                    ? pkg.redirectUrl.slice(0, 30) + '...'
                                                    : pkg.redirectUrl}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleActive(pkg)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${pkg.isActive
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {pkg.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() =>
                                                    navigate('/vedic-packages/create', { state: pkg })
                                                }
                                                className="py-2 px-3 font-semibold text-green-500 hover:text-green-600 duration-150 hover:bg-gray-50 rounded-lg"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDeleteId(pkg._id);
                                                    setShowDeleteModal(true);
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Package?</h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            This action cannot be undone. The package will be permanently removed from the homepage.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteId(null);
                                }}
                                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ListVedicPackages;
