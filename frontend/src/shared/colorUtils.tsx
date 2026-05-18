export const generateDistinctColors = (count: number): string[] => {
  const baseHues = [
    210,  // blue
    120,  // green
    0,    // red
    270,  // purple
    30,   // orange
    180,  // cyan
    330,  // pink
    60,   // yellow
    150,  // teal
    300   // magenta
  ];

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = baseHues[i % baseHues.length];
    const saturation = 65 + (i / count) * 20; // Vary saturation
    const lightness = 45 + (i / count) * 10;  // Vary lightness
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
};