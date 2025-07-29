const { generateCoastalFallback } = require('../routes/routingRoutes');
const coastalRoutes = require('../data/coastalRoutes.json');

describe('coastal route utilities', () => {
  test('generateCoastalFallback returns path starting and ending at provided points', () => {
    const start = [29.7050, -95.0030]; // Houston
    const end = [29.9511, -90.0715];  // New Orleans
    const path = generateCoastalFallback(start, end);
    expect(Array.isArray(path)).toBe(true);
    expect(path.length).toBeGreaterThan(2);
    expect(path[0]).toEqual(start);
    expect(path[path.length - 1]).toEqual(end);
  });

  test('coastalRoutes dataset has waypoints for known route', () => {
    const key = 'Houston, TX-New Orleans, LA';
    expect(coastalRoutes[key]).toBeDefined();
    expect(coastalRoutes[key].waypoints.length).toBeGreaterThan(0);
  });
});
