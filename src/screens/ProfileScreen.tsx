import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { SectionDivider } from '../components/ui';
import { User, Mail, Lock, LogOut, Save, Loader, Shield, Users } from 'lucide-react';

export const ProfileScreen: React.FC = () => {
    const { user, updateProfile, updateEmail, updatePassword, signOut, verifyPassword } = useHabits();

    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setFullName(user.full_name || '');
            setGender(user.gender || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await updateProfile({ full_name: fullName, gender });
            setMessage({ type: 'success', text: 'Profile updated successfully' });
            setIsEditing(false);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email === user?.email) return;

        setLoading(true);
        setMessage(null);

        try {
            await updateEmail(email);
            setMessage({ type: 'success', text: 'Confirmation email sent to new address' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || !currentPassword) return;

        setLoading(true);
        setMessage(null);

        try {
            // Verify current password first
            await verifyPassword(currentPassword);

            // If verification successful, update password
            await updatePassword(password);

            setMessage({ type: 'success', text: 'Password updated successfully' });
            setPassword('');
            setCurrentPassword('');
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Failed to update password. Please check your current password.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        if (window.confirm('Are you sure you want to sign out?')) {
            await signOut();
        }
    };

    const getInitials = () => {
        if (!fullName) return user?.email?.substring(0, 2).toUpperCase() || '??';
        return fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div className="min-h-screen pb-24 px-4 bg-[#FFF8E7]">
            {/* Header */}
            <div className="pt-8 pb-6">
                <h1 className="text-3xl font-extra-bold text-[#1F1F1F] tracking-tight mb-1">
                    Profile
                </h1>
                <p className="text-[#6B6B6B] font-medium">
                    Manage your account details
                </p>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-3xl font-bold border-4 border-white shadow-md">
                        {getInitials()}
                    </div>
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-800">
                    {fullName || 'User'}
                </h2>
                <p className="text-gray-500 text-sm">
                    {user?.email}
                </p>
            </div>

            {/* Feedback Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.type === 'success' ? <Shield className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            <div className="space-y-8">
                {/* Personal Info */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <SectionDivider text="PERSONAL DETAILS" />
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isEditing
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                        </button>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        disabled={!isEditing}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border-none font-medium transition-all ${isEditing
                                            ? 'bg-gray-50 focus:ring-2 focus:ring-orange-200 text-gray-800'
                                            : 'bg-transparent text-gray-500 cursor-not-allowed'
                                            }`}
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>

                            {/* Gender */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gender</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        disabled={!isEditing}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border-none font-medium appearance-none transition-all ${isEditing
                                            ? 'bg-gray-50 focus:ring-2 focus:ring-orange-200 text-gray-800'
                                            : 'bg-transparent text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl font-semibold bg-gray-900 text-white hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        )}
                    </form>
                </section>

                {/* Account Security */}
                <section>
                    <SectionDivider text="SECURITY" />
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-6">

                        {/* Email Update */}
                        <form onSubmit={handleUpdateEmail} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-200 text-gray-800 font-medium transition-all"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || email === user?.email}
                                className="w-full py-2.5 rounded-xl font-semibold border-2 border-gray-100 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
                            >
                                Update Email
                            </button>
                        </form>

                        <div className="h-px bg-gray-100" />

                        {/* Password Update */}
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-200 text-gray-800 font-medium transition-all"
                                        placeholder="Required for changes"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-300" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-200 text-gray-800 font-medium transition-all"
                                        placeholder="Min. 6 characters"
                                        minLength={6}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !password || !currentPassword}
                                className="w-full py-2.5 rounded-xl font-semibold border-2 border-gray-100 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
                            >
                                Change Password
                            </button>
                        </form>
                    </div>
                </section>

                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    className="w-full py-4 rounded-2xl font-bold text-red-500 bg-red-50 hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2 mb-8"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>

                <div className="text-center text-xs text-gray-400 pb-8">
                    Habit Tracker v1.0.0
                </div>
            </div>
        </div>
    );
};
