import { useState } from 'react';
import { X, LogOut, User as UserIcon, Mail, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { useHabits } from '../context/HabitContext';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { user, signOut, updateProfile, updatePassword, updateEmail, verifyPassword } = useHabits();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.full_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSignOut = async () => {
        try {
            await signOut();
            onClose();
        } catch (error) {
            console.error('Failed to sign out:', error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // Update Name (Non-sensitive)
            if (name !== user?.full_name) {
                await updateProfile(name);
            }

            // Sensitive Changes: Email or Password
            const isEmailChanged = email !== user?.email;
            const isPasswordChanged = newPassword.length > 0;

            if (isEmailChanged || isPasswordChanged) {
                if (!currentPassword) {
                    throw new Error("Current password is required to change email or password.");
                }

                // Verify identity first
                await verifyPassword(currentPassword);

                // Update Email if changed
                if (isEmailChanged) {
                    await updateEmail(email);
                }

                // Update Password if changed
                if (isPasswordChanged) {
                    await updatePassword(newPassword);
                }

                setMessage({ type: 'success', text: isEmailChanged ? 'Profile updated! Check new email for confirmation link.' : 'Profile updated successfully!' });
            } else {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            }

            setNewPassword('');
            setCurrentPassword('');

            // Only close edit mode if successful
            setTimeout(() => {
                if (message?.type !== 'error') {
                    setIsEditing(false);
                    setMessage(null);
                }
            }, 2000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="w-full sm:w-[400px] bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transform transition-transform duration-300 pointer-events-auto animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        {isEditing && (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="p-1.5 -ml-2 rounded-full hover:bg-gray-100/80 text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        )}
                        <h2 className="text-xl font-bold text-gray-900">
                            {isEditing ? 'Edit Profile' : 'My Profile'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {!isEditing ? (
                    <>
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-lg">
                                <span className="text-4xl font-bold text-pink-600">
                                    {user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {user?.full_name || 'Habit Tracker User'}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                <Mail className="w-3 h-3" />
                                <span className="text-xs font-medium">{user?.email}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setName(user?.full_name || '');
                                    setEmail(user?.email || '');
                                    setIsEditing(true);
                                }}
                                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                                        <UserIcon className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900">Manage Account</p>
                                        <p className="text-xs text-gray-500">Update details & security</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>

                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors mt-6"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSave} className="space-y-4">
                        {message && (
                            <div className={`p-3 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Full Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                                    placeholder="Enter your name"
                                />
                                <UserIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                                    placeholder="Enter your email"
                                />
                                <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4 mt-2">
                            <h4 className="text-sm font-bold text-gray-900 mb-3">Security</h4>

                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Current Password <span className="text-red-500">*</span></label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all placeholder:text-gray-400"
                                placeholder="Required to change Email or Password"
                            />

                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all placeholder:text-gray-400"
                                placeholder="Leave empty to keep unchanged"
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-200 hover:bg-pink-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Saving...' : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                <p className="text-center text-[10px] text-gray-400 mt-6">
                    Version 1.0.1 • Habit Tracker
                </p>
            </div>
        </div>
    );
}
