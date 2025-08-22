# Notification Center System

## Overview

The Notification Center System provides farmers with comprehensive real-time communication capabilities, keeping them informed about important updates related to their farms, MRV reports, carbon credits, weather conditions, and market information. The system supports multiple delivery channels including WhatsApp, SMS, email, and in-app notifications.

## Features

### 🔔 Real-Time Notifications
- **Instant Updates**: Real-time notifications for farm activities and system events
- **Multi-Channel Delivery**: WhatsApp, SMS, email, and in-app notifications
- **Priority-Based System**: Urgent, High, Medium, and Low priority levels
- **Smart Categorization**: System, Farm, MRV, Carbon, Weather, Market, and Security categories

### 📱 WhatsApp Integration
- **Direct Messaging**: Send notifications directly to farmers' WhatsApp
- **Rich Media Support**: Text, images, and document sharing capabilities
- **Offline Access**: Reach farmers without internet connectivity
- **Local Language Support**: Multi-language WhatsApp message delivery

### 🔍 Advanced Notification Management
- **Smart Filtering**: Filter by category, priority, type, and search terms
- **Tab Organization**: All, Unread, Pinned, and Archived notifications
- **Bulk Operations**: Mark all as read, bulk archive, and bulk pin
- **Notification Actions**: Pin, archive, mark as read, and delete

### ⚙️ Personalized Preferences
- **Delivery Method Control**: Choose preferred notification channels
- **Category Preferences**: Enable/disable specific notification categories
- **Priority Filtering**: Set minimum priority levels for different channels
- **Quiet Hours**: Configure notification-free time periods
- **Language Preferences**: Receive notifications in preferred language

### 📊 Analytics & Insights
- **Notification Statistics**: Total, unread, pinned, and archived counts
- **Category Breakdown**: Distribution across different notification types
- **Priority Analysis**: High-priority notification tracking
- **Delivery Success Rates**: Monitor notification delivery effectiveness

## Technical Architecture

### Frontend Components

#### NotificationsPage.tsx
```typescript
export default function NotificationsPage() {
  // Real-time notification management
  // Advanced filtering and search capabilities
  // Tab-based organization system
  // Notification preferences management
  // Statistics and analytics display
}
```

#### Notification Management System
```typescript
interface Notification {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'FARM_UPDATE' | 'MRV_REPORT' | 'CARBON_CREDIT' | 'WEATHER_ALERT' | 'MARKET_UPDATE';
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'SYSTEM' | 'FARM' | 'MRV' | 'CARBON' | 'WEATHER' | 'MARKET' | 'SECURITY';
  isRead: boolean;
  isArchived: boolean;
  isPinned: boolean;
  metadata?: {
    farmName?: string;
    carbonCredits?: number;
    weatherCondition?: string;
    marketPrice?: number;
  };
  deliveryMethods: ('IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP')[];
}
```

### Backend Services

#### Enhanced NotificationController
```typescript
export class NotificationController {
  async getNotifications(req: Request, res: Response): Promise<void> {
    // Fetch notifications with filtering and pagination
    // Include metadata and delivery status
    // Apply user preferences and permissions
  }

  async updateNotification(req: Request, res: Response): Promise<void> {
    // Handle notification updates (read, pin, archive)
    // Update delivery status and user interactions
    // Trigger real-time updates
  }

  async getPreferences(req: Request, res: Response): Promise<void> {
    // Retrieve user notification preferences
    // Include category and priority settings
    // Handle delivery method configurations
  }
}
```

#### WhatsApp Integration Service
```typescript
export class WhatsAppService {
  async sendNotification(notification: Notification, user: User): Promise<void> {
    // Format message for WhatsApp
    // Handle media attachments
    // Send via WhatsApp Business API
    // Track delivery status
  }

  async handleDeliveryStatus(messageId: string, status: string): Promise<void> {
    // Update delivery status in database
    // Handle delivery failures
    // Trigger retry mechanisms
  }
}
```

## Data Models

### Core Entities

#### Notification
```typescript
interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  category: NotificationCategory;
  isRead: boolean;
  isArchived: boolean;
  isPinned: boolean;
  userId: string;
  relatedId?: string;
  metadata?: NotificationMetadata;
  deliveryMethods: DeliveryMethod[];
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Notification Preferences
```typescript
interface NotificationPreferences {
  id: string;
  userId: string;
  inApp: boolean;
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  categories: Record<NotificationCategory, boolean>;
  priorities: Record<NotificationPriority, boolean>;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  language: string;
  timezone: string;
}
```

#### Notification Statistics
```typescript
interface NotificationStats {
  total: number;
  unread: number;
  archived: number;
  pinned: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
}
```

## User Interface

### Tab-Based Organization

#### All Notifications Tab
- **Comprehensive View**: All active notifications with filtering
- **Smart Sorting**: Priority-based and chronological organization
- **Quick Actions**: Mark as read, pin, and archive buttons
- **Search & Filters**: Advanced filtering capabilities

#### Unread Notifications Tab
- **Focus View**: Only unread notifications for quick attention
- **Priority Highlighting**: Visual indicators for urgent items
- **Bulk Actions**: Mark all as read functionality
- **Quick Navigation**: Jump to related content

#### Pinned Notifications Tab
- **Important Items**: Critical notifications that need attention
- **Persistent Display**: Always visible regardless of other filters
- **Quick Access**: Easy reference to important information
- **Pin Management**: Add/remove pin status

#### Archived Notifications Tab
- **Historical View**: Past notifications for reference
- **Search Capability**: Find specific archived notifications
- **Restore Options**: Unarchive important notifications
- **Cleanup Tools**: Bulk deletion of old notifications

### Advanced Filtering System

#### Category Filters
```typescript
const categories = [
  'SYSTEM', 'FARM', 'MRV', 'CARBON', 
  'WEATHER', 'MARKET', 'SECURITY'
];
```

#### Priority Filters
```typescript
const priorities = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];
```

#### Type Filters
```typescript
const types = [
  'INFO', 'SUCCESS', 'WARNING', 'ERROR',
  'FARM_UPDATE', 'MRV_REPORT', 'CARBON_CREDIT',
  'WEATHER_ALERT', 'MARKET_UPDATE'
];
```

#### Search Functionality
```typescript
const searchNotifications = (query: string) => {
  return notifications.filter(notification => 
    notification.title.toLowerCase().includes(query.toLowerCase()) ||
    notification.message.toLowerCase().includes(query.toLowerCase())
  );
};
```

## API Integration

### Data Fetching

#### Notifications Retrieval
```typescript
const fetchNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data.data;
};
```

#### Filtered Notifications
```typescript
const fetchFilteredNotifications = async (filters: NotificationFilters) => {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.type) params.append('type', filters.type);
  if (filters.search) params.append('search', filters.search);
  
  const response = await api.get(`/notifications?${params.toString()}`);
  return response.data.data;
};
```

### Notification Management

#### Mark as Read
```typescript
const markAsRead = async (notificationId: string) => {
  await api.put(`/notifications/${notificationId}/read`);
  // Update local state and refresh statistics
};
```

#### Pin/Unpin Notification
```typescript
const togglePin = async (notificationId: string) => {
  await api.put(`/notifications/${notificationId}/pin`);
  // Update local state and refresh statistics
};
```

#### Archive Notification
```typescript
const archiveNotification = async (notificationId: string) => {
  await api.put(`/notifications/${notificationId}/archive`);
  // Update local state and refresh statistics
};
```

## WhatsApp Integration

### Message Formatting

#### Text Notifications
```typescript
const formatWhatsAppMessage = (notification: Notification) => {
  return `🔔 *${notification.title}*
  
${notification.message}

*Priority:* ${notification.priority}
*Category:* ${notification.category}
*Time:* ${new Date(notification.createdAt).toLocaleString()}

${notification.metadata ? formatMetadata(notification.metadata) : ''}`;
};
```

#### Rich Media Support
```typescript
const sendWhatsAppMedia = async (notification: Notification, mediaUrl: string) => {
  const message = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: notification.user.phone,
    type: 'image',
    image: {
      link: mediaUrl,
      caption: notification.message
    }
  };
  
  return await whatsappApi.sendMessage(message);
};
```

### Delivery Tracking

#### Status Monitoring
```typescript
const trackDeliveryStatus = async (messageId: string) => {
  const status = await whatsappApi.getMessageStatus(messageId);
  
  await updateNotificationStatus(messageId, {
    delivered: status === 'delivered',
    deliveredAt: status === 'delivered' ? new Date() : null,
    status: status
  });
};
```

#### Retry Mechanisms
```typescript
const handleDeliveryFailure = async (notification: Notification) => {
  if (notification.retryCount < 3) {
    // Retry with exponential backoff
    const delay = Math.pow(2, notification.retryCount) * 1000;
    setTimeout(() => retryNotification(notification), delay);
  } else {
    // Fallback to alternative delivery method
    await sendFallbackNotification(notification);
  }
};
```

## Notification Preferences

### Delivery Method Configuration

#### Channel Selection
```typescript
const updateDeliveryPreferences = async (preferences: Partial<NotificationPreferences>) => {
  await api.put('/notifications/preferences', preferences);
  
  // Update local state
  setPreferences(prev => prev ? { ...prev, ...preferences } : null);
  
  // Show success message
  toast.success('Notification preferences updated');
};
```

#### Category Preferences
```typescript
const updateCategoryPreferences = async (category: string, enabled: boolean) => {
  await api.put('/notifications/preferences', {
    categories: {
      ...preferences.categories,
      [category]: enabled
    }
  });
};
```

### Quiet Hours Configuration

#### Time-Based Filtering
```typescript
const isQuietHours = (preferences: NotificationPreferences) => {
  if (!preferences.quietHours.enabled) return false;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const startTime = parseTime(preferences.quietHours.startTime);
  const endTime = parseTime(preferences.quietHours.endTime);
  
  return currentTime >= startTime && currentTime <= endTime;
};
```

#### Smart Delivery Scheduling
```typescript
const scheduleNotification = (notification: Notification, preferences: NotificationPreferences) => {
  if (isQuietHours(preferences)) {
    // Schedule for next available time
    const nextAvailable = getNextAvailableTime(preferences.quietHours);
    notification.scheduledAt = nextAvailable.toISOString();
  }
  
  return notification;
};
```

## Real-Time Features

### WebSocket Integration

#### Live Updates
```typescript
const setupWebSocket = () => {
  const ws = new WebSocket('ws://localhost:3000/notifications');
  
  ws.onmessage = (event) => {
    const notification = JSON.parse(event.data);
    addNotification(notification);
    updateStatistics();
    showToast(notification);
  };
  
  return ws;
};
```

#### Push Notifications
```typescript
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setupPushNotifications();
    }
  }
};
```

### Background Sync

#### Offline Support
```typescript
const syncOfflineNotifications = async () => {
  const offlineNotifications = await getOfflineNotifications();
  
  for (const notification of offlineNotifications) {
    try {
      await sendNotification(notification);
      await removeOfflineNotification(notification.id);
    } catch (error) {
      console.error('Failed to sync notification:', error);
    }
  }
};
```

## Performance Optimizations

### Frontend Optimizations

#### Lazy Loading
```typescript
const NotificationList = lazy(() => import('./NotificationList'));
const PreferencesPanel = lazy(() => import('./PreferencesPanel'));
const StatisticsPanel = lazy(() => import('./StatisticsPanel'));
```

#### Virtual Scrolling
```typescript
const VirtualizedNotificationList = ({ notifications }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  
  const visibleNotifications = notifications.slice(visibleRange.start, visibleRange.end);
  
  return (
    <div style={{ height: '600px', overflow: 'auto' }}>
      {visibleNotifications.map(notification => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
};
```

#### Memoization
```typescript
const filteredNotifications = useMemo(() => 
  notifications.filter(applyFilters), 
  [notifications, filters]
);

const sortedNotifications = useMemo(() => 
  [...filteredNotifications].sort(sortNotifications), 
  [filteredNotifications]
);
```

### Backend Optimizations

#### Database Indexing
```sql
-- Optimize notification queries
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at);
CREATE INDEX idx_notifications_category_priority ON notifications(category, priority);
CREATE INDEX idx_notifications_delivery_status ON notifications(delivery_status, sent_at);
```

#### Caching Strategy
```typescript
const getNotificationStats = async (userId: string) => {
  const cacheKey = `notification_stats:${userId}`;
  let stats = await redis.get(cacheKey);
  
  if (!stats) {
    stats = await calculateNotificationStats(userId);
    await redis.setex(cacheKey, 300, JSON.stringify(stats)); // 5 minutes TTL
  }
  
  return JSON.parse(stats);
};
```

## Testing

### Automated Testing

#### Test Coverage
```bash
# Run comprehensive tests
node test-notification-center.js

# Expected test results:
# ✅ Notification retrieval and management
# ✅ Notification preferences configuration
# ✅ Notification statistics and analytics
# ✅ Notification filtering and search
# ✅ Notification delivery methods (WhatsApp, SMS, Email, In-App)
# ✅ Notification categories and priorities
# ✅ Notification metadata handling
# ✅ Notification sorting and organization
# ✅ Notification preferences management
# ✅ Notification system integration
# ✅ Real-time notification capabilities
# ✅ Multi-channel delivery support
```

#### Manual Testing
1. Navigate to `/notifications` in the frontend
2. Test all four tabs (All, Unread, Pinned, Archived)
3. Verify filtering and search functionality
4. Test notification preferences configuration
5. Verify WhatsApp integration (if configured)
6. Check responsive design on different screen sizes

## Error Handling

### Frontend Error Handling

#### Network Errors
```typescript
try {
  const notifications = await fetchNotifications();
  setNotifications(notifications);
} catch (error: any) {
  if (error.response?.status === 401) {
    navigate('/login');
  } else if (error.response?.status === 500) {
    toast.error('Server error. Please try again later.');
  } else {
    toast.error('Failed to fetch notifications');
  }
}
```

#### Delivery Failures
```typescript
const handleDeliveryFailure = (notification: Notification, error: any) => {
  console.error('Delivery failed:', error);
  
  // Show user-friendly error message
  toast.error('Failed to deliver notification. Will retry automatically.');
  
  // Log for monitoring
  logger.error('Notification delivery failed', {
    notificationId: notification.id,
    error: error.message,
    timestamp: new Date().toISOString()
  });
};
```

### Backend Error Handling

#### WhatsApp API Errors
```typescript
try {
  await whatsappApi.sendMessage(message);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Queue for later delivery
    await queueNotification(notification, 'whatsapp');
  } else if (error.code === 'INVALID_PHONE_NUMBER') {
    // Mark as invalid and skip
    await markPhoneInvalid(user.phone);
  } else {
    // Log and retry
    logger.error('WhatsApp delivery failed', error);
    await scheduleRetry(notification, 'whatsapp');
  }
}
```

#### Database Errors
```typescript
try {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, data: notifications });
} catch (error) {
  logger.error('Database error:', error);
  res.status(500).json({
    success: false,
    message: 'Failed to retrieve notifications'
  });
}
```

## Future Enhancements

### Planned Features

#### Advanced Notification Features
- **Smart Notifications**: AI-powered notification relevance scoring
- **Notification Templates**: Pre-defined templates for common scenarios
- **Scheduled Notifications**: Time-based notification delivery
- **Notification Groups**: Group related notifications together

#### Enhanced WhatsApp Integration
- **Interactive Messages**: Buttons and quick replies
- **Media Library**: Pre-approved images and documents
- **Broadcast Lists**: Send to multiple recipients
- **Message Templates**: WhatsApp Business API templates

#### Improved User Experience
- **Notification Sounds**: Customizable alert sounds
- **Vibration Patterns**: Different patterns for priorities
- **Dark Mode**: Theme-aware notification display
- **Accessibility**: Screen reader and keyboard navigation

### Technical Improvements

#### Performance
- **Service Workers**: Offline notification handling
- **Push Notifications**: Native browser push support
- **Background Sync**: Automatic synchronization
- **CDN Integration**: Fast media delivery

#### Scalability
- **Message Queues**: Redis-based notification queuing
- **Load Balancing**: Distributed notification processing
- **Microservices**: Modular notification services
- **Database Sharding**: Horizontal scaling for notifications

## Troubleshooting

### Common Issues

#### Notifications Not Loading
```typescript
// Check authentication status
if (!user) {
  console.log('User not authenticated');
  navigate('/login');
  return;
}

// Verify API endpoint
console.log('API URL:', '/notifications');
console.log('Response status:', response.status);
```

#### WhatsApp Integration Issues
```typescript
// Check WhatsApp API configuration
console.log('WhatsApp API Token:', process.env.WHATSAPP_API_TOKEN);
console.log('WhatsApp Phone Number ID:', process.env.WHATSAPP_PHONE_NUMBER_ID);

// Verify phone number format
if (!isValidPhoneNumber(user.phone)) {
  console.error('Invalid phone number format:', user.phone);
}
```

#### Notification Preferences Not Saving
```typescript
// Check form validation
const validatePreferences = (preferences: NotificationPreferences) => {
  const errors: string[] = [];
  
  if (!preferences.userId) errors.push('User ID is required');
  if (Object.values(preferences.deliveryMethods).every(method => !method)) {
    errors.push('At least one delivery method must be enabled');
  }
  
  return errors;
};
```

### Debug Mode

#### Enable Debug Logging
```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Notification data:', notifications);
  console.log('Active filters:', { filterCategory, filterPriority, filterType });
  console.log('Search query:', searchQuery);
  console.log('Active tab:', activeTab);
}
```

#### Performance Monitoring
```typescript
// Measure notification loading time
const startTime = performance.now();
await fetchNotifications();
const endTime = performance.now();
console.log(`Notifications loaded in: ${endTime - startTime}ms`);
```

## Contributing

### Development Workflow

1. **Feature Branch**: Create feature branch from main
2. **Implementation**: Implement changes with tests
3. **Documentation**: Update relevant documentation
4. **Testing**: Run comprehensive test suite
5. **Code Review**: Submit pull request for review
6. **Merge**: Merge after approval and CI checks

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Jest**: Unit and integration tests
- **Storybook**: Component documentation

## License

This project is part of the UN Climate Challenge 2024 - Mandla Rice MRV System.

---

## Quick Start

```bash
# Navigate to notification center
# URL: /notifications

# Test the system
cd backend && node test-notification-center.js

# Expected features:
# 🔔 Real-time notification management
# 📱 WhatsApp integration and delivery
# 🔍 Advanced filtering and search
# ⚙️ Personalized preferences
# 📊 Analytics and statistics
# 🌐 Multi-channel delivery support
```

The Notification Center System is now ready for comprehensive real-time communication! 🔔✨
