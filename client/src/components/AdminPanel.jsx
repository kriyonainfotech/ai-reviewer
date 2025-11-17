import React, { useState, useEffect, useMemo, useCallback, Fragment } from 'react';
import axios from 'axios';
import { Icons } from '../components/Icons';

// Set up a pre-configured axios instance
// This is perfect. It uses localhost for dev and proxy for production.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : 'http://localhost:5000',
    // We will set Content-Type in the functions themselves
});

// V2 Toast function
function toast(msg, type = 'default') {
    // This function will work now because the .toast styles
    // are in your index.css file.
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    let icon = '';
    if (type === 'success') {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'error') {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    }
    t.innerHTML = `${icon} <span>${msg}</span>`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
}

// --- Reusable Button Component ---
const Button = ({ onClick, children, variant = 'primary', type = 'button', className = '' }) => {
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        outline: 'bg-transparent hover:bg-gray-800 text-gray-300 border border-gray-700',
        ghost: 'bg-transparent hover:bg-gray-700 text-gray-300'
    };
    return (
        <button
            type={type}
            onClick={onClick}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

// --- Admin Header ---
const Header = ({ view, showCreateForm, showList }) => (
    <div className="bg-gray-900 shadow-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <h1 className="text-xl font-bold text-white tracking-tight">
                    Review Booster Admin
                </h1>
                {view === 'list' && (
                    <Button onClick={showCreateForm} variant="primary">
                        <Icons.Plus /> New Client
                    </Button>
                )}
                {view !== 'list' && (
                    <Button onClick={showList} variant="outline">
                        <Icons.Back /> Back to List
                    </Button>
                )}
            </div>
        </div>
    </div>
);

// --- Form Card Wrapper ---
const FormCard = ({ title, children }) => (
    <div className="bg-gray-900 shadow-lg rounded-lg max-w-2xl mx-auto border border-gray-700">
        <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);


// --- Client Form Component ---
// UPDATED: Added reviewFile and setReviewFile props
const ClientForm = React.memo(({ onSubmit, isEdit = false, form, handleFormChange, jsonFiles, showList, reviewFile, setReviewFile }) => (
    <div className="bg-gray-900 shadow-xl rounded-2xl max-w-4xl mx-auto border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h2 className="text-xl font-bold">
                {isEdit ? `Edit Client` : `Create New Client`}
            </h2>
            <p className="text-sm opacity-80 mt-1">
                {isEdit ? 'Update client details below' : 'Fill required fields to continue'}
            </p>
        </div>

        {/* UPDATED: encType is required for file uploads */}
        <form onSubmit={onSubmit} className="p-8 space-y-10" encType="multipart/form-data">
            {/* TWO COLUMN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* LEFT */}
                <div className="space-y-6">
                    {/* CLIENT ID */}
                    <div>
                        <label className="text-sm font-semibold text-gray-300">Client ID</label>
                        <input
                            type="text"
                            name="clientId"
                            value={form.clientId}
                            disabled={isEdit}
                            onChange={handleFormChange}
                            className="mt-2 w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white placeholder-gray-400"
                            placeholder="unique-business-id"
                        />
                        {isEdit && (
                            <p className="text-xs text-gray-400 mt-1">Cannot be changed after creation</p>
                        )}
                    </div>
                    {/* CLIENT NAME */}
                    <div>
                        <label className="text-sm font-semibold text-gray-300">Client Name</label>
                        <input
                            type="text"
                            name="clientName"
                            value={form.clientName}
                            onChange={handleFormChange}
                            className="mt-2 w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white placeholder-gray-400"
                            placeholder="Business Name"
                            required
                        />
                    </div>
                    {/* GOOGLE LINK */}
                    <div>
                        <label className="text-sm font-semibold text-gray-300">Google Review Link</label>
                        <input
                            type="url"
                            name="googleReviewLink"
                            value={form.googleReviewLink}
                            onChange={handleFormChange}
                            className="mt-2 w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white placeholder-gray-400"
                            placeholder="https://g.page/r/..."
                            required
                        />
                    </div>
                    {/* LOGO URL */}
                    <div>
                        <label className="text-sm font-semibold text-gray-300">Logo URL</label>
                        <input
                            type="url"
                            name="logoUrl"
                            value={form.logoUrl}
                            onChange={handleFormChange}
                            className="mt-2 w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white placeholder-gray-400"
                            placeholder="https://.../logo.png"
                        />
                    </div>
                </div>
                {/* RIGHT */}
                <div className="space-y-6">
                    {/* SOURCE FILE UPLOAD */}
                    {!isEdit && (
                        <>
                            <div>
                                <label className="text-sm font-semibold text-gray-300">Initial Reviews (Option 1: Select)</label>
                                <select
                                    name="sourceReviewFile"
                                    value={form.sourceReviewFile}
                                    onChange={handleFormChange}
                                    disabled={!!reviewFile} // Disable if a file is uploaded
                                    className="mt-2 w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white disabled:opacity-50"
                                >
                                    <option value="">-- Select from /data --</option>
                                    {jsonFiles.map(file => (
                                        <option key={file} value={file}>{file}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="text-center text-gray-400 text-sm font-bold">OR</div>

                            <div>
                                <label className="text-sm font-semibold text-gray-300">Initial Reviews (Option 2: Upload)</label>
                                <input
                                    type="file"
                                    name="reviewFile"
                                    accept=".json"
                                    // UPDATED: This is the correct file handling logic
                                    onChange={(e) => {
                                        setReviewFile(e.target.files[0] || null);
                                    }}
                                    disabled={!!form.sourceReviewFile} // Disable if dropdown is selected
                                    className="mt-2 block w-full text-sm text-gray-400
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-600 file:text-white
                                        hover:file:bg-blue-700
                                        disabled:opacity-50"
                                />
                                {reviewFile && (
                                    <p className="text-green-400 text-sm mt-2">File selected: {reviewFile.name} ✓</p>
                                )}
                            </div>
                        </>
                    )}

                    {/* COLOR PICKERS */}
                    <div>
                        <label className="text-sm font-semibold text-gray-300">Brand Colors</label>
                        <div className="grid grid-cols-2 gap-6 mt-2">
                            <div>
                                <span className="text-xs text-gray-400">Primary (Button)</span>
                                <input
                                    type="color"
                                    name="primaryColor"
                                    value={form.primaryColor}
                                    onChange={handleFormChange}
                                    className="w-full h-12 rounded-lg border-gray-600"
                                />
                            </div>
                            <div>
                                <span className="text-xs text-gray-400">Secondary (Text)</span>
                                <input
                                    type="color"
                                    name="secondaryColor"
                                    value={form.secondaryColor}
                                    onChange={handleFormChange}
                                    className="w-full h-12 rounded-lg border-gray-600"
                                />
                            </div>
                        </div>
                    </div>
                    {/* LIVE PREVIEW */}
                    <div className="mt-4">
                        <label className="text-sm font-semibold text-gray-300">Preview Button</label>
                        <div className="mt-4 flex justify-center">
                            <button
                                type="button"
                                className="px-6 py-3 rounded-xl font-semibold shadow-lg"
                                style={{
                                    background: form.primaryColor,
                                    color: form.secondaryColor
                                }}
                            >
                                COPY REVIEW
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* FOOTER BUTTONS */}
            <div className="flex justify-end gap-4 pt-8 border-t border-gray-700">
                <button
                    type="button"
                    onClick={showList}
                    className="px-6 py-3 rounded-lg border border-gray-700 bg-gray-700 hover:bg-gray-600 text-white"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-3 rounded-lg text-white font-semibold shadow bg-blue-600 hover:bg-blue-700"
                >
                    {isEdit ? "Update Client" : "Create Client"}
                </button>
            </div>
        </form>
    </div>
));

// --- Client List Component ---
// UPDATED: Added Array.isArray check to prevent crash on load
const ClientList = ({
    loading,
    error,
    clients = [],
    showReviewManager,
    handleDownloadQR,
    showEditForm,
    handleDeleteClient
}) => (
    <div className="bg-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-700">
        <div className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-white">All Clients</h2>
        </div>

        {loading && <p className="p-6 text-gray-300">Loading clients...</p>}
        {error && <p className="p-6 text-red-400">{error}</p>}

        <div className="border-t border-gray-700">
            {!loading && Array.isArray(clients) && clients.length === 0 && (
                <p className="text-gray-400 text-center py-10">
                    No clients found. Click "+ New Client" to get started.
                </p>
            )}

            <ul className="divide-y divide-gray-700">
                {Array.isArray(clients) && clients.map(client => (
                    <li key={client.clientId} className="p-4 sm:p-6 hover:bg-gray-800">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-blue-400">{client.clientName}</h3>
                                <p className="text-sm text-gray-400 mt-1">ID: {client.clientId}</p>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                                <Button onClick={() => showReviewManager(client)} variant="ghost" className="text-green-400 hover:bg-green-900/50">
                                    <Icons.Reviews /> <span className="hidden sm:inline">Reviews</span>
                                </Button>

                                <Button onClick={() => handleDownloadQR(client.clientId)} variant="ghost" className="text-blue-400 hover:bg-blue-900/50">
                                    <Icons.QR /> <span className="hidden sm:inline">QR</span>
                                </Button>

                                <Button onClick={() => showEditForm(client)} variant="ghost" className="text-yellow-400 hover:bg-yellow-900/50">
                                    <Icons.Edit /> <span className="hidden sm:inline">Edit</span>
                                </Button>

                                <Button onClick={() => handleDeleteClient(client.clientId)} variant="ghost" className="text-red-400 hover:bg-red-900/50">
                                    <Icons.Trash /> <span className="hidden sm:inline">Delete</span>
                                </Button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);


// --- Review Manager Component ---
const ReviewManager = ({ currentClient, handleAddReview, reviewForm, setReviewForm, clientReviews, handleDeleteReview }) => (
    <FormCard title={`Manage Reviews for: ${currentClient.clientName}`}>
        <form onSubmit={handleAddReview} className="mb-6 pb-6 border-b border-gray-700">
            <label className="block text-sm font-medium text-gray-300">Add New Review</label>
            <textarea
                value={reviewForm.newReview}
                onChange={(e) => setReviewForm({ newReview: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm sm:text-sm placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="e.g., Fantastic service and great results!"
            ></textarea>
            <Button type="submit" variant="primary" className="mt-3">
                Add Review
            </Button>
        </form>
        <h3 className="text-base font-semibold text-gray-300 mb-3">Existing Reviews ({clientReviews.length})</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2 -mr-2">
            {clientReviews.length === 0 && <p className="text-gray-400">No reviews found.</p>}
            {clientReviews.map((review, index) => (
                <div key={index} className="bg-gray-800 p-3 rounded-md border border-gray-700 flex justify-between items-center">
                    <p className="text-gray-200 italic text-sm">"{review}"</p>
                    <button
                        onClick={() => handleDeleteReview(review)}
                        className="text-gray-500 hover:text-red-400 ml-4 p-1 rounded-full hover:bg-red-900/50"
                        title="Delete review"
                    >
                        <Icons.Close />
                    </button>
                </div>
            ))}
        </div>
    </FormCard>
);

/**
 * ===============================================
 * Component: AdminPanel
 * ===============================================
 */
const AdminPanel = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('list'); // 'list', 'create', 'edit', 'reviews'
    const [currentClient, setCurrentClient] = useState(null);
    const [jsonFiles, setJsonFiles] = useState([]);

    const [form, setForm] = useState({
        clientId: '',
        clientName: '',
        googleReviewLink: '',
        logoUrl: '',
        primaryColor: '#3b82f6',
        secondaryColor: '#ffffff',
        sourceReviewFile: '',
    });

    // UPDATED: New state for the file object
    const [reviewFile, setReviewFile] = useState(null);

    const [reviewForm, setReviewForm] = useState({ newReview: '' });
    const [clientReviews, setClientReviews] = useState([]);

    // --- Data Fetching ---
    const fetchClients = useCallback(async () => {
        setLoading(true);
        try {
            // UPDATED: Using correct 'api' instance
            const res = await api.get('/clients');
            setClients(res.data);
        } catch (err) {
            setError('Failed to fetch clients.');
            toast('Failed to fetch clients.', 'error');
        }
        setLoading(false);
    }, []);

    const fetchJsonFiles = async () => {
        try {
            const res = await api.get('/data-files');
            const allFiles = res.data;
            // Filter out files that are already clients (if clients is loaded)
            const clientIds = clients ? clients.map(c => c.clientId + '.json') : [];
            const sourceFiles = allFiles.filter(file => !clientIds.includes(file));

            setJsonFiles(sourceFiles);

            if (sourceFiles.length > 0) {
                const defaultFile = sourceFiles.includes('sample-reviews-200.json') ? 'sample-reviews-200.json' : sourceFiles[0];
                setForm(f => ({ ...f, sourceReviewFile: f.sourceReviewFile || defaultFile }));
            }
        } catch (err) {
            toast('Could not load source JSON files.', 'error');
        }
    };

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    useEffect(() => {
        if (!loading && clients) {
            fetchJsonFiles();
        }
    }, [loading, clients]); // Depend on clients to ensure it runs after fetch

    const fetchReviews = async (clientId) => {
        try {
            // UPDATED: Using correct 'api' instance
            const res = await api.get(`/client/${clientId}/reviews`);
            setClientReviews(res.data.reviews);
        } catch (err) {
            toast('Failed to load reviews.', 'error');
        }
    };

    // --- Form & View Handlers ---
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // UPDATED: Reset now also clears the reviewFile
    const resetForm = () => {
        setForm({
            clientId: '',
            clientName: '',
            googleReviewLink: '',
            logoUrl: '',
            primaryColor: '#3b82f6',
            secondaryColor: '#ffffff',
            sourceReviewFile: jsonFiles.includes('sample-reviews-200.json') ? 'sample-reviews-200.json' : (jsonFiles[0] || ''),
        });
        setReviewFile(null); // Clear the file
    };

    const showCreateForm = () => {
        resetForm();
        setCurrentClient(null);
        setView('create');
    };

    const showEditForm = (client) => {
        console.log(client, "client to edit");
        setLoading(true);
        // UPDATED: Using correct 'api' instance
        api.get(`/client/${client.clientId}`).then(res => {
            setForm({
                ...res.data,
                clientId: client.clientId,
            });
            setCurrentClient(res.data);
            setView('edit');
            setLoading(false);
        }).catch(() => {
            toast('Failed to load client details.', 'error');
            setLoading(false);
        });
    };

    const showReviewManager = (client) => {
        setCurrentClient(client);
        fetchReviews(client.clientId);
        setView('reviews');
    };

    const showList = () => {
        setView('list');
        setCurrentClient(null);
        setClientReviews([]);
        setReviewForm({ newReview: '' });
        fetchClients();
    };

    // --- API Actions ---

    // UPDATED: This is the correct way to send FormData to your backend
    const handleCreateClient = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        // Append all text fields
        formData.append('clientId', form.clientId);
        formData.append('clientName', form.clientName);
        formData.append('googleReviewLink', form.googleReviewLink);
        formData.append('logoUrl', form.logoUrl);
        formData.append('primaryColor', form.primaryColor);
        formData.append('secondaryColor', form.secondaryColor);

        // Append either the selected file name OR the uploaded file
        if (reviewFile) {
            formData.append('reviewFile', reviewFile); // The backend will get this
        } else {
            formData.append('sourceReviewFile', form.sourceReviewFile); // The backend will get this
        }

        try {
            await api.post('/client', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // This is crucial
                },
            });
            toast('Client created successfully!', 'success');
            showList();
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to create client.', 'error');
        }
    };

    const handleUpdateClient = async (e) => {
        e.preventDefault();
        if (!currentClient) return;
        try {
            console.log(currentClient, "form to update");
            // UPDATED: Send as JSON, which is correct for PUT
            const res = await api.put(`/client/${currentClient._id}`, form, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log(res.data, "updated client response");
            toast('Client updated successfully!', 'success');
            showList();
        } catch (err) {
            console.log(err, "error updating client");
            toast(err.response?.data?.message || 'Failed to update client.', 'error');
        }
    };

    const handleDeleteClient = async (clientId) => {
        if (!window.confirm(`Are you sure you want to delete client "${clientId}"? This is permanent.`)) {
            return;
        }
        try {
            // UPDATED: Using correct 'api' instance
            await api.delete(`/client/${clientId}`);
            toast('Client deleted.', 'success');
            fetchClients();
        } catch (err) {
            toast('Failed to delete client.', 'error');
        }
    };

    const handleDownloadQR = async (clientId) => {
        try {
            // UPDATED: Using correct 'api' instance
            const res = await api.post(`/client/${clientId}/generate-qr`);
            const { qrDataUrl } = res.data;
            const a = document.createElement('a');
            a.href = qrDataUrl;
            a.download = `${clientId}-qr-code.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast(`QR code downloaded!`, 'success');
        } catch (err) {
            toast('Failed to generate QR code.', 'error');
        }
    };

    // --- Review Management ---
    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!currentClient || !reviewForm.newReview) return;
        try {
            // UPDATED: Using correct 'api' instance and JSON payload
            await api.post(`/client/${currentClient.clientId}/reviews`, { review: reviewForm.newReview }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            toast('Review added!', 'success');
            setReviewForm({ newReview: '' });
            fetchReviews(currentClient.clientId);
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to add review.', 'error');
        }
    };

    const handleDeleteReview = async (review) => {
        if (!currentClient || !window.confirm('Delete this review?')) return;
        try {
            // UPDATED: Using correct 'api' instance
            await api.delete(`/client/${currentClient.clientId}/reviews`, { data: { review } });
            toast('Review deleted.', 'success');
            fetchReviews(currentClient.clientId);
        } catch (err) {
            toast('Failed to delete review.', 'error');
        }
    };

    // --- Main Admin Render ---
    return (
        <div className="min-h-screen bg-black">
            <Header
                view={view}
                showCreateForm={showCreateForm}
                showList={showList}
            />
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {view === 'list' && (
                    <ClientList
                        loading={loading}
                        error={error}
                        clients={clients}
                        showReviewManager={showReviewManager}
                        handleDownloadQR={handleDownloadQR}
                        showEditForm={showEditForm}
                        handleDeleteClient={handleDeleteClient}
                    />
                )}
                {(view === 'create' || view === 'edit') && (
                    <ClientForm
                        key={currentClient ? currentClient.clientId : 'create'}
                        onSubmit={view === 'create' ? handleCreateClient : handleUpdateClient}
                        isEdit={view === 'edit'}
                        form={form}
                        handleFormChange={handleFormChange}
                        jsonFiles={jsonFiles}
                        showList={showList}
                        // UPDATED: Pass file state to the form
                        reviewFile={reviewFile}
                        setReviewFile={setReviewFile}
                    />
                )}

                {view === 'reviews' && currentClient && (
                    <ReviewManager
                        currentClient={currentClient}
                        handleAddReview={handleAddReview}
                        reviewForm={reviewForm}
                        setReviewForm={setReviewForm}
                        clientReviews={clientReviews}
                        handleDeleteReview={handleDeleteReview}
                    />
                )}
            </main>
        </div>
    );
};

export default AdminPanel;