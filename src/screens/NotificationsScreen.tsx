import React, { useState } from 'react';
import { ChevronLeft, Bell, Clock } from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';

interface NotificationsScreenProps {
    onBack: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
    const [reminderTime, setReminderTime] = useState('09:00');
    const [isEnabled, setIsEnabled] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleScheduleReminder = async () => {
        if (!reminderTime) return;
        const [hours, minutes] = reminderTime.split(':').map(Number);

        try {
            // Request permissions
            let perm = await LocalNotifications.checkPermissions();
            if (perm.display !== 'granted') {
                perm = await LocalNotifications.requestPermissions();
                if (perm.display !== 'granted') {
                    showMessage('error', 'Notification permission denied');
                    return;
                }
            }

            // Schedule notification
            await LocalNotifications.schedule({
                notifications: [{
                    title: "Time to check your habits! 📝",
                    body: "Keep your streak going strong.",
                    id: 1,
                    schedule: {
                        on: { hour: hours, minute: minutes },
                        allowWhileIdle: true
                    }
                }]
            });

            setIsEnabled(true);
            showMessage('success', `Daily reminder set for ${reminderTime}!`);
        } catch (err: any) {
            showMessage('error', 'Failed to schedule: ' + err.message);
        }
    };

    const handleDisableReminder = async () => {
        try {
            await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
            setIsEnabled(false);
            showMessage('success', 'Reminder disabled');
        } catch (err: any) {
            showMessage('error', 'Failed to cancel: ' + err.message);
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
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
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
                {/* Daily Reminder Card */}
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-800">Daily Reminder</h2>
                            <p className="text-sm text-gray-500">Get notified to check your habits</p>
                        </div>
                    </div>

                    {/* Time Picker */}
                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-600 mb-2 block">Reminder Time</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="time"
                                value={reminderTime}
                                onChange={(e) => setReminderTime(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-bold text-lg focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleScheduleReminder}
                            className="flex-1 py-3 rounded-xl font-semibold bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.98] transition-all"
                        >
                            {isEnabled ? 'Update Reminder' : 'Enable Reminder'}
                        </button>
                        {isEnabled && (
                            <button
                                onClick={handleDisableReminder}
                                className="px-4 py-3 rounded-xl font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition-all"
                            >
                                Disable
                            </button>
                        )}
                    </div>
                </section>

                {/* Info Card */}
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                    <p className="text-sm text-blue-700">
                        💡 Tip: Set a reminder for a time when you're usually free to reflect on your day.
                    </p>
                </div>
            </div>
        </div>
    );
};
