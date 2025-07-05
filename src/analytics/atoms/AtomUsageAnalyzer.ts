// src/analytics/atoms/AtomUsageAnalyzer.ts
// 🎯 F3.3: Atom Usage Statistics - Rule utilization patterns and performance optimization insights

import { EventEmitter } from 'events';

export interface AtomUsageMetric {
  atomId: string;
  ruleId: string;
  campaignId: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageExecutionTime: number;
  lastUsed: Date;
  context: Record<string, any>;
  inputData: any;
  outputData: any;
  errorMessages: string[];
}

export interface AtomPerformanceStats {
  atomId: string;
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  medianExecutionTime: number;
  p95ExecutionTime: number;
  errorRate: number;
  mostCommonErrors: Array<{ error: string; count: number; percentage: number }>;
  usageFrequency: number; // executions per day
  popularityRank: number;
  efficiencyScore: number; // composite score based on speed and reliability
}

export interface AtomCombinationAnalysis {
  combinationId: string;
  atomIds: string[];
  frequency: number;
  averageSuccessRate: number;
  averageExecutionTime: number;
  synergySCore: number; // how well atoms work together
  optimizationOpportunities: string[];
}

export interface AtomDependencyGraph {
  atomId: string;
  dependencies: string[]; // atoms that this atom depends on
  dependents: string[]; // atoms that depend on this atom
  criticalityScore: number; // how critical this atom is to overall system
  bottleneckRisk: number; // likelihood of becoming a bottleneck
}

export interface OptimizationRecommendation {
  type: 'performance' | 'reliability' | 'usage' | 'combination';
  atomId: string;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  metrics: Record<string, number>;
}

export class AtomUsageAnalyzer extends EventEmitter {
  private usageMetrics: Map<string, AtomUsageMetric[]> = new Map();
  private performanceCache: Map<string, AtomPerformanceStats> = new Map();
  private combinationPatterns: Map<string, AtomCombinationAnalysis> = new Map();
  private dependencyGraph: Map<string, AtomDependencyGraph> = new Map();
  private retentionDays: number = 90;

  constructor(retentionDays: number = 90) {
    super();
    this.retentionDays = retentionDays;
    this.startAnalysisTimer();
  }

  // Record atom usage
  recordAtomUsage(
    atomId: string,
    ruleId: string,
    campaignId: string,
    executionTime: number,
    success: boolean,
    inputData: any = null,
    outputData: any = null,
    errorMessage?: string,
    context: Record<string, any> = {}
  ): void {
    const existing = this.usageMetrics.get(atomId) || [];
    const lastMetric = existing[existing.length - 1];

    let metric: AtomUsageMetric;
    
    if (lastMetric && lastMetric.ruleId === ruleId && lastMetric.campaignId === campaignId) {
      // Update existing metric
      metric = {
        ...lastMetric,
        executionCount: lastMetric.executionCount + 1,
        successCount: success ? lastMetric.successCount + 1 : lastMetric.successCount,
        failureCount: success ? lastMetric.failureCount : lastMetric.failureCount + 1,
        averageExecutionTime: (lastMetric.averageExecutionTime * lastMetric.executionCount + executionTime) / (lastMetric.executionCount + 1),
        lastUsed: new Date(),
        inputData: inputData || lastMetric.inputData,
        outputData: outputData || lastMetric.outputData,
        errorMessages: errorMessage ? [...lastMetric.errorMessages, errorMessage] : lastMetric.errorMessages
      };
      existing[existing.length - 1] = metric;
    } else {
      // Create new metric
      metric = {
        atomId,
        ruleId,
        campaignId,
        executionCount: 1,
        successCount: success ? 1 : 0,
        failureCount: success ? 0 : 1,
        averageExecutionTime: executionTime,
        lastUsed: new Date(),
        context,
        inputData,
        outputData,
        errorMessages: errorMessage ? [errorMessage] : []
      };
      existing.push(metric);
    }

    this.usageMetrics.set(atomId, existing);
    this.performanceCache.delete(atomId); // Invalidate cache

    this.emit('atomUsageRecorded', { atomId, metric });
  }

  // Get atom performance statistics
  getAtomPerformance(atomId: string): AtomPerformanceStats {
    if (this.performanceCache.has(atomId)) {
      return this.performanceCache.get(atomId)!;
    }

    const metrics = this.usageMetrics.get(atomId) || [];
    const stats = this.calculatePerformanceStats(atomId, metrics);
    this.performanceCache.set(atomId, stats);
    
    return stats;
  }

  // Get all atoms ranked by performance
  getAtomRankings(
    orderBy: 'usage' | 'performance' | 'reliability' | 'efficiency' = 'efficiency',
    limit: number = 50
  ): AtomPerformanceStats[] {
    const allAtoms = Array.from(this.usageMetrics.keys())
      .map(atomId => this.getAtomPerformance(atomId))
      .filter(stats => stats.totalExecutions > 0);

    // Sort by specified criteria
    allAtoms.sort((a, b) => {
      switch (orderBy) {
        case 'usage':
          return b.totalExecutions - a.totalExecutions;
        case 'performance':
          return a.averageExecutionTime - b.averageExecutionTime;
        case 'reliability':
          return b.successRate - a.successRate;
        case 'efficiency':
        default:
          return b.efficiencyScore - a.efficiencyScore;
      }
    });

    // Update popularity ranks
    allAtoms.forEach((stats, index) => {
      stats.popularityRank = index + 1;
    });

    return allAtoms.slice(0, limit);
  }

  // Analyze atom combinations
  analyzeAtomCombinations(minFrequency: number = 5): AtomCombinationAnalysis[] {
    const combinations = new Map<string, {
      atomIds: string[];
      executions: Array<{ success: boolean; time: number }>;
    }>();

    // Find combinations by analyzing rule executions
    this.usageMetrics.forEach((metrics, atomId) => {
      metrics.forEach(metric => {
        const ruleKey = `${metric.ruleId}-${metric.campaignId}`;
        
        // Get other atoms used in the same rule/campaign
        const relatedAtoms = this.getRelatedAtoms(metric.ruleId, metric.campaignId);
        
        if (relatedAtoms.length > 1) {
          const combinationKey = relatedAtoms.sort().join('|');
          const existing = combinations.get(combinationKey) || {
            atomIds: relatedAtoms,
            executions: []
          };
          
          existing.executions.push({
            success: metric.successCount > metric.failureCount,
            time: metric.averageExecutionTime
          });
          
          combinations.set(combinationKey, existing);
        }
      });
    });

    // Calculate combination statistics
    const analyses: AtomCombinationAnalysis[] = [];
    
    combinations.forEach((data, combinationKey) => {
      if (data.executions.length >= minFrequency) {
        const successfulExecutions = data.executions.filter(e => e.success).length;
        const totalTime = data.executions.reduce((sum, e) => sum + e.time, 0);
        
        // Calculate synergy score (how much better/worse combination performs vs individual atoms)
        const individualPerf = data.atomIds.map(atomId => this.getAtomPerformance(atomId));
        const expectedSuccessRate = individualPerf.reduce((sum, p) => sum + p.successRate, 0) / individualPerf.length;
        const expectedTime = individualPerf.reduce((sum, p) => sum + p.averageExecutionTime, 0);
        
        const actualSuccessRate = (successfulExecutions / data.executions.length) * 100;
        const actualTime = totalTime / data.executions.length;
        
        const synergySCore = ((actualSuccessRate - expectedSuccessRate) / expectedSuccessRate) * 100 +
                           ((expectedTime - actualTime) / expectedTime) * 100;

        analyses.push({
          combinationId: combinationKey,
          atomIds: data.atomIds,
          frequency: data.executions.length,
          averageSuccessRate: actualSuccessRate,
          averageExecutionTime: actualTime,
          synergySCore,
          optimizationOpportunities: this.identifyOptimizationOpportunities(data.atomIds, actualSuccessRate, actualTime)
        });
      }
    });

    return analyses.sort((a, b) => b.synergySCore - a.synergySCore);
  }

  // Build dependency graph
  buildDependencyGraph(): Map<string, AtomDependencyGraph> {
    const graph = new Map<string, AtomDependencyGraph>();
    
    // Initialize all atoms
    this.usageMetrics.forEach((_, atomId) => {
      graph.set(atomId, {
        atomId,
        dependencies: [],
        dependents: [],
        criticalityScore: 0,
        bottleneckRisk: 0
      });
    });

    // Analyze execution patterns to find dependencies
    this.usageMetrics.forEach((metrics, atomId) => {
      metrics.forEach(metric => {
        const relatedAtoms = this.getRelatedAtoms(metric.ruleId, metric.campaignId);
        const atomNode = graph.get(atomId)!;
        
        relatedAtoms.forEach(relatedAtomId => {
          if (relatedAtomId !== atomId) {
            // Simple heuristic: if atoms are used together, they might depend on each other
            if (!atomNode.dependencies.includes(relatedAtomId)) {
              atomNode.dependencies.push(relatedAtomId);
            }
            
            const relatedNode = graph.get(relatedAtomId);
            if (relatedNode && !relatedNode.dependents.includes(atomId)) {
              relatedNode.dependents.push(atomId);
            }
          }
        });
      });
    });

    // Calculate criticality and bottleneck risk
    graph.forEach((node, atomId) => {
      const stats = this.getAtomPerformance(atomId);
      
      // Criticality based on usage frequency and number of dependents
      node.criticalityScore = (stats.usageFrequency * 0.7) + (node.dependents.length * 0.3);
      
      // Bottleneck risk based on execution time and error rate
      node.bottleneckRisk = (stats.averageExecutionTime * 0.6) + (stats.errorRate * 0.4);
      
      graph.set(atomId, node);
    });

    this.dependencyGraph = graph;
    return graph;
  }

  // Generate optimization recommendations
  generateOptimizationRecommendations(): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    const rankings = this.getAtomRankings('efficiency');
    
    rankings.forEach(stats => {
      // Performance recommendations
      if (stats.averageExecutionTime > 1000) { // > 1 second
        recommendations.push({
          type: 'performance',
          atomId: stats.atomId,
          priority: stats.usageFrequency > 100 ? 'high' : 'medium',
          recommendation: `Optimize execution time for atom ${stats.atomId}. Current average: ${stats.averageExecutionTime}ms`,
          expectedImpact: `Potential ${Math.round((stats.averageExecutionTime - 500) / stats.averageExecutionTime * 100)}% time reduction`,
          effort: stats.averageExecutionTime > 5000 ? 'high' : 'medium',
          metrics: {
            currentTime: stats.averageExecutionTime,
            targetTime: 500,
            usageFrequency: stats.usageFrequency
          }
        });
      }

      // Reliability recommendations
      if (stats.successRate < 95 && stats.totalExecutions > 50) {
        recommendations.push({
          type: 'reliability',
          atomId: stats.atomId,
          priority: stats.successRate < 90 ? 'high' : 'medium',
          recommendation: `Improve reliability for atom ${stats.atomId}. Current success rate: ${stats.successRate.toFixed(1)}%`,
          expectedImpact: `Target 95%+ success rate could improve overall system reliability`,
          effort: 'medium',
          metrics: {
            currentSuccessRate: stats.successRate,
            targetSuccessRate: 95,
            totalExecutions: stats.totalExecutions
          }
        });
      }

      // Usage recommendations
      if (stats.totalExecutions === 0 || stats.usageFrequency < 0.1) {
        recommendations.push({
          type: 'usage',
          atomId: stats.atomId,
          priority: 'low',
          recommendation: `Consider removing unused atom ${stats.atomId} or find opportunities to utilize it`,
          expectedImpact: 'Reduced system complexity and maintenance overhead',
          effort: 'low',
          metrics: {
            usageFrequency: stats.usageFrequency,
            totalExecutions: stats.totalExecutions
          }
        });
      }
    });

    // Combination recommendations
    const combinations = this.analyzeAtomCombinations();
    combinations.filter(combo => combo.synergySCore < -20).forEach(combo => {
      recommendations.push({
        type: 'combination',
        atomId: combo.atomIds.join('+'),
        priority: combo.frequency > 100 ? 'high' : 'medium',
        recommendation: `Optimize atom combination: ${combo.atomIds.join(', ')}. Poor synergy detected.`,
        expectedImpact: `Potential improvement in combined execution efficiency`,
        effort: 'medium',
        metrics: {
          synergyScore: combo.synergySCore,
          frequency: combo.frequency,
          successRate: combo.averageSuccessRate
        }
      });
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Get usage trends over time
  getUsageTrends(
    atomId: string,
    startDate: Date,
    endDate: Date,
    granularity: 'hour' | 'day' | 'week' = 'day'
  ): Array<{
    date: Date;
    executions: number;
    successRate: number;
    averageTime: number;
  }> {
    const metrics = this.usageMetrics.get(atomId) || [];
    const timeGroups = new Map<string, Array<{ success: boolean; time: number }>>();

    metrics.forEach(metric => {
      if (metric.lastUsed >= startDate && metric.lastUsed <= endDate) {
        const timeKey = this.getTimeKey(metric.lastUsed, granularity);
        const group = timeGroups.get(timeKey) || [];
        
        // Add individual executions
        for (let i = 0; i < metric.executionCount; i++) {
          group.push({
            success: Math.random() < (metric.successCount / metric.executionCount),
            time: metric.averageExecutionTime
          });
        }
        
        timeGroups.set(timeKey, group);
      }
    });

    return Array.from(timeGroups.entries()).map(([timeKey, executions]) => {
      const successCount = executions.filter(e => e.success).length;
      const totalTime = executions.reduce((sum, e) => sum + e.time, 0);
      
      return {
        date: this.parseTimeKey(timeKey, granularity),
        executions: executions.length,
        successRate: executions.length > 0 ? (successCount / executions.length) * 100 : 0,
        averageTime: executions.length > 0 ? totalTime / executions.length : 0
      };
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private calculatePerformanceStats(atomId: string, metrics: AtomUsageMetric[]): AtomPerformanceStats {
    if (metrics.length === 0) {
      return {
        atomId,
        totalExecutions: 0,
        successRate: 0,
        averageExecutionTime: 0,
        medianExecutionTime: 0,
        p95ExecutionTime: 0,
        errorRate: 0,
        mostCommonErrors: [],
        usageFrequency: 0,
        popularityRank: 0,
        efficiencyScore: 0
      };
    }

    const totalExecutions = metrics.reduce((sum, m) => sum + m.executionCount, 0);
    const totalSuccesses = metrics.reduce((sum, m) => sum + m.successCount, 0);
    const totalFailures = metrics.reduce((sum, m) => sum + m.failureCount, 0);
    const totalTime = metrics.reduce((sum, m) => sum + m.averageExecutionTime * m.executionCount, 0);

    // Calculate execution time percentiles
    const allTimes: number[] = [];
    metrics.forEach(metric => {
      for (let i = 0; i < metric.executionCount; i++) {
        allTimes.push(metric.averageExecutionTime);
      }
    });
    allTimes.sort((a, b) => a - b);

    const medianExecutionTime = allTimes.length > 0 ? allTimes[Math.floor(allTimes.length / 2)] : 0;
    const p95ExecutionTime = allTimes.length > 0 ? allTimes[Math.floor(allTimes.length * 0.95)] : 0;

    // Calculate error analysis
    const errorMap = new Map<string, number>();
    metrics.forEach(metric => {
      metric.errorMessages.forEach(error => {
        errorMap.set(error, (errorMap.get(error) || 0) + 1);
      });
    });

    const mostCommonErrors = Array.from(errorMap.entries())
      .map(([error, count]) => ({
        error,
        count,
        percentage: totalExecutions > 0 ? (count / totalExecutions) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate usage frequency (executions per day)
    const oldestUsage = Math.min(...metrics.map(m => m.lastUsed.getTime()));
    const daysSinceFirst = Math.max(1, (Date.now() - oldestUsage) / (24 * 60 * 60 * 1000));
    const usageFrequency = totalExecutions / daysSinceFirst;

    // Calculate efficiency score (composite metric)
    const successRate = totalExecutions > 0 ? (totalSuccesses / totalExecutions) * 100 : 0;
    const averageExecutionTime = totalExecutions > 0 ? totalTime / totalExecutions : 0;
    const errorRate = totalExecutions > 0 ? (totalFailures / totalExecutions) * 100 : 0;
    
    // Efficiency score: higher is better
    const timeScore = Math.max(0, 100 - (averageExecutionTime / 10)); // Penalize slow execution
    const reliabilityScore = successRate;
    const efficiencyScore = (timeScore * 0.4) + (reliabilityScore * 0.6);

    return {
      atomId,
      totalExecutions,
      successRate,
      averageExecutionTime,
      medianExecutionTime,
      p95ExecutionTime,
      errorRate,
      mostCommonErrors,
      usageFrequency,
      popularityRank: 0, // Will be set during ranking
      efficiencyScore
    };
  }

  private getRelatedAtoms(ruleId: string, campaignId: string): string[] {
    const relatedAtoms: string[] = [];
    
    this.usageMetrics.forEach((metrics, atomId) => {
      const hasMatch = metrics.some(m => m.ruleId === ruleId && m.campaignId === campaignId);
      if (hasMatch) {
        relatedAtoms.push(atomId);
      }
    });

    return relatedAtoms;
  }

  private identifyOptimizationOpportunities(
    atomIds: string[],
    successRate: number,
    executionTime: number
  ): string[] {
    const opportunities: string[] = [];

    if (successRate < 90) {
      opportunities.push('Improve error handling between atoms');
    }
    
    if (executionTime > 2000) {
      opportunities.push('Consider parallel execution of independent atoms');
    }

    if (atomIds.length > 5) {
      opportunities.push('Evaluate if combination can be simplified');
    }

    return opportunities;
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

  private startAnalysisTimer(): void {
    // Run analysis and cleanup every hour
    setInterval(() => {
      this.cleanup();
      this.buildDependencyGraph();
    }, 60 * 60 * 1000);
  }

  private cleanup(): void {
    const cutoffDate = new Date(Date.now() - this.retentionDays * 24 * 60 * 60 * 1000);
    
    this.usageMetrics.forEach((metrics, atomId) => {
      const filteredMetrics = metrics.filter(m => m.lastUsed >= cutoffDate);
      if (filteredMetrics.length !== metrics.length) {
        this.usageMetrics.set(atomId, filteredMetrics);
        this.performanceCache.delete(atomId);
      }
    });
  }
}