// Icon library — curated SVG icons for presentations

const iconLibrary = [
  // --- Arrows & Navigation ---
  { name: 'Arrow Right', category: 'Arrows', path: 'M5 12h14m-7-7 7 7-7 7', stroke: true },
  { name: 'Arrow Left', category: 'Arrows', path: 'M19 12H5m7-7-7 7 7 7', stroke: true },
  { name: 'Arrow Up', category: 'Arrows', path: 'M12 19V5m-7 7 7-7 7 7', stroke: true },
  { name: 'Arrow Down', category: 'Arrows', path: 'M12 5v14m-7-7 7 7 7-7', stroke: true },
  { name: 'Chevron Right', category: 'Arrows', path: 'M9 18l6-6-6-6', stroke: true },
  { name: 'Chevron Down', category: 'Arrows', path: 'M6 9l6 6 6-6', stroke: true },

  // --- Common Actions ---
  { name: 'Checkmark', category: 'Actions', path: 'M20 6L9 17l-5-5', stroke: true },
  { name: 'X Mark', category: 'Actions', path: 'M18 6L6 18M6 6l12 12', stroke: true },
  { name: 'Plus', category: 'Actions', path: 'M12 5v14m-7-7h14', stroke: true },
  { name: 'Minus', category: 'Actions', path: 'M5 12h14', stroke: true },
  { name: 'Search', category: 'Actions', path: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', stroke: true },
  { name: 'Download', category: 'Actions', path: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5 5 5 5-5m-5 5V3', stroke: true },
  { name: 'Upload', category: 'Actions', path: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m14-7-5-5-5 5m5-5v12', stroke: true },
  { name: 'Refresh', category: 'Actions', path: 'M1 4v6h6m16 10v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15', stroke: true },

  // --- People & Communication ---
  { name: 'User', category: 'People', path: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8z', stroke: true },
  { name: 'Users', category: 'People', path: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m22 0v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M12 7a4 4 0 11-8 0 4 4 0 018 0z', stroke: true },
  { name: 'Chat', category: 'People', path: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', stroke: true },
  { name: 'Mail', category: 'People', path: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm16 2l-8 5-8-5', stroke: true },
  { name: 'Phone', category: 'People', path: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z', stroke: true },

  // --- Business & Data ---
  { name: 'Bar Chart', category: 'Business', path: 'M18 20V10M12 20V4M6 20v-6', stroke: true },
  { name: 'Pie Chart', category: 'Business', path: 'M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z', stroke: true },
  { name: 'Trending Up', category: 'Business', path: 'M23 6l-9.5 9.5-5-5L1 18m22-12h-6v6', stroke: true },
  { name: 'Trending Down', category: 'Business', path: 'M23 18l-9.5-9.5-5 5L1 6m22 12h-6v-6', stroke: true },
  { name: 'Dollar', category: 'Business', path: 'M12 1v22m5-18H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H7', stroke: true },
  { name: 'Briefcase', category: 'Business', path: 'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16', stroke: true },
  { name: 'Calendar', category: 'Business', path: 'M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18', stroke: true },
  { name: 'Clipboard', category: 'Business', path: 'M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2m4-2h4a1 1 0 011 1v1a1 1 0 01-1 1h-4a1 1 0 01-1-1V3a1 1 0 011-1z', stroke: true },

  // --- Technology ---
  { name: 'Monitor', category: 'Tech', path: 'M2 3h20v14H2zM8 21h8m-4-4v4', stroke: true },
  { name: 'Smartphone', category: 'Tech', path: 'M17 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2zM12 18h.01', stroke: true },
  { name: 'Cloud', category: 'Tech', path: 'M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z', stroke: true },
  { name: 'Database', category: 'Tech', path: 'M12 2C6.48 2 2 3.79 2 6v12c0 2.21 4.48 4 10 4s10-1.79 10-4V6c0-2.21-4.48-4-10-4zM2 6c0 2.21 4.48 4 10 4s10-1.79 10-4M2 12c0 2.21 4.48 4 10 4s10-1.79 10-4', stroke: true },
  { name: 'Globe', category: 'Tech', path: 'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z', stroke: true },
  { name: 'Wifi', category: 'Tech', path: 'M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01', stroke: true },
  { name: 'Lock', category: 'Tech', path: 'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4', stroke: true },
  { name: 'Shield', category: 'Tech', path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', stroke: true },
  { name: 'Code', category: 'Tech', path: 'M16 18l6-6-6-6M8 6l-6 6 6 6', stroke: true },
  { name: 'Terminal', category: 'Tech', path: 'M4 17l6-5-6-5m8 14h8', stroke: true },
  { name: 'Git Branch', category: 'Tech', path: 'M6 3v12m0 0a3 3 0 103 3M18 9a3 3 0 10-3-3m0 0v6a3 3 0 01-3 3H9', stroke: true },

  // --- Objects & Symbols ---
  { name: 'Star', category: 'Symbols', path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { name: 'Heart', category: 'Symbols', path: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' },
  { name: 'Lightning', category: 'Symbols', path: 'M13 2L3 14h9l-1 10 10-12h-9l1-10z' },
  { name: 'Flag', category: 'Symbols', path: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zm0 7v-7', stroke: true },
  { name: 'Award', category: 'Symbols', path: 'M12 15a7 7 0 100-14 7 7 0 000 14zm-3.24 1.42L7 23l5-3 5 3-1.76-6.58', stroke: true },
  { name: 'Zap', category: 'Symbols', path: 'M13 2L3 14h9l-1 10 10-12h-9l1-10z' },
  { name: 'Bulb', category: 'Symbols', path: 'M9 21h6m-6-3h6a7 7 0 10-6 0zM10 17v-2.5a3.5 3.5 0 01.67-2.06L12 11l1.33 1.44A3.5 3.5 0 0114 14.5V17', stroke: true },
  { name: 'Target', category: 'Symbols', path: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 18a6 6 0 100-12 6 6 0 000 12zM12 14a2 2 0 100-4 2 2 0 000 4z', stroke: true },
  { name: 'Clock', category: 'Symbols', path: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2', stroke: true },
  { name: 'Settings', category: 'Symbols', path: 'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z', stroke: true },

  // --- Hands & Gestures ---
  { name: 'Thumbs Up', category: 'Gestures', path: 'M14 9V5a3 3 0 00-6 0v0l-2 8h12.5a2.5 2.5 0 002.46-2.95l-.83-5A2.5 2.5 0 0017.63 3H14zM2 13h4v8H2z', stroke: true },
  { name: 'Thumbs Down', category: 'Gestures', path: 'M10 15v4a3 3 0 006 0v0l2-8H5.5a2.5 2.5 0 01-2.46-2.95l.83-5A2.5 2.5 0 016.37 1H10zM22 3h-4v8h4z', stroke: true },

  // --- Misc ---
  { name: 'Eye', category: 'Misc', path: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z', stroke: true },
  { name: 'Bell', category: 'Misc', path: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0', stroke: true },
  { name: 'Camera', category: 'Misc', path: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 17a4 4 0 100-8 4 4 0 000 8z', stroke: true },
  { name: 'Map Pin', category: 'Misc', path: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 13a3 3 0 100-6 3 3 0 000 6z', stroke: true },
  { name: 'Gift', category: 'Misc', path: 'M20 12v10H4V12m16 0H4m16 0h1M3 12h1m8-2V2m0 0c-1.5 0-4.5 1.5-4.5 4H12M12 2c1.5 0 4.5 1.5 4.5 4H12M2 7h20v5H2z', stroke: true },
  { name: 'Rocket', category: 'Misc', path: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3m3 3a22 22 0 005-8 22 22 0 00-13 5l3 3m0 0l-2 7 7-2m-5-5l3 3', stroke: true },
  { name: 'Coffee', category: 'Misc', path: 'M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3', stroke: true },
];

function buildIconSvg(icon, size = 24, color = '#333333') {
  const strokeAttr = icon.stroke
    ? `stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"`
    : `fill="${color}" stroke="none"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" ${strokeAttr}><path d="${icon.path}"/></svg>`;
}

function buildIconDataUrl(icon, size = 256, color = '#333333') {
  const svg = buildIconSvg(icon, size, color);
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

export { iconLibrary, buildIconSvg, buildIconDataUrl };
