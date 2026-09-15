import SwiftUI
import HealthKit

struct ContentView: View {
    @StateObject private var provider = MigrainePredictionProvider()
    @Environment(\.openURL) private var openURL

    var body: some View {
        VStack(spacing: 12) {
            if let prediction = provider.currentPrediction {
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("Risk")
                            .font(.headline)
                        Spacer()
                        Text(prediction.riskLevel.rawValue.uppercased())
                            .font(.headline)
                            .foregroundColor(colorForRisk(prediction.riskLevel))
                    }

                    ProgressView(value: prediction.probability)
                        .tint(colorForRisk(prediction.riskLevel))

                    Text("Probability: \(Int(prediction.probability * 100))%")
                        .font(.caption)

                    Text(prediction.summary)
                        .font(.caption2)
                        .lineLimit(3)
                }
            } else if provider.isLoading {
                ProgressView()
            } else if let error = provider.errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
            } else {
                Text("No prediction yet")
                    .font(.caption)
                    .foregroundColor(.gray)
            }

            Button("Feedback") {
                if let url = URL(string: "mailto:daniel@batesai.org?subject=Migraine%20Watch%20Feedback") {
                    openURL(url)
                }
            }
            .font(.system(size: 12, weight: .medium))
        }
        .padding()
        .onAppear {
            Task { await provider.requestPermissions() }
            Task { await provider.refreshPrediction() }
        }
    }
    
    private func colorForRisk(_ level: MigraineRiskLevel) -> Color {
        switch level {
        case .low: return .green
        case .medium: return .orange
        case .high: return .red
        }
    }
}

@MainActor
class MigrainePredictionProvider: ObservableObject, MigrainePredictionProviding {
    @Published var currentPrediction: MigrainePrediction?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let engine: MigrainePredictionEngine
    private let healthProvider: HealthKitProvider
    private let weatherProvider: WeatherKitProvider
    private let llmClient: RemoteLLMClient

    init() {
        self.healthProvider = HealthKitProvider()
        self.weatherProvider = WeatherKitProvider()
        self.llmClient = RemoteLLMClient()
        self.engine = MigrainePredictionEngine(llmClient: llmClient)
    }

    func refreshPrediction() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        let symptoms = await loadRecentSymptoms()
        let health = await healthProvider.fetchLatestHealthSnapshot()
        let environment = await weatherProvider.fetchLatestEnvironmentSnapshot()

        let context = MigraineContext(
            recentSymptoms: symptoms,
            healthSnapshots: health.map { [$0] } ?? [],
            environmentSnapshots: environment.map { [$0] } ?? []
        )

        let tier: AIPredictionTier = .free
        let prediction = await engine.predict(context: context, tier: tier)
        currentPrediction = prediction
    }

    func requestPermissions() async {
        await healthProvider.requestPermissions()
        await weatherProvider.requestPermissions()
    }
    
    func requestNotificationPermissions() async {
        // TODO: Implement notification permissions
    }

    private func loadRecentSymptoms() async -> [SymptomLogEntry] {
        return []
    }
}
