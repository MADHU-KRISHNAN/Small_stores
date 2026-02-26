import { Link } from 'react-router-dom';
import { SparklesIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-brand-600/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

            <div className="relative z-10 text-center animate-fade-in-up">
                <div className="flex items-center justify-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center shadow-glow-lg">
                        <SparklesIcon className="w-9 h-9 text-white" />
                    </div>
                </div>

                <h1 className="text-8xl font-bold gradient-text mb-4">404</h1>
                <h2 className="text-2xl font-bold text-white mb-3">Page not found</h2>
                <p className="text-surface-400 max-w-md mx-auto mb-8">
                    The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>

                <Link
                    to="/dashboard"
                    className="btn-primary inline-flex items-center space-x-2"
                >
                    <HomeIcon className="w-5 h-5" />
                    <span>Back to Dashboard</span>
                </Link>
            </div>
        </div>
    );
}
