# Migraine Watch

AI-powered migraine prediction app for Apple Watch that uses health data, weather, and symptom tracking to forecast migraine risk.

## Features
- Real-time migraine risk prediction
- HealthKit integration (heart rate, HRV, sleep)
- WeatherKit integration (barometric pressure, humidity)
- Free tier with Deepseek AI (Groq fallback)
- Premium tier with enhanced predictions

## Architecture
- **MigraineApp/** - Xcode project for watchOS
- **WatchApp/** - Standalone Swift source files
- **engine/** - Backend prediction engine
- **web/** - Web interface

## Roadmap
- [x] Core prediction engine
- [x] HealthKit integration
- [x] WeatherKit integration
- [ ] DeepSeek/Groq API integration
- [ ] Symptom logging UI
- [ ] Push notifications
- [ ] App Store submission

## License

This software is licensed under the [Polyform Noncommercial License 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/).

You may use this software for noncommercial purposes only. Commercial use requires a separate license.

## Contact

**Daniel Bates**  
Email: daniel@batesai.org
