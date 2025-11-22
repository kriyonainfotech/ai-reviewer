import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // Import useParams
import { Icons } from '../components/Icons'; // Import Icons

// Set up a pre-configured axios instance
// The '/api' prefix will be caught by the Vite proxy
// Set up a pre-configured axios instance
// This now matches your AdminPanel and works for both dev and prod
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : 'http://localhost:5000',
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

                console.log(c.data, "cc---------")
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
        <div
            // h-[100dvh] fixes the mobile address bar scroll issue
            className="h-[100dvh] w-full flex flex-col items-center justify-between px-5 py-4 sm:py-6 overflow-hidden"
            style={{
                background: "linear-gradient(180deg, #1F144A 0%, #2D0F4B 100%)",
            }}
        >
            {/* Header: Flex-none ensures it doesn't shrink */}
            <div className="flex-none flex flex-col items-center text-center space-y-2 pt-2 sm:pt-4">
                <img
                    src={client.logoUrl}
                    alt="Logo"
                    // Responsive logo size: smaller on mobile
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-full opacity-95 shadow-lg mb-1"
                />

                <div className="space-y-0.5">
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white drop-shadow-md">
                        {client.clientName}
                    </h1>
                    <p className="text-[10px] sm:text-[11px] text-white/60 uppercase tracking-wider font-medium">
                        Verified Review Message
                    </p>
                </div>
            </div>

            {/* Card Container: Flex-1 takes all available middle space */}
            <div className="flex-1 w-full flex items-center justify-center min-h-0 py-4">
                {/* Card: Max height ensures it never goes off screen */}
                <div className="w-full max-w-md bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-gray-100 flex flex-col max-h-full">

                    <div className="text-yellow-500 text-xl sm:text-2xl mb-3 text-center flex-none">
                        ★★★★★
                    </div>

                    {/* Text Area: Auto overflow handles long text gracefully without scrolling the page */}
                    <div className="flex-1 overflow-y-auto min-h-0 mb-5 custom-scrollbar">
                        <p className="text-center text-gray-700 text-sm sm:text-[15px] leading-relaxed font-medium px-2">
                            {review}
                        </p>
                    </div>

                    <button
                        onClick={handleCopy}
                        className="flex-none w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2
                        bg-gradient-to-r from-[#2389FF] to-[#9A1FFF] text-white shadow-lg active:scale-[0.98] transition-all hover:opacity-95"
                    >
                        <Icons.Copy className="w-4 h-4" />
                        COPY REVIEW
                    </button>
                </div>
            </div>

            {/* Footer: Flex-none */}
            <div className="flex-none pb-1 text-center text-white/50 text-[10px] sm:text-[11px]">
                Powered by <span className="font-semibold text-white/90">Kriyona Infotech</span>
            </div>
        </div>
    );

};

export default ReviewPage;