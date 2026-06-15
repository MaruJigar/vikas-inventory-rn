export interface UserDto {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'MANUFACTURER_ADMIN' | 'DISTRIBUTOR_ADMIN' | 'SALESMAN';
  name: string;
  userId: string;
}

export interface AuthDto {
  email_or_phone: string;
  password?: string;
  fcmToken?: string;
}
