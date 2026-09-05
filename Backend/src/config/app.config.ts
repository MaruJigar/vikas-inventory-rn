import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  adminPanelUrl: process.env.ADMIN_PANEL_URL,
  reactNativeWebUrl: process.env.REACT_NATIVE_WEB_URL,
  uploadRoot: process.env.UPLOAD_ROOT || 'storage/uploads',
  appBaseUrl: process.env.APP_BASE_URL,
  frontendUrl: process.env.FRONTEND_URL,
}));
