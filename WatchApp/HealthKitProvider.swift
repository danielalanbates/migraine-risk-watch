import HealthKit

class HealthKitProvider {
    private let healthStore = HKHealthStore()

    func requestPermissions() async {
        let typesToRead: Set<HKSampleType> = [
            HKObjectType.quantityType(forIdentifier: .heartRate)!,
            HKObjectType.quantityType(forIdentifier: .heartRateVariabilitySDNN)!,
            HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!,
            // Add more as needed
        ]

        do {
            try await healthStore.requestAuthorization(toShare: [], read: typesToRead)
        } catch {
            print("HealthKit permissions error: \(error)")
        }
    }

    func fetchLatestHealthSnapshot() async -> HealthSnapshot? {
        let now = Date()
        // TODO: Implement fetching latest HR, HRV, sleep, stress
        // For now, return nil or mock data
        return HealthSnapshot(date: now, heartRate: 70, hrv: 50, sleepDurationHours: 7, stressScore: 0.3, menstrualPhase: nil)
    }
}
