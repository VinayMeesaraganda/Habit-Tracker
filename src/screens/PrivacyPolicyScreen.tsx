import React from 'react';
import { ArrowLeft, Mail, Shield, Lock } from 'lucide-react';

interface PrivacyPolicyScreenProps {
    onBack: () => void;
}

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="flex items-center gap-3 px-4 h-14">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-800">Privacy Policy</h1>
                </div>
            </div>

            <div className="p-5 space-y-6">
                {/* Last Updated */}
                <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleDateString()}
                </div>

                {/* 1. What Information Do We Collect */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                        <DatabaseIcon className="w-5 h-5 text-blue-500" />
                        <h2>1. What Information Do We Collect?</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        We use backend services to allow us to better understand the functionality of our mobile software on your phone. We may link the data we store within the backend software to any personal data you submit within the mobile application.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-sm mt-2">
                        We automatically collect certain information when you visit, use or navigate <strong>Itera</strong>. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, country, location, and other technical information. This information is primarily needed to maintain the security and operation of our App, and for our internal analytics and reporting purposes.
                    </p>
                </section>

                {/* 2. Will Your Information Be Shared */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                        <Shield className="w-5 h-5 text-orange-500" />
                        <h2>2. Will Your Information Be Shared With Anyone?</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        Except with our third party service provider <strong>Supabase</strong> (which provides authentication and database services), the data is not shared with anyone. Supabase may collect information used to identify you (e.g. IP address for security).
                    </p>
                </section>

                {/* 3. Cookies */}
                <section className="space-y-3">
                    <h2 className="text-gray-900 font-bold text-lg">3. Do We Use Cookies and Other Tracking Technologies?</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        In Short: We may use cookies and other tracking technologies to collect and store your information.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-sm mt-1">
                        We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information essential for authentication and security.
                    </p>
                </section>

                {/* 4. International Transfer */}
                <section className="space-y-3">
                    <h2 className="text-gray-900 font-bold text-lg">4. Is Your Information Transferred Internationally?</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        In Short: We may transfer, store, and process your information in countries other than your own.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-sm mt-1">
                        Our third-party service (Supabase) may have servers located in the USA or other regions. If you are accessing the servers from outside, please be aware that your information may be transferred to, stored, and processed by us in our facilities. We will take all necessary measures to protect your personal information in accordance with this privacy notice and applicable law.
                    </p>
                </section>

                {/* 5. Retention */}
                <section className="space-y-3">
                    <h2 className="text-gray-900 font-bold text-lg">5. How Long Do We Keep Your Information?</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        In Short: We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-sm mt-1">
                        We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice. When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information.
                    </p>
                </section>

                {/* 6. Minors */}
                <section className="space-y-3">
                    <h2 className="text-gray-900 font-bold text-lg">6. Do We Collect Information From Minors?</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        In Short: We do not knowingly collect data from or market to children under 13 years of age.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-sm mt-1">
                        We do not knowingly solicit data from or market to children under 13 years of age. By using Itera, you represent that you are at least 13 or that you are the parent or guardian of such a minor and consent to such minor dependent use of Itera. If we learn that personal information from users less than 13 years of age has been collected, we will promptly delete such data from our records.
                    </p>
                </section>

                {/* 7. Privacy Rights */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                        <Lock className="w-5 h-5 text-purple-500" />
                        <h2>7. What Are Your Privacy Rights?</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        You have the right to request access to the personal information we collect from you, change that information, or delete it in some circumstances.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-sm mt-1">
                        <strong>To delete your data:</strong> You can use the "Delete Account" feature found directly in the Settings/Profile section of this app. This will immediately remove your account and all associated data.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-sm mt-1">
                        For other requests, please contact us at: <a href="mailto:Vinaykiran.018@gmail.com" className="text-blue-600 font-medium">Vinaykiran.018@gmail.com</a>
                    </p>
                </section>

                {/* 8. Updates */}
                <section className="space-y-3">
                    <h2 className="text-gray-900 font-bold text-lg">8. Do We Make Updates To This Notice?</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        In Short: Yes, we will update this notice as necessary to stay compliant with relevant laws. The updated version will be effective as soon as it is accessible.
                    </p>
                </section>

                {/* 9. Contact */}
                <section className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                        <Mail className="w-5 h-5 text-gray-700" />
                        <h2>9. How Can You Contact Us About This Notice?</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        If you have questions or comments about this notice, you may email us at: <a href="mailto:Vinaykiran.018@gmail.com" className="text-blue-600 font-medium">Vinaykiran.018@gmail.com</a>
                    </p>
                </section>
            </div>
        </div>
    );
};

// Simple icon component to avoid huge import list if needed, or import standard Lucide
const DatabaseIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
);
