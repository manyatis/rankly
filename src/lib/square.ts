// TODO: Fix Square SDK client initialization when production ready
// Currently using mock client to avoid build errors

interface MockApi {
  createSubscription: (request: unknown) => Promise<{ result: { subscription?: { id: string; status: string }; errors?: unknown[] } }>;
  cancelSubscription: (request: unknown) => Promise<{ result: { subscription?: { id: string }; errors?: unknown[] } }>;
  createCustomer: (request: unknown) => Promise<{ result: { customer?: { id: string }; errors?: unknown[] } }>;
  createCard: (request: unknown) => Promise<{ result: { card?: { id: string }; errors?: unknown[] } }>;
  retrieveSubscription: (request: { subscriptionId: string }) => Promise<{ result: { subscription?: { id: string; status: string }; errors?: unknown[] } }>;
  searchSubscriptions: (request: unknown) => Promise<{ result: { subscriptions?: Array<{ id: string; status: string; customerId?: string }>; errors?: unknown[] } }>;
}

// Mock Square API implementations for development
const mockApi: MockApi = {
  createSubscription: async () => ({
    result: {
      subscription: { id: 'mock-subscription-' + Date.now(), status: 'ACTIVE' },
      errors: []
    }
  }),
  cancelSubscription: async () => ({
    result: {
      subscription: { id: 'mock-subscription-canceled' },
      errors: []
    }
  }),
  createCustomer: async () => ({
    result: {
      customer: { id: 'mock-customer-' + Date.now() },
      errors: []
    }
  }),
  createCard: async () => ({
    result: {
      card: { id: 'mock-card-' + Date.now() },
      errors: []
    }
  }),
  retrieveSubscription: async (request: { subscriptionId: string }) => {
    // Mock different statuses based on subscription ID for testing
    const status = request.subscriptionId.includes('canceled') ? 'CANCELED' : 
                   request.subscriptionId.includes('paused') ? 'PAUSED' :
                   request.subscriptionId.includes('pending') ? 'PENDING' : 'ACTIVE';
    
    return {
      result: {
        subscription: { 
          id: request.subscriptionId, 
          status 
        },
        errors: []
      }
    };
  },
  searchSubscriptions: async () => ({
    result: {
      subscriptions: [], // Mock empty results for now
      errors: []
    }
  }),
};

// Export mock API clients
export const paymentsApi = mockApi;
export const subscriptionsApi = mockApi;
export const catalogApi = mockApi;
export const customersApi = mockApi;
export const cardsApi = mockApi;
export const invoicesApi = mockApi;

// When ready for production, replace with:
/*
import { SquareClient, SquareEnvironment } from 'square';

const squareClient = new SquareClient({
  // TODO: Research correct initialization parameters for Square SDK v43+
  environment: process.env.SQUARE_ENVIRONMENT === 'production' 
    ? SquareEnvironment.Production 
    : SquareEnvironment.Sandbox,
});

export const subscriptionsApi = squareClient.subscriptions;
export const customersApi = squareClient.customers;
export const cardsApi = squareClient.cards;
// etc.
*/

const mockClient = null;
export default mockClient;