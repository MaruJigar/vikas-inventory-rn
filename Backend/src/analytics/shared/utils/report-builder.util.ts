import { SelectQueryBuilder } from 'typeorm';

export function applyOwnership(
  query: SelectQueryBuilder<any>,
  alias: string,
  userRole: string,
  userId: string,
  field: string,
) {
  if (userRole === 'DISTRIBUTOR_ADMIN') {
    if (field === 'requester_user_id') {
      query.andWhere(`${alias}.${field} = :userId`, { userId });
    } else {
      const distSubquery = `SELECT d.id FROM distributors d WHERE d.user_id = :userId`;
      query.andWhere(`${alias}.${field} IN (${distSubquery})`, { userId });
    }
  } else if (userRole === 'SALESMAN') {
    if (field === 'requester_user_id') {
      query.andWhere(`${alias}.${field} = :userId`, { userId });
    } else {
      const salesSubquery = `SELECT s.id FROM salesmen s WHERE s.user_id = :userId`;
      query.andWhere(`${alias}.${field} IN (${salesSubquery})`, { userId });
    }
  } else if (userRole === 'MANUFACTURER_ADMIN') {
    if (field === 'distributor_id' || field === 'salesman_id') {
      // If it's salesman_id, we still map via distributor_id if it's there
      const qbSubquery = `
        SELECT md.distributor_id
        FROM manufacturer_distributors md
        INNER JOIN manufacturers m ON m.id = md.manufacturer_id
        WHERE m.user_id = :userId
      `;
      query.andWhere(`${alias}.distributor_id IN (${qbSubquery})`, {
        userId,
      });
    } else if (field === 'requester_user_id') {
      const userSubquery = `
        SELECT d.user_id
        FROM distributors d
        INNER JOIN manufacturer_distributors md ON md.distributor_id = d.id
        INNER JOIN manufacturers m ON m.id = md.manufacturer_id
        WHERE m.user_id = :userId
      `;
      query.andWhere(`${alias}.requester_user_id IN (${userSubquery})`, {
        userId,
      });
    }
  }
}
