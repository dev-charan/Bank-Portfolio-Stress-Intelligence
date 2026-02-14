// src/controllers/borrowerController.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";

export class BorrowerController {
  // Get all borrowers
  async getAllBorrowers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 50, search } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: "insensitive" } },
          { pan: { contains: search as string, mode: "insensitive" } },
        ];
      }

      const [borrowers, total] = await Promise.all([
        prisma.borrower.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            directors: true,
            guarantors: true,
            _count: {
              select: { records: true },
            },
          },
          orderBy: { name: "asc" },
        }),
        prisma.borrower.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          borrowers,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get borrower by ID
  async getBorrowerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const borrower = await prisma.borrower.findUnique({
        where: { id },
        include: {
          directors: true,
          guarantors: true,
          records: {
            include: {
              bank: true,
              branch: true,
            },
            orderBy: {
              reportingCycle: "desc",
            },
          },
        },
      });

      if (!borrower) {
        return res.status(404).json({
          success: false,
          message: "Borrower not found",
        });
      }

      res.json({
        success: true,
        data: borrower,
      });
    } catch (error) {
      next(error);
    }
  }
}
