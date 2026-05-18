import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { PaginatedResponse, PaginationParams } from '@shared/types';

/**
 * Base Repository with common CRUD operations
 * All repositories should extend this class
 */
@Injectable()
export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  constructor(protected prisma: PrismaService) {}

  /**
   * Find all records with pagination
   */
  async findAll(
    params: PaginationParams = { page: 1, limit: 10 },
  ): Promise<PaginatedResponse<T>> {
    const page = Math.max(params.page || 1, 1);
    const limit = Math.min(Math.max(params.limit || 10, 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.findMany({ skip, take: limit }),
      this.count(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Find by ID
   */
  abstract findById(id: string): Promise<T | null>;

  /**
   * Find many records
   */
  abstract findMany(args: any): Promise<T[]>;

  /**
   * Count records
   */
  abstract count(): Promise<number>;

  /**
   * Create a new record
   */
  abstract create(data: CreateInput): Promise<T>;

  /**
   * Update a record
   */
  abstract update(id: string, data: UpdateInput): Promise<T>;

  /**
   * Delete a record
   */
  abstract delete(id: string): Promise<T>;
}
