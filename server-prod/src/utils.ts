/**
 * The name of the message queue passed to bullmq
 *
 * Where the actual message queue messages are stored
 * @param accessToken
 */
export const getJobQueueKey = (accessToken: string): string => {
  return `job-queue-${accessToken}`;
};

/**
 * The name of the cron job queue passed to bullmq
 *
 * Where the actual repeatable cron jobs are stored
 * @param accessToken
 */
export const getCronQueueKey = (accessToken: string): string => {
  return `cron-queue-${accessToken}`;
};

/**
 * The key where we store the names of job queues as a set
 *
 * This helps keep track of all the queues registered by the client
 * @param accessToken
 */
export const getJobQueueNamesKey = (accessToken: string): string => {
  return `job-queue-names-${accessToken}`;
};

/**
 * Where the callback path is for a given job queue name
 *
 * e.g. "important-message-queue" -> "/api/import-message-queue"
 *
 * This helps keep track of all the queues registered by the client
 * @param accessToken
 * @param queueName
 */
export const getJobQueuePathKey = (accessToken: string, queueName): string => {
  return `job-queue-path-${accessToken}-${queueName}`;
};
