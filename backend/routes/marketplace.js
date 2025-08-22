const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// Get all carbon credits with real database queries
router.get('/credits', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      projectType, 
      verificationLevel, 
      minPrice, 
      maxPrice,
      location,
      status = 'LISTED'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause for filtering
    const where = {
      status: status,
      ...(projectType && { projectType }),
      ...(verificationLevel && { verificationLevel }),
      ...(minPrice && { pricePerCredit: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { pricePerCredit: { lte: parseFloat(maxPrice) } }),
      ...(location && { farm: { location: { contains: location, mode: 'insensitive' } } })
    };

    // Get carbon credits with pagination and filtering
    const [credits, totalCount] = await Promise.all([
      prisma.carbonCredit.findMany({
        where,
        include: {
          farm: {
            select: {
              id: true,
              name: true,
              location: true,
              farmer: {
                select: {
                  id: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.carbonCredit.count({ where })
    ]);

    // Format the response
    const formattedCredits = credits.map(credit => ({
      id: credit.id,
      title: credit.title,
      description: credit.description,
      quantity: credit.quantity,
      availableQuantity: credit.availableQuantity,
      pricePerCredit: credit.pricePerCredit,
      totalPrice: credit.totalPrice,
      currency: credit.currency,
      status: credit.status,
      verificationLevel: credit.verificationLevel,
      farmId: credit.farmId,
      farmName: credit.farm.name,
      farmerId: credit.farm.farmer.id,
      farmerName: `${credit.farm.farmer.profile.firstName} ${credit.farm.farmer.profile.lastName}`,
      location: credit.farm.location,
      projectType: credit.projectType,
      methodology: credit.methodology,
      vintage: credit.vintage,
      certification: credit.certification,
      images: credit.images,
      documents: credit.documents,
      createdAt: credit.createdAt,
      updatedAt: credit.updatedAt,
      expiresAt: credit.expiresAt,
      buyerId: credit.buyerId,
      buyerName: credit.buyerName,
      soldAt: credit.soldAt,
      transactionId: credit.transactionId
    }));

    res.json({
      success: true,
      message: 'Carbon credits retrieved successfully',
      data: formattedCredits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching carbon credits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch carbon credits',
      error: error.message
    });
  }
});

// Get marketplace statistics with real database queries
router.get('/stats', async (req, res) => {
  try {
    const [
      totalCredits,
      totalValue,
      totalListings,
      activeListings,
      completedTransactions,
      totalFarmers,
      totalBuyers,
      topProjectTypes,
      topLocations,
      recentTransactions
    ] = await Promise.all([
      // Total carbon credits
      prisma.carbonCredit.aggregate({
        _sum: {
          quantity: true
        }
      }),
      // Total market value
      prisma.carbonCredit.aggregate({
        _sum: {
          totalPrice: true
        },
        where: {
          status: 'LISTED'
        }
      }),
      // Total listings
      prisma.carbonCredit.count(),
      // Active listings
      prisma.carbonCredit.count({
        where: {
          status: 'LISTED'
        }
      }),
      // Completed transactions
      prisma.transaction.count({
        where: {
          status: 'COMPLETED'
        }
      }),
      // Total farmers
      prisma.user.count({
        where: {
          role: 'FARMER'
        }
      }),
      // Total buyers
      prisma.user.count({
        where: {
          role: 'BUYER'
        }
      }),
      // Top project types
      prisma.carbonCredit.groupBy({
        by: ['projectType'],
        _count: {
          projectType: true
        },
        _sum: {
          totalPrice: true
        },
        orderBy: {
          _count: {
            projectType: 'desc'
          }
        },
        take: 5
      }),
      // Top locations
      prisma.carbonCredit.groupBy({
        by: ['farmId'],
        _count: {
          farmId: true
        },
        _sum: {
          totalPrice: true
        },
        orderBy: {
          _count: {
            farmId: 'desc'
          }
        },
        take: 5
      }),
      // Recent transactions for trend analysis
      prisma.transaction.findMany({
        where: {
          status: 'COMPLETED'
        },
        orderBy: {
          completedAt: 'desc'
        },
        take: 10,
        select: {
          totalAmount: true,
          completedAt: true
        }
      })
    ]);

    // Calculate average price
    const averagePrice = totalCredits._sum.quantity > 0 
      ? (totalValue._sum.totalPrice || 0) / totalCredits._sum.quantity 
      : 0;

    // Calculate trends based on recent transactions
    const priceTrend = calculatePriceTrend(recentTransactions);
    const volumeTrend = calculateVolumeTrend(recentTransactions);

    // Get location names for top locations
    const topLocationsWithNames = await Promise.all(
      topLocations.map(async (loc) => {
        const farm = await prisma.farm.findUnique({
          where: { id: loc.farmId },
          select: { location: true }
        });
        return {
          location: farm?.location || `Location ${loc.farmId}`,
          count: loc._count.farmId,
          value: loc._sum.totalPrice || 0
        };
      })
    );

    const stats = {
      totalCredits: totalCredits._sum.quantity || 0,
      totalValue: totalValue._sum.totalPrice || 0,
      averagePrice: Math.round(averagePrice),
      totalListings,
      activeListings,
      completedTransactions,
      totalFarmers,
      totalBuyers,
      priceTrend,
      volumeTrend,
      topProjectTypes: topProjectTypes.map(pt => ({
        type: pt.projectType,
        count: pt._count.projectType,
        value: pt._sum.totalPrice || 0
      })),
      topLocations: topLocationsWithNames
    };

    res.json({
      success: true,
      message: 'Marketplace statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching marketplace stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch marketplace statistics',
      error: error.message
    });
  }
});

// Get transactions with real database queries
router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = status ? { status } : {};

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          carbonCredit: {
            select: {
              id: true,
              title: true,
              projectType: true
            }
          },
          seller: {
            select: {
              id: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          buyer: {
            select: {
              id: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.transaction.count({ where })
    ]);

    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      creditId: tx.carbonCreditId,
      creditTitle: tx.carbonCredit.title,
      projectType: tx.carbonCredit.projectType,
      sellerId: tx.sellerId,
      sellerName: `${tx.seller.profile.firstName} ${tx.seller.profile.lastName}`,
      buyerId: tx.buyerId,
      buyerName: `${tx.buyer.profile.firstName} ${tx.buyer.profile.lastName}`,
      quantity: tx.quantity,
      pricePerCredit: tx.pricePerCredit,
      totalAmount: tx.totalAmount,
      currency: tx.currency,
      status: tx.status,
      paymentMethod: tx.paymentMethod,
      escrowId: tx.escrowId,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
      completedAt: tx.completedAt
    }));

    res.json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: formattedTransactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
});

// Purchase carbon credits with real database transaction
router.post('/purchase', authMiddleware, async (req, res) => {
  try {
    const { creditId, quantity, paymentMethod } = req.body;
    const buyerId = req.user.id;

    // Validate input
    if (!creditId || !quantity || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: creditId, quantity, paymentMethod'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    // Use Prisma transaction for data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get the carbon credit with lock
      const credit = await tx.carbonCredit.findUnique({
        where: { id: creditId },
        include: {
          farm: {
            include: {
              farmer: true
            }
          }
        }
      });

      if (!credit) {
        throw new Error('Carbon credit not found');
      }

      if (credit.status !== 'LISTED') {
        throw new Error('Carbon credit is not available for purchase');
      }

      if (credit.availableQuantity < quantity) {
        throw new Error(`Insufficient quantity available. Available: ${credit.availableQuantity}, Requested: ${quantity}`);
      }

      // Prevent self-purchase
      if (credit.farm.farmer.id === buyerId) {
        throw new Error('Cannot purchase your own carbon credits');
      }

      // Calculate total amount
      const totalAmount = credit.pricePerCredit * quantity;

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          carbonCreditId: creditId,
          sellerId: credit.farm.farmer.id,
          buyerId,
          quantity,
          pricePerCredit: credit.pricePerCredit,
          totalAmount,
          currency: credit.currency,
          status: 'PENDING',
          paymentMethod,
          escrowId: paymentMethod === 'ESCROW' ? `ESCROW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null
        }
      });

      // Update carbon credit availability
      const updatedCredit = await tx.carbonCredit.update({
        where: { id: creditId },
        data: {
          availableQuantity: {
            decrement: quantity
          },
          status: credit.availableQuantity - quantity === 0 ? 'SOLD' : 'LISTED',
          ...(credit.availableQuantity - quantity === 0 && {
            soldAt: new Date(),
            buyerId,
            buyerName: req.user.profile ? `${req.user.profile.firstName} ${req.user.profile.lastName}` : 'Unknown Buyer'
          })
        }
      });

      // Create notification for seller
      await tx.notification.create({
        data: {
          type: 'CARBON_CREDIT',
          title: 'Carbon Credit Purchase',
          message: `Your carbon credit "${credit.title}" has been purchased. Transaction ID: ${transaction.id}`,
          priority: 'HIGH',
          category: 'CARBON',
          userId: credit.farm.farmer.id,
          senderId: buyerId,
          deliveryChannels: ['IN_APP', 'EMAIL'],
          metadata: {
            transactionId: transaction.id,
            creditId: creditId,
            quantity: quantity,
            totalAmount: totalAmount
          }
        }
      });

      // Create notification for buyer
      await tx.notification.create({
        data: {
          type: 'CARBON_CREDIT',
          title: 'Purchase Confirmation',
          message: `Your purchase of ${quantity} carbon credits from "${credit.title}" has been confirmed.`,
          priority: 'HIGH',
          category: 'CARBON',
          userId: buyerId,
          senderId: credit.farm.farmer.id,
          deliveryChannels: ['IN_APP', 'EMAIL'],
          metadata: {
            transactionId: transaction.id,
            creditId: creditId,
            quantity: quantity,
            totalAmount: totalAmount
          }
        }
      });

      return { transaction, updatedCredit };
    });

    res.json({
      success: true,
      message: 'Purchase initiated successfully',
      data: {
        transactionId: result.transaction.id,
        status: result.transaction.status,
        totalAmount: result.transaction.totalAmount,
        escrowId: result.transaction.escrowId,
        availableQuantity: result.updatedCredit.availableQuantity,
        creditStatus: result.updatedCredit.status
      }
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process purchase',
      error: error.message
    });
  }
});

// Get user's listings with real database queries
router.get('/my-listings', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      farm: {
        farmerId: userId
      },
      ...(status && { status })
    };

    const [listings, totalCount] = await Promise.all([
      prisma.carbonCredit.findMany({
        where,
        include: {
          farm: {
            select: {
              name: true,
              location: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.carbonCredit.count({ where })
    ]);

    res.json({
      success: true,
      message: 'User listings retrieved successfully',
      data: listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user listings',
      error: error.message
    });
  }
});

// Get user's purchases with real database queries
router.get('/my-purchases', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      buyerId: userId,
      ...(status && { status })
    };

    const [purchases, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          carbonCredit: {
            select: {
              title: true,
              projectType: true,
              verificationLevel: true
            }
          },
          seller: {
            select: {
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.transaction.count({ where })
    ]);

    const formattedPurchases = purchases.map(purchase => ({
      id: purchase.id,
      creditTitle: purchase.carbonCredit.title,
      projectType: purchase.carbonCredit.projectType,
      verificationLevel: purchase.carbonCredit.verificationLevel,
      sellerName: `${purchase.seller.profile.firstName} ${purchase.seller.profile.lastName}`,
      quantity: purchase.quantity,
      pricePerCredit: purchase.pricePerCredit,
      totalAmount: purchase.totalAmount,
      currency: purchase.currency,
      status: purchase.status,
      paymentMethod: purchase.paymentMethod,
      escrowId: purchase.escrowId,
      createdAt: purchase.createdAt,
      completedAt: purchase.completedAt
    }));

    res.json({
      success: true,
      message: 'User purchases retrieved successfully',
      data: formattedPurchases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user purchases',
      error: error.message
    });
  }
});

// Helper functions for trend calculation
function calculatePriceTrend(recentTransactions) {
  if (recentTransactions.length < 2) return 'STABLE';
  
  const recent = recentTransactions.slice(0, 5);
  const older = recentTransactions.slice(-5);
  
  const recentAvg = recent.reduce((sum, tx) => sum + tx.totalAmount, 0) / recent.length;
  const olderAvg = older.reduce((sum, tx) => sum + tx.totalAmount, 0) / older.length;
  
  const change = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  if (change > 5) return 'UP';
  if (change < -5) return 'DOWN';
  return 'STABLE';
}

function calculateVolumeTrend(recentTransactions) {
  if (recentTransactions.length < 2) return 'STABLE';
  
  const recent = recentTransactions.slice(0, 5);
  const older = recentTransactions.slice(-5);
  
  const recentCount = recent.length;
  const olderCount = older.length;
  
  if (recentCount > olderCount) return 'UP';
  if (recentCount < olderCount) return 'DOWN';
  return 'STABLE';
}

// Complete escrow transaction
router.post('/escrow/complete', authMiddleware, async (req, res) => {
  try {
    const { transactionId, action } = req.body;
    const userId = req.user.id;

    if (!transactionId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: transactionId, action'
      });
    }

    if (!['RELEASE', 'REFUND', 'DISPUTE'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be RELEASE, REFUND, or DISPUTE'
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get transaction with related data
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          carbonCredit: true,
          seller: true,
          buyer: true
        }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Verify user has permission to act on this transaction
      if (transaction.sellerId !== userId && transaction.buyerId !== userId) {
        throw new Error('Unauthorized to act on this transaction');
      }

      // Verify transaction is in ESCROW status
      if (transaction.status !== 'ESCROW') {
        throw new Error('Transaction is not in escrow status');
      }

      let updatedTransaction;
      let updatedCredit;

      switch (action) {
        case 'RELEASE':
          // Buyer releases funds to seller
          if (transaction.buyerId !== userId) {
            throw new Error('Only buyer can release funds');
          }

          updatedTransaction = await tx.transaction.update({
            where: { id: transactionId },
            data: {
              status: 'COMPLETED',
              completedAt: new Date()
            }
          });

          // Update carbon credit status if fully sold
          const credit = await tx.carbonCredit.findUnique({
            where: { id: transaction.carbonCreditId }
          });

          if (credit && credit.availableQuantity === 0) {
            updatedCredit = await tx.carbonCredit.update({
              where: { id: transaction.carbonCreditId },
              data: {
                status: 'SOLD',
                soldAt: new Date()
              }
            });
          }

          // Create success notifications
          await Promise.all([
            tx.notification.create({
              data: {
                type: 'CARBON_CREDIT',
                title: 'Payment Released',
                message: `Payment of ₹${transaction.totalAmount} has been released for your carbon credits.`,
                priority: 'HIGH',
                category: 'CARBON',
                userId: transaction.sellerId,
                senderId: transaction.buyerId,
                deliveryChannels: ['IN_APP', 'EMAIL'],
                metadata: {
                  transactionId: transaction.id,
                  amount: transaction.totalAmount,
                  action: 'RELEASE'
                }
              }
            }),
            tx.notification.create({
              data: {
                type: 'CARBON_CREDIT',
                title: 'Transaction Completed',
                message: `Your purchase of ${transaction.quantity} carbon credits has been completed.`,
                priority: 'HIGH',
                category: 'CARBON',
                userId: transaction.buyerId,
                senderId: transaction.sellerId,
                deliveryChannels: ['IN_APP', 'EMAIL'],
                metadata: {
                  transactionId: transaction.id,
                  quantity: transaction.quantity,
                  action: 'COMPLETE'
                }
              }
            })
          ]);

          break;

        case 'REFUND':
          // Seller refunds the transaction
          if (transaction.sellerId !== userId) {
            throw new Error('Only seller can initiate refund');
          }

          updatedTransaction = await tx.transaction.update({
            where: { id: transactionId },
            data: {
              status: 'CANCELLED',
              completedAt: new Date()
            }
          });

          // Restore carbon credit availability
          updatedCredit = await tx.carbonCredit.update({
            where: { id: transaction.carbonCreditId },
            data: {
              availableQuantity: {
                increment: transaction.quantity
              },
              status: 'LISTED'
            }
          });

          // Create refund notifications
          await Promise.all([
            tx.notification.create({
              data: {
                type: 'CARBON_CREDIT',
                title: 'Refund Processed',
                message: `Your payment of ₹${transaction.totalAmount} has been refunded.`,
                priority: 'HIGH',
                category: 'CARBON',
                userId: transaction.buyerId,
                senderId: transaction.sellerId,
                deliveryChannels: ['IN_APP', 'EMAIL'],
                metadata: {
                  transactionId: transaction.id,
                  amount: transaction.totalAmount,
                  action: 'REFUND'
                }
              }
            }),
            tx.notification.create({
              data: {
                type: 'CARBON_CREDIT',
                title: 'Refund Initiated',
                message: `Refund has been processed for transaction ${transaction.id}.`,
                priority: 'HIGH',
                category: 'CARBON',
                userId: transaction.sellerId,
                senderId: transaction.buyerId,
                deliveryChannels: ['IN_APP', 'EMAIL'],
                metadata: {
                  transactionId: transaction.id,
                  action: 'REFUND'
                }
              }
            })
          ]);

          break;

        case 'DISPUTE':
          // Either party can initiate dispute
          updatedTransaction = await tx.transaction.update({
            where: { id: transactionId },
            data: {
              status: 'DISPUTED',
              updatedAt: new Date()
            }
          });

          // Create dispute notification for admin
          await tx.notification.create({
            data: {
              type: 'SECURITY_ALERT',
              title: 'Transaction Dispute',
              message: `Transaction ${transaction.id} has been disputed and requires admin review.`,
              priority: 'URGENT',
              category: 'SECURITY',
              userId: 'admin', // This would be admin user ID in real system
              senderId: userId,
              deliveryChannels: ['IN_APP', 'EMAIL'],
              metadata: {
                transactionId: transaction.id,
                disputedBy: userId,
                reason: req.body.reason || 'No reason provided'
              }
            }
          });

          break;
      }

      return { transaction: updatedTransaction, credit: updatedCredit };
    });

    res.json({
      success: true,
      message: `Transaction ${action.toLowerCase()}d successfully`,
      data: {
        transactionId: result.transaction.id,
        status: result.transaction.status,
        action: action,
        completedAt: result.transaction.completedAt
      }
    });

  } catch (error) {
    console.error('Error processing escrow action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process escrow action',
      error: error.message
    });
  }
});

// Get transaction details
router.get('/transactions/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        carbonCredit: {
          include: {
            farm: {
              select: {
                name: true,
                location: true
              }
            }
          }
        },
        seller: {
          select: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
                phone: true
              }
            }
          }
        },
        buyer: {
          select: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
                phone: true
              }
            }
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Verify user has access to this transaction
    if (transaction.sellerId !== userId && transaction.buyerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this transaction'
      });
    }

    const formattedTransaction = {
      id: transaction.id,
      creditId: transaction.carbonCreditId,
      creditTitle: transaction.carbonCredit.title,
      projectType: transaction.carbonCredit.projectType,
      verificationLevel: transaction.carbonCredit.verificationLevel,
      farmName: transaction.carbonCredit.farm.name,
      farmLocation: transaction.carbonCredit.farm.location,
      sellerId: transaction.sellerId,
      sellerName: `${transaction.seller.profile.firstName} ${transaction.seller.profile.lastName}`,
      sellerPhone: transaction.seller.profile.phone,
      buyerId: transaction.buyerId,
      buyerName: `${transaction.buyer.profile.firstName} ${transaction.buyer.profile.lastName}`,
      buyerPhone: transaction.buyer.profile.phone,
      quantity: transaction.quantity,
      pricePerCredit: transaction.pricePerCredit,
      totalAmount: transaction.totalAmount,
      currency: transaction.currency,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      escrowId: transaction.escrowId,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      completedAt: transaction.completedAt,
      // Escrow information
      escrowStatus: transaction.status === 'ESCROW' ? 'ACTIVE' : 
                   transaction.status === 'COMPLETED' ? 'RELEASED' :
                   transaction.status === 'CANCELLED' ? 'REFUNDED' :
                   transaction.status === 'DISPUTED' ? 'DISPUTED' : 'N/A',
      canAct: transaction.status === 'ESCROW' && 
              (transaction.sellerId === userId || transaction.buyerId === userId),
      actions: transaction.status === 'ESCROW' ? 
               (transaction.buyerId === userId ? ['RELEASE', 'DISPUTE'] : ['REFUND', 'DISPUTE']) : []
    };

    res.json({
      success: true,
      message: 'Transaction details retrieved successfully',
      data: formattedTransaction
    });

  } catch (error) {
    console.error('Error fetching transaction details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction details',
      error: error.message
    });
  }
});

// Get escrow transactions for user
router.get('/escrow/active', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      status: 'ESCROW',
      OR: [
        { sellerId: userId },
        { buyerId: userId }
      ]
    };

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          carbonCredit: {
            select: {
              title: true,
              projectType: true
            }
          },
          seller: {
            select: {
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          buyer: {
            select: {
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.transaction.count({ where })
    ]);

    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      creditTitle: tx.carbonCredit.title,
      projectType: tx.carbonCredit.projectType,
      sellerName: `${tx.seller.profile.firstName} ${tx.seller.profile.lastName}`,
      buyerName: `${tx.buyer.profile.firstName} ${tx.buyer.profile.lastName}`,
      quantity: tx.quantity,
      totalAmount: tx.totalAmount,
      currency: tx.currency,
      paymentMethod: tx.paymentMethod,
      escrowId: tx.escrowId,
      createdAt: tx.createdAt,
      userRole: tx.sellerId === userId ? 'SELLER' : 'BUYER',
      canAct: tx.sellerId === userId ? ['REFUND', 'DISPUTE'] : ['RELEASE', 'DISPUTE']
    }));

    res.json({
      success: true,
      message: 'Active escrow transactions retrieved successfully',
      data: formattedTransactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching escrow transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch escrow transactions',
      error: error.message
    });
  }
});

// Get transaction history with filters
router.get('/transactions/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type = 'ALL',
      startDate,
      endDate 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    let where = {};
    
    if (type === 'PURCHASES') {
      where.buyerId = userId;
    } else if (type === 'SALES') {
      where.sellerId = userId;
    } else {
      where.OR = [
        { buyerId: userId },
        { sellerId: userId }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          carbonCredit: {
            select: {
              title: true,
              projectType: true,
              verificationLevel: true
            }
          },
          seller: {
            select: {
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          buyer: {
            select: {
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.transaction.count({ where })
    ]);

    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      creditTitle: tx.carbonCredit.title,
      projectType: tx.carbonCredit.projectType,
      verificationLevel: tx.carbonCredit.verificationLevel,
      sellerName: `${tx.seller.profile.firstName} ${tx.seller.profile.lastName}`,
      buyerName: `${tx.buyer.profile.firstName} ${tx.buyer.profile.lastName}`,
      quantity: tx.quantity,
      pricePerCredit: tx.pricePerCredit,
      totalAmount: tx.totalAmount,
      currency: tx.currency,
      status: tx.status,
      paymentMethod: tx.paymentMethod,
      escrowId: tx.escrowId,
      createdAt: tx.createdAt,
      completedAt: tx.completedAt,
      userRole: tx.sellerId === userId ? 'SELLER' : 'BUYER',
      counterparty: tx.sellerId === userId ? 
        `${tx.buyer.profile.firstName} ${tx.buyer.profile.lastName}` :
        `${tx.seller.profile.firstName} ${tx.seller.profile.lastName}`
    }));

    res.json({
      success: true,
      message: 'Transaction history retrieved successfully',
      data: formattedTransactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction history',
      error: error.message
    });
  }
});

// ===== BLOCKCHAIN INTEGRATION ENDPOINTS =====

// Tokenize carbon credits on blockchain
router.post('/blockchain/tokenize', authMiddleware, async (req, res) => {
  try {
    const { creditId } = req.body;
    const userId = req.user.id;

    if (!creditId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: creditId'
      });
    }

    // Get carbon credit details
    const credit = await prisma.carbonCredit.findUnique({
      where: { id: creditId },
      include: {
        farm: {
          include: {
            farmer: {
              select: {
                id: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!credit) {
      return res.status(404).json({
        success: false,
        message: 'Carbon credit not found'
      });
    }

    // Verify user owns this credit
    if (credit.farm.farmer.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to tokenize this carbon credit'
      });
    }

    // Check if already tokenized
    if (credit.blockchainTokenId) {
      return res.status(400).json({
        success: false,
        message: 'Carbon credit already tokenized on blockchain'
      });
    }

    // Prepare metadata for blockchain
    const blockchainMetadata = {
      id: credit.id,
      title: credit.title,
      description: credit.description,
      projectType: credit.projectType,
      methodology: credit.methodology,
      vintage: credit.vintage,
      location: credit.farm.location,
      verificationLevel: credit.verificationLevel,
      quantity: credit.quantity,
      pricePerCredit: credit.pricePerCredit,
      currency: credit.currency,
      certification: credit.certification,
      images: credit.images,
      documents: credit.documents,
      farmId: credit.farmId,
      farmerId: credit.farm.farmer.id,
      mrvReportHash: credit.mrvReportHash || '',
      satelliteDataHash: credit.satelliteDataHash || ''
    };

    // Import blockchain service (in real app, this would be injected)
    const { BlockchainService } = require('../../services/blockchain/BlockchainService');
    const blockchainService = new BlockchainService();
    await blockchainService.initialize();

    // Tokenize on blockchain
    const result = await blockchainService.tokenizeCarbonCredit(blockchainMetadata);

    // Update database with blockchain information
    const updatedCredit = await prisma.carbonCredit.update({
      where: { id: creditId },
      data: {
        blockchainTokenId: result.tokenId,
        blockchainTransactionHash: result.transactionHash,
        blockchainBlockNumber: result.blockNumber,
        isTokenized: true,
        tokenizedAt: new Date()
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: 'CARBON_CREDIT',
        title: 'Carbon Credit Tokenized',
        message: `Your carbon credit "${credit.title}" has been successfully tokenized on the blockchain.`,
        priority: 'HIGH',
        category: 'CARBON',
        userId: userId,
        deliveryChannels: ['IN_APP', 'EMAIL'],
        metadata: {
          creditId: creditId,
          tokenId: result.tokenId,
          transactionHash: result.transactionHash,
          blockNumber: result.blockNumber
        }
      }
    });

    res.json({
      success: true,
      message: 'Carbon credit tokenized successfully on blockchain',
      data: {
        creditId: creditId,
        tokenId: result.tokenId,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed
      }
    });

  } catch (error) {
    console.error('Error tokenizing carbon credit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to tokenize carbon credit on blockchain',
      error: error.message
    });
  }
});

// Create blockchain escrow for transaction
router.post('/blockchain/escrow/create', authMiddleware, async (req, res) => {
  try {
    const { transactionId, sellerAddress, buyerAddress, amount } = req.body;
    const userId = req.user.id;

    if (!transactionId || !sellerAddress || !buyerAddress || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: transactionId, sellerAddress, buyerAddress, amount'
      });
    }

    // Verify transaction exists and user has access
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        carbonCredit: true
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.sellerId !== userId && transaction.buyerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to create escrow for this transaction'
      });
    }

    // Check if escrow already exists
    if (transaction.blockchainEscrowId) {
      return res.status(400).json({
        success: false,
        message: 'Escrow already exists for this transaction'
      });
    }

    // Import blockchain service
    const { BlockchainService } = require('../../services/blockchain/BlockchainService');
    const blockchainService = new BlockchainService();
    await blockchainService.initialize();

    // Create escrow on blockchain
    const result = await blockchainService.createEscrow(
      transactionId,
      sellerAddress,
      buyerAddress,
      amount
    );

    // Update transaction with blockchain escrow information
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        blockchainEscrowId: result.escrowId,
        blockchainTransactionHash: result.transactionHash,
        blockchainBlockNumber: result.blockNumber,
        status: 'ESCROW',
        escrowId: result.escrowId
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: 'CARBON_CREDIT',
        title: 'Escrow Created on Blockchain',
        message: `Escrow has been created on the blockchain for transaction ${transactionId}.`,
        priority: 'HIGH',
        category: 'CARBON',
        userId: userId,
        deliveryChannels: ['IN_APP', 'EMAIL'],
        metadata: {
          transactionId: transactionId,
          escrowId: result.escrowId,
          transactionHash: result.transactionHash,
          amount: amount
        }
      }
    });

    res.json({
      success: true,
      message: 'Escrow created successfully on blockchain',
      data: {
        escrowId: result.escrowId,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed
      }
    });

  } catch (error) {
    console.error('Error creating blockchain escrow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create escrow on blockchain',
      error: error.message
    });
  }
});

// Release escrow funds on blockchain
router.post('/blockchain/escrow/release', authMiddleware, async (req, res) => {
  try {
    const { transactionId } = req.body;
    const userId = req.user.id;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: transactionId'
      });
    }

    // Verify transaction exists and user is buyer
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.buyerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only buyer can release escrow funds'
      });
    }

    if (transaction.status !== 'ESCROW') {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not in escrow status'
      });
    }

    // Import blockchain service
    const { BlockchainService } = require('../../services/blockchain/BlockchainService');
    const blockchainService = new BlockchainService();
    await blockchainService.initialize();

    // Release funds on blockchain
    const success = await blockchainService.releaseEscrowFunds(transactionId);

    if (success) {
      // Update transaction status
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });

      // Create notification
      await prisma.notification.create({
        data: {
          type: 'CARBON_CREDIT',
          title: 'Escrow Funds Released',
          message: `Escrow funds have been released on the blockchain for transaction ${transactionId}.`,
          priority: 'HIGH',
          category: 'CARBON',
          userId: userId,
          deliveryChannels: ['IN_APP', 'EMAIL'],
          metadata: {
            transactionId: transactionId,
            action: 'RELEASE'
          }
        }
      });

      res.json({
        success: true,
        message: 'Escrow funds released successfully on blockchain'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to release escrow funds on blockchain'
      });
    }

  } catch (error) {
    console.error('Error releasing escrow funds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to release escrow funds on blockchain',
      error: error.message
    });
  }
});

// Get blockchain status and information
router.get('/blockchain/status', async (req, res) => {
  try {
    // Import blockchain service
    const { BlockchainService } = require('../../services/blockchain/BlockchainService');
    const blockchainService = new BlockchainService();
    
    try {
      await blockchainService.initialize();
      
      const [networkInfo, walletInfo] = await Promise.all([
        blockchainService.getNetworkInfo(),
        blockchainService.getWalletInfo()
      ]);

      res.json({
        success: true,
        message: 'Blockchain status retrieved successfully',
        data: {
          status: 'CONNECTED',
          network: networkInfo,
          wallet: walletInfo,
          contracts: {
            carbonCredit: process.env.CARBON_CREDIT_CONTRACT_ADDRESS || 'Not configured',
            escrow: process.env.ESCROW_CONTRACT_ADDRESS || 'Not configured'
          },
          features: [
            'Carbon Credit Tokenization',
            'Escrow Management',
            'Smart Contract Verification',
            'Blockchain Transactions'
          ]
        }
      });
    } catch (error) {
      res.json({
        success: true,
        message: 'Blockchain status retrieved successfully',
        data: {
          status: 'DISCONNECTED',
          error: error.message,
          features: [
            'Carbon Credit Tokenization (Offline)',
            'Escrow Management (Offline)',
            'Smart Contract Verification (Offline)',
            'Blockchain Transactions (Offline)'
          ]
        }
      });
    }

  } catch (error) {
    console.error('Error getting blockchain status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blockchain status',
      error: error.message
    });
  }
});

// Verify carbon credit on blockchain
router.post('/blockchain/verify', authMiddleware, async (req, res) => {
  try {
    const { creditId, verificationHash } = req.body;
    const userId = req.user.id;

    if (!creditId || !verificationHash) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: creditId, verificationHash'
      });
    }

    // Verify user has permission (admin or credit owner)
    const credit = await prisma.carbonCredit.findUnique({
      where: { id: creditId },
      include: {
        farm: {
          include: {
            farmer: true
          }
        }
      }
    });

    if (!credit) {
      return res.status(404).json({
        success: false,
        message: 'Carbon credit not found'
      });
    }

    // Check if user is admin or credit owner
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user.role !== 'ADMIN' && credit.farm.farmer.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to verify this carbon credit'
      });
    }

    // Import blockchain service
    const { BlockchainService } = require('../../services/blockchain/BlockchainService');
    const blockchainService = new BlockchainService();
    await blockchainService.initialize();

    // Verify on blockchain
    const success = await blockchainService.verifyCarbonCredit(creditId, verificationHash);

    if (success) {
      // Update credit verification status
      await prisma.carbonCredit.update({
        where: { id: creditId },
        data: {
          blockchainVerified: true,
          blockchainVerifiedAt: new Date(),
          verificationHash: verificationHash
        }
      });

      // Create notification
      await prisma.notification.create({
        data: {
          type: 'CARBON_CREDIT',
          title: 'Carbon Credit Verified on Blockchain',
          message: `Carbon credit "${credit.title}" has been verified on the blockchain.`,
          priority: 'HIGH',
          category: 'CARBON',
          userId: userId,
          deliveryChannels: ['IN_APP', 'EMAIL'],
          metadata: {
            creditId: creditId,
            verificationHash: verificationHash,
            action: 'VERIFY'
          }
        }
      });

      res.json({
        success: true,
        message: 'Carbon credit verified successfully on blockchain'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to verify carbon credit on blockchain'
      });
    }

  } catch (error) {
    console.error('Error verifying carbon credit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify carbon credit on blockchain',
      error: error.message
    });
  }
});

module.exports = router;
