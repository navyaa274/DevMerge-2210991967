/**
 * Request Batcher Middleware
 * Batches multiple API requests into a single request
 */

class RequestBatcher {
  constructor() {
    this.batches = new Map();
    this.batchTimeout = 50; // 50ms batch window
  }

  /**
   * Batch multiple requests together
   */
  batch(key, request) {
    return new Promise((resolve, reject) => {
      if (!this.batches.has(key)) {
        this.batches.set(key, {
          requests: [],
          timeout: setTimeout(() => this.executeBatch(key), this.batchTimeout)
        });
      }

      const batch = this.batches.get(key);
      batch.requests.push({ request, resolve, reject });
    });
  }

  /**
   * Execute batched requests
   */
  async executeBatch(key) {
    const batch = this.batches.get(key);
    if (!batch) return;

    this.batches.delete(key);
    clearTimeout(batch.timeout);

    try {
      // Execute all requests in parallel
      const results = await Promise.allSettled(
        batch.requests.map(({ request }) => request())
      );

      // Resolve/reject individual promises
      results.forEach((result, index) => {
        const { resolve, reject } = batch.requests[index];
        if (result.status === 'fulfilled') {
          resolve(result.value);
        } else {
          reject(result.reason);
        }
      });
    } catch (error) {
      // Reject all on batch error
      batch.requests.forEach(({ reject }) => reject(error));
    }
  }

  /**
   * Middleware for batch API endpoint
   */
  middleware() {
    return async (req, res, next) => {
      if (req.path !== '/api/batch') {
        return next();
      }

      try {
        const { requests } = req.body;
        
        if (!Array.isArray(requests)) {
          return res.status(400).json({ error: 'Requests must be an array' });
        }

        // Execute all requests in parallel
        const results = await Promise.allSettled(
          requests.map(async (request) => {
            const { method, url, body, headers } = request;
            
            // Create  request/response for internal routing
            const Req = {
              method: method || 'GET',
              url,
              body,
              headers: { ...req.headers, ...headers },
              user: req.user
            };

            return new Promise((resolve) => {
              const Res = {
                status: (code) => ({
                  json: (data) => resolve({ status: code, data }),
                  send: (data) => resolve({ status: code, data })
                }),
                json: (data) => resolve({ status: 200, data }),
                send: (data) => resolve({ status: 200, data })
              };

              // Route the request internally
              req.app.handle(Req, Res);
            });
          })
        );

        // Format results
        const responses = results.map((result, index) => ({
          id: requests[index].id,
          status: result.status === 'fulfilled' ? result.value.status : 500,
          data: result.status === 'fulfilled' ? result.value.data : { error: result.reason.message }
        }));

        res.json({ responses });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };
  }
}

module.exports = new RequestBatcher();
