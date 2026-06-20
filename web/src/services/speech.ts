// Tiny wrapper around the Web Speech API. Skips silently when unavailable
// (e.g. SSR, locked-down browsers).

export function speak(text: string): void {
  if (typeof window === 'undefined') return
  const synth = window.speechSynthesis
  if (!synth || !text) return
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.95
  utterance.pitch = 1.1
  synth.speak(utterance)
}
