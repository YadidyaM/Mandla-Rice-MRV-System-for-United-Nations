/**
 * Frontend Logger Utility
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  stack?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private log(level: LogLevel, message: string, data?: any, error?: Error) {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      level,
      message,
      timestamp,
      data,
      stack: error?.stack,
    };

    // Add to internal log store
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output in development
    if (this.isDevelopment) {
      const consoleMethod = console[level] || console.log;
      const prefix = `[${timestamp}] ${level.toUpperCase()}:`;
      
      if (data || error) {
        consoleMethod(prefix, message, data || error);
      } else {
        consoleMethod(prefix, message);
      }
    }

    // Send to remote logging service in production
    if (!this.isDevelopment && level === 'error') {
      this.sendToRemote(logEntry);
    }
  }

  private async sendToRemote(logEntry: LogEntry) {
    try {
      // Send to Sentry or other logging service
      if (import.meta.env.VITE_SENTRY_DSN) {
        // Implementation would go here
      }
    } catch (error) {
      console.error('Failed to send log to remote service:', error);
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | any) {
    this.log('error', message, undefined, error instanceof Error ? error : new Error(String(error)));
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  // Performance timing
  time(label: string) {
    const start = performance.now();
    return {
      end: () => {
        const duration = performance.now() - start;
        this.info(`Performance: ${label}`, { duration: `${duration.toFixed(2)}ms` });
        return duration;
      },
    };
  }
}

export const logger = new Logger();
