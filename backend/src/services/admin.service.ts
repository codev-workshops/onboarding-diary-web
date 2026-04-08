import { Role, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { AppError } from '../middleware/errorHandler';
import { PaginationQuery } from '../types';

interface UserListQuery extends PaginationQuery {
  search?: string;
  role?: string;
  department?: string;
  isActive?: string;
}

export class AdminService {
  async listUsers(query: UserListQuery) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query, 'createdAt');

    const where: Prisma.UserWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.role) where.role = query.role as Role;
    if (query.department) where.department = query.department;
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          department: true,
          startDate: true,
          isActive: true,
          managerId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return buildPaginatedResponse(users, total, page, limit);
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        startDate: true,
        isActive: true,
        managerId: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        manager: { select: { id: true, name: true, email: true } },
      },
    });

    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    return user;
  }

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role: Role;
    department?: string;
    startDate?: string;
    managerId?: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError(409, 'CONFLICT', 'Email already registered');
    }

    if (data.managerId) {
      const manager = await prisma.user.findFirst({
        where: { id: data.managerId, role: 'manager' },
      });
      if (!manager) {
        throw new AppError(400, 'INVALID_MANAGER', 'Manager not found or user is not a manager');
      }
    }

    const passwordHash = await hashPassword(data.password);

    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role,
        department: data.department,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        managerId: data.managerId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        startDate: true,
        isActive: true,
        managerId: true,
        createdAt: true,
      },
    });
  }

  async updateUser(
    id: string,
    data: {
      name?: string;
      role?: Role;
      department?: string;
      startDate?: string;
      managerId?: string | null;
      isActive?: boolean;
    }
  ) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    if (data.managerId) {
      const manager = await prisma.user.findFirst({
        where: { id: data.managerId, role: 'manager' },
      });
      if (!manager) {
        throw new AppError(400, 'INVALID_MANAGER', 'Manager not found or user is not a manager');
      }
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.managerId !== undefined) {
      updateData.manager = data.managerId
        ? { connect: { id: data.managerId } }
        : { disconnect: true };
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        startDate: true,
        isActive: true,
        managerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deactivateUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    return prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
  }

  async activateUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    return prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
  }

  async deleteUser(id: string, confirmEmail: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    if (user.email !== confirmEmail) {
      throw new AppError(400, 'CONFIRMATION_FAILED', 'Email confirmation does not match');
    }

    await prisma.user.delete({ where: { id } });
  }
}

export const adminService = new AdminService();
