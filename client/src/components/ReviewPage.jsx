import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // Import useParams
import { Icons } from '../components/Icons'; // Import Icons

// Set up a pre-configured axios instance
// The '/api' prefix will be caught by the Vite proxy
// Set up a pre-configured axios instance
// This now matches your AdminPanel and works for both dev and prod
const api = axios.create({
    baseURL: import.meta.env.DEV ? 'http://localhost:5000/api' : '/api',
    headers: { 'Content-Type': 'application/json' }
});

// V2 Toast function
function toast(msg, type = 'default') {
    // (Pasting toast function from original index.html)
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


const ReviewPage = () => {
    // Get the clientId from the URL using the hook
    const { clientId } = useParams();

    const [client, setClient] = useState(null);
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!clientId) return; // Don't fetch if no clientId

        const load = async () => {
            try {
                const [c, r] = await Promise.all([
                    api.get(`/client/${clientId}`),
                    api.get(`/client/${clientId}/random-review`)
                ]);

                setClient(c.data);
                setReview(r.data.review);

                document.title = `${c.data.clientName} - Review`;
            } catch (e) {
                setError("Client not found or server error.");
            }
            setLoading(false);
        };
        load();
    }, [clientId]); // Dependency array


    const handleCopy = () => {
        const textArea = document.createElement("textarea");
        textArea.value = review;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            toast("Review copied!", "success");
        } catch (err) {
            toast("Copy failed!", "error");
        }
        document.body.removeChild(textArea);

        window.open(client.googleReviewLink, "_blank");
    };

    // ---- Renders (copied from original) ----
    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center shimmer-bg">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center text-red-500 shimmer-bg">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-between p-6 shimmer-bg text-white">
            {/* Header */}
            <div className="flex flex-col items-center pt-10 h-28 text-center px-6">
                <div className="w-16 h-1 bg-purple-400 rounded-full mb-4 opacity-70"></div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-wider uppercase text-white/90" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {client.clientName}
                </h1>
            </div>

            {/* Glass Card */}
            <div className="w-full max-w-md bg-black/20 backdrop-blur-lg rounded-2xl shadow-xl border border-white/10 p-8 flex flex-col items-center">
                <div className="text-yellow-400 text-3xl mb-6 tracking-wide">
                    ★★★★★
                </div>
                <p className="text-center text-white/80 text-lg leading-relaxed mb-8">
                    {review}
                </p>
                <button
                    onClick={handleCopy}
                    className="w-full py-3.5 rounded-xl font-semibold text-lg transition-all duration-300 hover:opacity-90 hover:scale-[1.02] flex items-center justify-center gap-2
                 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30"
                >
                    <Icons.Copy />
                    COPY REVIEW
                </button>
            </div>

            {/* Footer */}
            <div className="pb-6 pt-12 text-center text-gray-400 text-xs opacity-90 h-20 flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-white/70">
                    AI
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L9.42 9.42L2 12L9.42 14.58L12 22L14.58 14.58L22 12L14.58 9.42L12 2Z" fill="#60a5fa" />
                    </svg>
                    Powered
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <svg width="24" height="24" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 60L24.1935 0H41.9355L17.7419 60H0Z" fill="white" />
                        <path d="M29.0323 60L53.2258 0H70.9677L46.7742 60H29.0323Z" fill="white" />
                        <path d="M82.2581 0L58.0645 60H75.8065L100 0H82.2581Z" fill="white" />
                    </svg>
                    <span className="font-semibold tracking-wider text-white/90">
                        Kriyona Infotech
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ReviewPage;