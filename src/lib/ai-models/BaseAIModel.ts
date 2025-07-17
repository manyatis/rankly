export abstract class BaseAIModel {
  abstract getName(): string;
  abstract getRequiredEnvVars(): string[];
  abstract query(businessDescription: string): Promise<string>;
  
  isConfigured(): boolean {
    const requiredVars = this.getRequiredEnvVars();
    return requiredVars.every(varName => !!process.env[varName]);
  }

  protected logQuery(businessDescription: string): void {
    console.log(`🤖 [${this.getName()}] Querying with: "${businessDescription}"`);
  }

  protected logSuccess(responseLength: number): void {
    console.log(`✅ [${this.getName()}] Response received: ${responseLength} characters`);
  }

  protected logError(error: unknown): void {
    console.error(`❌ [${this.getName()}] Query error:`, error);
  }

  protected getMissingEnvVarError(): string {
    const requiredVars = this.getRequiredEnvVars();
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    return `Error: Missing environment variables: ${missingVars.join(', ')}. Please add your API keys to the .env.local file.`;
  }

  protected formatError(error: unknown): string {
    return `Error querying ${this.getName()}: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}