function fmtDist(m, imperial = typeof IMPERIAL !== 'undefined' ? IMPERIAL : false) {
  if (imperial) {
    const ft = m * 3.28084;
    if (ft < 1000) return Math.max(10, Math.round(ft / 10) * 10) + ' ft';
    const mi = ft / 5280;
    return (mi < 10 ? mi.toFixed(1) : Math.round(mi)) + ' mi';
  }
  if (m < 1000) return Math.max(10, Math.round(m / 10) * 10) + ' m';
  const km = m / 1000;
  return (km < 10 ? km.toFixed(1) : Math.round(km)) + ' km';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fmtDist };
}
