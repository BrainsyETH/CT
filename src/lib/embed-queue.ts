/**
 * Embed Load Queue Manager
 * 
 * Manages concurrent loading of embeds (Twitter, YouTube) to prevent
 * performance degradation from too many simultaneous loads.
 */

export type EmbedType = "twitter" | "youtube";

export interface QueuedLoad {
  id: string;
  type: EmbedType;
  priority: number; // Higher = more priority
  loadFn: () => Promise<void>;
  abortController?: AbortController;
}

class EmbedQueue {
  private twitterQueue: QueuedLoad[] = [];
  private youtubeQueue: QueuedLoad[] = [];
  private activeTwitterLoads = 0;
  private activeYoutubeLoads = 0;
  private readonly maxConcurrentTwitter = 2;
  private readonly maxConcurrentYoutube = 1;

  /**
   * Add a load task to the queue
   */
  enqueue(load: QueuedLoad): () => void {
    const queue = load.type === "twitter" ? this.twitterQueue : this.youtubeQueue;
    
    // Insert in priority order (higher priority first)
    const insertIndex = queue.findIndex((item) => item.priority < load.priority);
    if (insertIndex === -1) {
      queue.push(load);
    } else {
      queue.splice(insertIndex, 0, load);
    }

    // Try to process immediately
    this.processQueue(load.type);

    // Return cancellation function
    return () => {
      this.cancel(load.id, load.type);
    };
  }

  /**
   * Cancel a queued or active load
   */
  cancel(id: string, type: EmbedType): void {
    const queue = type === "twitter" ? this.twitterQueue : this.youtubeQueue;
    const index = queue.findIndex((item) => item.id === id);
    
    if (index !== -1) {
      const load = queue[index];
      load.abortController?.abort();
      queue.splice(index, 1);
    }
  }

  /**
   * Cancel all loads of a specific type
   */
  cancelAll(type: EmbedType): void {
    const queue = type === "twitter" ? this.twitterQueue : this.youtubeQueue;
    
    queue.forEach((load) => {
      load.abortController?.abort();
    });
    
    if (type === "twitter") {
      this.twitterQueue = [];
      this.activeTwitterLoads = 0;
    } else {
      this.youtubeQueue = [];
      this.activeYoutubeLoads = 0;
    }
  }

  /**
   * Cancel all loads
   */
  cancelAllLoads(): void {
    this.cancelAll("twitter");
    this.cancelAll("youtube");
  }

  /**
   * Process the queue for a specific embed type
   */
  private async processQueue(type: EmbedType): Promise<void> {
    const queue = type === "twitter" ? this.twitterQueue : this.youtubeQueue;
    const maxConcurrent = type === "twitter" ? this.maxConcurrentTwitter : this.maxConcurrentYoutube;
    const activeLoads = type === "twitter" ? this.activeTwitterLoads : this.activeYoutubeLoads;

    // Check if we can start more loads
    if (activeLoads >= maxConcurrent || queue.length === 0) {
      return;
    }

    // Get the highest priority item
    const load = queue.shift();
    if (!load) return;

    // Check if aborted
    if (load.abortController?.signal.aborted) {
      this.processQueue(type);
      return;
    }

    // Increment active loads
    if (type === "twitter") {
      this.activeTwitterLoads++;
    } else {
      this.activeYoutubeLoads++;
    }

    try {
      await load.loadFn();
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name !== "AbortError") {
        console.warn(`Embed load failed for ${load.id}:`, error);
      }
    } finally {
      // Decrement active loads
      if (type === "twitter") {
        this.activeTwitterLoads--;
      } else {
        this.activeYoutubeLoads--;
      }

      // Process next item in queue
      this.processQueue(type);
    }
  }

  /**
   * Get current queue status
   */
  getStatus(): {
    twitter: { queued: number; active: number };
    youtube: { queued: number; active: number };
  } {
    return {
      twitter: {
        queued: this.twitterQueue.length,
        active: this.activeTwitterLoads,
      },
      youtube: {
        queued: this.youtubeQueue.length,
        active: this.activeYoutubeLoads,
      },
    };
  }
}

// Singleton instance
export const embedQueue = new EmbedQueue();
