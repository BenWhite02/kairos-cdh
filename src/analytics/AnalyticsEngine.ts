// src/analytics/AnalyticsEngine.ts
// 🎯 F3 Integration Example - Complete analytics system integration

import { CampaignMetricsCollector } from './campaign/CampaignMetrics';
import { MomentEffectivenessTracker } from './moments/MomentTracker';
import { AtomUsageAnalyzer } from './atoms/AtomUsageAnalyzer';
import { UserInteractionAnalyzer } from './users/UserInteractionAnalyzer';
import { ReportingFramework } from './reporting/ReportingFramework';

export class AnalyticsEngine {
  private campaignMetrics: CampaignMetricsCollector;
  private momentTracker: MomentEffectivenessTracker;
  private atomAnalyzer: AtomUsageAnalyzer;
  private userAnalyzer: UserInteractionAnalyzer;
  private reportingFramework: ReportingFramework;

  constructor() {
    // Initialize all analytics components
    this.campaignMetrics = new CampaignMetricsCollector(30); // 30 days retention
    this.momentTracker = new MomentEffectivenessTracker();
    this.atomAnalyzer = new AtomUsageAnalyzer(90); // 90 days retention
    this.userAnalyzer = new UserInteractionAnalyzer(365); // 1 year retention
    
    this.reportingFramework = new ReportingFramework(
      this.campaignMetrics,
      this.momentTracker,
      this.atomAnalyzer,
      this.userAnalyzer
    );

    this.setupEventHandlers();
  }

  // Record a complete decision execution
  recordDecisionExecution(data: {
    campaignId: string;
    decisionId: string;
    userId: string;
    sessionId: string;
    atomsUsed: Array<{ atomId: string; executionTime: number; success: boolean; error?: string }>;
    momentId?: string;
    userContext: Record<string, any>;
    executionTime: number;
    success: boolean;
    errors: string[];
  }): void {
    // Record campaign metrics
    this.campaignMetrics.recordExecution({
      campaignId: data.campaignId,
      decisionId: data.decisionId,
      executionTime: data.executionTime,
      status: data.success ? 'success' : 'failure',
      rulesEvaluated: data.atomsUsed.length,
      rulesTriggered: data.atomsUsed.filter(a => a.success).length,
      errors: data.errors,
      timestamp: new Date(),
      context: data.userContext
    });

    // Record atom usage
    data.atomsUsed.forEach(atom => {
      this.atomAnalyzer.recordAtomUsage(
        atom.atomId,
        data.decisionId,
        data.campaignId,
        atom.executionTime,
        atom.success,
        data.userContext,
        null, // output data
        atom.error,
        data.userContext
      );
    });

    // Record user interaction
    this.userAnalyzer.recordUserRequest({
      userId: data.userId,
      sessionId: data.sessionId,
      requestId: `${data.campaignId}-${Date.now()}`,
      timestamp: new Date(),
      campaignId: data.campaignId,
      contextData: data.userContext,
      decisionMade: data.success,
      responseTime: data.executionTime,
      deviceType: this.detectDeviceType(data.userContext.userAgent),
      location: data.userContext.location
    });

    // Record moment interaction if present
    if (data.momentId) {
      this.momentTracker.recordInteraction({
        momentId: data.momentId,
        userId: data.userId,
        sessionId: data.sessionId,
        timestamp: new Date(),
        type: data.success ? 'conversion' : 'view',
        value: data.success ? 1 : 0,
        metadata: { campaignId: data.campaignId, ...data.userContext }
      });
    }
  }

  // Get comprehensive analytics dashboard
  getAnalyticsDashboard(): any {
    return this.reportingFramework.getDashboardMetrics();
  }

  // Generate performance insights
  generatePerformanceInsights(): {
    campaigns: any[];
    atoms: any[];
    users: any[];
    recommendations: any[];
  } {
    // Get top performing campaigns
    const topCampaigns = this.campaignMetrics.getTopPerformingCampaigns(10);
    
    // Get atom performance and recommendations
    const atomRankings = this.atomAnalyzer.getAtomRankings('efficiency', 20);
    const atomRecommendations = this.atomAnalyzer.generateOptimizationRecommendations();
    
    // Get user segments and behavior patterns
    const userSegments = this.userAnalyzer.generateUserSegments();
    
    // Generate campaign-specific insights
    const campaignInsights = topCampaigns.map(campaign => {
      const trends = this.campaignMetrics.getPerformanceTrends(
        campaign.campaignId,
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        new Date()
      );
      
      const errors = this.campaignMetrics.getErrorAnalysis(campaign.campaignId);
      const percentiles = this.campaignMetrics.getExecutionTimePercentiles(campaign.campaignId);
      
      return {
        ...campaign,
        trends,
        errors: errors.slice(0, 5),
        performanceDistribution: percentiles,
        healthScore: this.calculateCampaignHealthScore(campaign)
      };
    });

    return {
      campaigns: campaignInsights,
      atoms: atomRankings,
      users: userSegments,
      recommendations: atomRecommendations
    };
  }

  // Set up A/B test for moments
  setupMomentABTest(
    testId: string,
    momentIdA: string,
    momentIdB: string,
    trafficSplit: number = 0.5
  ): void {
    this.momentTracker.setupABTest(testId, momentIdA, momentIdB, trafficSplit);
  }

  // Analyze A/B test results
  getABTestResults(testId: string) {
    return this.momentTracker.analyzeABTest(testId);
  }

  // Get user journey analysis
  getUserJourney(userId: string, sessionId?: string) {
    const interactions = this.userAnalyzer.getUserJourney(userId, sessionId);
    const moments = this.momentTracker.getUserJourney(userId, sessionId);
    
    // Combine and sort by timestamp
    const combined = [...interactions, ...moments].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    return combined;
  }

  // Generate predictive insights
  generatePredictiveInsights(): {
    userChurnPredictions: Array<{
      userId: string;
      churnRisk: number;
      factors: string[];
      recommendedActions: string[];
    }>;
    campaignPerformanceForecast: Array<{
      campaignId: string;
      forecastedSuccessRate: number;
      confidence: number;
      trend: 'improving' | 'stable' | 'declining';
    }>;
    atomOptimizationOpportunities: Array<{
      atomId: string;
      currentPerformance: number;
      potentialImprovement: number;
      effort: 'low' | 'medium' | 'high';
    }>;
  } {
    const userSegments = this.userAnalyzer.generateUserSegments();
    const atRiskSegment = userSegments.find(s => s.segmentId === 'at-risk');
    
    // User churn predictions
    const churnPredictions = atRiskSegment ? 
      Array.from({length: Math.min(10, atRiskSegment.userCount)}, (_, i) => ({
        userId: `user_${i + 1}`,
        churnRisk: 70 + Math.random() * 25,
        factors: ['Decreasing engagement', 'Low conversion rate', 'Reduced session duration'],
        recommendedActions: [
          'Send personalized re-engagement campaign',
          'Offer special promotion',
          'Improve onboarding experience'
        ]
      })) : [];

    // Campaign performance forecast
    const topCampaigns = this.campaignMetrics.getTopPerformingCampaigns(5);
    const campaignForecasts = topCampaigns.map(campaign => {
      const trends = this.campaignMetrics.getPerformanceTrends(
        campaign.campaignId,
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        new Date()
      );
      
      const recentTrend = trends.slice(-7); // Last 7 days
      const avgTrend = recentTrend.reduce((sum, t) => sum + t.successRate, 0) / recentTrend.length;
      
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (avgTrend > campaign.successRate + 5) trend = 'improving';
      else if (avgTrend < campaign.successRate - 5) trend = 'declining';
      
      return {
        campaignId: campaign.campaignId,
        forecastedSuccessRate: Math.min(100, Math.max(0, avgTrend + (Math.random() - 0.5) * 10)),
        confidence: Math.min(95, 60 + recentTrend.length * 5),
        trend
      };
    });

    // Atom optimization opportunities
    const atomRecommendations = this.atomAnalyzer.generateOptimizationRecommendations();
    const optimizationOpportunities = atomRecommendations
      .filter(rec => rec.type === 'performance')
      .slice(0, 10)
      .map(rec => ({
        atomId: rec.atomId,
        currentPerformance: rec.metrics.currentTime || 0,
        potentialImprovement: rec.metrics.targetTime 
          ? ((rec.metrics.currentTime - rec.metrics.targetTime) / rec.metrics.currentTime) * 100 
          : 0,
        effort: rec.effort
      }));

    return {
      userChurnPredictions: churnPredictions,
      campaignPerformanceForecast: campaignForecasts,
      atomOptimizationOpportunities: optimizationOpportunities
    };
  }

  // Export analytics data
  async exportAnalytics(
    format: 'json' | 'csv' | 'excel',
    timeRange: { start: Date; end: Date },
    includeSegments: string[] = ['campaigns', 'atoms', 'users', 'moments']
  ): Promise<Buffer> {
    const exportData: any = {};

    if (includeSegments.includes('campaigns')) {
      exportData.campaigns = this.campaignMetrics.getTopPerformingCampaigns();
    }

    if (includeSegments.includes('atoms')) {
      exportData.atoms = this.atomAnalyzer.getAtomRankings();
    }

    if (includeSegments.includes('users')) {
      exportData.users = this.userAnalyzer.analyzeRequestPatterns(
        timeRange.start, 
        timeRange.end
      );
    }

    if (includeSegments.includes('moments')) {
      // Would collect moment data based on time range
      exportData.moments = [];
    }

    // Use reporting framework to export
    return this.reportingFramework.exportReport(
      'custom-export',
      { format, includeMetadata: true },
      timeRange
    );
  }

  // Get real-time system health
  getSystemHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    metrics: {
      averageResponseTime: number;
      errorRate: number;
      throughput: number;
      activeUsers: number;
    };
    alerts: Array<{
      level: 'info' | 'warning' | 'error';
      message: string;
      timestamp: Date;
    }>;
    recommendations: string[];
  } {
    const dashboard = this.reportingFramework.getDashboardMetrics();
    const atomRecommendations = this.atomAnalyzer.generateOptimizationRecommendations();
    
    // Calculate overall health status
    const errorRate = 100 - dashboard.overview.overallSuccessRate;
    const responseTime = dashboard.overview.averageResponseTime;
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (errorRate > 10 || responseTime > 2000) {
      status = 'critical';
    } else if (errorRate > 5 || responseTime > 1000) {
      status = 'warning';
    }

    const recommendations = [
      ...atomRecommendations.slice(0, 3).map(rec => rec.recommendation),
      ...(errorRate > 5 ? ['Review error patterns and implement fixes'] : []),
      ...(responseTime > 1000 ? ['Optimize slow-performing components'] : [])
    ];

    return {
      status,
      metrics: {
        averageResponseTime: responseTime,
        errorRate,
        throughput: dashboard.overview.totalDecisions,
        activeUsers: dashboard.overview.activeUsers
      },
      alerts: dashboard.alerts,
      recommendations
    };
  }

  // Create custom report
  createCustomReport(config: {
    name: string;
    metrics: string[];
    timeRange: { start: Date; end: Date };
    filters?: Record<string, any>;
    groupBy?: string[];
  }): Promise<any> {
    const reportConfig = {
      reportId: `custom-${Date.now()}`,
      name: config.name,
      description: 'Custom analytics report',
      type: 'adhoc' as const,
      filters: config.filters || {},
      metrics: config.metrics,
      visualizations: [],
      autoRefresh: false,
      retentionDays: 7
    };

    this.reportingFramework.createReport(reportConfig);
    return this.reportingFramework.generateReport(
      reportConfig.reportId,
      config.timeRange,
      false
    );
  }

  // Get performance comparison
  comparePerformance(
    entityType: 'campaign' | 'atom' | 'moment',
    entityIds: string[],
    timeRange: { start: Date; end: Date }
  ): Array<{
    entityId: string;
    metrics: Record<string, number>;
    rank: number;
    trend: 'up' | 'down' | 'stable';
  }> {
    const comparisons: Array<{
      entityId: string;
      metrics: Record<string, number>;
      rank: number;
      trend: 'up' | 'down' | 'stable';
    }> = [];

    entityIds.forEach((entityId, index) => {
      let metrics: Record<string, number> = {};
      let trend: 'up' | 'down' | 'stable' = 'stable';

      switch (entityType) {
        case 'campaign':
          const campaignStats = this.campaignMetrics.getCampaignPerformance(entityId);
          metrics = {
            successRate: campaignStats.successRate,
            averageExecutionTime: campaignStats.averageExecutionTime,
            totalExecutions: campaignStats.totalExecutions,
            errorRate: campaignStats.errorRate
          };
          break;

        case 'atom':
          const atomStats = this.atomAnalyzer.getAtomPerformance(entityId);
          if (atomStats) {
            metrics = {
              successRate: atomStats.successRate,
              averageExecutionTime: atomStats.averageExecutionTime,
              totalExecutions: atomStats.totalExecutions,
              efficiencyScore: atomStats.efficiencyScore
            };
          }
          break;

        case 'moment':
          const momentStats = this.momentTracker.getMomentEffectiveness(entityId);
          metrics = {
            conversionRate: momentStats.conversionRate,
            clickThroughRate: momentStats.clickThroughRate,
            totalViews: momentStats.totalViews,
            revenueAttribution: momentStats.revenueAttribution
          };
          break;
      }

      comparisons.push({
        entityId,
        metrics,
        rank: index + 1, // Simplified ranking
        trend
      });
    });

    // Sort by primary metric and update ranks
    const primaryMetric = entityType === 'campaign' ? 'successRate' : 
                         entityType === 'atom' ? 'efficiencyScore' : 'conversionRate';
    
    comparisons.sort((a, b) => (b.metrics[primaryMetric] || 0) - (a.metrics[primaryMetric] || 0));
    comparisons.forEach((comp, index) => {
      comp.rank = index + 1;
    });

    return comparisons;
  }

  private setupEventHandlers(): void {
    // Set up cross-component event handling
    this.campaignMetrics.on('executionRecorded', (metric) => {
      // Could trigger alerts or notifications
      if (metric.errors.length > 0) {
        this.emit('performanceAlert', {
          type: 'campaign_error',
          campaignId: metric.campaignId,
          errors: metric.errors
        });
      }
    });

    this.atomAnalyzer.on('atomUsageRecorded', ({ atomId, metric }) => {
      // Could trigger optimization recommendations
      if (metric.averageExecutionTime > 5000) {
        this.emit('performanceAlert', {
          type: 'slow_atom',
          atomId,
          executionTime: metric.averageExecutionTime
        });
      }
    });

    this.userAnalyzer.on('userRequestRecorded', (request) => {
      // Could trigger personalization updates
      if (!request.decisionMade) {
        this.emit('conversionAlert', {
          type: 'decision_rejected',
          userId: request.userId,
          campaignId: request.campaignId
        });
      }
    });
  }

  private calculateCampaignHealthScore(campaign: any): number {
    // Calculate a composite health score (0-100)
    const successRateScore = campaign.successRate;
    const performanceScore = Math.max(0, 100 - (campaign.averageExecutionTime / 50));
    const reliabilityScore = Math.max(0, 100 - campaign.errorRate * 2);
    const usageScore = Math.min(100, (campaign.totalExecutions / 1000) * 10);

    return (successRateScore * 0.3 + performanceScore * 0.25 + reliabilityScore * 0.25 + usageScore * 0.2);
  }

  private detectDeviceType(userAgent?: string): 'mobile' | 'desktop' | 'tablet' {
    if (!userAgent) return 'desktop';
    
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      if (/iPad/.test(userAgent)) return 'tablet';
      return 'mobile';
    }
    return 'desktop';
  }

  private emit(event: string, data: any): void {
    // Event emission for external listeners
    console.log(`Analytics Event: ${event}`, data);
  }
}

// Usage Example
export class AnalyticsUsageExample {
  private analytics: AnalyticsEngine;

  constructor() {
    this.analytics = new AnalyticsEngine();
  }

  // Example: Record a complete user interaction
  async handleUserDecision(): Promise<void> {
    // Simulate a user decision execution
    this.analytics.recordDecisionExecution({
      campaignId: 'summer-sale-2024',
      decisionId: 'product-recommendation',
      userId: 'user-12345',
      sessionId: 'session-67890',
      atomsUsed: [
        { atomId: 'user-profile-atom', executionTime: 150, success: true },
        { atomId: 'product-catalog-atom', executionTime: 300, success: true },
        { atomId: 'recommendation-engine', executionTime: 450, success: true }
      ],
      momentId: 'homepage-banner',
      userContext: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        location: { country: 'US', region: 'CA', city: 'San Francisco' },
        previousPurchases: 5,
        loyaltyTier: 'gold'
      },
      executionTime: 900,
      success: true,
      errors: []
    });
  }

  // Example: Generate comprehensive insights
  async generateInsights(): Promise<void> {
    const insights = this.analytics.generatePerformanceInsights();
    const predictive = this.analytics.generatePredictiveInsights();
    const systemHealth = this.analytics.getSystemHealth();

    console.log('Performance Insights:', {
      topCampaigns: insights.campaigns.slice(0, 3),
      topAtoms: insights.atoms.slice(0, 5),
      userSegments: insights.users.length,
      recommendations: insights.recommendations.length
    });

    console.log('Predictive Insights:', {
      churnRisk: predictive.userChurnPredictions.length,
      campaignForecasts: predictive.campaignPerformanceForecast.length,
      optimizationOps: predictive.atomOptimizationOpportunities.length
    });

    console.log('System Health:', systemHealth.status);
  }

  // Example: Set up real-time monitoring
  setupMonitoring(): void {
    const unsubscribe = this.analytics.getReportingFramework().subscribeToRealtimeUpdates(
      'executive-dashboard',
      (data) => {
        console.log('Real-time dashboard update:', {
          activeUsers: data.overview.activeUsers,
          successRate: data.overview.overallSuccessRate,
          alerts: data.alerts.length
        });
      }
    );

    // Unsubscribe after 1 hour
    setTimeout(unsubscribe, 60 * 60 * 1000);
  }

  // Example: A/B test analysis
  async runABTest(): Promise<void> {
    // Set up A/B test
    this.analytics.setupMomentABTest(
      'homepage-banner-test',
      'banner-variant-a',
      'banner-variant-b',
      0.5
    );

    // Simulate some time passing and interactions...
    
    // Analyze results
    const results = this.analytics.getABTestResults('homepage-banner-test');
    if (results) {
      console.log('A/B Test Results:', {
        winner: results.winner,
        significance: results.significance,
        variantAConversion: results.variantA.stats.conversionRate,
        variantBConversion: results.variantB.stats.conversionRate
      });
    }
  }

  private getReportingFramework() {
    return this.analytics['reportingFramework'];
  }
}

// Export types for external use
export * from './campaign/CampaignMetrics';
export * from './moments/MomentTracker';
export * from './atoms/AtomUsageAnalyzer';
export * from './users/UserInteractionAnalyzer';
export * from './reporting/ReportingFramework';