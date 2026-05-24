import AVFoundation

/// Warm, simple voice prompts. Synthesized for now; pre-recorded voice talent
/// is an open item (PRD Wave 1 §11).
@MainActor
final class SpeechService {
    private let synthesizer = AVSpeechSynthesizer()
    var isEnabled = true

    func speak(_ text: String) {
        guard isEnabled, !text.isEmpty else { return }
        let utterance = AVSpeechUtterance(string: text)
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate * 0.92
        utterance.pitchMultiplier = 1.12
        synthesizer.stopSpeaking(at: .immediate)
        synthesizer.speak(utterance)
    }
}
