// Plum — the Quiet Ledger's one deliberate accent (oklch(46% 0.14 338) light /
// oklch(72% 0.13 338) dark). Chosen to read warm and personal rather than
// generic-fintech-blue, and to sit far enough from the success/warning/danger
// hues that it never gets mistaken for a status color.
const tintColorLight = '#873273';
const tintColorDark = '#d983c1';
const tintPressedLight = '#70125d';
const tintPressedDark = '#e6a9d6';

export default {
  light: {
    text: '#000',
    textSecondary: '#666',
    // Darkened from #999 (2.61:1 on card, 2.85:1 on screen bg — failed WCAG AA
    // for placeholder/empty-state text). #6c6c6c clears 4.5:1 against both.
    textMuted: '#6c6c6c',
    background: '#fff',
    card: '#f5f5f5',
    border: '#e2e2e2',
    tint: tintColorLight,
    tintPressed: tintPressedLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    success: '#1d9e75',
    successBg: '#e1f5ee',
    warning: '#ba7517',
    warningBg: '#faeeda',
    danger: '#a32d2d',
    dangerBg: '#fcebeb',
    // Positive-edge highlight for playstat picks (GameCard/ParlayCard) — a
    // distinct hue from `success` so "this leg has an edge" never reads as
    // "this bet already won." Darkened from the emerald these components used
    // to hardcode (#059669), which only hit 3.46:1 on the card background.
    edge: '#00794d',
    edgeBg: '#00794d22',
    edgeBorder: '#00794d55',
  },
  dark: {
    text: '#fff',
    textSecondary: '#aaa',
    // Lightened from #777 (3.80:1 on the dark card bg — failed WCAG AA).
    // #888 clears 4.5:1 against both the dark card and the black screen bg.
    textMuted: '#888',
    background: '#000',
    card: '#1c1c1e',
    border: '#2c2c2e',
    tint: tintColorDark,
    tintPressed: tintPressedDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    success: '#5dcaa5',
    successBg: '#085041',
    warning: '#f2a13f',
    warningBg: '#633806',
    danger: '#f09595',
    dangerBg: '#791f1f',
    edge: '#34d399',
    edgeBg: '#34d39922',
    edgeBorder: '#34d39955',
  },
};
