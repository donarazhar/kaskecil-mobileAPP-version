import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
    Login: undefined;
    ForgotPassword: undefined;
};

export type TransaksiStackParamList = {
    TransaksiList: undefined;
    TransaksiCreate: undefined;
    TransaksiDetail: { id: number };
    TransaksiEdit: { id: number };
    DraftEdit: { id: number };
};

export type DraftStackParamList = {
    DraftList: undefined;
    DraftCreate: undefined;
    DraftDetail: { id: number };
    DraftEdit: { id: number };
};

export type MenuStackParamList = {
    Menu: undefined;
    Profile: undefined;
    ProfileEdit: undefined;
    ChangePassword: undefined;
    Pengisian: undefined;
    MasterData: undefined;
    Cabang: undefined;
    Unit: undefined;
    MataAnggaran: undefined;
    Users: undefined;
    Notifications: undefined;
};

export type BottomTabParamList = {
    Dashboard: undefined;
    Transaksi: NavigatorScreenParams<TransaksiStackParamList>;
    Draft: NavigatorScreenParams<DraftStackParamList>;
    Laporan: undefined;
    MenuTab: NavigatorScreenParams<MenuStackParamList>;
};

export type MainStackParamList = {
    MainTabs: NavigatorScreenParams<BottomTabParamList>;
    Camera: { mode: 'photo' | 'document'; onCapture: (uri: string) => void };
    Filter: { type: 'transaksi' | 'draft'; onApply: (filters: any) => void };
    Approval: { id: number; type: 'draft' };
};

export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainStackParamList>;
};
