import { pipeline, env } from "@xenova/transformers";

// Optional: Disable local models to force downloading from HF if needed
// env.allowLocalModels = false;
// env.useBrowserCache = false;

// Optimize for serverless: prevent transformers from spawning workers
if (typeof process !== "undefined") {
  // @ts-ignore
  env.backends.onnx.wasm.numThreads = 1;
}

/**
 * Singleton pipeline pattern ensures we only load the model once per server instance.
 */
class PipelineSingleton {
  static task = "feature-extraction";
  static model = "Xenova/all-MiniLM-L6-v2";
  static instance: any = null;

  static async getInstance(progress_callback?: any) {
    if (this.instance === null) {
      // @ts-ignore
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

export default PipelineSingleton;
