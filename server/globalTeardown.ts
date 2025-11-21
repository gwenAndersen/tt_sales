import { db } from './storage';

export default async () => {
  // Close the database connection if it's still open
  // Drizzle doesn't have a direct 'close' method for the neon driver,
  // but we can ensure the underlying connection is terminated if necessary.
  // For testing, often the process exits, cleaning up connections.
  // If using a persistent connection pool, you might need to drain it here.
  console.log('Global Teardown: Ensuring database connections are closed.');
  // Example for a hypothetical direct connection close if available:
  // if (db.connection) {
  //   await db.connection.end();
  // }
};