// src/analytics/campaign/CampaignMetrics.ts
// 🎯 F3.1: Campaign Performance Metrics - Decision execution analytics and performance tracking

import { EventEmitter } from 'events';
import { AuditEntry, AuditSeverity } from '../audit/AuditEntry';

export interface CampaignExecutionMetric {
  campaignId: string;
  decisionId: string;
  executionTime: number;
  status: 'success' | 'failure' | 'partial';
  rulesEvaluated: number;
  rulesTriggered: number;
  errors: string[];
  timestamp: Date;
  context: Record<string, any>;
}

export interface CampaignPerformanceStats {
  campaignId: string;
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  totalRulesEvaluated: number;
  totalRulesTriggered: number;
  errorRate: number;
  commonErrors: Array<{ error: string; count: number }>;
  performanceTrend: Array<{ date: Date; avgTime: number; successRate: number }>;
}

export interface RulePerformanceMetric {
  ruleId: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageExecutionTime: number;
  lastExecuted: Date;
  errorPatterns: Array<{ error: string; count: number }>;
}

export class CampaignMetricsCollector extends EventEmitter {
  private executionMetrics: Map<string, CampaignExecutionMetric[]> = new Map();
  private performanceCache: Map<string, CampaignPerformanceStats> = new Map();
  private ruleMetrics: Map<string, RulePerformanceMetric> = new Map();
  private retentionDays: number = 30;

  constructor(retentionDays: number = 30) {
    super();
    this.retentionDays = retentionDays;
    this.startCleanupTimer();
  }

  // Record campaign execution metrics
  recordExecution(metric: CampaignExecutionMetric): void {
    const campaignMetrics = this.executionMetrics.get(metric.campaignId) || [];
    campaignMetrics.push(metric);
    this.executionMetrics.set(metric.campaignId, campaignMetrics);

    // Update rule metrics
    this.updateRuleMetrics(metric);

    // Invalidate performance cache
    this.performanceCache.delete(metric.campaignId);

    this.emit('executionRecorded', metric);
  }

  // Get campaign performance statistics
  getCampaignPerformance(campaignId: string): CampaignPerformanceStats {
    if (this.performanceCache.has(campaignId)) {
      return this.performanceCache.get(campaignId)!;
    }

    const metrics = this.executionMetrics.get(campaignId) || [];
    const stats = this.calculatePerformanceStats(campaignId, metrics);
    this.performanceCache.set(campaignId, stats);
    
    return stats;
  }

  // Get rule performance metrics
  getRulePerformance(ruleId: string): RulePerformanceMetric | null {
    return this.ruleMetrics.get(ruleId) || null;
  }

  // Get top performing campaigns
  getTopPerformingCampaigns(limit: number = 10): CampaignPerformanceStats[] {
    const allCampaigns = Array.from(this.executionMetrics.keys())
      .map(campaignId => this.getCampaignPerformance(campaignId))
      .filter(stats => stats.totalExecutions > 0)
      .sort((a, b) => {
        // Sort by success rate first, then by execution count
        const successDiff = b.successRate - a.successRate;
        return successDiff !== 0 ? successDiff : b.totalExecutions - a.totalExecutions;
      });

    return allCampaigns.slice(0, limit);
  }

  // Get performance trends over time
  getPerformanceTrends(
    campaignId: string, 
    startDate: Date, 
    endDate: Date,
    granularity: 'hour' | 'day' | 'week' = 'day'
  ): Array<{ date: Date; avgTime: number; successRate: number; executions: number }> {
    const metrics = this.executionMetrics.get(campaignId) || [];
    const filteredMetrics = metrics.filter(
      m => m.timestamp >= startDate && m.timestamp <= endDate
    );

    return this.aggregateMetricsByTime(filteredMetrics, granularity);
  }

  // Get execution time percentiles
  getExecutionTimePercentiles(campaignId: string): {
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  } {
    const metrics = this.executionMetrics.get(campaignId) || [];
    const times = metrics.map(m => m.executionTime).sort((a, b) => a - b);
    
    if (times.length === 0) {
      return { p50: 0, p75: 0, p90: 0, p95: 0, p99: 0 };
    }

    return {
      p50: this.getPercentile(times, 0.5),
      p75: this.getPercentile(times, 0.75),
      p90: this.getPercentile(times, 0.9),
      p95: this.getPercentile(times, 0.95),
      p99: this.getPercentile(times, 0.99)
    };
  }

  // Get error analysis
  getErrorAnalysis(campaignId: string): Array<{
    error: string;
    count: number;
    percentage: number;
    lastOccurrence: Date;
    affectedRules: string[];
  }> {
    const metrics = this.executionMetrics.get(campaignId) || [];
    const errorMap = new Map<string, {
      count: number;
      lastOccurrence: Date;
      affectedRules: Set<string>;
    }>();

    metrics.forEach(metric => {
      metric.errors.forEach(error => {
        const existing = errorMap.get(error) || {
          count: 0,
          lastOccurrence: new Date(0),
          affectedRules: new Set<string>()
        };
        
        existing.count++;
        existing.lastOccurrence = new Date(Math.max(
          existing.lastOccurrence.getTime(),
          metric.timestamp.getTime()
        ));
        existing.affectedRules.add(metric.decisionId);
        
        errorMap.set(error, existing);
      });
    });

    const totalErrors = Array.from(errorMap.values()).reduce((sum, e) => sum + e.count, 0);

    return Array.from(errorMap.entries()).map(([error, data]) => ({
      error,
      count: data.count,
      percentage: totalErrors > 0 ? (data.count / totalErrors) * 100 : 0,
      lastOccurrence: data.lastOccurrence,
      affectedRules: Array.from(data.affectedRules)
    })).sort((a, b) => b.count - a.count);
  }

  private calculatePerformanceStats(
    campaignId: string, 
    metrics: CampaignExecutionMetric[]
  ): CampaignPerformanceStats {
    if (metrics.length === 0) {
      return {
        campaignId,
        totalExecutions: 0,
        successRate: 0,
        averageExecutionTime: 0,
        totalRulesEvaluated: 0,
        totalRulesTriggered: 0,
        errorRate: 0,
        commonErrors: [],
        performanceTrend: []
      };
    }

    const successCount = metrics.filter(m => m.status === 'success').length;
    const totalExecutions = metrics.length;
    const totalExecutionTime = metrics.reduce((sum, m) => sum + m.executionTime, 0);
    const totalRulesEvaluated = metrics.reduce((sum, m) => sum + m.rulesEvaluated, 0);
    const totalRulesTriggered = metrics.reduce((sum, m) => sum + m.rulesTriggered, 0);
    const errorCount = metrics.filter(m => m.errors.length > 0).length;

    // Calculate common errors
    const errorMap = new Map<string, number>();
    metrics.forEach(metric => {
      metric.errors.forEach(error => {
        errorMap.set(error, (errorMap.get(error) || 0) + 1);
      });
    });

    const commonErrors = Array.from(errorMap.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate performance trend (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentMetrics = metrics.filter(m => m.timestamp >= sevenDaysAgo);
    const performanceTrend = this.aggregateMetricsByTime(recentMetrics, 'day');

    return {
      campaignId,
      totalExecutions,
      successRate: totalExecutions > 0 ? (successCount / totalExecutions) * 100 : 0,
      averageExecutionTime: totalExecutions > 0 ? totalExecutionTime / totalExecutions : 0,
      totalRulesEvaluated,
      totalRulesTriggered,
      errorRate: totalExecutions > 0 ? (errorCount / totalExecutions) * 100 : 0,
      commonErrors,
      performanceTrend
    };
  }

  private updateRuleMetrics(metric: CampaignExecutionMetric): void {
    // This is a simplified version - in practice, you'd need more detailed rule execution data
    const ruleMetric = this.ruleMetrics.get(metric.decisionId) || {
      ruleId: metric.decisionId,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      averageExecutionTime: 0,
      lastExecuted: new Date(0),
      errorPatterns: []
    };

    ruleMetric.executionCount++;
    ruleMetric.lastExecuted = metric.timestamp;
    
    if (metric.status === 'success') {
      ruleMetric.successCount++;
    } else {
      ruleMetric.failureCount++;
    }

    // Update average execution time
    ruleMetric.averageExecutionTime = 
      (ruleMetric.averageExecutionTime * (ruleMetric.executionCount - 1) + metric.executionTime) / 
      ruleMetric.executionCount;

    this.ruleMetrics.set(metric.decisionId, ruleMetric);
  }

  private aggregateMetricsByTime(
    metrics: CampaignExecutionMetric[],
    granularity: 'hour' | 'day' | 'week'
  ): Array<{ date: Date; avgTime: number; successRate: number; executions: number }> {
    const groups = new Map<string, CampaignExecutionMetric[]>();

    metrics.forEach(metric => {
      const key = this.getTimeKey(metric.timestamp, granularity);
      const group = groups.get(key) || [];
      group.push(metric);
      groups.set(key, group);
    });

    return Array.from(groups.entries()).map(([key, groupMetrics]) => {
      const successCount = groupMetrics.filter(m => m.status === 'success').length;
      const avgTime = groupMetrics.reduce((sum, m) => sum + m.executionTime, 0) / groupMetrics.length;
      
      return {
        date: this.parseTimeKey(key, granularity),
        avgTime,
        successRate: (successCount / groupMetrics.length) * 100,
        executions: groupMetrics.length
      };
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private getTimeKey(date: Date, granularity: 'hour' | 'day' | 'week'): string {
    switch (granularity) {
      case 'hour':
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
      case 'day':
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
      default:
        return date.toISOString();
    }
  }

  private parseTimeKey(key: string, granularity: 'hour' | 'day' | 'week'): Date {
    const parts = key.split('-').map(Number);
    switch (granularity) {
      case 'hour':
        return new Date(parts[0], parts[1], parts[2], parts[3]);
      case 'day':
      case 'week':
        return new Date(parts[0], parts[1], parts[2]);
      default:
        return new Date(key);
    }
  }

  private getPercentile(sortedArray: number[], percentile: number): number {
    const index = percentile * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;

    if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1];
    if (lower === upper) return sortedArray[lower];

    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanup();
    }, 24 * 60 * 60 * 1000); // Run cleanup daily
  }

  private cleanup(): void {
    const cutoffDate = new Date(Date.now() - this.retentionDays * 24 * 60 * 60 * 1000);
    
    this.executionMetrics.forEach((metrics, campaignId) => {
      const filteredMetrics = metrics.filter(m => m.timestamp >= cutoffDate);
      if (filteredMetrics.length !== metrics.length) {
        this.executionMetrics.set(campaignId, filteredMetrics);
        this.performanceCache.delete(campaignId); // Invalidate cache
      }
    });
  }
}