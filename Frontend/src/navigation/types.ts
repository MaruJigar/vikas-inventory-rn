import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Product } from '@/types/product';

/**
 * Auth flow (shown when unauthenticated). The app is login-only — distributors
 * are created on the backend/admin side and salesmen by their distributor, so
 * there is no in-app registration.
 */
export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

/**
 * Main app tabs (shown when approved). The Home tab renders a role-specific
 * dashboard; the other tabs are shared shells filled in by later phases.
 */
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Shops: NavigatorScreenParams<ShopsStackParamList> | undefined;
  Orders: NavigatorScreenParams<OrdersStackParamList> | undefined;
  Account: NavigatorScreenParams<AccountStackParamList> | undefined;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

/** Home tab stack (dashboard → visit flow → products → cart → success). */
export type HomeStackParamList = {
  HomeDashboard: undefined;
  SelectShop: undefined;
  Products: undefined;
  AddProduct: { product?: Product } | undefined;
  Cart: undefined;
  OrderSuccess: { orderNumber: string };
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

/** Orders tab stack (listing → detail). */
export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetail: { id: string };
};

export type OrdersScreenProps<T extends keyof OrdersStackParamList> =
  NativeStackScreenProps<OrdersStackParamList, T>;

/** Account tab stack (account → distributor-only salesmen management). */
export type AccountStackParamList = {
  AccountHome: undefined;
  Salesmen: undefined;
  AddSalesman: undefined;
  SalesmanDetail: { id: string };
};

export type AccountScreenProps<T extends keyof AccountStackParamList> =
  NativeStackScreenProps<AccountStackParamList, T>;
