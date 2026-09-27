/** 听写模拟：使用浏览器内置语音合成朗读拼音/字符，不接入任何第三方服务 */
let cachedVoice: SpeechSynthesisVoice | null = null;

function pickChineseVoice() {
  if (typeof speechSynthesis === "undefined") return null;
  if (cachedVoice) return cachedVoice;
  const voices = speechSynthesis.getVoices();
  cachedVoice =
    voices.find((v) => /zh(-|_)?(CN|Hans)/i.test(v.lang)) ??
    voices.find((v) => v.lang.toLowerCase().startsWith("zh")) ??
    null;
  return cachedVoice;
}

export function speakHint(text: string) {
  if (typeof speechSynthesis === "undefined") return;
  try {
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "zh-CN";
    utter.rate = 0.85;
    const voice = pickChineseVoice();
    if (voice) utter.voice = voice;
    speechSynthesis.speak(utter);
  } catch {
    // 语音不可用时静默降级为拼音文字提示
  }
}

export function stopSpeaking() {
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}
