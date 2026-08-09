import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Product } from '@/types/product';
import type { InventoryItem } from '@/types/inventory';

/**
 * Auth flow (shown when unauthenticated). The app is login-only — distributors
 * are created on the backend/admin side and salesmen by their distributor, so
 * there is no in-app registration.
 */
export type AuthStackParamList = {
  Login: undefined;
  RegisterDistributor: undefined;
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
  Categories: undefined;
  /** Optional category scopes the list to one category (client-side filter). */
  Products: { categoryId?: string; categoryName?: string } | undefined;
  /** Full record; the list already carries it, so it travels here rather than
   * being re-fetched. Also offers add-to-cart during an active visit. */
  ProductDetail: { product: Product };
  /**
   * `categoryId`/`categoryName` come from a category-scoped Products list: the
   * new product belongs to the category being browsed, so the form locks to it.
   */
  AddProduct:
    | { product?: Product; categoryId?: string; categoryName?: string }
    | undefined;
  Cart: undefined;
  OrderSuccess: { orderNumber: string };
  /** Distributor→Manufacturer purchase-order flow. */
  PurchaseOrderProducts: undefined;
  PurchaseOrderCart: undefined;
  PurchaseOrderSuccess: { count: number };
};

export type HomeScreenProps<T extends keyof HomeStackParamList> =
  NativeStackScreenProps<HomeStackParamList, T>;

/** Shops tab stack (listing → detail → add / edit). */
export type ShopsStackParamList = {
  ShopsList: undefined;
  ShopDetail: { id: string };
  AddShop: undefined;
  EditShop: { id: string };
};

export type ShopsScreenProps<T extends keyof ShopsStackParamList> =
  NativeStackScreenProps<ShopsStackParamList, T>;

/**
 * An order's direction, keyed off `salesman_id`: a purchase order is the
 * distributor→manufacturer one (no salesman), a sales order is salesman→shop.
 */
export type OrderTypeFilter = 'PURCHASE' | 'SALES';

/** Orders tab stack (listing → detail → edit; distributor-only backorders). */
export type OrdersStackParamList = {
  /**
   * `initialStatus` pre-selects a status filter by status_id (e.g. a tile).
   * `salesmanId` / `shopId` scope the list (from a salesman or shop screen);
   * `filterLabel` names that scope for the "Filtered by …" banner.
   * `orderType` narrows to purchase (distributor→manufacturer) or sales
   * (salesman→shop) orders — applied CLIENT-side, as the backend has no such
   * filter; see `OrdersListScreen`.
   */
  OrdersList:
    | {
        initialStatus?: string;
        salesmanId?: string;
        shopId?: string;
        orderType?: OrderTypeFilter;
        filterLabel?: string;
      }
    | undefined;
  OrderDetail: { id: string };
  EditOrder: { id: string };
  Backorders: undefined;
  BackorderDetail: { id: string };
};

export type OrdersScreenProps<T extends keyof OrdersStackParamList> =
  NativeStackScreenProps<OrdersStackParamList, T>;

/** Account tab stack (account → profile edit + distributor salesmen mgmt). */
export type AccountStackParamList = {
  AccountHome: undefined;
  EditProfile: undefined;
  Salesmen: undefined;
  AddSalesman: undefined;
  SalesmanDetail: { id: string };
  Approvals: undefined;
  /** `subject` carries the enriched name from the list (the detail endpoint
   * doesn't re-resolve it for shop approvals). */
  ApprovalDetail: { id: string; subject?: string };
  Attendance: undefined;
  /** Distributor stock management (distributor-only, entered from Account). */
  Inventory: undefined;
  /** There is no `GET /inventory/:id`, so the row travels from the list. */
  InventoryDetail: { item: InventoryItem };
  /** Without params the screen picks a product first (opening stock). */
  AdjustStock: { productId?: string; productName?: string } | undefined;
  InventoryValuation: undefined;
};

export type AccountScreenProps<T extends keyof AccountStackParamList> =
  NativeStackScreenProps<AccountStackParamList, T>;
