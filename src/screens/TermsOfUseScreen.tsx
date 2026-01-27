import React from 'react';
import { ArrowLeft, Scale, FileText, AlertCircle, Ban } from 'lucide-react';

interface TermsOfUseScreenProps {
    onBack: () => void;
}

export const TermsOfUseScreen: React.FC<TermsOfUseScreenProps> = ({ onBack }) => {
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
                    <h1 className="text-lg font-bold text-gray-800">Terms of Use</h1>
                </div>
            </div>

            <div className="p-5 space-y-6">
                <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleDateString()}
                </div>

                {/* 1. The Application */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <h2>1. The Application</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        <strong>Itera</strong> (hereinafter: Application) is a piece of software created to help people build new habits and focus - and customized for Apple mobile devices. It is used to track habit activity, set up timers, and analyze progress.
                    </p>
                </section>

                {/* 2. Scope of License */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                        <Scale className="w-5 h-5 text-green-500" />
                        <h2>2. Scope of License</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        2.1 You are given a non-transferable, non-exclusive, non-sublicensable license to install and use the Licensed Application on any Apple-branded Products that You (End-User) own or control and as permitted by the Usage Rules set forth in this section and the App Store Terms of Service.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-sm mt-2">
                        2.2 This license will also govern any updates of the Application provided by Licensor that replace, repair, and/or supplement the first Application.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-sm mt-2">
                        2.3 You may not share or make the Application available to third parties, sell, rent, lend, lease or otherwise redistribute the Application.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-sm mt-2">
                        2.4 You may not reverse engineer, translate, disassemble, integrate, decompile, remove, modify, combine, create derivative works or updates of, adapt, or attempt to derive the source code of the Application.
                    </p>
                </section>

                {/* 3. User Generated Contributions */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        <h2>3. User Generated Contributions</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        The Application does not offer users to submit or post public content. However, you may create, submit, post, display, transmit, or store content (habits, logs, notes) within the Application ("Contributions").
                    </p>
                    <p className="text-gray-600 leading-relaxed text-sm mt-2">
                        By creating Contributions, you represent and warrant that:
                    </p>
                    <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                        <li>Your Contributions do not violate any applicable law, regulation, or rule.</li>
                        <li>Your Contributions are not false, inaccurate, or misleading.</li>
                        <li>Your Contributions do not contain any material that solicits personal information from anyone under the age of 18.</li>
                    </ul>
                </section>

                {/* 4. Contribution License */}
                <section className="space-y-3">
                    <h2 className="text-gray-900 font-bold text-lg">4. Contribution License</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        You agree that we may access, store, process, and use any information and personal data that you provide following the terms of the Privacy Policy. We do not assert any ownership over your Contributions. You retain full ownership of all of your Contributions.
                    </p>
                </section>

                {/* 5. Liability & Warranty */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                        <Ban className="w-5 h-5 text-red-500" />
                        <h2>5. Liability & Warranty</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        5.1 Licensor warrants that the Application is free of spyware, trojan horses, viruses, or any other malware at the time of Your download.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-sm mt-2">
                        5.2 No warranty is provided for the Application that is not executable on the device, that has been unauthorizedly modified, handled inappropriately or culpably, combined or installed with inappropriate hardware or software.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-sm mt-2">
                        5.3 <strong>Limitation of Liability:</strong> In no event will we be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages arising from your use of the Application.
                    </p>
                </section>

                {/* 6. Product Claims */}
                <section className="space-y-3">
                    <h2 className="text-gray-900 font-bold text-lg">6. Product Claims</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        Vinay kiran and the End-User acknowledge that Vinay kiran, and not Apple, is responsible for addressing any claims of the End-User or any third party relating to the licensed Application or the End-User’s possession and/or use of that licensed Application, including product liability claims and claims arising under consumer protection or privacy legislation.
                    </p>
                </section>

                {/* 7. Legal Compliance */}
                <section className="space-y-3">
                    <h2 className="text-gray-900 font-bold text-lg">7. Legal Compliance</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        You represent and warrant that You are not located in a country that is subject to a U.S. Government embargo, or that has been designated by the U.S. Government as a "terrorist supporting" country; and that You are not listed on any U.S. Government list of prohibited or restricted parties.
                    </p>
                </section>

                {/* 8. Third-Party Beneficiary */}
                <section className="space-y-3">
                    <h2 className="text-gray-900 font-bold text-lg">8. Third-Party Beneficiary</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        Apple and Apple's subsidiaries shall be third-party beneficiaries of this End User License Agreement and - upon Your acceptance of the terms and conditions of this license agreement, Apple will have the right (and will be deemed to have accepted the right) to enforce this End User License Agreement against You as a third-party beneficiary thereof.
                    </p>
                </section>

                {/* 9. Governing Law */}
                <section className="space-y-3">
                    <h2 className="text-gray-900 font-bold text-lg">9. Applicable Law</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        This license agreement is governed by the laws of the United States of America excluding its conflicts of law rules.
                    </p>
                </section>

                {/* Contact */}
                <section className="space-y-3 pt-4 border-t border-gray-100">
                    <p className="text-gray-600 leading-relaxed text-sm">
                        For general inquiries, complaints, questions or claims concerning the licensed Application, please contact: <a href="mailto:Vinaykiran.018@gmail.com" className="text-blue-600 font-medium">Vinaykiran.018@gmail.com</a>
                    </p>
                </section>
            </div>
        </div>
    );
};
