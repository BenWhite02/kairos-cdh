// src/analytics/users/UserInteractionAnalyzer.ts
// 🎯 F3.4: User Interaction Analytics - Decision request patterns and personalization effectiveness

import { EventEmitter } from 'events';

export interface UserDecisionRequest {
  userId: string;
  sessionId: string;
  requestId: string;
  timestamp: Date;
  campaignId: string;
  contextData: Record<string, any>;
  decisionMade: boolean;
  responseTime: number;
  userAgent?: string;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  location?: { country: string; region: string; city: string };
}

export interface UserBehaviorPattern {
  userId: string;
  patternType: 'frequent_user' | 'power_user' | 'casual_user' | 'trial_user' | 'churned_user';
  requestFrequency: number; // requests per day
  averageSessionLength: number; // minutes
  preferredTimeSlots: Array<{ hour: number; dayOfWeek: number; frequency: number }>;
  campaignPreferences: Array<{ campaignId: string; engagementScore: number }>;
  conversionLikelihood: number; // 0-100
  churnRisk: number; // 0-100
  lastActivity: Date;
  engagementTrend: 'increasing' | 'stable' | 'decreasing';
}

export interface SessionAnalytics {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  totalRequests: number;
  decisionsAccepted: number;
  decisionsRejected: number;
  averageResponseTime: number;
  deviceInfo: {
    type: 'mobile' | 'desktop' | 'tablet';
    browser?: string;
    os?: string;
  };
  journey: Array<{
    timestamp: Date;
    action: 'request' | 'decision' | 'conversion' | 'exit';
    campaignId?: string;
    value?: number;
  }>;
}

export interface PersonalizationEffectiveness {
  userId: string;
  personalizedRequests: number;
  genericRequests: number;
  personalizedAcceptanceRate: number;
  genericAcceptanceRate: number;
  personalizationLift: number; // percentage improvement
  topPersonalizationFactors: Array<{
    factor: string;
    impact: number;
    confidence: number;
  }>;
  segmentPerformance: Record<string, {
    requests: number;
    acceptanceRate: number;
    avgValue: number;
  }>;
}

export interface UserSegment {
  segmentId: string;
  name: string;
  description: string;
  criteria: Record<string, any>;
  userCount: number;
  averageEngagement: number;
  averageValue: number;
  churnRate: number;
  topCampaigns: Array<{ campaignId: string; engagement: number }>;
}

export interface CohortAnalysis {
  cohortId: string;
  cohortDate: Date;
  initialSize: number;
  retentionRates: Array<{
    period: number;
    activeUsers: number;
    retentionRate: number;
    averageValue: number;
  }>;
  behaviorEvolution: Array<{
    period: number;
    avgRequestsPerUser: number;
    avgAcceptanceRate: number;
    avgSessionDuration: number;
  }>;
}

export class UserInteractionAnalyzer extends EventEmitter {
  private userRequests: Map<string, UserDecisionRequest[]> = new Map();
  private userPatterns: Map<string, UserBehaviorPattern> = new Map();
  private sessions: Map<string, SessionAnalytics> = new Map();
  private personalizationData: Map<string, PersonalizationEffectiveness> = new Map();
  private userSegments: Map<string, UserSegment> = new Map();
  private cohorts: Map<string, CohortAnalysis> = new Map();
  private retentionDays: number = 365;

  constructor(retentionDays: number = 365) {
    super();
    this.retentionDays = retentionDays;
    this.startAnalysisTimer();
  }

  // Record user decision request
  recordUserRequest(request: UserDecisionRequest): void {
    const userRequests = this.userRequests.get(request.userId) || [];
    userRequests.push(request);
    this.userRequests.set(request.userId, userRequests);

    // Update or create session
    this.updateSession(request);

    // Update user behavior pattern
    this.updateUserPattern(request);

    // Update personalization data
    this.updatePersonalizationData(request);

    this.emit('userRequestRecorded', request);
  }

  // End user session
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session && !session.endTime) {
      session.endTime = new Date();
      session.duration = session.endTime.getTime() - session.startTime.getTime();
      this.sessions.set(sessionId, session);
      
      this.emit('sessionEnded', session);
    }
  }

  // Get user behavior pattern
  getUserBehaviorPattern(userId: string): UserBehaviorPattern | null {
    return this.userPatterns.get(userId) || null;
  }

  // Get session analytics
  getSessionAnalytics(sessionId: string): SessionAnalytics | null {
    return this.sessions.get(sessionId) || null;
  }

  // Get user sessions within date range
  getUserSessions(userId: string, startDate: Date, endDate: Date): SessionAnalytics[] {
    return Array.from(this.sessions.values()).filter(session =>
      session.userId === userId &&
      session.startTime >= startDate &&
      session.startTime <= endDate
    ).sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  // Analyze decision request patterns
  analyzeRequestPatterns(
    startDate: Date,
    endDate: Date
  ): {
    totalRequests: number;
    uniqueUsers: number;
    averageRequestsPerUser: number;
    peakHours: Array<{ hour: number; requests: number }>;
    deviceDistribution: Record<string, number>;
    geographicDistribution: Record<string, number>;
    campaignPopularity: Array<{ campaignId: string; requests: number; uniqueUsers: number }>;
  } {
    const filteredRequests: UserDecisionRequest[] = [];
    
    this.userRequests.forEach(requests => {
      filteredRequests.push(...requests.filter(r => 
        r.timestamp >= startDate && r.timestamp <= endDate
      ));
    });

    const uniqueUsers = new Set(filteredRequests.map(r => r.userId)).size;
    
    // Analyze peak hours
    const hourCounts = new Array(24).fill(0);
    filteredRequests.forEach(request => {
      hourCounts[request.timestamp.getHours()]++;
    });
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, requests: count }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 5);

    // Device distribution
    const deviceDistribution: Record<string, number> = {};
    filteredRequests.forEach(request => {
      const device = request.deviceType || 'unknown';
      deviceDistribution[device] = (deviceDistribution[device] || 0) + 1;
    });

    // Geographic distribution
    const geographicDistribution: Record<string, number> = {};
    filteredRequests.forEach(request => {
      if (request.location) {
        const location = request.location.country;
        geographicDistribution[location] = (geographicDistribution[location] || 0) + 1;
      }
    });

    // Campaign popularity
    const campaignStats = new Map<string, { requests: number; users: Set<string> }>();
    filteredRequests.forEach(request => {
      const existing = campaignStats.get(request.campaignId) || { requests: 0, users: new Set() };
      existing.requests++;
      existing.users.add(request.userId);
      campaignStats.set(request.campaignId, existing);
    });

    const campaignPopularity = Array.from(campaignStats.entries())
      .map(([campaignId, stats]) => ({
        campaignId,
        requests: stats.requests,
        uniqueUsers: stats.users.size
      }))
      .sort((a, b) => b.requests - a.requests);

    return {
      totalRequests: filteredRequests.length,
      uniqueUsers,
      averageRequestsPerUser: uniqueUsers > 0 ? filteredRequests.length / uniqueUsers : 0,
      peakHours,
      deviceDistribution,
      geographicDistribution,
      campaignPopularity
    };
  }

  // Get personalization effectiveness
  getPersonalizationEffectiveness(userId: string): PersonalizationEffectiveness | null {
    return this.personalizationData.get(userId) || null;
  }

  // Generate user segments
  generateUserSegments(): UserSegment[] {
    const segments: UserSegment[] = [];
    const userPatterns = Array.from(this.userPatterns.values());

    // High-value users
    const highValueUsers = userPatterns.filter(p => 
      p.requestFrequency > 10 && p.conversionLikelihood > 70
    );
    if (highValueUsers.length > 0) {
      segments.push(this.createSegment(
        'high-value',
        'High Value Users',
        'Frequent users with high conversion likelihood',
        highValueUsers
      ));
    }

    // At-risk users
    const atRiskUsers = userPatterns.filter(p => 
      p.churnRisk > 60 && p.engagementTrend === 'decreasing'
    );
    if (atRiskUsers.length > 0) {
      segments.push(this.createSegment(
        'at-risk',
        'At-Risk Users',
        'Users with high churn risk and decreasing engagement',
        atRiskUsers
      ));
    }

    // New users
    const newUsers = userPatterns.filter(p => {
      const daysSinceFirst = (Date.now() - p.lastActivity.getTime()) / (24 * 60 * 60 * 1000);
      return daysSinceFirst <= 7;
    });
    if (newUsers.length > 0) {
      segments.push(this.createSegment(
        'new-users',
        'New Users',
        'Users who joined within the last 7 days',
        newUsers
      ));
    }

    // Power users
    const powerUsers = userPatterns.filter(p => 
      p.patternType === 'power_user' && p.averageSessionLength > 30
    );
    if (powerUsers.length > 0) {
      segments.push(this.createSegment(
        'power-users',
        'Power Users',
        'Highly engaged users with long session durations',
        powerUsers
      ));
    }

    this.userSegments.clear();
    segments.forEach(segment => {
      this.userSegments.set(segment.segmentId, segment);
    });

    return segments;
  }

  // Perform cohort analysis
  performCohortAnalysis(
    startDate: Date,
    endDate: Date,
    periodType: 'week' | 'month' = 'month'
  ): CohortAnalysis[] {
    const cohorts = new Map<string, {
      users: Set<string>;
      firstActivity: Date;
    }>();

    // Group users by their first activity period
    this.userRequests.forEach((requests, userId) => {
      const userRequests = requests.filter(r => r.timestamp >= startDate && r.timestamp <= endDate);
      if (userRequests.length > 0) {
        const firstRequest = userRequests.reduce((earliest, r) => 
          r.timestamp < earliest.timestamp ? r : earliest
        );
        
        const cohortKey = this.getCohortKey(firstRequest.timestamp, periodType);
        const cohort = cohorts.get(cohortKey) || { users: new Set(), firstActivity: firstRequest.timestamp };
        cohort.users.add(userId);
        cohorts.set(cohortKey, cohort);
      }
    });

    // Calculate retention for each cohort
    const cohortAnalyses: CohortAnalysis[] = [];
    
    cohorts.forEach((cohortData, cohortKey) => {
      const cohortUsers = Array.from(cohortData.users);
      const cohortDate = cohortData.firstActivity;
      
      const retentionRates = this.calculateCohortRetention(
        cohortUsers,
        cohortDate,
        periodType,
        12 // 12 periods
      );

      const behaviorEvolution = this.calculateBehaviorEvolution(
        cohortUsers,
        cohortDate,
        periodType,
        12
      );

      cohortAnalyses.push({
        cohortId: cohortKey,
        cohortDate,
        initialSize: cohortUsers.length,
        retentionRates,
        behaviorEvolution
      });
    });

    return cohortAnalyses.sort((a, b) => a.cohortDate.getTime() - b.cohortDate.getTime());
  }

  // Get user journey analysis
  getUserJourney(userId: string, sessionId?: string): Array<{
    timestamp: Date;
    action: string;
    campaignId?: string;
    context: Record<string, any>;
    outcome?: string;
  }> {
    const userRequests = this.userRequests.get(userId) || [];
    const relevantRequests = sessionId 
      ? userRequests.filter(r => r.sessionId === sessionId)
      : userRequests;

    return relevantRequests
      .map(request => ({
        timestamp: request.timestamp,
        action: 'decision_request',
        campaignId: request.campaignId,
        context: request.contextData,
        outcome: request.decisionMade ? 'accepted' : 'rejected'
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // Calculate user lifetime value prediction
  predictUserLifetimeValue(userId: string): {
    predictedValue: number;
    confidence: number;
    factors: Array<{ factor: string; weight: number; value: any }>;
  } {
    const pattern = this.userPatterns.get(userId);
    if (!pattern) {
      return { predictedValue: 0, confidence: 0, factors: [] };
    }

    const factors = [
      { factor: 'requestFrequency', weight: 0.3, value: pattern.requestFrequency },
      { factor: 'conversionLikelihood', weight: 0.25, value: pattern.conversionLikelihood },
      { factor: 'sessionLength', weight: 0.2, value: pattern.averageSessionLength },
      { factor: 'churnRisk', weight: -0.15, value: pattern.churnRisk },
      { factor: 'engagementTrend', weight: 0.1, value: pattern.engagementTrend === 'increasing' ? 1 : 0 }
    ];

    const baseValue = 100; // Base monetary value
    let predictedValue = baseValue;
    
    factors.forEach(factor => {
      const normalizedValue = typeof factor.value === 'number' ? factor.value / 100 : factor.value;
      predictedValue += baseValue * factor.weight * normalizedValue;
    });

    const confidence = Math.min(95, Math.max(10, 
      (pattern.requestFrequency / 10) * 20 + 
      (100 - pattern.churnRisk) * 0.5
    ));

    return {
      predictedValue: Math.max(0, predictedValue),
      confidence,
      factors
    };
  }

  private updateSession(request: UserDecisionRequest): void {
    let session = this.sessions.get(request.sessionId);
    
    if (!session) {
      session = {
        sessionId: request.sessionId,
        userId: request.userId,
        startTime: request.timestamp,
        totalRequests: 0,
        decisionsAccepted: 0,
        decisionsRejected: 0,
        averageResponseTime: 0,
        deviceInfo: {
          type: request.deviceType || 'desktop',
          browser: request.userAgent?.split(' ')[0],
          os: this.detectOS(request.userAgent)
        },
        journey: []
      };
    }

    session.totalRequests++;
    if (request.decisionMade) {
      session.decisionsAccepted++;
    } else {
      session.decisionsRejected++;
    }

    // Update average response time
    session.averageResponseTime = 
      (session.averageResponseTime * (session.totalRequests - 1) + request.responseTime) / 
      session.totalRequests;

    // Add to journey
    session.journey.push({
      timestamp: request.timestamp,
      action: 'request',
      campaignId: request.campaignId
    });

    this.sessions.set(request.sessionId, session);
  }

  private updateUserPattern(request: UserDecisionRequest): void {
    const existing = this.userPatterns.get(request.userId);
    const userRequests = this.userRequests.get(request.userId) || [];
    
    if (!existing) {
      // Create new pattern
      const pattern: UserBehaviorPattern = {
        userId: request.userId,
        patternType: 'trial_user',
        requestFrequency: 1,
        averageSessionLength: 5, // Default
        preferredTimeSlots: [],
        campaignPreferences: [],
        conversionLikelihood: 50,
        churnRisk: 30,
        lastActivity: request.timestamp,
        engagementTrend: 'stable'
      };
      this.userPatterns.set(request.userId, pattern);
    } else {
      // Update existing pattern
      const daysSinceFirst = userRequests.length > 1 
        ? (request.timestamp.getTime() - userRequests[0].timestamp.getTime()) / (24 * 60 * 60 * 1000)
        : 1;
      
      existing.requestFrequency = userRequests.length / Math.max(1, daysSinceFirst);
      existing.lastActivity = request.timestamp;
      
      // Update pattern type based on usage
      if (existing.requestFrequency > 20) {
        existing.patternType = 'power_user';
      } else if (existing.requestFrequency > 5) {
        existing.patternType = 'frequent_user';
      } else if (existing.requestFrequency > 1) {
        existing.patternType = 'casual_user';
      }

      // Update engagement trend
      const recentRequests = userRequests.slice(-10);
      const olderRequests = userRequests.slice(-20, -10);
      
      if (recentRequests.length > olderRequests.length) {
        existing.engagementTrend = 'increasing';
      } else if (recentRequests.length < olderRequests.length) {
        existing.engagementTrend = 'decreasing';
      }

      this.userPatterns.set(request.userId, existing);
    }
  }

  private updatePersonalizationData(request: UserDecisionRequest): void {
    const existing = this.personalizationData.get(request.userId) || {
      userId: request.userId,
      personalizedRequests: 0,
      genericRequests: 0,
      personalizedAcceptanceRate: 0,
      genericAcceptanceRate: 0,
      personalizationLift: 0,
      topPersonalizationFactors: [],
      segmentPerformance: {}
    };

    const isPersonalized = Object.keys(request.contextData).length > 0;
    
    if (isPersonalized) {
      existing.personalizedRequests++;
      if (request.decisionMade) {
        existing.personalizedAcceptanceRate = 
          ((existing.personalizedAcceptanceRate * (existing.personalizedRequests - 1)) + 100) / 
          existing.personalizedRequests;
      }
    } else {
      existing.genericRequests++;
      if (request.decisionMade) {
        existing.genericAcceptanceRate = 
          ((existing.genericAcceptanceRate * (existing.genericRequests - 1)) + 100) / 
          existing.genericRequests;
      }
    }

    // Calculate lift
    if (existing.genericAcceptanceRate > 0) {
      existing.personalizationLift = 
        ((existing.personalizedAcceptanceRate - existing.genericAcceptanceRate) / 
         existing.genericAcceptanceRate) * 100;
    }

    this.personalizationData.set(request.userId, existing);
  }

  private createSegment(
    segmentId: string,
    name: string,
    description: string,
    users: UserBehaviorPattern[]
  ): UserSegment {
    const totalValue = users.reduce((sum, u) => sum + u.conversionLikelihood, 0);
    const totalEngagement = users.reduce((sum, u) => sum + u.requestFrequency, 0);
    const avgChurnRate = users.reduce((sum, u) => sum + u.churnRisk, 0) / users.length;

    // Find top campaigns for this segment
    const campaignEngagement = new Map<string, number>();
    users.forEach(user => {
      user.campaignPreferences.forEach(pref => {
        const existing = campaignEngagement.get(pref.campaignId) || 0;
        campaignEngagement.set(pref.campaignId, existing + pref.engagementScore);
      });
    });

    const topCampaigns = Array.from(campaignEngagement.entries())
      .map(([campaignId, engagement]) => ({ campaignId, engagement }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5);

    return {
      segmentId,
      name,
      description,
      criteria: {}, // Would be populated based on segmentation logic
      userCount: users.length,
      averageEngagement: users.length > 0 ? totalEngagement / users.length : 0,
      averageValue: users.length > 0 ? totalValue / users.length : 0,
      churnRate: avgChurnRate,
      topCampaigns
    };
  }

  private calculateCohortRetention(
    cohortUsers: string[],
    cohortDate: Date,
    periodType: 'week' | 'month',
    periods: number
  ): Array<{ period: number; activeUsers: number; retentionRate: number; averageValue: number }> {
    const retention = [];
    const periodMs = periodType === 'week' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;

    for (let period = 0; period < periods; period++) {
      const periodStart = new Date(cohortDate.getTime() + period * periodMs);
      const periodEnd = new Date(periodStart.getTime() + periodMs);

      const activeUsers = cohortUsers.filter(userId => {
        const userRequests = this.userRequests.get(userId) || [];
        return userRequests.some(r => r.timestamp >= periodStart && r.timestamp < periodEnd);
      });

      const averageValue = activeUsers.length > 0 
        ? activeUsers.reduce((sum, userId) => {
            const pattern = this.userPatterns.get(userId);
            return sum + (pattern?.conversionLikelihood || 0);
          }, 0) / activeUsers.length
        : 0;

      retention.push({
        period,
        activeUsers: activeUsers.length,
        retentionRate: cohortUsers.length > 0 ? (activeUsers.length / cohortUsers.length) * 100 : 0,
        averageValue
      });
    }

    return retention;
  }

  private calculateBehaviorEvolution(
    cohortUsers: string[],
    cohortDate: Date,
    periodType: 'week' | 'month',
    periods: number
  ): Array<{
    period: number;
    avgRequestsPerUser: number;
    avgAcceptanceRate: number;
    avgSessionDuration: number;
  }> {
    const evolution = [];
    const periodMs = periodType === 'week' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;

    for (let period = 0; period < periods; period++) {
      const periodStart = new Date(cohortDate.getTime() + period * periodMs);
      const periodEnd = new Date(periodStart.getTime() + periodMs);

      const periodData = cohortUsers.map(userId => {
        const userRequests = this.userRequests.get(userId) || [];
        const periodRequests = userRequests.filter(r => 
          r.timestamp >= periodStart && r.timestamp < periodEnd
        );

        const acceptedRequests = periodRequests.filter(r => r.decisionMade).length;
        const acceptanceRate = periodRequests.length > 0 ? (acceptedRequests / periodRequests.length) * 100 : 0;

        const userSessions = this.getUserSessions(userId, periodStart, periodEnd);
        const avgSessionDuration = userSessions.length > 0
          ? userSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / userSessions.length / 60000 // Convert to minutes
          : 0;

        return {
          requests: periodRequests.length,
          acceptanceRate,
          sessionDuration: avgSessionDuration
        };
      }).filter(data => data.requests > 0); // Only active users

      const avgRequestsPerUser = periodData.length > 0
        ? periodData.reduce((sum, d) => sum + d.requests, 0) / cohortUsers.length
        : 0;

      const avgAcceptanceRate = periodData.length > 0
        ? periodData.reduce((sum, d) => sum + d.acceptanceRate, 0) / periodData.length
        : 0;

      const avgSessionDuration = periodData.length > 0
        ? periodData.reduce((sum, d) => sum + d.sessionDuration, 0) / periodData.length
        : 0;

      evolution.push({
        period,
        avgRequestsPerUser,
        avgAcceptanceRate,
        avgSessionDuration
      });
    }

    return evolution;
  }

  private getCohortKey(date: Date, periodType: 'week' | 'month'): string {
    if (periodType === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return `${weekStart.getFullYear()}-W${this.getWeekNumber(weekStart)}`;
    } else {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  private detectOS(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    
    return 'unknown';
  }

  private startAnalysisTimer(): void {
    // Run user pattern analysis every hour
    setInterval(() => {
      this.generateUserSegments();
      this.cleanup();
    }, 60 * 60 * 1000);
  }

  private cleanup(): void {
    const cutoffDate = new Date(Date.now() - this.retentionDays * 24 * 60 * 60 * 1000);
    
    // Clean old requests
    this.userRequests.forEach((requests, userId) => {
      const filteredRequests = requests.filter(r => r.timestamp >= cutoffDate);
      if (filteredRequests.length !== requests.length) {
        this.userRequests.set(userId, filteredRequests);
      }
    });

    // Clean old sessions
    const oldSessions = Array.from(this.sessions.entries()).filter(([_, session]) => 
      session.startTime < cutoffDate
    );
    oldSessions.forEach(([sessionId]) => {
      this.sessions.delete(sessionId);
    });
  }
}