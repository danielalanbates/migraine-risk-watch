import Foundation

class RemoteLLMClient: MigraineLLMClient {
    func predict(
        from context: MigraineContext,
        basePrediction: MigrainePrediction,
        tier: AIPredictionTier
    ) async throws -> MigrainePrediction {
        // TODO: Implement HTTP request to backend API
        // For free tier: Use Deepseek, fallback to Groq
        // For premium: Enhanced prompt with Groq

        // For now, return base prediction as placeholder
        return basePrediction
    }
}
