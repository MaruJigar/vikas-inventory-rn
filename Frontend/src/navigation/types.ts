import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

/**
 * Auth flow (shown when unauthenticated). Registration is distributor-only —
 * salesmen are created by their distributor inside the app, not self-registered.
 */
export type AuthStackParamList = {
  Login: undefined;
  RegisterDistributor: undefined;
  RegisterSuccess: undefined;
  ForgotPassword: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

/**
 * Main app tabs (shown when approved). The Home tab renders a role-specific
 * dashboard; the other tabs are shared shells filled in by later phases.
 */
export type MainTabParamList = {
  Home: undefined;
  Shops: undefined;
  Orders: undefined;
  Account: undefined;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

/** Home tab stack (dashboard → products → cart). */
export type HomeStackParamList = {
  HomeDashboard: undefined;
  Products: undefined;
  Cart: undefined;
};

export type HomeScreenProps<T extends keyof HomeStackParamList> =
  NativeStackScreenProps<HomeStackParamList, T>;

/** Shops tab stack (listing → detail → add). */
export type ShopsStackParamList = {
  ShopsList: undefined;
  ShopDetail: { id: string };
  AddShop: undefined;
};

export type ShopsScreenProps<T extends keyof ShopsStackParamList> =
  NativeStackScreenProps<ShopsStackParamList, T>;

/** Account tab stack (account → distributor-only salesmen management). */
export type AccountStackParamList = {
  AccountHome: undefined;
  Salesmen: undefined;
  AddSalesman: undefined;
  SalesmanDetail: { id: string };
};

export type AccountScreenProps<T extends keyof AccountStackParamList> =
  NativeStackScreenProps<AccountStackParamList, T>;
