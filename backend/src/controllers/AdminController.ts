/**
 * Admin Controller - Comprehensive System Administration
 * UN Climate Challenge 2024
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class AdminController {
  /**
   * Get comprehensive admin dashboard data
   */
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      // Get real-time statistics from database
      const [
        totalUsers,
        totalFarms,
        totalCarbonCredits,
        totalTransactions,
        totalRevenue,
        activeListings,
        pendingVerifications,
        systemHealth
      ] = await Promise.all([
        prisma.user.count(),
        prisma.farm.count(),
        prisma.carbonCredit.count(),
        prisma.transaction.count(),
        prisma.transaction.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { totalAmount: true }
        }),
        prisma.carbonCredit.count({ where: { status: 'LISTED' } }),
        prisma.carbonCredit.count({ where: { status: 'PENDING' } }),
        this.getSystemHealth()
      ]);

      // Get recent activity
      const recentActivity = await this.getRecentActivity();

      // Get user growth trends
      const userGrowth = await this.getUserGrowthTrends();

      // Get carbon credit trends
      const creditTrends = await this.getCarbonCreditTrends();

      const dashboard = {
        overview: {
          totalUsers: totalUsers,
          totalFarms: totalFarms,
          totalCarbonCredits: totalCarbonCredits,
          totalTransactions: totalTransactions,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          activeListings: activeListings,
          pendingVerifications: pendingVerifications
        },
        systemHealth,
        recentActivity,
        userGrowth,
        creditTrends
      };

      res.status(200).json({ success: true, data: dashboard });
    } catch (error) {
      logger.error('Error fetching admin dashboard:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
    }
  }

  /**
   * Get detailed system statistics
   */
  async getSystemStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.getComprehensiveSystemStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      logger.error('Error fetching system stats:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch system statistics' });
    }
  }

  /**
   * Get user management data
   */
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, role, search, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (role) where.role = role;
      if (status !== undefined) where.isActive = status === 'active';
      if (search) {
        where.OR = [
          { email: { contains: String(search), mode: 'insensitive' } },
          { phone: { contains: String(search), mode: 'insensitive' } },
          { profile: { firstName: { contains: String(search), mode: 'insensitive' } } },
          { profile: { lastName: { contains: String(search), mode: 'insensitive' } } }
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            profile: true,
            _count: {
              select: {
                farms: true,
                carbonCredits: true,
                purchases: true,
                sales: true
              }
            }
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching users:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
  }

  /**
   * Update user role or status
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { role, isActive } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { role, isActive },
        include: { profile: true }
      });

      // Create audit log
      await this.createAuditLog('USER_UPDATE', req.user?.id, {
        targetUserId: userId,
        changes: { role, isActive }
      });

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      logger.error('Error updating user:', error);
      res.status(500).json({ success: false, error: 'Failed to update user' });
    }
  }

  /**
   * Get farm management data
   */
  async getFarms(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, status, cropType, district } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (status !== undefined) where.isActive = status === 'active';
      if (cropType) where.cropType = cropType;
      if (district) {
        where.farmer = {
          profile: { district: { contains: String(district), mode: 'insensitive' } }
        };
      }

      const [farms, total] = await Promise.all([
        prisma.farm.findMany({
          where,
          include: {
            farmer: {
              include: { profile: true }
            },
            carbonCredits: {
              select: {
                id: true,
                status: true,
                quantity: true,
                pricePerCredit: true
              }
            },
            _count: {
              select: { carbonCredits: true }
            }
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.farm.count({ where })
      ]);

      res.status(200).json({
        success: true,
        data: {
          farms,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching farms:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch farms' });
    }
  }

  /**
   * Get carbon credit management data
   */
  async getCarbonCredits(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, status, verificationLevel, projectType } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (status) where.status = status;
      if (verificationLevel) where.verificationLevel = verificationLevel;
      if (projectType) where.projectType = projectType;

      const [credits, total] = await Promise.all([
        prisma.carbonCredit.findMany({
          where,
          include: {
            farm: {
              include: {
                farmer: {
                  include: { profile: true }
                }
              }
            },
            transactions: {
              select: {
                id: true,
                status: true,
                totalAmount: true,
                createdAt: true
              }
            }
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.carbonCredit.count({ where })
      ]);

      res.status(200).json({
        success: true,
        data: {
          credits,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching carbon credits:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch carbon credits' });
    }
  }

  /**
   * Get transaction management data
   */
  async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, status, dateFrom, dateTo } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (status) where.status = status;
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(String(dateFrom));
        if (dateTo) where.createdAt.lte = new Date(String(dateTo));
      }

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: {
            carbonCredit: {
              include: {
                farm: {
                  include: {
                    farmer: {
                      include: { profile: true }
                    }
                  }
                }
              }
            },
            seller: {
              include: { profile: true }
            },
            buyer: {
              include: { profile: true }
            }
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.transaction.count({ where })
      ]);

      res.status(200).json({
        success: true,
        data: {
          transactions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching transactions:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
    }
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, action, userId, dateFrom, dateTo } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // For now, return mock audit logs since we don't have an audit log table
      // In production, this would query a real audit log table
      const mockAuditLogs = [
        {
          id: '1',
          action: 'USER_LOGIN',
          userId: 'user1',
          details: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0...' },
          timestamp: new Date()
        },
        {
          id: '2',
          action: 'CARBON_CREDIT_CREATED',
          userId: 'user2',
          details: { creditId: 'credit1', quantity: 100 },
          timestamp: new Date()
        }
      ];

      res.status(200).json({
        success: true,
        data: {
          logs: mockAuditLogs,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: mockAuditLogs.length,
            pages: 1
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching audit logs:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
    }
  }

  /**
   * Export data
   */
  async exportData(req: Request, res: Response): Promise<void> {
    try {
      const { type, format = 'json', filters } = req.params;
      
      let data: any = {};
      
      switch (type) {
        case 'users':
          data = await prisma.user.findMany({
            include: { profile: true },
            orderBy: { createdAt: 'desc' }
          });
          break;
        case 'farms':
          data = await prisma.farm.findMany({
            include: {
              farmer: { include: { profile: true } },
              carbonCredits: true
            },
            orderBy: { createdAt: 'desc' }
          });
          break;
        case 'carbon-credits':
          data = await prisma.carbonCredit.findMany({
            include: {
              farm: {
                include: {
                  farmer: { include: { profile: true } }
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          });
          break;
        case 'transactions':
          data = await prisma.transaction.findMany({
            include: {
              carbonCredit: true,
              seller: { include: { profile: true } },
              buyer: { include: { profile: true } }
            },
            orderBy: { createdAt: 'desc' }
          });
          break;
        default:
          return res.status(400).json({ success: false, error: 'Invalid export type' });
      }

      // Create audit log
      await this.createAuditLog('DATA_EXPORT', req.user?.id, {
        exportType: type,
        format,
        filters
      });

      if (format === 'csv') {
        // Convert to CSV format
        const csv = this.convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${type}-${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csv);
      } else {
        res.status(200).json({ success: true, data });
      }
    } catch (error) {
      logger.error('Error exporting data:', error);
      res.status(500).json({ success: false, error: 'Failed to export data' });
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.getSystemHealth();
      res.status(200).json({ success: true, data: health });
    } catch (error) {
      logger.error('Error fetching system health:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch system health' });
    }
  }

  /**
   * Get blockchain status
   */
  async getBlockchainStatus(req: Request, res: Response): Promise<void> {
    try {
      // This would integrate with the BlockchainService
      const blockchainStatus = {
        network: 'Polygon Mumbai Testnet',
        status: 'connected',
        lastBlock: 12345678,
        gasPrice: '30 gwei',
        contractAddresses: {
          carbonCredit: '0x1234...',
          escrow: '0x5678...'
        },
        lastSync: new Date()
      };

      res.status(200).json({ success: true, data: blockchainStatus });
    } catch (error) {
      logger.error('Error fetching blockchain status:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch blockchain status' });
    }
  }

  // Private helper methods

  private async getSystemHealth() {
    try {
      // Test database connection
      await prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  private async getRecentActivity() {
    const [recentUsers, recentCredits, recentTransactions] = await Promise.all([
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { profile: true }
      }),
      prisma.carbonCredit.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          farm: {
            include: {
              farmer: { include: { profile: true } }
            }
          }
        }
      }),
      prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          carbonCredit: true,
          seller: { include: { profile: true } },
          buyer: { include: { profile: true } }
        }
      })
    ]);

    return {
      recentUsers,
      recentCredits,
      recentTransactions
    };
  }

  private async getUserGrowthTrends() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowth = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      _count: { id: true }
    });

    return userGrowth.map(item => ({
      date: item.createdAt,
      count: item._count.id
    }));
  }

  private async getCarbonCreditTrends() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const creditTrends = await prisma.carbonCredit.groupBy({
      by: ['createdAt', 'status'],
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      _count: { id: true },
      _sum: { quantity: true }
    });

    return creditTrends.map(item => ({
      date: item.createdAt,
      status: item.status,
      count: item._count.id,
      quantity: item._sum.quantity
    }));
  }

  private async getComprehensiveSystemStats() {
    const [
      userStats,
      farmStats,
      creditStats,
      transactionStats
    ] = await Promise.all([
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true }
      }),
      prisma.farm.groupBy({
        by: ['cropType'],
        _count: { id: true },
        _avg: { area: true }
      }),
      prisma.carbonCredit.groupBy({
        by: ['status', 'verificationLevel'],
        _count: { id: true },
        _sum: { quantity: true }
      }),
      prisma.transaction.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { totalAmount: true }
      })
    ]);

    return {
      userStats,
      farmStats,
      creditStats,
      transactionStats,
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
  }

  private async createAuditLog(action: string, userId?: string, details?: any) {
    // In production, this would write to an audit log table
    logger.info('Audit Log', { action, userId, details, timestamp: new Date() });
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'object') {
            return JSON.stringify(value);
          }
          return String(value || '');
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  }
}
