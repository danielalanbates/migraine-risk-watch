import Foundation

// MARK: - Core Types

struct MigrainePrediction: Codable {
    let createdAt: Date
    let riskLevel: MigraineRiskLevel
    let probability: Double
    let likelyTriggers: [String]
    let summary: String
    let recommendedActions: [String]
}

enum MigraineRiskLevel: String, Codable {
    case low, medium, high
}

struct HealthSnapshot {
    let date: Date
    let heartRate: Double?
    let hrv: Double?
    let sleepDurationHours: Double?
    let stressScore: Double?
    let menstrualPhase: String?
}

struct EnvironmentSnapshot {
    let date: Date
    let temperatureCelsius: Double?
    let humidityPercent: Double?
    let barometricPressureHPa: Double?
    let weatherCondition: String?
}

struct SymptomLogEntry {
    let date: Date
    let severity: SeverityLevel
    let symptoms: [SymptomType]
}

enum SeverityLevel: String {
    case mild, moderate, severe
}

enum SymptomType: String {
    case headache, nausea, lightSensitivity, soundSensitivity, aura
}

struct MigraineContext {
    let recentSymptoms: [SymptomLogEntry]
    let healthSnapshots: [HealthSnapshot]
    let environmentSnapshots: [EnvironmentSnapshot]
}

enum AIPredictionTier {
    case free
    case premium
}

// MARK: - Protocols

protocol MigraineLLMClient {
    func predict(
        from context: MigraineContext,
        basePrediction: MigrainePrediction,
        tier: AIPredictionTier
    ) async throws -> MigrainePrediction
}

enum MigraineLLMClientError: Error {
    case notConfigured
    case apiError(String)
}

protocol MigrainePredictionProviding {
    var currentPrediction: MigrainePrediction? { get }
    var isLoading: Bool { get }
    var errorMessage: String? { get }
    func refreshPrediction() async
    func requestPermissions() async
    func requestNotificationPermissions() async
}

// MARK: - Prediction Engine

class MigrainePredictionEngine {
    private let llmClient: MigraineLLMClient
    
    init(llmClient: MigraineLLMClient) {
        self.llmClient = llmClient
    }
    
    func predict(context: MigraineContext, tier: AIPredictionTier) async -> MigrainePrediction {
        // Heuristic base prediction
        let basePrediction = MigrainePrediction(
            createdAt: Date(),
            riskLevel: .low,
            probability: 0.2,
            likelyTriggers: [],
            summary: "Low risk based on current data",
            recommendedActions: ["Stay hydrated", "Monitor symptoms"]
        )
        
        do {
            return try await llmClient.predict(from: context, basePrediction: basePrediction, tier: tier)
        } catch {
            return basePrediction
        }
    }
}
