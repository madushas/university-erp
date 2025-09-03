import React from 'react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to the University ERP</h1>
                <p className="text-lg text-gray-600 mb-8">Manage your academic journey with ease.</p>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Get Started
                </button>
            </div>
        </div>
    );
}