// @ts-nocheck
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from '@/hooks/useAuth';
import {
    LayoutDashboard,
    LogOut,
    Users,
    Building,
    Building2,
    ChevronDown,
    Menu,
    X,
    Bell,
    Search,
    Settings,
    User,
    CreditCard,
    RefreshCw,
    FileBarChart,
    Wallet,
    HelpCircle,
    Database,
    History,
    Printer,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

// Type for submenu items
type SubMenuItem = {
    label: string;
    icon: any;
    href: string;
};

// Master Inputan submenu - Super Admin (Instansi, Cabang, Unit only)
const masterInputanSuperAdmin: SubMenuItem[] = [
    { label: 'Input Instansi', icon: Building, href: '/master/instansi' },
    { label: 'Input Cabang', icon: Building, href: '/master/cabang' },
    { label: 'Input Unit', icon: Building2, href: '/master/unit' },
];

// Master Inputan submenu - Admin Unit (Akun AAS & Mata Anggaran for their unit)
const masterInputanAdminUnit: SubMenuItem[] = [
    { label: 'Input Akun AAS', icon: CreditCard, href: '/master/akun-aas' },
    { label: 'Input Mata Anggaran', icon: Wallet, href: '/master/mata-anggaran' },
];

// Transaksi submenu - Admin Unit only (Pengeluaran + Pengisian)
const transaksiItemsAdminUnit: SubMenuItem[] = [
    { label: 'Pengeluaran Kas', icon: Wallet, href: '/transaksi' },
    { label: 'Pengisian Kas', icon: RefreshCw, href: '/pengisian' },
];

// Laporan submenu - Super Admin (comprehensive reports)
const laporanItemsSuperAdmin: SubMenuItem[] = [
    { label: 'Laporan Akun', icon: CreditCard, href: '/laporan/akun-aas' },
    { label: 'Laporan Transaksi', icon: FileBarChart, href: '/laporan/transaksi' },
    { label: 'Cetak Laporan', icon: Printer, href: '/laporan/cetak' },
];

// Laporan submenu - Admin Unit (unit specific reports)
const laporanItemsAdminUnit: SubMenuItem[] = [
    { label: 'Laporan Transaksi', icon: FileBarChart, href: '/laporan/transaksi' },
    { label: 'Cetak Laporan', icon: Printer, href: '/laporan/cetak' },
];

// Pengaturan submenu - Super Admin only
const pengaturanItems: SubMenuItem[] = [
    { label: 'Pengguna', icon: Users, href: '/users' },
    { label: 'Activity Log', icon: History, href: '/settings/activity-log' },
    { label: 'Backup Data', icon: Database, href: '/settings/backup' },
];

// Mock notifications data
const mockNotifications = [
    { id: 1, title: 'Pengajuan Baru', message: '3 pengajuan menunggu persetujuan', time: '5 menit lalu', unread: true },
    { id: 2, title: 'Transaksi Disetujui', message: 'Transaksi #TRX-001 telah disetujui', time: '1 jam lalu', unread: true },
    { id: 3, title: 'Saldo Rendah', message: 'Saldo kas kecil Unit IT hampir habis', time: '2 jam lalu', unread: false },
];

export default function DashboardLayout() {
    const { user, logout, isAuthenticated, isLoading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [menuOpen, setMenuOpen] = useState<{ [key: string]: boolean }>({
        masterInputan: false,
        transaksi: false,
        laporan: false,
        pengaturan: false,
    });
    const [searchOpen, setSearchOpen] = useState(false);
    const location = useLocation();

    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
        window.location.href = '/login';
        return null;
    }

    // Role checks
    const isSuperAdmin = user?.role?.name === 'super_admin';

    // Get menu items based on role
    const masterInputanItems = isSuperAdmin ? masterInputanSuperAdmin : masterInputanAdminUnit;
    const laporanItems = isSuperAdmin ? laporanItemsSuperAdmin : laporanItemsAdminUnit;

    // Auto-expand menus based on current path (ONLY if not collapsed)
    useEffect(() => {
        if (!isCollapsed) {
            if (masterInputanItems.some(item => location.pathname.startsWith(item.href))) {
                setMenuOpen(prev => ({ ...prev, masterInputan: true }));
            }
            if (transaksiItemsAdminUnit.some(item => location.pathname.startsWith(item.href))) {
                setMenuOpen(prev => ({ ...prev, transaksi: true }));
            }
            if (laporanItems.some(item => location.pathname.startsWith(item.href))) {
                setMenuOpen(prev => ({ ...prev, laporan: true }));
            }
            if (pengaturanItems.some(item => location.pathname.startsWith(item.href)) || location.pathname.startsWith('/users')) {
                setMenuOpen(prev => ({ ...prev, pengaturan: true }));
            }
        }
    }, [location.pathname, laporanItems, isCollapsed]);

    const toggleMenu = (key: string) => {
        setMenuOpen(prev => ({
            masterInputan: key === 'masterInputan' ? !prev.masterInputan : false,
            transaksi: key === 'transaksi' ? !prev.transaksi : false,
            laporan: key === 'laporan' ? !prev.laporan : false,
            pengaturan: key === 'pengaturan' ? !prev.pengaturan : false,
        }));
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
        if (!isCollapsed) {
            setMenuOpen({
                masterInputan: false,
                transaksi: false,
                laporan: false,
                pengaturan: false,
            });
        }
    };

    // Check if submenu is active
    const isMenuActive = (items: SubMenuItem[]) => items.some(item => location.pathname.startsWith(item.href));

    // Nav Item Helper Component
    const NavItem = ({
        to,
        icon: Icon,
        label,
        active,
        onClick,
        mobile
    }: {
        to: string;
        icon: any;
        label: string;
        active?: boolean;
        onClick?: () => void;
        mobile?: boolean;
    }) => {
        const content = (
            <NavLink
                to={to}
                end={to === '/dashboard'}
                onClick={onClick}
                className={({ isActive }) => cn(
                    "nav-item",
                    (active !== undefined ? active : isActive) ? "nav-item-active" : "nav-item-inactive",
                    isCollapsed && !mobile && "justify-center px-2"
                )}
            >
                <Icon size={20} className="flex-shrink-0" />
                {(!isCollapsed || mobile) && <span className="font-medium animate-in fade-in zoom-in-95 duration-200">{label}</span>}
            </NavLink>
        );

        if (isCollapsed && !mobile) {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>
                        {content}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        {label}
                    </TooltipContent>
                </Tooltip>
            );
        }

        return content;
    };

    // Collapsible Menu Component
    const CollapsibleMenu = ({
        label,
        icon: Icon,
        menuKey,
        items,
        mobile = false
    }: {
        label: string;
        icon: any;
        menuKey: string;
        items: SubMenuItem[];
        mobile?: boolean;
    }) => {
        const isActive = isMenuActive(items);

        if (isCollapsed && !mobile) {
            return (
                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className={cn(
                                        "nav-item w-full justify-center px-2",
                                        isActive ? "nav-item-active" : "nav-item-inactive"
                                    )}
                                >
                                    <Icon size={20} className="flex-shrink-0" />
                                </button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            {label}
                        </TooltipContent>
                    </Tooltip>

                    <DropdownMenuContent side="right" className="w-56" align="start">
                        <DropdownMenuLabel>{label}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {items.map((item) => (
                            <DropdownMenuItem key={item.href} asChild>
                                <NavLink
                                    to={item.href}
                                    className={({ isActive }) => cn(
                                        "w-full cursor-pointer flex items-center p-2 rounded-sm hover:bg-accent",
                                        isActive && "bg-accent text-accent-foreground"
                                    )}
                                >
                                    <item.icon className="mr-2 h-4 w-4" />
                                    <span>{item.label}</span>
                                </NavLink>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }

        return (
            <>
                <button
                    onClick={() => toggleMenu(menuKey)}
                    className={cn(
                        "nav-item w-full justify-between",
                        isActive ? "nav-item-active" : "nav-item-inactive"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Icon size={20} className="flex-shrink-0" />
                        <span className="font-medium">{label}</span>
                    </div>
                    <ChevronDown
                        size={16}
                        className={cn(
                            "transition-transform duration-200",
                            menuOpen[menuKey] && "rotate-180"
                        )}
                    />
                </button>
                <div className={cn(
                    "overflow-hidden transition-all duration-300 ease-out",
                    menuOpen[menuKey] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}>
                    <div className="pl-4 space-y-1 pt-1">
                        {items.map((item) => (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                onClick={() => mobile && setSidebarOpen(false)}
                                className={({ isActive }) => cn(
                                    "nav-item text-sm",
                                    isActive ? "nav-item-active" : "nav-item-inactive"
                                )}
                            >
                                <item.icon size={18} className="flex-shrink-0" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            </>
        );
    };

    // Sidebar Content Component
    const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={cn("p-6 pb-8 transition-all duration-300", isCollapsed && !mobile ? "px-2 items-center" : "")}>
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 flex-shrink-0 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 shadow-lg overflow-hidden p-1">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    {(!isCollapsed || mobile) && (
                        <div className="overflow-hidden whitespace-nowrap">
                            <h1 className="text-xl font-bold text-white tracking-tight animate-in fade-in slide-in-from-left-4 duration-300">Kas Kecil</h1>
                            <p className="text-xs text-white/50 font-medium animate-in fade-in slide-in-from-left-4 duration-300 delay-75">Imprest Methode App</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className={cn("flex-1 px-4 space-y-1.5 overflow-y-auto overflow-x-hidden", isCollapsed && !mobile && "px-2")}>
                <NavItem
                    to="/dashboard"
                    icon={LayoutDashboard}
                    label="Dashboard"
                    mobile={mobile}
                    onClick={() => mobile && setSidebarOpen(false)}
                />

                <div className={cn("my-4 h-px bg-white/10", isCollapsed && !mobile ? "mx-2" : "mx-4")} />

                <CollapsibleMenu
                    label="Master Inputan"
                    icon={Database}
                    menuKey="masterInputan"
                    items={masterInputanItems}
                    mobile={mobile}
                />

                {!isSuperAdmin && (
                    <CollapsibleMenu
                        label="Transaksi"
                        icon={Wallet}
                        menuKey="transaksi"
                        items={transaksiItemsAdminUnit}
                        mobile={mobile}
                    />
                )}

                {isSuperAdmin ? (
                    <CollapsibleMenu
                        label="Laporan"
                        icon={FileBarChart}
                        menuKey="laporan"
                        items={laporanItems}
                        mobile={mobile}
                    />
                ) : (
                    <NavItem
                        to="/laporan/cetak"
                        icon={FileBarChart}
                        label="Laporan"
                        mobile={mobile}
                        onClick={() => mobile && setSidebarOpen(false)}
                    />
                )}

                {isSuperAdmin && (
                    <CollapsibleMenu
                        label="Pengaturan"
                        icon={Settings}
                        menuKey="pengaturan"
                        items={pengaturanItems}
                        mobile={mobile}
                    />
                )}
            </nav>

            {/* Collapse Toggle (Desktop Only) */}
            {!mobile && (
                <div className="px-4 py-2 border-t border-white/5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleCollapse}
                        className="w-full text-white/50 hover:text-white hover:bg-white/10 justify-center h-8"
                    >
                        {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                    </Button>
                </div>
            )}

            {/* User Profile Section */}
            <div className={cn("p-4 mt-auto", isCollapsed && !mobile && "px-2")}>
                <div className={cn("h-px bg-white/10 my-3", isCollapsed && !mobile && "mx-1")} />

                <div className={cn(
                    "flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 transition-all",
                    isCollapsed && !mobile ? "p-2 justify-center" : "px-3 py-3"
                )}>
                    {isCollapsed && !mobile ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Avatar className="h-8 w-8 border-2 border-white/20 cursor-pointer" onClick={() => logout()}>
                                    <AvatarImage src={user?.foto || undefined} />
                                    <AvatarFallback className="bg-white/10 text-white font-medium text-xs">
                                        {user?.nama?.substring(0, 2).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                                {user?.nama} (Klik untuk keluar)
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <>
                            <Avatar className="h-10 w-10 border-2 border-white/20">
                                <AvatarImage src={user?.foto || undefined} alt={user?.nama} />
                                <AvatarFallback className="bg-white/10 text-white font-medium text-sm">
                                    {user?.nama?.substring(0, 2).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{user?.nama || 'User'}</p>
                                <p className="text-xs text-white/50 truncate">{user?.role?.display_name || user?.role?.name}</p>
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => logout()}
                                        className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
                                    >
                                        <LogOut size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Keluar</TooltipContent>
                            </Tooltip>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-[#F5F7FA]">
                {/* Desktop Sidebar */}
                <aside className={cn(
                    "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-20" : "w-72"
                )}>
                    <div className="flex flex-col flex-1 bg-gradient-sidebar shadow-xl relative z-50">
                        <SidebarContent />
                    </div>
                </aside>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Mobile Sidebar */}
                <aside className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 ease-out lg:hidden",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    <div className="flex flex-col h-full bg-gradient-sidebar">
                        <div className="absolute right-4 top-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(false)}
                                className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                                <X size={24} />
                            </Button>
                        </div>
                        <SidebarContent mobile />
                    </div>
                </aside>

                {/* Main Content */}
                <div className={cn(
                    "transition-all duration-300 ease-in-out min-h-screen flex flex-col",
                    isCollapsed ? "lg:pl-20" : "lg:pl-72"
                )}>
                    {/* Header */}
                    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                        <div className="flex items-center justify-between h-16 px-4 lg:px-8">
                            {/* Left Section */}
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden hover:bg-gray-100"
                                    onClick={() => setSidebarOpen(true)}
                                >
                                    <Menu size={24} />
                                </Button>

                                {/* Breadcrumb / Page Title */}
                                <div className="hidden sm:block">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {location.pathname === '/dashboard' && 'Dashboard'}
                                        {location.pathname.includes('/master') && 'Master Inputan'}
                                        {location.pathname.includes('/transaksi') && 'Transaksi'}
                                        {location.pathname.includes('/laporan') && 'Laporan'}
                                        {location.pathname.includes('/users') && 'Pengguna'}
                                        {location.pathname.includes('/settings') && 'Pengaturan'}
                                    </h2>
                                </div>
                            </div>

                            {/* Right Section */}
                            <div className="flex items-center gap-2">
                                {/* Search Button */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-gray-100"
                                    onClick={() => setSearchOpen(!searchOpen)}
                                >
                                    <Search size={20} className="text-gray-600" />
                                </Button>

                                {/* Notifications */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 ml-1">
                                            <Bell size={20} className="text-gray-600" />
                                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-80">
                                        <DropdownMenuLabel className="flex items-center justify-between">
                                            <span className="font-semibold">Notifikasi</span>
                                            <button className="text-xs text-[#0053C5] font-medium hover:underline">
                                                Tandai semua dibaca
                                            </button>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {mockNotifications.map((notification) => (
                                            <DropdownMenuItem key={notification.id} className="p-4 cursor-pointer">
                                                <div className="flex gap-3">
                                                    <div className={cn(
                                                        "w-2 h-2 mt-2 rounded-full flex-shrink-0",
                                                        notification.unread ? "bg-[#0053C5]" : "bg-gray-300"
                                                    )} />
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                                        <p className="text-xs text-gray-500">{notification.message}</p>
                                                        <p className="text-xs text-gray-400">{notification.time}</p>
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="p-3 justify-center text-[#0053C5] font-medium cursor-pointer">
                                            Lihat semua notifikasi
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* User Menu - Desktop */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 h-auto hover:bg-gray-100 ml-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user?.foto || undefined} alt={user?.nama} />
                                                <AvatarFallback className="bg-[#0053C5]/10 text-[#0053C5] text-sm font-medium">
                                                    {user?.nama?.substring(0, 2).toUpperCase() || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="text-left hidden md:block">
                                                <p className="text-sm font-medium text-gray-900">{user?.nama || 'User'}</p>
                                                <p className="text-xs text-gray-500">{user?.role?.display_name || user?.role?.name}</p>
                                            </div>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                            <User size={16} className="mr-2" />
                                            Profil
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Settings size={16} className="mr-2" />
                                            Pengaturan
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:text-red-600">
                                            <LogOut size={16} className="mr-2" />
                                            Keluar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Search Bar (Expandable) */}
                        {searchOpen && (
                            <div className="px-4 lg:px-8 pb-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Cari transaksi, pengguna, atau menu..."
                                        className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0053C5]/20 focus:border-[#0053C5]"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 p-6 lg:p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
