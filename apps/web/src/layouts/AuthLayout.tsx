import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding & Illustration */}
            <div className="hidden lg:flex lg:w-[55%] bg-gradient-sidebar relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 opacity-[0.03]">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>

                    {/* Floating Circles */}
                    <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-soft" />
                    <div className="absolute top-1/4 -right-20 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
                    <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16 text-white">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-lg overflow-hidden p-1">
                            <img src="/logo.png" alt="Kas Kecil Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Kas Kecil</h1>
                            <p className="text-sm text-white/60 font-medium">Imprest Methode App</p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-8 max-w-lg">
                        <div className="space-y-4">
                            <h2 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
                                Kelola Kas Kecil
                                <span className="block text-white/90">dengan Mudah</span>
                            </h2>
                            <p className="text-lg text-white/70 leading-relaxed">
                                Platform terintegrasi untuk mengelola kas kecil organisasi Anda dengan transparan, akuntabel, dan efisien.
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            {[
                                { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Multi Cabang & Unit' },
                                { icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Laporan Real-time' },
                                { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: 'Keamanan Terjamin' },
                                { icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', label: 'Akses Mobile App' },
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-white/90">{feature.label}</span>
                                </div>
                            ))}
                        </div>


                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-white/40">
                        <span>© {new Date().getFullYear()} Kas Kecil. All rights reserved by Bagian ITTD YPI Al Azhar</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gray-50/50">
                <div className="w-full max-w-[420px]">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
                        <div className="w-14 h-14 bg-[#0053C5] rounded-2xl flex items-center justify-center shadow-lg shadow-[#0053C5]/30 overflow-hidden p-1">
                            <img src="/logo.png" alt="Kas Kecil Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Kas Kecil</h1>
                            <p className="text-sm text-gray-500">Imprest Methode App</p>
                        </div>
                    </div>

                    <div className="animate-fade-in">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}
