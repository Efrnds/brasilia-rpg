const pairs = [
  ["texto", "#243d33", "#f5eace"],
  ["secundário", "#56634f", "#f5eace"],
  ["foco", "#ae3d22", "#f5eace"],
  ["diário", "#24352e", "#eee6d5"],
  ["minimapa", "#fff3db", "#243d33"],
];
const luminance = (hex) => {
  const channels = hex
    .slice(1)
    .match(/../g)
    .map((n) => parseInt(n, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};
for (const [label, foreground, background] of pairs) {
  const a = luminance(foreground),
    b = luminance(background),
    ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  console.log(`${label}: ${ratio.toFixed(2)}:1`);
  if (ratio < 4.5) process.exitCode = 1;
}
console.log(
  "Verifica pares sólidos declarados; transparência e enquadramento ainda exigem captura.",
);
