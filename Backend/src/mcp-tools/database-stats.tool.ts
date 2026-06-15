import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Tool } from '@nestjs-mcp/server';
import { z } from 'zod';

@Injectable()
export class DatabaseStatsTool {
  constructor(private dataSource: DataSource) {}

  @Tool({
    name: 'get_database_stats',
    description:
      'Retrieves the total count of registered users, products, and distributors inside the Vikas Inventory system.',
  })
  async execute() {
    try {
      const userCount = await this.dataSource.query(
        'SELECT COUNT(*) FROM users',
      );
      const productCount = await this.dataSource.query(
        'SELECT COUNT(*) FROM products',
      );
      const distributorCount = await this.dataSource.query(
        'SELECT COUNT(*) FROM distributors',
      );
      const shopCount = await this.dataSource.query(
        'SELECT COUNT(*) FROM shops',
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                users: parseInt(userCount[0].count, 10),
                products: parseInt(productCount[0].count, 10),
                distributors: parseInt(distributorCount[0].count, 10),
                shops: parseInt(shopCount[0].count, 10),
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to retrieve stats: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
}
