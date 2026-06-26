import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/** Auth flow (shown when unauthenticated). */
export type AuthStackParamList = {
  Login: undefined;
  RoleSelect: undefined;
  RegisterSalesman: undefined;
  RegisterDistributor: undefined;
  RegisterSuccess: undefined;
  ForgotPassword: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

/** Root (post-auth) — expands as feature stacks land in later phases. */
export type RootStackParamList = {
  Placeholder: undefined;
};
