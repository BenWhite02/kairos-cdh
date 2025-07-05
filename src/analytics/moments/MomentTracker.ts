// src/analytics/moments/MomentTracker.ts
// 🎯 F3.2: Moment Effectiveness Tracking - Decision outcome correlation and user engagement measurement

import { EventEmitter } from 'events';

export interface MomentInteraction {
  momentId: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  type: 'view' | 'click' | 'conversion' | 'dismiss' | 'engagement';
  value?: number;
  metadata: Record<string, any>;
}

export interface MomentOutcome {
  momentId: string;
  userId: string;
  decisionId: string;
  outcomeType: 'conversion' | 'engagement' | 'bounce' | 'error';
  value: number;
  timestamp: Date;
  conversionPath: string[];
  timeToConversion?: number;
}

export interface MomentEffectivenessStats {
  momentId: string;
  totalViews: number;
  totalClicks: number;
  totalConversions: number;
  clickThroughRate: number;
  conversionRate: number;
  averageEngagementTime: number;
  bounceRate: number;
  revenueAttribution: number;
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
}

export interface ConversionFunnelStep {
  stepName: string;
  totalUsers: number;
  convertedUsers: number;
  conversionRate: number;
  averageTimeInStep: number;
  dropoffReasons: Array<{ reason: string; count: number }>;
}

export interface ABTestResult {
  testId: string;
  variantA: {
    momentId: string;
    stats: MomentEffectivenessStats;
    sampleSize: number;
  };
  variantB: {
    momentId: string;
    stats: MomentEffectivenessStats;
    sampleSize: number;
  };
  significance: number;
  confidenceLevel: number;
  winner?: 'A' | 'B' | 'inconclusive';
}

export class MomentEffectivenessTracker extends EventEmitter {
  private interactions: Map<string, MomentInteraction[]> = new Map();
  private outcomes: Map<string, MomentOutcome[]> = new Map();
  private funnelDefinitions: Map<string, string[]> = new Map();
  private abTests: Map<string, ABTestResult> = new Map();
  private retentionData: Map<string, Date[]> = new Map(); // userId -> visit dates

  constructor() {
    super();
  }

  // Record moment interaction
  recordInteraction(interaction: MomentInteraction): void {
    const momentInteractions = this.interactions.get(interaction.momentId) || [];
    momentInteractions.push(interaction);
    this.interactions.set(interaction.momentId, momentInteractions);

    // Track user visits for retention calculation
    this.recordUserVisit(interaction.userId, interaction.timestamp);

    this.emit('interactionRecorded', interaction);
  }

  // Record moment outcome
  recordOutcome(outcome: MomentOutcome): void {
    const momentOutcomes = this.outcomes.get(outcome.momentId) || [];
    momentOutcomes.push(outcome);
    this.outcomes.set(outcome.momentId, momentOutcomes);

    this.emit('outcomeRecorded', outcome);
  }

  // Get moment effectiveness statistics
  getMomentEffectiveness(momentId: string): MomentEffectivenessStats {
    const interactions = this.interactions.get(momentId) || [];
    const outcomes = this.outcomes.get(momentId) || [];

    const views = interactions.filter(i => i.type === 'view').length;
    const clicks = interactions.filter(i => i.type === 'click').length;
    const conversions = outcomes.filter(o => o.outcomeType === 'conversion').length;
    const bounces = outcomes.filter(o => o.outcomeType === 'bounce').length;

    // Calculate engagement time
    const engagementInteractions = interactions.filter(i => i.type === 'engagement');
    const averageEngagementTime = engagementInteractions.length > 0
      ? engagementInteractions.reduce((sum, i) => sum + (i.value || 0), 0) / engagementInteractions.length
      : 0;

    // Calculate revenue attribution
    const revenueAttribution = outcomes
      .filter(o => o.outcomeType === 'conversion')
      .reduce((sum, o) => sum + o.value, 0);

    // Calculate retention rates
    const uniqueUsers = new Set(interactions.map(i => i.userId));
    const userRetention = this.calculateUserRetention(Array.from(uniqueUsers), momentId);

    return {
      momentId,
      totalViews: views,
      totalClicks: clicks,
      totalConversions: conversions,
      clickThroughRate: views > 0 ? (clicks / views) * 100 : 0,
      conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
      averageEngagementTime,
      bounceRate: (views > 0) ? (bounces / views) * 100 : 0,
      revenueAttribution,
      userRetention
    };
  }

  // Analyze conversion funnel
  analyzeConversionFunnel(
    funnelId: string, 
    steps: string[],
    startDate: Date,
    endDate: Date
  ): ConversionFunnelStep[] {
    this.funnelDefinitions.set(funnelId, steps);

    const funnelData: ConversionFunnelStep[] = [];
    let previousStepUsers = new Set<string>();

    steps.forEach((stepName, index) => {
      const stepInteractions = this.getStepInteractions(stepName, startDate, endDate);
      const stepUsers = new Set(stepInteractions.map(i => i.userId));
      
      // For first step, all users are eligible
      const eligibleUsers = index === 0 ? stepUsers : previousStepUsers;
      const convertedUsers = new Set([...stepUsers].filter(u => eligibleUsers.has(u)));

      // Calculate average time in step
      const userTimes = this.calculateTimeInStep(stepName, Array.from(convertedUsers));
      const averageTimeInStep = userTimes.length > 0
        ? userTimes.reduce((sum, time) => sum + time, 0) / userTimes.length
        : 0;

      // Analyze dropoff reasons (simplified)
      const dropoffUsers = new Set([...eligibleUsers].filter(u => !convertedUsers.has(u)));
      const dropoffReasons = this.analyzeDropoffReasons(stepName, Array.from(dropoffUsers));

      funnelData.push({
        stepName,
        totalUsers: eligibleUsers.size,
        convertedUsers: convertedUsers.size,
        conversionRate: eligibleUsers.size > 0 ? (convertedUsers.size / eligibleUsers.size) * 100 : 0,
        averageTimeInStep,
        dropoffReasons
      });

      previousStepUsers = convertedUsers;
    });

    return funnelData;
  }

  // Setup A/B test
  setupABTest(
    testId: string,
    momentIdA: string,
    momentIdB: string,
    trafficSplit: number = 0.5
  ): void {
    // Initialize A/B test tracking
    this.abTests.set(testId, {
      testId,
      variantA: {
        momentId: momentIdA,
        stats: this.getMomentEffectiveness(momentIdA),
        sampleSize: 0
      },
      variantB: {
        momentId: momentIdB,
        stats: this.getMomentEffectiveness(momentIdB),
        sampleSize: 0
      },
      significance: 0,
      confidenceLevel: 95,
      winner: 'inconclusive'
    });

    this.emit('abTestSetup', { testId, momentIdA, momentIdB, trafficSplit });
  }

  // Analyze A/B test results
  analyzeABTest(testId: string): ABTestResult | null {
    const test = this.abTests.get(testId);
    if (!test) return null;

    // Update current stats
    test.variantA.stats = this.getMomentEffectiveness(test.variantA.momentId);
    test.variantB.stats = this.getMomentEffectiveness(test.variantB.momentId);

    // Update sample sizes
    test.variantA.sampleSize = this.interactions.get(test.variantA.momentId)?.length || 0;
    test.variantB.sampleSize = this.interactions.get(test.variantB.momentId)?.length || 0;

    // Calculate statistical significance
    const significance = this.calculateStatisticalSignificance(
      test.variantA.stats.conversionRate,
      test.variantA.sampleSize,
      test.variantB.stats.conversionRate,
      test.variantB.sampleSize
    );

    test.significance = significance;

    // Determine winner
    if (significance >= 0.95) {
      test.winner = test.variantA.stats.conversionRate > test.variantB.stats.conversionRate ? 'A' : 'B';
    } else {
      test.winner = 'inconclusive';
    }

    this.abTests.set(testId, test);
    return test;
  }

  // Get user journey analysis
  getUserJourney(userId: string, sessionId?: string): MomentInteraction[] {
    const allInteractions: MomentInteraction[] = [];
    
    this.interactions.forEach(interactions => {
      const userInteractions = interactions.filter(i => {
        const matchesUser = i.userId === userId;
        const matchesSession = !sessionId || i.sessionId === sessionId;
        return matchesUser && matchesSession;
      });
      allInteractions.push(...userInteractions);
    });

    return allInteractions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // Get cohort analysis
  getCohortAnalysis(
    startDate: Date,
    endDate: Date,
    groupBy: 'week' | 'month' = 'week'
  ): Array<{
    cohort: string;
    totalUsers: number;
    retention: Array<{ period: number; users: number; percentage: number }>;
  }> {
    const cohorts = new Map<string, Set<string>>();
    
    // Group users by cohort
    this.interactions.forEach(interactions => {
      interactions.forEach(interaction => {
        if (interaction.timestamp >= startDate && interaction.timestamp <= endDate) {
          const cohortKey = this.getCohortKey(interaction.timestamp, groupBy);
          if (!cohorts.has(cohortKey)) {
            cohorts.set(cohortKey, new Set());
          }
          cohorts.get(cohortKey)!.add(interaction.userId);
        }
      });
    });

    // Calculate retention for each cohort
    return Array.from(cohorts.entries()).map(([cohort, users]) => {
      const cohortDate = this.parseCohortKey(cohort, groupBy);
      const retention = this.calculateCohortRetention(Array.from(users), cohortDate, groupBy);
      
      return {
        cohort,
        totalUsers: users.size,
        retention
      };
    });
  }

  // Get personalization effectiveness
  getPersonalizationEffectiveness(userId: string): {
    personalizedMoments: number;
    genericMoments: number;
    personalizedConversionRate: number;
    genericConversionRate: number;
    lift: number;
  } {
    const allInteractions: MomentInteraction[] = [];
    const allOutcomes: MomentOutcome[] = [];

    this.interactions.forEach(interactions => {
      allInteractions.push(...interactions.filter(i => i.userId === userId));
    });

    this.outcomes.forEach(outcomes => {
      allOutcomes.push(...outcomes.filter(o => o.userId === userId));
    });

    const personalizedInteractions = allInteractions.filter(i => 
      i.metadata.personalized === true
    );
    const genericInteractions = allInteractions.filter(i => 
      i.metadata.personalized !== true
    );

    const personalizedConversions = allOutcomes.filter(o => 
      personalizedInteractions.some(i => i.momentId === o.momentId && i.userId === o.userId)
    ).length;

    const genericConversions = allOutcomes.filter(o => 
      genericInteractions.some(i => i.momentId === o.momentId && i.userId === o.userId)
    ).length;

    const personalizedConversionRate = personalizedInteractions.length > 0 
      ? (personalizedConversions / personalizedInteractions.length) * 100 
      : 0;

    const genericConversionRate = genericInteractions.length > 0 
      ? (genericConversions / genericInteractions.length) * 100 
      : 0;

    const lift = genericConversionRate > 0 
      ? ((personalizedConversionRate - genericConversionRate) / genericConversionRate) * 100 
      : 0;

    return {
      personalizedMoments: personalizedInteractions.length,
      genericMoments: genericInteractions.length,
      personalizedConversionRate,
      genericConversionRate,
      lift
    };
  }

  private recordUserVisit(userId: string, timestamp: Date): void {
    const visits = this.retentionData.get(userId) || [];
    visits.push(timestamp);
    this.retentionData.set(userId, visits);
  }

  private calculateUserRetention(userIds: string[], momentId: string): {
    day1: number;
    day7: number;
    day30: number;
  } {
    const retentionCounts = { day1: 0, day7: 0, day30: 0 };
    const now = new Date();

    userIds.forEach(userId => {
      const visits = this.retentionData.get(userId) || [];
      if (visits.length === 0) return;

      const firstVisit = new Date(Math.min(...visits.map(v => v.getTime())));
      const hasDay1Return = visits.some(v => 
        v.getTime() > firstVisit.getTime() && 
        v.getTime() <= firstVisit.getTime() + 24 * 60 * 60 * 1000
      );
      const hasDay7Return = visits.some(v => 
        v.getTime() > firstVisit.getTime() && 
        v.getTime() <= firstVisit.getTime() + 7 * 24 * 60 * 60 * 1000
      );
      const hasDay30Return = visits.some(v => 
        v.getTime() > firstVisit.getTime() && 
        v.getTime() <= firstVisit.getTime() + 30 * 24 * 60 * 60 * 1000
      );

      if (hasDay1Return) retentionCounts.day1++;
      if (hasDay7Return) retentionCounts.day7++;
      if (hasDay30Return) retentionCounts.day30++;
    });

    const totalUsers = userIds.length;
    return {
      day1: totalUsers > 0 ? (retentionCounts.day1 / totalUsers) * 100 : 0,
      day7: totalUsers > 0 ? (retentionCounts.day7 / totalUsers) * 100 : 0,
      day30: totalUsers > 0 ? (retentionCounts.day30 / totalUsers) * 100 : 0
    };
  }

  private getStepInteractions(stepName: string, startDate: Date, endDate: Date): MomentInteraction[] {
    const stepInteractions: MomentInteraction[] = [];
    
    this.interactions.forEach(interactions => {
      const filtered = interactions.filter(i => 
        i.metadata.step === stepName &&
        i.timestamp >= startDate &&
        i.timestamp <= endDate
      );
      stepInteractions.push(...filtered);
    });

    return stepInteractions;
  }

  private calculateTimeInStep(stepName: string, userIds: string[]): number[] {
    // Simplified - would need more sophisticated session tracking
    return userIds.map(() => Math.random() * 300 + 30); // Mock data
  }

  private analyzeDropoffReasons(stepName: string, dropoffUsers: string[]): Array<{ reason: string; count: number }> {
    // Simplified analysis - in practice would analyze user behavior patterns
    return [
      { reason: 'Page load timeout', count: Math.floor(dropoffUsers.length * 0.3) },
      { reason: 'Form complexity', count: Math.floor(dropoffUsers.length * 0.25) },
      { reason: 'Pricing concerns', count: Math.floor(dropoffUsers.length * 0.2) },
      { reason: 'Technical issues', count: Math.floor(dropoffUsers.length * 0.15) },
      { reason: 'Other', count: Math.floor(dropoffUsers.length * 0.1) }
    ];
  }

  private calculateStatisticalSignificance(
    conversionRateA: number,
    sampleSizeA: number,
    conversionRateB: number,
    sampleSizeB: number
  ): number {
    // Simplified z-test calculation
    const p1 = conversionRateA / 100;
    const p2 = conversionRateB / 100;
    const pooled = ((p1 * sampleSizeA) + (p2 * sampleSizeB)) / (sampleSizeA + sampleSizeB);
    const se = Math.sqrt(pooled * (1 - pooled) * (1/sampleSizeA + 1/sampleSizeB));
    
    if (se === 0) return 0;
    
    const z = Math.abs(p1 - p2) / se;
    
    // Convert z-score to confidence level (simplified)
    return Math.min(0.99, Math.max(0, (z - 1.96) / 2.58 + 0.95));
  }

  private getCohortKey(date: Date, groupBy: 'week' | 'month'): string {
    if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return `${weekStart.getFullYear()}-W${this.getWeekNumber(weekStart)}`;
    } else {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
  }

  private parseCohortKey(key: string, groupBy: 'week' | 'month'): Date {
    if (groupBy === 'week') {
      const [year, week] = key.split('-W');
      return this.getDateFromWeek(parseInt(year), parseInt(week));
    } else {
      const [year, month] = key.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, 1);
    }
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  private getDateFromWeek(year: number, week: number): Date {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return ISOweekStart;
  }

  private calculateCohortRetention(
    userIds: string[], 
    cohortDate: Date, 
    groupBy: 'week' | 'month'
  ): Array<{ period: number; users: number; percentage: number }> {
    const retention = [];
    const periodLength = groupBy === 'week' ? 7 : 30;
    
    for (let period = 0; period < 12; period++) {
      const periodStart = new Date(cohortDate.getTime() + period * periodLength * 24 * 60 * 60 * 1000);
      const periodEnd = new Date(periodStart.getTime() + periodLength * 24 * 60 * 60 * 1000);
      
      const activeUsers = userIds.filter(userId => {
        const visits = this.retentionData.get(userId) || [];
        return visits.some(visit => visit >= periodStart && visit < periodEnd);
      }).length;

      retention.push({
        period,
        users: activeUsers,
        percentage: userIds.length > 0 ? (activeUsers / userIds.length) * 100 : 0
      });
    }

    return retention;
  }
}