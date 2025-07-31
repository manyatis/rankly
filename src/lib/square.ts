import { SquareClient, SquareEnvironment } from 'square';

// Initialize Square client
const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN || '',
  environment: process.env.SQUARE_ENVIRONMENT === 'production' 
    ? SquareEnvironment.Production 
    : SquareEnvironment.Sandbox,
});

// Export Square API clients
export const paymentsApi = squareClient.payments;
export const subscriptionsApi = squareClient.subscriptions;
export const catalogApi = squareClient.catalog;
export const customersApi = squareClient.customers;
export const cardsApi = squareClient.cards;
export const invoicesApi = squareClient.invoices;

export default squareClient;