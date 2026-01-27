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
            if (name !== user?.full_name) {
                await updateProfile({ full_name: name });
            }

            const isEmailChanged = email !== user?.email;
            const isPasswordChanged = newPassword.length > 0;

            if (isEmailChanged || isPasswordChanged) {
                if (!currentPassword) {
                    throw new Error("Current password is required to change email or password.");
                }

                await verifyPassword(currentPassword);

                if (isEmailChanged) {
                    await updateEmail(email);
                }

                if (isPasswordChanged) {
                    await updatePassword(newPassword);
                }

                setMessage({ type: 'success', text: isEmailChanged ? 'Profile updated! Check new email for confirmation link.' : 'Profile updated successfully!' });
            } else {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            }

            setNewPassword('');
            setCurrentPassword('');

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
                className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="w-full sm:w-[400px] card-glass rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transform transition-transform duration-300 pointer-events-auto animate-scale-in max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        {isEditing && (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="p-1.5 -ml-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        )}
                        <h2 className="text-xl font-bold text-white">
                            {isEditing ? 'Edit Profile' : 'My Profile'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {!isEditing ? (
                    <>
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mb-4 border-4 border-white/10 shadow-lg shadow-primary-500/30">
                                <span className="text-4xl font-bold text-white">
                                    {user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1">
                                {user?.full_name || 'Habit Tracker User'}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
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
                                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group border border-white/10"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg group-hover:scale-110 transition-transform">
                                        <UserIcon className="w-5 h-5 text-primary-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-white">Manage Account</p>
                                        <p className="text-xs text-gray-500">Update details & security</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                            </button>

                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold transition-colors mt-6 border border-red-500/20"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSave} className="space-y-4">
                        {message && (
                            <div className={`p-3 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Full Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-dark pl-11"
                                    placeholder="Enter your name"
                                />
                                <UserIcon className="w-5 h-5 text-gray-500 absolute left-3.5 top-3.5" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-dark pl-11"
                                    placeholder="Enter your email"
                                />
                                <Mail className="w-5 h-5 text-gray-500 absolute left-3.5 top-3.5" />
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-4 mt-2">
                            <h4 className="text-sm font-bold text-white mb-3">Security</h4>

                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Current Password <span className="text-red-400">*</span></label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="input-dark mb-3"
                                placeholder="Required to change Email or Password"
                            />

                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input-dark"
                                placeholder="Leave empty to keep unchanged"
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="flex-1 py-3 text-gray-400 font-bold hover:bg-white/5 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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

                <p className="text-center text-[10px] text-gray-600 mt-6">
                    Version 1.0.1 • Habit Tracker
                </p>
            </div>
        </div>
    );
}
