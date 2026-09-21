import { MongoMemoryServer } from 'mongodb-memory-server';
import type { TestProject } from 'vitest/node';

/** Starts one in-memory MongoDB for the whole e2e run; each test file uses its own database. */
export default async function globalSetup(project: TestProject): Promise<() => Promise<void>> {
  const mongo = await MongoMemoryServer.create();
  project.provide('mongoUri', mongo.getUri());

  return async () => {
    await mongo.stop();
  };
}
