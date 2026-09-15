import Foundation
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
                    }

                    ProgressView(value: prediction.probability)

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
                if let url = URL(string: "mailto:help@batesai.org?subject=Migraine%20Watch%20Feedback") {
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
}

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

        do {
            // Gather context from providers
            let symptoms = await loadRecentSymptoms() // TODO: Implement
            let health = await healthProvider.fetchLatestHealthSnapshot()
            let environment = await weatherProvider.fetchLatestEnvironmentSnapshot()

            let context = MigraineContext(
                recentSymptoms: symptoms,
                healthSnapshots: health.map { [$0] } ?? [],
                environmentSnapshots: environment.map { [$0] } ?? []
            )

            // Determine tier based on user settings (TODO: User settings)
            let tier: AIPredictionTier = .free // Default to free

            let prediction = await engine.predict(context: context, tier: tier)
            currentPrediction = prediction
        } catch {
            errorMessage = "Failed to load prediction: \(error.localizedDescription)"
        }
    }

    func requestPermissions() async {
        await healthProvider.requestPermissions()
        await weatherProvider.requestPermissions()
    }

    private func loadRecentSymptoms() async -> [SymptomLogEntry] {
        // TODO: Load from storage (e.g., Core Data or files)
        return []
    }
}
