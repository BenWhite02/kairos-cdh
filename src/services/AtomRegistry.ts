// src/services/AtomRegistry.ts
// Registry of available atoms with definitions and sample data
// Provides the atom palette with searchable, categorized components

import { AtomDefinition } from '../types/RuleTypes';

// Sample atom definitions for the Visual Rule Builder
const atomDefinitions: AtomDefinition[] = [
  // Condition Atoms
  {
    type: 'age_range',
    name: 'Age Range',
    description: 'Check if user age falls within specified range',
    category: 'condition',
    complexity: 2,
    parameters: [
      {
        name: 'minAge',
        type: 'number',
        description: 'Minimum age (inclusive)',
        required: true,
        min: 0,
        max: 120,
        defaultValue: 18
      },
      {
        name: 'maxAge',
        type: 'number',
        description: 'Maximum age (inclusive)',
        required: true,
        min: 0,
        max: 120,
        defaultValue: 65
      }
    ],
    examples: [
      {
        title: 'Young Adults',
        description: 'Target users aged 18-35',
        configuration: { minAge: 18, maxAge: 35 }
      },
      {
        title: 'Seniors',
        description: 'Target users aged 65+',
        configuration: { minAge: 65, maxAge: 120 }
      }
    ],
    tags: ['demographics', 'targeting', 'age']
  },
  {
    type: 'geography',
    name: 'Geography',
    description: 'Check if user is in specified geographic locations',
    category: 'condition',
    complexity: 3,
    parameters: [
      {
        name: 'countries',
        type: 'array',
        description: 'List of country codes (ISO 3166-1)',
        required: true,
        defaultValue: ['US', 'CA', 'GB']
      },
      {
        name: 'excludeRegions',
        type: 'array',
        description: 'Regions to exclude',
        required: false
      }
    ],
    examples: [
      {
        title: 'North America',
        description: 'Target users in US and Canada',
        configuration: { countries: ['US', 'CA'] }
      }
    ],
    tags: ['location', 'targeting', 'geography']
  },
  {
    type: 'time_window',
    name: 'Time Window',
    description: 'Check if current time falls within specified window',
    category: 'condition',
    complexity: 3,
    parameters: [
      {
        name: 'startTime',
        type: 'string',
        description: 'Start time (HH:MM format)',
        required: true,
        defaultValue: '09:00'
      },
      {
        name: 'endTime',
        type: 'string',
        description: 'End time (HH:MM format)',
        required: true,
        defaultValue: '17:00'
      },
      {
        name: 'timezone',
        type: 'select',
        description: 'Timezone for the time window',
        required: true,
        defaultValue: 'UTC',
        options: [
          { label: 'UTC', value: 'UTC' },
          { label: 'US Eastern', value: 'America/New_York' },
          { label: 'US Pacific', value: 'America/Los_Angeles' },
          { label: 'Europe/London', value: 'Europe/London' }
        ]
      }
    ],
    tags: ['time', 'scheduling', 'timing']
  },
  {
    type: 'user_activity',
    name: 'User Activity',
    description: 'Check user activity patterns and engagement levels',
    category: 'condition',
    complexity: 4,
    parameters: [
      {
        name: 'activityType',
        type: 'select',
        description: 'Type of activity to check',
        required: true,
        options: [
          { label: 'Page Views', value: 'page_views' },
          { label: 'Purchases', value: 'purchases' },
          { label: 'Logins', value: 'logins' },
          { label: 'Downloads', value: 'downloads' }
        ]
      },
      {
        name: 'threshold',
        type: 'number',
        description: 'Minimum activity count',
        required: true,
        defaultValue: 5,
        min: 1
      },
      {
        name: 'timeFrame',
        type: 'select',
        description: 'Time frame for activity check',
        required: true,
        defaultValue: '7d',
        options: [
          { label: 'Last 24 hours', value: '1d' },
          { label: 'Last 7 days', value: '7d' },
          { label: 'Last 30 days', value: '30d' },
          { label: 'Last 90 days', value: '90d' }
        ]
      }
    ],
    tags: ['activity', 'engagement', 'behavior']
  },

  // Action Atoms
  {
    type: 'send_email',
    name: 'Send Email',
    description: 'Send personalized email to user',
    category: 'action',
    complexity: 4,
    parameters: [
      {
        name: 'templateId',
        type: 'string',
        description: 'Email template ID',
        required: true
      },
      {
        name: 'subject',
        type: 'string',
        description: 'Email subject line',
        required: true,
        maxLength: 100
      },
      {
        name: 'priority',
        type: 'select',
        description: 'Email priority level',
        required: false,
        defaultValue: 'normal',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Normal', value: 'normal' },
          { label: 'High', value: 'high' }
        ]
      },
      {
        name: 'variables',
        type: 'object',
        description: 'Template variables as JSON',
        required: false
      }
    ],
    examples: [
      {
        title: 'Welcome Email',
        description: 'Send welcome email to new users',
        configuration: {
          templateId: 'welcome-001',
          subject: 'Welcome to our platform!',
          priority: 'high'
        }
      }
    ],
    tags: ['email', 'communication', 'marketing']
  },
  {
    type: 'show_banner',
    name: 'Show Banner',
    description: 'Display banner message on website',
    category: 'action',
    complexity: 2,
    parameters: [
      {
        name: 'message',
        type: 'string',
        description: 'Banner message text',
        required: true,
        maxLength: 200
      },
      {
        name: 'type',
        type: 'select',
        description: 'Banner type/style',
        required: true,
        defaultValue: 'info',
        options: [
          { label: 'Info', value: 'info' },
          { label: 'Success', value: 'success' },
          { label: 'Warning', value: 'warning' },
          { label: 'Error', value: 'error' }
        ]
      },
      {
        name: 'duration',
        type: 'number',
        description: 'Display duration in seconds (0 = permanent)',
        required: false,
        defaultValue: 10,
        min: 0,
        max: 300
      }
    ],
    tags: ['display', 'notification', 'ui']
  },
  {
    type: 'send_push_notification',
    name: 'Push Notification',
    description: 'Send push notification to mobile devices',
    category: 'action',
    complexity: 3,
    parameters: [
      {
        name: 'title',
        type: 'string',
        description: 'Notification title',
        required: true,
        maxLength: 50
      },
      {
        name: 'body',
        type: 'string',
        description: 'Notification body text',
        required: true,
        maxLength: 200
      },
      {
        name: 'deepLink',
        type: 'string',
        description: 'Deep link URL for tap action',
        required: false
      },
      {
        name: 'badge',
        type: 'number',
        description: 'Badge count for app icon',
        required: false,
        min: 0,
        max: 99
      }
    ],
    tags: ['mobile', 'notification', 'engagement']
  },

  // Computation Atoms
  {
    type: 'calculate_score',
    name: 'Calculate Score',
    description: 'Calculate user engagement score',
    category: 'computation',
    complexity: 5,
    parameters: [
      {
        name: 'weights',
        type: 'object',
        description: 'Scoring weights as JSON object',
        required: true,
        defaultValue: { pageViews: 0.3, timeSpent: 0.4, interactions: 0.3 }
      },
      {
        name: 'maxScore',
        type: 'number',
        description: 'Maximum possible score',
        required: false,
        defaultValue: 100,
        min: 1
      }
    ],
    tags: ['scoring', 'analytics', 'calculation']
  },
  {
    type: 'lookup_data',
    name: 'Data Lookup',
    description: 'Look up data from external source',
    category: 'computation',
    complexity: 6,
    parameters: [
      {
        name: 'source',
        type: 'select',
        description: 'Data source',
        required: true,
        options: [
          { label: 'User Profile', value: 'user_profile' },
          { label: 'Purchase History', value: 'purchase_history' },
          { label: 'Behavioral Data', value: 'behavioral_data' }
        ]
      },
      {
        name: 'fields',
        type: 'array',
        description: 'Fields to retrieve',
        required: true
      }
    ],
    tags: ['data', 'lookup', 'external']
  },
  {
    type: 'transform_data',
    name: 'Transform Data',
    description: 'Transform and format data values',
    category: 'computation',
    complexity: 4,
    parameters: [
      {
        name: 'transformType',
        type: 'select',
        description: 'Type of transformation',
        required: true,
        options: [
          { label: 'Format Currency', value: 'format_currency' },
          { label: 'Format Date', value: 'format_date' },
          { label: 'Capitalize Text', value: 'capitalize' },
          { label: 'Calculate Percentage', value: 'percentage' }
        ]
      },
      {
        name: 'inputField',
        type: 'string',
        description: 'Field to transform',
        required: true
      },
      {
        name: 'outputField',
        type: 'string',
        description: 'Output field name',
        required: true
      }
    ],
    tags: ['transformation', 'formatting', 'data']
  },

  // Flow Control Atoms
  {
    type: 'if_then_else',
    name: 'If-Then-Else',
    description: 'Conditional branching logic',
    category: 'flow',
    complexity: 4,
    parameters: [
      {
        name: 'condition',
        type: 'string',
        description: 'Condition to evaluate',
        required: true
      }
    ],
    tags: ['logic', 'branching', 'conditional']
  },
  {
    type: 'delay',
    name: 'Delay',
    description: 'Add delay before next action',
    category: 'flow',
    complexity: 2,
    parameters: [
      {
        name: 'duration',
        type: 'number',
        description: 'Delay duration',
        required: true,
        defaultValue: 5,
        min: 1,
        max: 10080
      },
      {
        name: 'unit',
        type: 'select',
        description: 'Time unit',
        required: true,
        defaultValue: 'minutes',
        options: [
          { label: 'Minutes', value: 'minutes' },
          { label: 'Hours', value: 'hours' },
          { label: 'Days', value: 'days' }
        ]
      }
    ],
    tags: ['timing', 'delay', 'scheduling']
  },
  {
    type: 'loop',
    name: 'Loop',
    description: 'Repeat actions for multiple items',
    category: 'flow',
    complexity: 6,
    parameters: [
      {
        name: 'iterateOver',
        type: 'string',
        description: 'Field containing array to iterate',
        required: true
      },
      {
        name: 'maxIterations',
        type: 'number',
        description: 'Maximum number of iterations',
        required: false,
        defaultValue: 100,
        min: 1,
        max: 1000
      }
    ],
    tags: ['iteration', 'loop', 'repeat']
  },

  // Data Atoms
  {
    type: 'user_segment',
    name: 'User Segment',
    description: 'Check if user belongs to specific segment',
    category: 'data',
    complexity: 3,
    parameters: [
      {
        name: 'segmentId',
        type: 'string',
        description: 'Segment identifier',
        required: true
      },
      {
        name: 'includeSubsegments',
        type: 'boolean',
        description: 'Include sub-segments',
        required: false,
        defaultValue: false
      }
    ],
    tags: ['segmentation', 'targeting', 'user']
  },
  {
    type: 'custom_event',
    name: 'Custom Event',
    description: 'Trigger custom event with data',
    category: 'data',
    complexity: 3,
    parameters: [
      {
        name: 'eventName',
        type: 'string',
        description: 'Event name',
        required: true
      },
      {
        name: 'properties',
        type: 'object',
        description: 'Event properties as JSON',
        required: false
      }
    ],
    tags: ['events', 'tracking', 'analytics']
  },
  {
    type: 'data_filter',
    name: 'Data Filter',
    description: 'Filter data based on criteria',
    category: 'data',
    complexity: 4,
    parameters: [
      {
        name: 'field',
        type: 'string',
        description: 'Field to filter on',
        required: true
      },
      {
        name: 'operator',
        type: 'select',
        description: 'Filter operator',
        required: true,
        options: [
          { label: 'Equals', value: 'equals' },
          { label: 'Not Equals', value: 'not_equals' },
          { label: 'Greater Than', value: 'greater_than' },
          { label: 'Less Than', value: 'less_than' },
          { label: 'Contains', value: 'contains' },
          { label: 'Starts With', value: 'starts_with' }
        ]
      },
      {
        name: 'value',
        type: 'string',
        description: 'Value to compare against',
        required: true
      }
    ],
    tags: ['filter', 'data', 'criteria']
  }
];

// Registry service class
class AtomRegistryService {
  private atoms: Map<string, AtomDefinition> = new Map();

  constructor() {
    // Initialize with sample atoms
    atomDefinitions.forEach(atom => {
      this.atoms.set(atom.type, atom);
    });
  }

  // Get all atom definitions
  getAtomDefinitions(): AtomDefinition[] {
    return Array.from(this.atoms.values());
  }

  // Get atom by type
  getAtomDefinition(type: string): AtomDefinition | undefined {
    return this.atoms.get(type);
  }

  // Get atoms by category
  getAtomsByCategory(category: string): AtomDefinition[] {
    return this.getAtomDefinitions().filter(atom => atom.category === category);
  }

  // Search atoms
  searchAtoms(query: string): AtomDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAtomDefinitions().filter(atom =>
      atom.name.toLowerCase().includes(lowerQuery) ||
      atom.description.toLowerCase().includes(lowerQuery) ||
      atom.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Register new atom (for extensibility)
  registerAtom(atom: AtomDefinition): void {
    this.atoms.set(atom.type, atom);
  }
}

// Singleton instance
export const atomRegistry = new AtomRegistryService();

// Export functions for backwards compatibility
export const getAtomDefinitions = () => atomRegistry.getAtomDefinitions();
export const getAtomDefinition = (type: string) => atomRegistry.getAtomDefinition(type);
export const getAtomsByCategory = (category: string) => atomRegistry.getAtomsByCategory(category);
export const searchAtoms = (query: string) => atomRegistry.searchAtoms(query);