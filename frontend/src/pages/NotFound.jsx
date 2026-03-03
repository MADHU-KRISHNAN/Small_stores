import { Link } from 'react-router-dom';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6">
            <div className="text-center animate-fade-in-up">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-brand-500/15 flex items-center justify-center ring-1 ring-brand-500/20">
                    <BuildingStorefrontIcon className="w-10 h-10 text-brand-400" />
                </div>
                <h1 className="text-6xl font-bold text-white mb-2">404</h1>
                <p className="text-lg text-surface-400 mb-6">This page doesn't exist in your store</p>
                <Link
                    to="/dashboard"
                    className="btn-primary inline-flex items-center space-x-2"
                >
                    <span>Back to Dashboard</span>
                </Link>
            </div>
        </div>
    );
}
