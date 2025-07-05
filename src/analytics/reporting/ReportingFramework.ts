// src/analytics/reporting/ReportingFramework.ts
// 🎯 F3.5: Basic Reporting Framework - Real-time dashboard APIs and historical trend analysis

import { EventEmitter } from 'events';
import { CampaignMetricsCollector, CampaignPerformanceStats } from '../campaign/CampaignMetrics';
import { MomentEffectivenessTracker, MomentEffectivenessStats } from '../moments/MomentTracker';
import { AtomUsageAnalyzer, AtomPerformanceStats } from '../atoms/AtomUsageAnalyzer';
import { UserInteractionAnalyzer, UserBehaviorPattern } from '../users/UserInteractionAnalyzer';

export interface ReportConfig {
  reportId: string;
  name: string;
  description: string;
  type: 'dashboard' | 'scheduled' | 'adhoc';
  frequency?: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  recipients?: string[];
  filters: Record<string, any>;
  metrics: string[];
  visualizations: ReportVisualization[];
  autoRefresh: boolean;
  retentionDays: number;
}

export interface ReportVisualization {
  id: string;
  type: 'line_chart' | 'bar_chart' | 'pie_chart' | 'heatmap' | 'table' | 'metric_card' | 'funnel';
  title: string;
  dataSource: string;
  metrics: string[];
  dimensions: string[];
  filters: Record<string, any>;
  config: Record<string, any>;
}

export interface ReportData {
  reportId: string;
  generatedAt: Date;
  timeRange: { start: Date; end: Date };
  data: Record<string, any>;
  metadata: {
    totalRows: number;
    executionTime: number;
    dataFreshness: Date;
    warningsAndNotes: string[];
  };
}

export interface DashboardMetrics {
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalDecisions: number;
    overallSuccessRate: number;
    averageResponseTime: number;
    activeUsers: number;
  };
  performance: {
    topPerformingCampaigns: CampaignPerformanceStats[];
    topPerformingMoments: MomentEffectivenessStats[];
    topPerformingAtoms: AtomPerformanceStats[];
    performanceTrends: Array<{
      date: Date;
      successRate: number;
      responseTime: number;
      decisions: number;
    }>;
  };
  users: {
    userGrowth: Array<{ date: Date; newUsers: number; totalUsers: number }>;
    engagementMetrics: {
      dailyActiveUsers: number;
      averageSessionDuration: number;
      userRetention: { day1: number; day7: number; day30: number };
    };
    topUserSegments: Array<{
      segment: string;
      users: number;
      engagement: number;
      value: number;
    }>;
  };
  alerts: Array<{
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: Date;
    category: 'performance' | 'reliability' | 'usage' | 'security';
    actionRequired: boolean;
  }>;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  includeMetadata: boolean;
  compressionLevel?: 'none' | 'low' | 'medium' | 'high';
  dateFormat?: string;
  timezone?: string;
}

export class ReportingFramework extends EventEmitter {
  private campaignMetrics: CampaignMetricsCollector;
  private momentTracker: MomentEffectivenessTracker;
  private atomAnalyzer: AtomUsageAnalyzer;
  private userAnalyzer: UserInteractionAnalyzer;
  
  private reportConfigs: Map<string, ReportConfig> = new Map();
  private reportCache: Map<string, { data: ReportData; expires: Date }> = new Map();
  private scheduledReports: Map<string, NodeJS.Timeout> = new Map();
  private realtimeSubscriptions: Map<string, Set<(data: any) => void>> = new Map();

  constructor(
    campaignMetrics: CampaignMetricsCollector,
    momentTracker: MomentEffectivenessTracker,
    atomAnalyzer: AtomUsageAnalyzer,
    userAnalyzer: UserInteractionAnalyzer
  ) {
    super();
    this.campaignMetrics = campaignMetrics;
    this.momentTracker = momentTracker;
    this.atomAnalyzer = atomAnalyzer;
    this.userAnalyzer = userAnalyzer;

    this.initializeDefaultReports();
    this.startRealtimeUpdates();
  }

  // Create a new report configuration
  createReport(config: ReportConfig): void {
    this.reportConfigs.set(config.reportId, config);
    
    if (config.frequency && config.frequency !== 'realtime') {
      this.scheduleReport(config);
    }

    this.emit('reportCreated', config);
  }

  // Update existing report configuration
  updateReport(reportId: string, updates: Partial<ReportConfig>): void {
    const existing = this.reportConfigs.get(reportId);
    if (!existing) {
      throw new Error(`Report ${reportId} not found`);
    }

    const updated = { ...existing, ...updates };
    this.reportConfigs.set(reportId, updated);

    // Reschedule if frequency changed
    if (updates.frequency) {
      this.unscheduleReport(reportId);
      if (updated.frequency !== 'realtime') {
        this.scheduleReport(updated);
      }
    }

    // Clear cache
    this.reportCache.delete(reportId);

    this.emit('reportUpdated', { reportId, config: updated });
  }

  // Generate report data
  async generateReport(
    reportId: string, 
    timeRange?: { start: Date; end: Date },
    useCache: boolean = true
  ): Promise<ReportData> {
    const config = this.reportConfigs.get(reportId);
    if (!config) {
      throw new Error(`Report configuration not found: ${reportId}`);
    }

    // Check cache first
    if (useCache) {
      const cached = this.reportCache.get(reportId);
      if (cached && cached.expires > new Date()) {
        return cached.data;
      }
    }

    const startTime = Date.now();
    const effectiveTimeRange = timeRange || this.getDefaultTimeRange(config);
    
    try {
      const data = await this.collectReportData(config, effectiveTimeRange);
      
      const reportData: ReportData = {
        reportId,
        generatedAt: new Date(),
        timeRange: effectiveTimeRange,
        data,
        metadata: {
          totalRows: this.countDataRows(data),
          executionTime: Date.now() - startTime,
          dataFreshness: new Date(),
          warningsAndNotes: []
        }
      };

      // Cache the result
      const cacheExpiry = this.getCacheExpiry(config.frequency);
      this.reportCache.set(reportId, {
        data: reportData,
        expires: new Date(Date.now() + cacheExpiry)
      });

      this.emit('reportGenerated', reportData);
      return reportData;

    } catch (error) {
      this.emit('reportError', { reportId, error });
      throw error;
    }
  }

  // Get real-time dashboard metrics
  getDashboardMetrics(): DashboardMetrics {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate overview metrics
    const topCampaigns = this.campaignMetrics.getTopPerformingCampaigns(10);
    const totalCampaigns = topCampaigns.length;
    const activeCampaigns = topCampaigns.filter(c => c.totalExecutions > 0).length;
    const totalDecisions = topCampaigns.reduce((sum, c) => sum + c.totalExecutions, 0);
    const overallSuccessRate = topCampaigns.length > 0
      ? topCampaigns.reduce((sum, c) => sum + c.successRate, 0) / topCampaigns.length
      : 0;
    const averageResponseTime = topCampaigns.length > 0
      ? topCampaigns.reduce((sum, c) => sum + c.averageExecutionTime, 0) / topCampaigns.length
      : 0;

    // Get user metrics
    const requestPatterns = this.userAnalyzer.analyzeRequestPatterns(last24Hours, now);
    const activeUsers = requestPatterns.uniqueUsers;

    // Generate performance trends
    const performanceTrends = this.generatePerformanceTrends(last7Days, now);

    // Generate user growth data
    const userGrowth = this.generateUserGrowthData(last30Days, now);

    // Get user segments
    const userSegments = this.userAnalyzer.generateUserSegments();
    const topUserSegments = userSegments.slice(0, 5).map(segment => ({
      segment: segment.name,
      users: segment.userCount,
      engagement: segment.averageEngagement,
      value: segment.averageValue
    }));

    // Generate alerts
    const alerts = this.generateSystemAlerts();

    return {
      overview: {
        totalCampaigns,
        activeCampaigns,
        totalDecisions,
        overallSuccessRate,
        averageResponseTime,
        activeUsers
      },
      performance: {
        topPerformingCampaigns: topCampaigns.slice(0, 5),
        topPerformingMoments: [], // Would integrate with moment tracker
        topPerformingAtoms: this.atomAnalyzer.getAtomRankings('efficiency', 5),
        performanceTrends
      },
      users: {
        userGrowth,
        engagementMetrics: {
          dailyActiveUsers: activeUsers,
          averageSessionDuration: 0, // Would calculate from user analyzer
          userRetention: { day1: 80, day7: 65, day30: 45 } // Mock data
        },
        topUserSegments
      },
      alerts
    };
  }

  // Export report data
  async exportReport(
    reportId: string,
    options: ExportOptions,
    timeRange?: { start: Date; end: Date }
  ): Promise<Buffer> {
    const reportData = await this.generateReport(reportId, timeRange, false);
    
    switch (options.format) {
      case 'json':
        return this.exportAsJSON(reportData, options);
      case 'csv':
        return this.exportAsCSV(reportData, options);
      case 'excel':
        return this.exportAsExcel(reportData, options);
      case 'pdf':
        return this.exportAsPDF(reportData, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  // Subscribe to real-time updates
  subscribeToRealtimeUpdates(
    reportId: string, 
    callback: (data: any) => void
  ): () => void {
    const subscribers = this.realtimeSubscriptions.get(reportId) || new Set();
    subscribers.add(callback);
    this.realtimeSubscriptions.set(reportId, subscribers);

    // Return unsubscribe function
    return () => {
      const currentSubscribers = this.realtimeSubscriptions.get(reportId);
      if (currentSubscribers) {
        currentSubscribers.delete(callback);
        if (currentSubscribers.size === 0) {
          this.realtimeSubscriptions.delete(reportId);
        }
      }
    };
  }

  // Get historical trend analysis
  getHistoricalTrends(
    metric: string,
    timeRange: { start: Date; end: Date },
    granularity: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Array<{ date: Date; value: number; trend: 'up' | 'down' | 'stable' }> {
    // This is a simplified implementation
    // In practice, you'd query historical data based on the metric type
    
    const trends: Array<{ date: Date; value: number; trend: 'up' | 'down' | 'stable' }> = [];
    const timeSpan = timeRange.end.getTime() - timeRange.start.getTime();
    const periodMs = this.getPeriodMs(granularity);
    const periods = Math.ceil(timeSpan / periodMs);

    let previousValue = 0;
    
    for (let i = 0; i < periods; i++) {
      const date = new Date(timeRange.start.getTime() + i * periodMs);
      const value = this.calculateHistoricalMetric(metric, date, granularity);
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (i > 0) {
        const change = ((value - previousValue) / previousValue) * 100;
        if (change > 5) trend = 'up';
        else if (change < -5) trend = 'down';
      }
      
      trends.push({ date, value, trend });
      previousValue = value;
    }

    return trends;
  }

  // Compare performance between time periods
  comparePerformance(
    reportId: string,
    currentPeriod: { start: Date; end: Date },
    comparisonPeriod: { start: Date; end: Date }
  ): {
    current: ReportData;
    comparison: ReportData;
    changes: Record<string, {
      value: number;
      previousValue: number;
      change: number;
      changePercent: number;
      trend: 'up' | 'down' | 'stable';
    }>;
  } {
    // This would generate comparison reports
    // Simplified implementation
    const current = this.generateReport(reportId, currentPeriod, false);
    const comparison = this.generateReport(reportId, comparisonPeriod, false);

    // Calculate changes (simplified)
    const changes: Record<string, any> = {};
    
    return {
      current: current as any,
      comparison: comparison as any,
      changes
    };
  }

  private async collectReportData(
    config: ReportConfig,
    timeRange: { start: Date; end: Date }
  ): Promise<Record<string, any>> {
    const data: Record<string, any> = {};

    // Collect campaign metrics
    if (config.metrics.includes('campaign_performance')) {
      data.campaigns = this.campaignMetrics.getTopPerformingCampaigns();
    }

    // Collect atom metrics
    if (config.metrics.includes('atom_usage')) {
      data.atoms = this.atomAnalyzer.getAtomRankings();
    }

    // Collect user metrics
    if (config.metrics.includes('user_behavior')) {
      data.users = this.userAnalyzer.analyzeRequestPatterns(timeRange.start, timeRange.end);
    }

    // Apply filters
    if (config.filters) {
      this.applyFilters(data, config.filters);
    }

    return data;
  }

  private initializeDefaultReports(): void {
    // Executive Dashboard
    this.createReport({
      reportId: 'executive-dashboard',
      name: 'Executive Dashboard',
      description: 'High-level overview of system performance',
      type: 'dashboard',
      frequency: 'realtime',
      filters: {},
      metrics: ['campaign_performance', 'user_behavior', 'system_health'],
      visualizations: [
        {
          id: 'overview-metrics',
          type: 'metric_card',
          title: 'Key Metrics',
          dataSource: 'overview',
          metrics: ['total_decisions', 'success_rate', 'active_users'],
          dimensions: [],
          filters: {},
          config: {}
        }
      ],
      autoRefresh: true,
      retentionDays: 90
    });

    // Daily Performance Report
    this.createReport({
      reportId: 'daily-performance',
      name: 'Daily Performance Report',
      description: 'Daily summary of system performance',
      type: 'scheduled',
      frequency: 'daily',
      metrics: ['campaign_performance', 'atom_usage', 'errors'],
      visualizations: [],
      autoRefresh: false,
      retentionDays: 30,
      filters: {}
    });
  }

  private scheduleReport(config: ReportConfig): void {
    if (!config.frequency || config.frequency === 'realtime') return;

    const interval = this.getScheduleInterval(config.frequency);
    const timer = setInterval(async () => {
      try {
        const reportData = await this.generateReport(config.reportId, undefined, false);
        this.emit('scheduledReportGenerated', reportData);
        
        // Send to recipients if configured
        if (config.recipients && config.recipients.length > 0) {
          this.sendReportToRecipients(reportData, config.recipients);
        }
      } catch (error) {
        this.emit('scheduledReportError', { reportId: config.reportId, error });
      }
    }, interval);

    this.scheduledReports.set(config.reportId, timer);
  }

  private unscheduleReport(reportId: string): void {
    const timer = this.scheduledReports.get(reportId);
    if (timer) {
      clearInterval(timer);
      this.scheduledReports.delete(reportId);
    }
  }

  private startRealtimeUpdates(): void {
    // Update real-time subscriptions every 30 seconds
    setInterval(() => {
      this.realtimeSubscriptions.forEach((subscribers, reportId) => {
        if (subscribers.size > 0) {
          try {
            const data = this.getDashboardMetrics();
            subscribers.forEach(callback => callback(data));
          } catch (error) {
            this.emit('realtimeUpdateError', { reportId, error });
          }
        }
      });
    }, 30000);
  }

  private generatePerformanceTrends(startDate: Date, endDate: Date): Array<{
    date: Date;
    successRate: number;
    responseTime: number;
    decisions: number;
  }> {
    // Simplified implementation - would aggregate actual data
    const trends = [];
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      trends.push({
        date,
        successRate: 85 + Math.random() * 10,
        responseTime: 200 + Math.random() * 100,
        decisions: 1000 + Math.random() * 500
      });
    }
    
    return trends;
  }

  private generateUserGrowthData(startDate: Date, endDate: Date): Array<{
    date: Date;
    newUsers: number;
    totalUsers: number;
  }> {
    // Simplified implementation
    const growth = [];
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    let totalUsers = 10000;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const newUsers = Math.floor(50 + Math.random() * 100);
      totalUsers += newUsers;
      
      growth.push({
        date,
        newUsers,
        totalUsers
      });
    }
    
    return growth;
  }

  private generateSystemAlerts(): Array<{
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: Date;
    category: 'performance' | 'reliability' | 'usage' | 'security';
    actionRequired: boolean;
  }> {
    // This would analyze system metrics to generate real alerts
    return [
      {
        severity: 'warning',
        message: 'Campaign "summer-promo" has 15% higher than usual error rate',
        timestamp: new Date(),
        category: 'reliability',
        actionRequired: true
      },
      {
        severity: 'info',
        message: 'New user registrations up 25% this week',
        timestamp: new Date(),
        category: 'usage',
        actionRequired: false
      }
    ];
  }

  private exportAsJSON(reportData: ReportData, options: ExportOptions): Buffer {
    const jsonData = options.includeMetadata ? reportData : reportData.data;
    return Buffer.from(JSON.stringify(jsonData, null, 2));
  }

  private exportAsCSV(reportData: ReportData, options: ExportOptions): Buffer {
    // Simplified CSV export - would use proper CSV library
    let csv = '';
    
    // Add headers
    const firstRecord = Object.values(reportData.data)[0];
    if (Array.isArray(firstRecord) && firstRecord.length > 0) {
      csv += Object.keys(firstRecord[0]).join(',') + '\n';
      
      // Add data rows
      firstRecord.forEach(record => {
        csv += Object.values(record).join(',') + '\n';
      });
    }
    
    return Buffer.from(csv);
  }

  private exportAsExcel(reportData: ReportData, options: ExportOptions): Buffer {
    // Would use a library like exceljs
    throw new Error('Excel export not implemented');
  }

  private exportAsPDF(reportData: ReportData, options: ExportOptions): Buffer {
    // Would use a library like puppeteer or pdfkit
    throw new Error('PDF export not implemented');
  }

  private getDefaultTimeRange(config: ReportConfig): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();
    
    switch (config.frequency) {
      case 'hourly':
        start.setHours(start.getHours() - 1);
        break;
      case 'daily':
        start.setDate(start.getDate() - 1);
        break;
      case 'weekly':
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        break;
      default:
        start.setDate(start.getDate() - 7); // Default to last week
    }
    
    return { start, end };
  }

  private getCacheExpiry(frequency?: string): number {
    switch (frequency) {
      case 'realtime':
        return 30 * 1000; // 30 seconds
      case 'hourly':
        return 5 * 60 * 1000; // 5 minutes
      case 'daily':
        return 60 * 60 * 1000; // 1 hour
      default:
        return 5 * 60 * 1000; // 5 minutes
    }
  }

  private getScheduleInterval(frequency: string): number {
    switch (frequency) {
      case 'hourly':
        return 60 * 60 * 1000; // 1 hour
      case 'daily':
        return 24 * 60 * 60 * 1000; // 1 day
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000; // 1 week
      case 'monthly':
        return 30 * 24 * 60 * 60 * 1000; // 30 days
      default:
        return 60 * 60 * 1000; // 1 hour
    }
  }

  private getPeriodMs(granularity: string): number {
    switch (granularity) {
      case 'hour':
        return 60 * 60 * 1000;
      case 'day':
        return 24 * 60 * 60 * 1000;
      case 'week':
        return 7 * 24 * 60 * 60 * 1000;
      case 'month':
        return 30 * 24 * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000;
    }
  }

  private calculateHistoricalMetric(metric: string, date: Date, granularity: string): number {
    // Simplified implementation - would query actual historical data
    return Math.random() * 100;
  }

  private countDataRows(data: Record<string, any>): number {
    let count = 0;
    Object.values(data).forEach(value => {
      if (Array.isArray(value)) {
        count += value.length;
      }
    });
    return count;
  }

  private applyFilters(data: Record<string, any>, filters: Record<string, any>): void {
    // Apply filters to data - simplified implementation
    Object.keys(filters).forEach(filterKey => {
      const filterValue = filters[filterKey];
      // Apply filter logic based on filter key and value
    });
  }

  private sendReportToRecipients(reportData: ReportData, recipients: string[]): void {
    // Would integrate with email service or notification system
    this.emit('reportSent', { reportData, recipients });
  }
}