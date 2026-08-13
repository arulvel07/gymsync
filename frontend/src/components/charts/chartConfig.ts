export const chartDarkTheme = {
  textColor: '#a1a1aa',
  mutedColor: '#71717a',
  gridColor: 'rgba(255, 255, 255, 0.05)',
  borderColor: 'rgba(255, 255, 255, 0.1)',
  accentColor: '#3b82f6',
  tooltipBg: '#121215',
  tooltipBorder: 'rgba(255, 255, 255, 0.15)',
};

export const commonTooltipOptions = {
  backgroundColor: chartDarkTheme.tooltipBg,
  titleColor: '#fafafa',
  bodyColor: chartDarkTheme.textColor,
  borderColor: chartDarkTheme.tooltipBorder,
  borderWidth: 1,
  padding: 12,
  cornerRadius: 6,
  displayColors: true,
  titleFont: {
    family: "'Inter', sans-serif",
    size: 12,
    weight: 'bold' as const,
  },
  bodyFont: {
    family: "'Inter', sans-serif",
    size: 11,
  },
};

export const commonCartesianScales = {
  x: {
    grid: {
      color: chartDarkTheme.gridColor,
    },
    ticks: {
      color: chartDarkTheme.mutedColor,
      font: {
        family: "'Inter', sans-serif",
        size: 11,
      },
    },
  },
  y: {
    beginAtZero: true,
    grid: {
      color: chartDarkTheme.gridColor,
    },
    ticks: {
      color: chartDarkTheme.mutedColor,
      font: {
        family: "'Inter', sans-serif",
        size: 11,
      },
    },
  },
};
