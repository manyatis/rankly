export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // This code runs only on the server - using new pool-based system
    const { initializeServer } = await import('./lib/server-init-pool');
    await initializeServer();
  }
}