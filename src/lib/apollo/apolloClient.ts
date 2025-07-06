// File: src/lib/apollo/apolloClient.ts
// 🎯 Block H4: GraphQL Integration - Apollo Client Setup
// Complete Apollo Client configuration with real-time subscriptions for Kairos Frontend
// * 🔌 **HTTP Link** for standard GraphQL queries and mutations
// * 🔄 **WebSocket Link** for real-time subscriptions
// * 🏢 **Tenant context** injection via headers
// * 🛡️ **Authentication** with JWT token handling
// * 💾 **Intelligent caching** with normalized cache
// * 🔧 **Error handling** and retry logic

import { 
  ApolloClient, 
  InMemoryCache, 
  createHttpLink, 
  from,
  split,
  ApolloLink,
  Observable,
  FetchResult,
  Operation,
  NextLink
} from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { RetryLink } from '@apollo/client/link/retry'
import { createClient } from 'graphql-ws'
import { useAppStore } from '@/stores/appStore'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface AuthContextValue {
  token?: string
  refreshToken?: string
  tenantId?: string
  workspaceId?: string
}

interface GraphQLErrorExtensions {
  code?: string
  field?: string
  timestamp?: string
  traceId?: string
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const HTTP_ENDPOINT = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8080/graphql'
const WS_ENDPOINT = import.meta.env.VITE_GRAPHQL_WS_URL || 'ws://localhost:8080/graphql/websocket'

// =============================================================================
// HTTP LINK SETUP
// =============================================================================

const httpLink = createHttpLink({
  uri: HTTP_ENDPOINT,
  credentials: 'include', // Include cookies for CSRF protection
})

// =============================================================================
// WEBSOCKET LINK SETUP FOR SUBSCRIPTIONS
// =============================================================================

const wsClient = createClient({
  url: WS_ENDPOINT,
  connectionParams: () => {
    const state = useAppStore.getState()
    return {
      Authorization: state.authToken ? `Bearer ${state.authToken}` : '',
      'X-Tenant-ID': state.currentTenant?.id || '',
      'X-Workspace-ID': state.currentWorkspace?.id || '',
    }
  },
  // Reconnect on connection drop
  shouldRetry: () => true,
  retryAttempts: 5,
  retryWait: (attempts) => new Promise(resolve => 
    setTimeout(resolve, Math.min(1000 * Math.pow(2, attempts), 30000))
  ),
})

const wsLink = new GraphQLWsLink(wsClient)

// =============================================================================
// AUTHENTICATION LINK
// =============================================================================

const authLink = setContext((_, { headers }) => {
  const state = useAppStore.getState()
  
  return {
    headers: {
      ...headers,
      // Add authentication token
      authorization: state.authToken ? `Bearer ${state.authToken}` : '',
      // Add tenant context
      'X-Tenant-ID': state.currentTenant?.id || import.meta.env.VITE_DEFAULT_TENANT_ID || '',
      'X-Workspace-ID': state.currentWorkspace?.id || '',
      // Add request metadata
      'X-Client-Version': import.meta.env.VITE_APP_VERSION || '1.0.0',
      'X-Client-Name': 'Kairos-Frontend',
    },
  }
})

// =============================================================================
// TOKEN REFRESH LINK
// =============================================================================

const tokenRefreshLink = new ApolloLink((operation: Operation, forward: NextLink) => {
  return new Observable<FetchResult>((observer) => {
    const subscription = forward(operation).subscribe({
      next: (result) => {
        observer.next(result)
      },
      error: async (error) => {
        // Check if error is due to expired token
        if (error.networkError?.statusCode === 401) {
          const state = useAppStore.getState()
          
          if (state.refreshToken) {
            try {
              // Attempt to refresh token
              const response = await fetch('/api/v1/auth/refresh', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${state.refreshToken}`,
                },
              })
              
              if (response.ok) {
                const { authToken, refreshToken } = await response.json()
                
                // Update tokens in store
                state.login(state.user!, { authToken, refreshToken })
                
                // Retry the original operation with new token
                const retrySubscription = forward(operation).subscribe({
                  next: (result) => observer.next(result),
                  error: (retryError) => observer.error(retryError),
                  complete: () => observer.complete(),
                })
                
                return () => retrySubscription.unsubscribe()
              } else {
                // Refresh failed, logout user
                state.logout()
                observer.error(error)
              }
            } catch (refreshError) {
              // Refresh request failed, logout user
              state.logout()
              observer.error(error)
            }
          } else {
            // No refresh token available, logout user
            state.logout()
            observer.error(error)
          }
        } else {
          observer.error(error)
        }
      },
      complete: () => {
        observer.complete()
      },
    })
    
    return () => subscription.unsubscribe()
  })
})

// =============================================================================
// ERROR HANDLING LINK
// =============================================================================

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  const { addNotification } = useAppStore.getState()
  
  // Handle GraphQL errors
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      const errorExtensions = extensions as GraphQLErrorExtensions
      
      console.error(
        `[GraphQL Error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        { extensions: errorExtensions }
      )
      
      // Show user-friendly error notifications for specific error codes
      switch (errorExtensions?.code) {
        case 'VALIDATION_ERROR':
          addNotification({
            type: 'warning',
            title: 'Validation Error',
            message: `Invalid input: ${message}`,
          })
          break
          
        case 'TENANT_NOT_FOUND':
          addNotification({
            type: 'error',
            title: 'Tenant Error',
            message: 'Your workspace could not be found. Please contact support.',
          })
          break
          
        case 'INSUFFICIENT_PERMISSIONS':
          addNotification({
            type: 'warning',
            title: 'Access Denied',
            message: 'You do not have permission to perform this action.',
          })
          break
          
        case 'RATE_LIMIT_EXCEEDED':
          addNotification({
            type: 'warning',
            title: 'Rate Limit Exceeded',
            message: 'Too many requests. Please wait a moment and try again.',
          })
          break
          
        default:
          // Generic error for development
          if (import.meta.env.VITE_NODE_ENV === 'development') {
            addNotification({
              type: 'error',
              title: 'GraphQL Error',
              message: message,
            })
          }
      }
    })
  }
  
  // Handle network errors
  if (networkError) {
    console.error(`[Network Error]: ${networkError}`)
    
    // Check if it's a connection error
    if (!navigator.onLine) {
      addNotification({
        type: 'error',
        title: 'Network Error',
        message: 'You appear to be offline. Please check your internet connection.',
      })
    } else {
      addNotification({
        type: 'error',
        title: 'Connection Error',
        message: 'Failed to connect to the server. Please try again.',
      })
    }
  }
})

// =============================================================================
// RETRY LINK CONFIGURATION
// =============================================================================

const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 5,
    retryIf: (error, _operation) => {
      // Retry on network errors but not on GraphQL errors
      return !!error && !error.result
    },
  },
})

// =============================================================================
// LINK SPLITTING FOR HTTP VS WEBSOCKET
// =============================================================================

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink
)

// =============================================================================
// APOLLO CACHE CONFIGURATION
// =============================================================================

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Analytics data with time-based cache invalidation
        dashboardMetrics: {
          merge: true,
        },
        campaignPerformance: {
          merge(existing = [], incoming) {
            return [...incoming]
          },
        },
        atomUsageStats: {
          merge(existing = [], incoming) {
            return [...incoming]
          },
        },
        momentEffectiveness: {
          merge(existing = [], incoming) {
            return [...incoming]
          },
        },
      },
    },
    Campaign: {
      fields: {
        performance: {
          merge: true,
        },
      },
    },
    Atom: {
      fields: {
        usageStats: {
          merge: true,
        },
      },
    },
    Moment: {
      fields: {
        effectiveness: {
          merge: true,
        },
      },
    },
    // Real-time subscription data
    Subscription: {
      fields: {
        dashboardUpdates: {
          merge: false, // Always use latest data
        },
        campaignUpdates: {
          merge: false,
        },
        atomUpdates: {
          merge: false,
        },
      },
    },
  },
  // Cache data for 5 minutes by default
  defaultOptions: {
    watchQuery: {
      gcTime: 300000, // 5 minutes
    },
  },
})

// =============================================================================
// APOLLO CLIENT INSTANCE
// =============================================================================

export const apolloClient = new ApolloClient({
  link: from([
    errorLink,
    retryLink,
    tokenRefreshLink,
    authLink,
    splitLink,
  ]),
  cache,
  // Enable developer tools in development
  connectToDevTools: import.meta.env.VITE_NODE_ENV === 'development',
  // Default options for all operations
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all', // Return partial data even if there are errors
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  // Custom resolvers for client-side computed fields
  resolvers: {
    Campaign: {
      efficiency: (campaign) => {
        if (!campaign.revenue || !campaign.cost) return 0
        return (campaign.revenue - campaign.cost) / campaign.cost
      },
    },
    Atom: {
      performanceScore: (atom) => {
        const { successRate, averageExecutionTime, usageCount } = atom
        // Custom scoring algorithm
        const timeScore = Math.max(0, 100 - (averageExecutionTime / 10))
        const reliabilityScore = successRate * 100
        const popularityScore = Math.min(100, usageCount / 10)
        
        return (timeScore + reliabilityScore + popularityScore) / 3
      },
    },
  },
})

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Refresh the Apollo Client cache
 */
export const refreshCache = async (): Promise<void> => {
  await apolloClient.clearStore()
  await apolloClient.reFetchObservableQueries()
}

/**
 * Get current cache size for debugging
 */
export const getCacheSize = (): number => {
  return Object.keys(apolloClient.cache.extract()).length
}

/**
 * Clear all cached data
 */
export const clearCache = async (): Promise<void> => {
  await apolloClient.clearStore()
}

/**
 * Reset WebSocket connection
 */
export const resetWebSocketConnection = (): void => {
  wsClient.terminate()
}

// =============================================================================
// SUBSCRIPTION MANAGEMENT
// =============================================================================

/**
 * Set up real-time dashboard subscriptions
 */
export const setupDashboardSubscriptions = () => {
  const { currentTenant } = useAppStore.getState()
  
  if (!currentTenant) return
  
  // This would be implemented with actual GraphQL subscription queries
  // Example structure for when you implement the subscriptions
  /*
  apolloClient.subscribe({
    query: DASHBOARD_UPDATES_SUBSCRIPTION,
    variables: { tenantId: currentTenant.id },
  }).subscribe({
    next: (data) => {
      // Update analytics store with real-time data
      console.log('Dashboard update received:', data)
    },
    error: (error) => {
      console.error('Dashboard subscription error:', error)
    },
  })
  */
}

export default apolloClient