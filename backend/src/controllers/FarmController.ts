/**
 * Farm Controller for Mandla Rice MRV System
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export class FarmController {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getFarms(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Get user ID from authenticated session
      const userId = req.user?.id || 'temp-user-id';
      
      const farms = await this.prisma.farm.findMany({
        where: { farmerId: userId },
        include: {
          farmer: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  village: true,
                  block: true
                }
              }
            }
          },
          seasons: {
            select: {
              id: true,
              season: true,
              year: true,
              crop: true,
              farmingMethod: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          },
          _count: {
            select: {
              seasons: true,
              mrvReports: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({
        success: true,
        data: farms,
        message: 'Farms retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching farms:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch farms',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createFarm(req: Request, res: Response): Promise<void> {
    try {
      const farmData = req.body;
      
      // TODO: Get user ID from authenticated session
      const userId = req.user?.id || 'temp-user-id';
      
      // Validate required fields
      if (!farmData.name || !farmData.area || !farmData.village || !farmData.block) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: name, area, village, block'
        });
        return;
      }

      // Create farm with coordinates
      const farm = await this.prisma.farm.create({
        data: {
          ...farmData,
          farmerId: userId,
          isActive: true,
          coordinates: farmData.coordinates,
          cropPattern: farmData.cropPattern || {},
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          farmer: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  village: true,
                  block: true
                }
              }
            }
          }
        }
      });

      logger.info('Farm created successfully', { farmId: farm.id, farmerId: userId });

      res.status(201).json({
        success: true,
        data: farm,
        message: 'Farm registered successfully'
      });
    } catch (error) {
      logger.error('Error creating farm:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create farm',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getFarm(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const farm = await this.prisma.farm.findUnique({
        where: { id },
        include: {
          farmer: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  village: true,
                  block: true,
                  district: true,
                  state: true
                }
              }
            }
          },
          seasons: {
            select: {
              id: true,
              season: true,
              year: true,
              crop: true,
              variety: true,
              sowingDate: true,
              transplantDate: true,
              harvestDate: true,
              farmingMethod: true,
              expectedYield: true,
              actualYield: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' }
          },
          mrvReports: {
            select: {
              id: true,
              seasonId: true,
              status: true,
              verificationStatus: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' }
          },
          satelliteData: {
            select: {
              id: true,
              date: true,
              satellite: true,
              floodStatus: true,
              createdAt: true
            },
            orderBy: { date: 'desc' },
            take: 10
          }
        }
      });

      if (!farm) {
        res.status(404).json({
          success: false,
          message: 'Farm not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: farm,
        message: 'Farm retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching farm:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch farm',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateFarm(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // TODO: Get user ID from authenticated session and verify ownership
      const userId = req.user?.id || 'temp-user-id';
      
      // Check if farm exists and belongs to user
      const existingFarm = await this.prisma.farm.findFirst({
        where: { id, farmerId: userId }
      });

      if (!existingFarm) {
        res.status(404).json({
          success: false,
          message: 'Farm not found or access denied'
        });
        return;
      }

      // Update farm
      const updatedFarm = await this.prisma.farm.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        include: {
          farmer: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  village: true,
                  block: true
                }
              }
            }
          }
        }
      });

      logger.info('Farm updated successfully', { farmId: id, farmerId: userId });

      res.status(200).json({
        success: true,
        data: updatedFarm,
        message: 'Farm updated successfully'
      });
    } catch (error) {
      logger.error('Error updating farm:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update farm',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteFarm(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // TODO: Get user ID from authenticated session and verify ownership
      const userId = req.user?.id || 'temp-user-id';
      
      // Check if farm exists and belongs to user
      const existingFarm = await this.prisma.farm.findFirst({
        where: { id, farmerId: userId }
      });

      if (!existingFarm) {
        res.status(404).json({
          success: false,
          message: 'Farm not found or access denied'
        });
        return;
      }

      // Soft delete by setting isActive to false
      await this.prisma.farm.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

      logger.info('Farm deleted successfully', { farmId: id, farmerId: userId });

      res.status(200).json({
        success: true,
        message: 'Farm deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting farm:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete farm',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getFarmSeasons(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // TODO: Get user ID from authenticated session and verify ownership
      const userId = req.user?.id || 'temp-user-id';
      
      // Check if farm exists and belongs to user
      const existingFarm = await this.prisma.farm.findFirst({
        where: { id, farmerId: userId }
      });

      if (!existingFarm) {
        res.status(404).json({
          success: false,
          message: 'Farm not found or access denied'
        });
        return;
      }

      const seasons = await this.prisma.farmingSeason.findMany({
        where: { farmId: id },
        include: {
          farm: {
            select: {
              id: true,
              name: true,
              village: true,
              block: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({
        success: true,
        data: seasons,
        message: 'Farm seasons retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching farm seasons:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch farm seasons',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
