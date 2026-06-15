import { join } from 'path';

export const getUploadRoot = () => join(process.cwd(), process.env.UPLOAD_ROOT || 'storage/uploads');
