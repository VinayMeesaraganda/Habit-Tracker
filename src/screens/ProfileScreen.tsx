import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { User, Bell, Download, Shield, FileText, Mail, LogOut, ChevronRight } from 'lucide-react';
import { generateCSV, downloadCSV } from '../utils/export';
import { format } from 'date-fns';

import { PrivacyPolicyScreen } from './PrivacyPolicyScreen';
import { TermsOfUseScreen } from './TermsOfUseScreen';
import { AccountScreen } from './AccountScreen';
import { NotificationsScreen } from './NotificationsScreen';

type ProfileView = 'main' | 'privacy' | 'terms' | 'account' | 'notifications';

export const ProfileScreen: React.FC = () => {
    const { user, signOut, habits, logs } = useHabits();
    const [view, setView] = useState<ProfileView>('main');
    const [exportMessage, setExportMessage] = useState<string | null>(null);

    const getInitials = () => {
        const name = user?.full_name;
        if (!name) return user?.email?.substring(0, 2).toUpperCase() || '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };



    const handleExport = () => {
        const csv = generateCSV(habits, logs, new Date());
        const filename = `habit_tracker_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        downloadCSV(csv, filename);
        setExportMessage('Data exported!');
        setTimeout(() => setExportMessage(null), 2000);
    };

    const handleSignOut = async () => {
        if (window.confirm('Are you sure you want to sign out?')) {
            await signOut();
        }
    };

    // Sub-screen routing
    if (view === 'privacy') return <PrivacyPolicyScreen onBack={() => setView('main')} />;
    if (view === 'terms') return <TermsOfUseScreen onBack={() => setView('main')} />;
    if (view === 'account') return <AccountScreen onBack={() => setView('main')} />;
    if (view === 'notifications') return <NotificationsScreen onBack={() => setView('main')} />;

    // Menu item component
    const MenuItem: React.FC<{
        icon: React.ReactNode;
        label: string;
        sublabel?: string;
        onClick: () => void;
        iconBg?: string;
    }> = ({ icon, label, sublabel, onClick, iconBg = 'bg-gray-100' }) => (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                {icon}
            </div>
            <div className="flex-1 text-left">
                <span className="font-semibold text-gray-800 block">{label}</span>
                {sublabel && <span className="text-sm text-gray-500">{sublabel}</span>}
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
    );

    return (
        <div className="min-h-screen pb-24 bg-[#FFF8E7]">
            {/* Header */}
            <div className="px-4 pt-8 pb-2 safe-area-top">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Profile</h1>
            </div>

            {/* Profile Card */}
            <div className="mx-4 mt-4 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {getInitials()}
                    </div>
                    {/* Info */}
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900">
                            {user?.full_name || 'User'}
                        </h2>
                        <p className="text-gray-500 text-sm">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Export Message Toast */}
            {exportMessage && (
                <div className="mx-4 mt-4 p-3 bg-green-100 text-green-700 rounded-xl text-sm font-medium text-center">
                    ✓ {exportMessage}
                </div>
            )}

            {/* Settings Menu */}
            <div className="mx-4 mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <MenuItem
                    icon={<User className="w-5 h-5 text-blue-500" />}
                    iconBg="bg-blue-100"
                    label="Account"
                    sublabel="Edit profile, email, password"
                    onClick={() => setView('account')}
                />
                <div className="h-px bg-gray-100 ml-18" />
                <MenuItem
                    icon={<Bell className="w-5 h-5 text-orange-500" />}
                    iconBg="bg-orange-100"
                    label="Notifications"
                    sublabel="Daily reminder settings"
                    onClick={() => setView('notifications')}
                />
                <div className="h-px bg-gray-100 ml-18" />
                <MenuItem
                    icon={<Download className="w-5 h-5 text-green-500" />}
                    iconBg="bg-green-100"
                    label="Export Data"
                    sublabel="Download habits as CSV"
                    onClick={handleExport}
                />
            </div>

            {/* Legal Menu */}
            <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <MenuItem
                    icon={<Shield className="w-5 h-5 text-purple-500" />}
                    iconBg="bg-purple-100"
                    label="Privacy Policy"
                    onClick={() => setView('privacy')}
                />
                <div className="h-px bg-gray-100 ml-18" />
                <MenuItem
                    icon={<FileText className="w-5 h-5 text-gray-500" />}
                    iconBg="bg-gray-100"
                    label="Terms of Use"
                    onClick={() => setView('terms')}
                />
                <div className="h-px bg-gray-100 ml-18" />
                <a
                    href="mailto:Vinaykiran.018@gmail.com"
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-teal-500" />
                    </div>
                    <div className="flex-1 text-left">
                        <span className="font-semibold text-gray-800 block">Contact Support</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </a>
            </div>

            {/* Sign Out */}
            <div className="mx-4 mt-6">
                <button
                    onClick={handleSignOut}
                    className="w-full py-4 rounded-2xl font-bold text-red-500 bg-red-50 hover:bg-red-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>

            {/* Version */}
            <p className="text-center text-xs text-gray-400 mt-6">
                Itera v1.0.0
            </p>
        </div>
    );
};
