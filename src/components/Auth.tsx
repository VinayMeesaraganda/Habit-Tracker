/**
 * Auth component - Sign in / Sign up form
 */

import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

export function Auth() {
    const [view, setView] = useState<'signin' | 'signup' | 'forgot'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp, resetPassword } = useHabits();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            if (view === 'signup') {
                await signUp(email, password);
                setSuccessMessage('Check your email for confirmation link!');
            } else if (view === 'signin') {
                await signIn(email, password);
            } else if (view === 'forgot') {
                await resetPassword(email);
                setSuccessMessage('Check your email for the password reset link!');
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold gradient-text mb-2">
                        Habit Tracker
                    </h1>
                    <p className="text-gray-600">
                        Build better habits, track your progress
                    </p>
                </div>

                <div className="card">
                    {/* Tabs for Sign In / Sign Up */}
                    {view !== 'forgot' && (
                        <div className="flex gap-2 mb-6">
                            <button
                                type="button"
                                onClick={() => { setView('signin'); setError(''); setSuccessMessage(''); }}
                                className={`flex-1 py-2 rounded-lg font-medium transition-all ${view === 'signin'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <LogIn className="inline w-4 h-4 mr-2" />
                                Sign In
                            </button>
                            <button
                                type="button"
                                onClick={() => { setView('signup'); setError(''); setSuccessMessage(''); }}
                                className={`flex-1 py-2 rounded-lg font-medium transition-all ${view === 'signup'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <UserPlus className="inline w-4 h-4 mr-2" />
                                Sign Up
                            </button>
                        </div>
                    )}

                    {view === 'forgot' && (
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h2>
                            <p className="text-sm text-gray-500">Enter your email to receive reset instructions.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        {view !== 'forgot' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        )}

                        {/* Sign In Extras: Forgot Password */}
                        {view === 'signin' && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setView('forgot'); setError(''); setSuccessMessage(''); }}
                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="p-3 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
                                {successMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {view === 'forgot' ? 'Sending...' : view === 'signup' ? 'Creating...' : 'Signing in...'}
                                </>
                            ) : (
                                <>
                                    {view === 'forgot' ? 'Send Reset Link' : view === 'signup' ? 'Create Account' : 'Sign In'}
                                </>
                            )}
                        </button>

                        {/* Back to Sign In (Forgot Password View) */}
                        {view === 'forgot' && (
                            <button
                                type="button"
                                onClick={() => { setView('signin'); setError(''); setSuccessMessage(''); }}
                                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
                            >
                                Back to Sign In
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
