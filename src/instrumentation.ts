export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // This code runs only on the server
    await import('./lib/server-init');
  }
}