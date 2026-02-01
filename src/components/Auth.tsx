/**
 * Auth Component - Full Landing Page with Auth Modal
 * Redesigned with Vibrant Light Theme
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Loader2, Check, Flame, Trophy, TrendingUp, ChevronRight, Target,
    BarChart3, Award, X, ArrowRight, Sparkles, LineChart, Mail, User, Lock
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
    const { signIn, signUp, resetPassword } = useAuth();

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
        <div className="min-h-screen bg-[#FFF8E7] text-[#1F1F1F] overflow-x-hidden font-sans">
            {/* ===== NAVIGATION ===== */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 bg-[#FFF8E7]/80 backdrop-blur-lg border-b border-orange-100/50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF7A6B] to-[#FFA094] flex items-center justify-center shadow-sm">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900">Habit Tracker</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => openAuthModal('signin')}
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 font-medium"
                        >
                            Log in
                        </button>
                        <button
                            onClick={() => openAuthModal('signup')}
                            className="text-sm px-4 py-2 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                        >
                            Sign up
                        </button>
                    </div>
                </div>
            </nav>

            {/* ===== HERO SECTION ===== */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
                {/* Background glow effects */}
                <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-orange-300/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />
                <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-pink-300/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />

                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Hero Text */}
                        <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-600 text-sm mb-6 font-semibold shadow-sm">
                                <Sparkles className="w-4 h-4" />
                                <span>Your personal growth companion</span>
                            </div>

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6 text-gray-900">
                                Build better<br />
                                <span className="bg-gradient-to-r from-[#FF7A6B] to-[#FFD97D] bg-clip-text text-transparent">
                                    habits together
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600 leading-relaxed max-w-lg mb-8">
                                A beautiful way to track daily routines, visualize progress, and build lasting streaks that transform your life.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => openAuthModal('signup')}
                                    className="px-8 py-4 bg-gradient-to-r from-[#FF7A6B] to-[#FFA094] text-white rounded-full font-bold text-lg hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-1 transition-all flex items-center gap-2 group"
                                >
                                    Start building
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => openAuthModal('signin')}
                                    className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-full font-semibold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
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
                                <div className="hidden sm:block h-4 w-px bg-gray-300" />
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
                                className="relative bg-white border border-gray-100 rounded-3xl p-6 shadow-2xl shadow-orange-500/10"
                                style={{ transform: 'perspective(1000px) rotateX(2deg) rotateY(-3deg)' }}
                            >
                                {/* Window controls */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400 opacity-20" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-20" />
                                        <div className="w-3 h-3 rounded-full bg-green-400 opacity-20" />
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium">Dashboard</span>
                                </div>

                                {/* Habit rows */}
                                <div className="space-y-3">
                                    <div className={`flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100 transition-all duration-500 ${animationPhase >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${animationPhase >= 2 ? 'bg-green-500 border-green-500' : 'border-green-200'}`}>
                                                <Check className={`w-5 h-5 text-white transition-all ${animationPhase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">Morning Run</p>
                                                <p className="text-xs text-green-600 font-medium">Health · 5km</p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 transition-all duration-500 ${animationPhase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                                            <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                                            <span className="text-xs font-bold">12</span>
                                        </div>
                                    </div>

                                    <div className={`flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100 transition-all duration-500 delay-100 ${animationPhase >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 delay-200 ${animationPhase >= 3 ? 'bg-blue-500 border-blue-500' : 'border-blue-200'}`}>
                                                <Check className={`w-5 h-5 text-white transition-all ${animationPhase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">Read 30 mins</p>
                                                <p className="text-xs text-blue-600 font-medium">Learning · Daily</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-blue-400 bg-blue-100 px-2 py-1 rounded-md">1/1</span>
                                    </div>

                                    <div className={`flex items-center justify-between p-4 bg-purple-50 rounded-2xl border border-purple-100 transition-all duration-500 delay-200 ${animationPhase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full border-2 border-purple-200 bg-white" />
                                            <div>
                                                <p className="font-bold text-gray-800">Meditate</p>
                                                <p className="text-xs text-purple-600 font-medium">Mindfulness · 10 min</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-purple-400 bg-purple-100 px-2 py-1 rounded-md">0/1</span>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className={`mt-6 transition-all duration-500 delay-300 ${animationPhase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="flex justify-between text-sm mb-2 font-medium">
                                        <span className="text-gray-500">Today's Progress</span>
                                        <span className={`font-bold ${animationPhase >= 4 ? 'text-green-600' : 'text-gray-400'}`}>
                                            {animationPhase >= 4 ? '67%' : '0%'}
                                        </span>
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#FF7A6B] to-[#FFA094] rounded-full transition-all duration-1000 ease-out shadow-sm"
                                            style={{ width: animationPhase >= 4 ? '67%' : '0%' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Floating analytics card */}
                            <div
                                className={`absolute -right-4 sm:-right-8 top-1/3 bg-white border border-gray-100 rounded-2xl p-5 shadow-xl shadow-purple-500/10 transition-all duration-1000 delay-500 ${animationPhase >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <BarChart3 className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-800">Analytics</span>
                                </div>
                                <div className="flex gap-1.5 h-16 items-end">
                                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                        <div
                                            key={i}
                                            className="w-3 rounded-full bg-purple-200 transition-all duration-500"
                                            style={{
                                                height: animationPhase >= 4 ? `${h}%` : '10%',
                                                transitionDelay: `${i * 80}ms`,
                                                background: animationPhase >= 4 ? undefined : '#F3E8FF'
                                            }}
                                        >
                                            <div className={`w-full h-full rounded-full bg-purple-500 opacity-80 ${i === 5 ? 'opacity-100' : ''}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Floating badge card */}
                            <div
                                className={`absolute -left-4 bottom-8 bg-white border border-gray-100 rounded-2xl p-4 shadow-xl shadow-orange-500/10 transition-all duration-1000 delay-700 ${animationPhase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center shadow-md">
                                        <Trophy className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">7 Day Streak!</p>
                                        <p className="text-xs text-gray-500 font-medium">Keep it going 🔥</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FEATURES SECTION ===== */}
            <section ref={featuresRef} className="py-24 px-4 sm:px-6 relative bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className={`text-center mb-16 transition-all duration-1000 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <h2 className="text-4xl font-bold mb-4 text-gray-900">
                            Purpose-built for<br />
                            <span className="text-orange-500">personal growth</span>
                        </h2>
                        <p className="text-gray-500 max-w-lg mx-auto text-lg">
                            Everything you need to build better habits and achieve your goals.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURES.map((feature, index) => (
                            <div
                                key={feature.title}
                                className={`group p-8 bg-gray-50 border border-gray-100 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-500 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                    }`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md ring-4 ring-white`}>
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA SECTION ===== */}
            <section className="py-24 px-4 sm:px-6 bg-[#FFF8E7]">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-[2.5rem] p-12 sm:p-20 text-white shadow-2xl shadow-orange-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10">
                            <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
                                Ready to build better habits?
                            </h2>
                            <p className="text-orange-50 mb-10 max-w-lg mx-auto text-lg font-medium opacity-90">
                                Join thousands of users who have transformed their daily routines.
                            </p>
                            <button
                                onClick={() => openAuthModal('signup')}
                                className="px-10 py-4 bg-white text-orange-600 rounded-full font-bold text-lg hover:bg-orange-50 transition-all flex items-center gap-2 mx-auto group shadow-lg"
                            >
                                Get started free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="py-12 px-4 sm:px-6 border-t border-orange-100 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7A6B] to-[#FFA094] flex items-center justify-center shadow-sm">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">Habit Tracker</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">© 2026 Habit Tracker. All rights reserved.</p>
                </div>
            </footer>

            {/* ===== AUTH MODAL ===== */}
            {isAuthModalOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
                    onClick={(e) => { if (e.target === e.currentTarget) setIsAuthModalOpen(false); }}
                >
                    <div
                        className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setIsAuthModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Modal Header */}
                        <div className="mb-8 text-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                {authView === 'signin' ? <User className="w-6 h-6 text-orange-600" /> :
                                    authView === 'signup' ? <Sparkles className="w-6 h-6 text-orange-600" /> :
                                        <Lock className="w-6 h-6 text-orange-600" />}
                            </div>
                            <h2 className="text-2xl font-bold mb-2 text-gray-900">
                                {authView === 'signin' ? 'Welcome back' : authView === 'signup' ? 'Create Account' : 'Reset Password'}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {authView === 'signin' ? 'Enter your details to access your account' :
                                    authView === 'signup' ? 'Start your journey with us today' :
                                        "We'll send you instructions to reset it"}
                            </p>
                        </div>

                        {/* Tab Switcher */}
                        {authView !== 'forgot' && (
                            <div className="flex p-1.5 bg-gray-100 rounded-xl mb-8">
                                <button
                                    onClick={() => { setAuthView('signin'); setError(''); setSuccessMessage(''); }}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${authView === 'signin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => { setAuthView('signup'); setError(''); setSuccessMessage(''); }}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${authView === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}

                        {authView === 'forgot' && (
                            <button
                                onClick={() => setAuthView('signin')}
                                className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 group mx-auto font-medium"
                            >
                                <ChevronRight className="w-4 h-4 rotate-180 mr-1 group-hover:-translate-x-1 transition-transform" />
                                Back to sign in
                            </button>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all font-medium"
                                        placeholder="you@example.com"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {authView !== 'forgot' && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
                                        {authView === 'signin' && (
                                            <button
                                                type="button"
                                                onClick={() => setAuthView('forgot')}
                                                className="text-xs text-orange-600 font-semibold hover:text-orange-700"
                                            >
                                                Forgot password?
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all font-medium"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    {error}
                                </div>
                            )}

                            {successMessage && (
                                <div className="p-3 rounded-xl bg-green-50 text-green-700 text-sm font-medium flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    {successMessage}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        {authView === 'forgot' ? 'Send Link' : authView === 'signup' ? 'Create Account' : 'Sign In'}
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-xs text-gray-400 text-center leading-relaxed">
                            By continuing, you agree to our Terms of Service & Privacy Policy.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
