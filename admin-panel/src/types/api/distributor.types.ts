export interface RegisterDistributorDto {
  email: string;
  password?: string;
  name: string;
  manufacturer_id: string;
}
export type UpdateDistributorDto = Partial<RegisterDistributorDto>;

export interface DistributorDto {
  id: string;
  user_id: string;
  name: string;
}
