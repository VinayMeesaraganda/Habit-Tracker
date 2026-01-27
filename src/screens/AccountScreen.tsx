import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { User, Mail, Lock, ChevronLeft, Save, Loader, Trash2, Users } from 'lucide-react';

interface AccountScreenProps {
    onBack: () => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({ onBack }) => {
    const { user, updateProfile, updateEmail, updatePassword, deleteAccount, verifyPassword } = useHabits();

    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setFullName(user.full_name || '');
            setGender(user.gender || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            await updateProfile({ full_name: fullName, gender });
            showMessage('success', 'Profile updated!');
        } catch (err: any) {
            showMessage('error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEmail = async () => {
        if (email === user?.email) return;
        setLoading(true);
        try {
            await updateEmail(email);
            showMessage('success', 'Confirmation email sent!');
        } catch (err: any) {
            showMessage('error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) return;
        setLoading(true);
        try {
            await verifyPassword(currentPassword);
            await updatePassword(newPassword);
            showMessage('success', 'Password changed!');
            setCurrentPassword('');
            setNewPassword('');
        } catch (err: any) {
            showMessage('error', 'Current password is incorrect.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('⚠️ DANGER\n\nThis will PERMANENTLY delete your account and ALL your data.\n\nThis cannot be undone. Are you sure?')) {
            setLoading(true);
            try {
                await deleteAccount();
            } catch (err: any) {
                showMessage('error', err.message);
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF8E7] pb-24">
            {/* Header */}
            <div className="sticky top-0 bg-[#FFF8E7] z-10 px-4 pt-8 pb-4 safe-area-top flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-xl hover:bg-white/50 active:scale-95 transition-all"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Account</h1>
            </div>

            {/* Message Toast */}
            {message && (
                <div className={`mx-4 mb-4 p-3 rounded-xl text-sm font-medium ${message.type === 'success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="px-4 space-y-6">
                {/* Personal Info Section */}
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Personal Info</h2>

                    {/* Full Name */}
                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-600 mb-1.5 block">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                placeholder="Your name"
                            />
                        </div>
                    </div>

                    {/* Gender */}
                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-600 mb-1.5 block">Gender</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-orange-200 outline-none appearance-none transition-all"
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-semibold bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </section>

                {/* Email Section */}
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Email Address</h2>
                    <div className="relative mb-4">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                            placeholder="your@email.com"
                        />
                    </div>
                    <button
                        onClick={handleUpdateEmail}
                        disabled={loading || email === user?.email}
                        className="w-full py-2.5 rounded-xl font-semibold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        Update Email
                    </button>
                </section>

                {/* Password Section */}
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Change Password</h2>

                    <div className="mb-3">
                        <label className="text-sm font-medium text-gray-600 mb-1.5 block">Current Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                placeholder="Required"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-600 mb-1.5 block">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                placeholder="Min. 6 characters"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleChangePassword}
                        disabled={loading || !currentPassword || !newPassword}
                        className="w-full py-2.5 rounded-xl font-semibold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        Change Password
                    </button>
                </section>

                {/* Danger Zone */}
                <section className="bg-red-50 rounded-2xl p-5 border border-red-100">
                    <h2 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Danger Zone</h2>
                    <p className="text-sm text-red-600/70 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                    </button>
                </section>
            </div>
        </div>
    );
};
