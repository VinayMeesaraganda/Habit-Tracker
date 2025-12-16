/**
 * Auth Component - Full Landing Page with Auth Modal
 * Inspired by Linear's premium dark design
 */

import React, { useState, useEffect, useRef } from 'react';
import { useHabits } from '../context/HabitContext';
import {
    Loader2, Check, Flame, Trophy, TrendingUp, ChevronRight, Target,
    BarChart3, Award, X, ArrowRight, Sparkles, LineChart
} from 'lucide-react';

// Feature card data
const FEATURES = [
    {
        icon: Target,
        title: 'Track Daily Goals',
        description: 'Set and monitor your daily and weekly habits with beautiful visual progress tracking.',
        color: 'from-blue-500 to-cyan-400'
    },
    {
        icon: Flame,
        title: 'Build Streaks',
        description: 'Stay motivated with streak tracking. See your consistency grow day by day.',
        color: 'from-orange-500 to-red-400'
    },
    {
        icon: LineChart,
        title: 'Visualize Progress',
        description: 'Beautiful charts and analytics help you understand your patterns and improve.',
        color: 'from-purple-500 to-pink-400'
    },
    {
        icon: Award,
        title: 'Earn Badges',
        description: 'Unlock achievements as you hit milestones. Celebrate your wins!',
        color: 'from-yellow-500 to-orange-400'
    }
];

export function Auth() {
    const [authView, setAuthView] = useState<'signin' | 'signup' | 'forgot'>('signin');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Animation states
    const [heroVisible, setHeroVisible] = useState(false);
    const [demoVisible, setDemoVisible] = useState(false);
    const [featuresVisible, setFeaturesVisible] = useState(false);
    const [animationPhase, setAnimationPhase] = useState(0);

    const featuresRef = useRef<HTMLDivElement>(null);
    const { signIn, signUp, resetPassword } = useHabits();

    // Initial animations
    useEffect(() => {
        setTimeout(() => setHeroVisible(true), 100);
        setTimeout(() => setDemoVisible(true), 400);
        const timers = [
            setTimeout(() => setAnimationPhase(1), 800),
            setTimeout(() => setAnimationPhase(2), 1200),
            setTimeout(() => setAnimationPhase(3), 1600),
            setTimeout(() => setAnimationPhase(4), 2000),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    // Scroll-based reveal for features
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setFeaturesVisible(true);
                    }
                });
            },
            { threshold: 0.2 }
        );
        if (featuresRef.current) observer.observe(featuresRef.current);
        return () => observer.disconnect();
    }, []);

    const openAuthModal = (view: 'signin' | 'signup') => {
        setAuthView(view);
        setError('');
        setSuccessMessage('');
        setIsAuthModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            if (authView === 'signup') {
                await signUp(email, password);
                setSuccessMessage('Check your email for confirmation link!');
            } else if (authView === 'signin') {
                await signIn(email, password);
            } else if (authView === 'forgot') {
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
        <div className="min-h-screen bg-[#0A0A0B] text-white overflow-x-hidden">
            {/* ===== NAVIGATION ===== */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 bg-[#0A0A0B]/80 backdrop-blur-lg border-b border-white/5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Habit Tracker</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => openAuthModal('signin')}
                            className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2"
                        >
                            Log in
                        </button>
                        <button
                            onClick={() => openAuthModal('signup')}
                            className="text-sm px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors"
                        >
                            Sign up
                        </button>
                    </div>
                </div>
            </nav>

            {/* ===== HERO SECTION ===== */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
                {/* Background glow effects */}
                <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Hero Text */}
                        <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm mb-6">
                                <Sparkles className="w-4 h-4" />
                                <span>Your personal growth companion</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
                                Build and track<br />
                                <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
                                    your habits
                                </span>
                            </h1>

                            <p className="text-lg text-gray-400 leading-relaxed max-w-lg mb-8">
                                A purpose-built tool for personal growth. Track daily routines, visualize progress, and build lasting streaks that transform your life.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => openAuthModal('signup')}
                                    className="px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-all flex items-center gap-2 group"
                                >
                                    Start building
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => openAuthModal('signin')}
                                    className="px-6 py-3 border border-white/20 rounded-full font-medium hover:bg-white/5 transition-all"
                                >
                                    Log in
                                </button>
                            </div>

                            {/* Social Proof */}
                            <div className={`mt-10 flex items-center gap-6 text-sm text-gray-500 transition-all duration-1000 delay-500 ${heroVisible ? 'opacity-100' : 'opacity-0'}`}>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                    <span>10,000+ habits tracked</span>
                                </div>
                                <div className="hidden sm:block h-4 w-px bg-gray-700" />
                                <div className="hidden sm:flex items-center gap-2">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <span>50,000+ streaks built</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating Product Demo */}
                        <div className={`relative transition-all duration-1000 delay-300 ${demoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                            {/* Main Dashboard Card */}
                            <div
                                className="relative bg-[#111113] border border-white/10 rounded-2xl p-6 shadow-2xl"
                                style={{ transform: 'perspective(1000px) rotateX(2deg) rotateY(-3deg)' }}
                            >
                                {/* Window controls */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <span className="text-xs text-gray-500 font-mono">Dashboard</span>
                                </div>

                                {/* Habit rows */}
                                <div className="space-y-3">
                                    <div className={`flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${animationPhase >= 2 ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}>
                                                <Check className={`w-4 h-4 text-white transition-all ${animationPhase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Morning Run</p>
                                                <p className="text-xs text-gray-500">Health · 5km</p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 transition-all duration-500 ${animationPhase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                                            <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                                            <span className="text-xs text-orange-300 font-bold">12</span>
                                        </div>
                                    </div>

                                    <div className={`flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 transition-all duration-500 delay-100 ${animationPhase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 delay-200 ${animationPhase >= 3 ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}>
                                                <Check className={`w-4 h-4 text-white transition-all ${animationPhase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Read 30 mins</p>
                                                <p className="text-xs text-gray-500">Learning · Daily</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500">1/1</span>
                                    </div>

                                    <div className={`flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 transition-all duration-500 delay-200 ${animationPhase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-6 h-6 rounded-full border-2 border-gray-600" />
                                            <div>
                                                <p className="font-medium text-sm">Meditate</p>
                                                <p className="text-xs text-gray-500">Mindfulness · 10 min</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500">0/1</span>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className={`mt-6 transition-all duration-500 delay-300 ${animationPhase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-400">Today's Progress</span>
                                        <span className={`font-bold ${animationPhase >= 4 ? 'text-green-400' : 'text-gray-400'}`}>
                                            {animationPhase >= 4 ? '67%' : '0%'}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: animationPhase >= 4 ? '67%' : '0%' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Floating analytics card */}
                            <div
                                className={`absolute -right-4 sm:-right-8 top-1/3 bg-[#111113] border border-white/10 rounded-xl p-4 shadow-2xl transition-all duration-1000 delay-500 ${animationPhase >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                        <BarChart3 className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <span className="text-sm font-medium">Analytics</span>
                                </div>
                                <div className="flex gap-1 h-12 items-end">
                                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                        <div
                                            key={i}
                                            className="w-3 rounded-t bg-gradient-to-t from-purple-600 to-purple-400 transition-all duration-500"
                                            style={{
                                                height: animationPhase >= 4 ? `${h}%` : '10%',
                                                transitionDelay: `${i * 80}ms`
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Floating badge card */}
                            <div
                                className={`absolute -left-4 bottom-4 bg-[#111113] border border-white/10 rounded-xl p-4 shadow-2xl transition-all duration-1000 delay-700 ${animationPhase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                                        <Trophy className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-yellow-400">7 Day Streak!</p>
                                        <p className="text-xs text-gray-500">Keep it going</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FEATURES SECTION ===== */}
            <section ref={featuresRef} className="py-24 px-4 sm:px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/5 to-transparent pointer-events-none" />

                <div className="max-w-7xl mx-auto">
                    <div className={`text-center mb-16 transition-all duration-1000 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Purpose-built for<br />
                            <span className="text-gray-400">personal growth</span>
                        </h2>
                        <p className="text-gray-500 max-w-lg mx-auto">
                            Everything you need to build better habits and achieve your goals.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURES.map((feature, index) => (
                            <div
                                key={feature.title}
                                className={`group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-500 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                    }`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA SECTION ===== */}
            <section className="py-24 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                        Ready to build better habits?
                    </h2>
                    <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                        Join thousands of users who have transformed their daily routines with Habit Tracker.
                    </p>
                    <button
                        onClick={() => openAuthModal('signup')}
                        className="px-8 py-4 bg-white text-black rounded-full font-semibold text-lg hover:bg-gray-200 transition-all flex items-center gap-2 mx-auto group"
                    >
                        Get started free
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="py-8 px-4 sm:px-6 border-t border-white/10">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                            <Target className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm text-gray-500">Habit Tracker</span>
                    </div>
                    <p className="text-xs text-gray-600">© 2024 Habit Tracker. All rights reserved.</p>
                </div>
            </footer>

            {/* ===== AUTH MODAL ===== */}
            {isAuthModalOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setIsAuthModalOpen(false); }}
                >
                    <div
                        className="relative w-full max-w-md bg-[#111113] border border-white/10 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setIsAuthModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Modal Header */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-2">
                                {authView === 'signin' ? 'Welcome back' : authView === 'signup' ? 'Get started' : 'Reset password'}
                            </h2>
                            <p className="text-gray-400 text-sm">
                                {authView === 'signin' ? 'Sign in to your account to continue.' :
                                    authView === 'signup' ? 'Create your account and start building habits.' :
                                        "We'll send you a link to reset your password."}
                            </p>
                        </div>

                        {/* Tab Switcher */}
                        {authView !== 'forgot' && (
                            <div className="flex p-1 bg-white/5 rounded-lg mb-6">
                                <button
                                    onClick={() => { setAuthView('signin'); setError(''); setSuccessMessage(''); }}
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${authView === 'signin' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Sign in
                                </button>
                                <button
                                    onClick={() => { setAuthView('signup'); setError(''); setSuccessMessage(''); }}
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${authView === 'signup' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Sign up
                                </button>
                            </div>
                        )}

                        {authView === 'forgot' && (
                            <button
                                onClick={() => setAuthView('signin')}
                                className="flex items-center text-sm text-gray-400 hover:text-white mb-6 group"
                            >
                                <ChevronRight className="w-4 h-4 rotate-180 mr-1 group-hover:-translate-x-1 transition-transform" />
                                Back to sign in
                            </button>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="you@example.com"
                                    required
                                    autoFocus
                                />
                            </div>

                            {authView !== 'forgot' && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-gray-300">Password</label>
                                        {authView === 'signin' && (
                                            <button
                                                type="button"
                                                onClick={() => setAuthView('forgot')}
                                                className="text-xs text-gray-400 hover:text-white"
                                            >
                                                Forgot password?
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            )}

                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {successMessage && (
                                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    {successMessage}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        {authView === 'forgot' ? 'Send reset link' : authView === 'signup' ? 'Create account' : 'Sign in'}
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-6 text-xs text-gray-500 text-center">
                            By continuing, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
