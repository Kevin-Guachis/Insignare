function wrapLabel(text, limit = 24) {
 const lines = [""];
 for (const word of text.split(" ")) {
  const i = lines.length - 1;
  if (lines[i] && lines[i].length + word.length + 1 > limit) lines.push(word);
  else lines[i] += (lines[i] ? " " : "") + word;
 }
 return lines;
}
export function chartConfig(results, type, print = false) {
 const labels = results.map(a => wrapLabel(a.nombre, type === "radar" ? 20 : 26));
 const data = results.map(a => a.porcentaje);
 return {
  type, data: { labels, datasets: [{ label: type === "bar" ? "Afinidad (%)" : "Perfil vocacional", data,
   backgroundColor: type === "bar" ? results.map(a => a.color) : "rgba(27,79,130,.18)",
   borderColor: "#1B4F82", borderWidth: 1.5 }] },
  options: {
   responsive: !print, maintainAspectRatio: false, animation: false,
   devicePixelRatio: print ? 3 : Math.min(window.devicePixelRatio || 1, 2),
   ...(type === "bar" ? { indexAxis: "y" } : {}),
   plugins: { legend: { display: false } },
   scales: type === "bar" ? {
    x: { beginAtZero: true, max: 100, ticks: { font: { size: 11 } } },
    y: { ticks: { autoSkip: false, font: { size: 11 } } },
   } : { r: { beginAtZero: true, max: 100, ticks: { stepSize: 25, font: { size: 10 } },
    pointLabels: { font: { size: 11 }, padding: 6 } } },
  },
 };
}
