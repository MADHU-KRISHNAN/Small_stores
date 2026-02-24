import { useAuth } from '../context/AuthContext';
import { Store } from 'lucide-react';

export default function Navbar() {
    const { user } = useAuth();

    return (
        <header className="bg-white border-b h-16 flex items-center justify-between px-8">
            <div className="flex items-center text-gray-800">
                <Store className="w-5 h-5 mr-3 text-indigo-600" />
                <span className="font-medium">Store ID: {user?.storeId || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-gray-900">{user?.username}</span>
                    <span className="text-xs text-gray-500">{user?.roles?.[0]}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    );
}
