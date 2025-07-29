// Non-port inland locations that cannot originate or terminate ship routes
const NON_PORT_LOCATIONS = ['St. Louis, MO', 'Memphis, TN'];

// Pairs that have no navigable waterway connections
const IMPOSSIBLE_ROUTES = new Set([
  'St. Louis, MO-Houston, TX',
  'St. Louis, MO-New Orleans, LA',
  'St. Louis, MO-Mobile, AL',
  'St. Louis, MO-Tampa Bay, FL',
  'St. Louis, MO-Savannah, GA',
  'St. Louis, MO-Jacksonville, FL',
  'St. Louis, MO-Miami, FL',
  'St. Louis, MO-New York/NJ',
  'St. Louis, MO-Philadelphia, PA',
  'St. Louis, MO-Norfolk, VA',
  'St. Louis, MO-Boston, MA',
  'St. Louis, MO-Long Beach, CA',
  'St. Louis, MO-Los Angeles, CA',
  'St. Louis, MO-Seattle, WA',
  'St. Louis, MO-Portland, OR',
  'St. Louis, MO-San Francisco/Oakland, CA',
  'St. Louis, MO-Chicago, IL',
  'St. Louis, MO-Duluth-Superior, MN/WI',
  'Memphis, TN-Houston, TX',
  'Memphis, TN-New Orleans, LA',
  'Memphis, TN-Mobile, AL',
  'Memphis, TN-Tampa Bay, FL',
  'Memphis, TN-Savannah, GA',
  'Memphis, TN-Jacksonville, FL',
  'Memphis, TN-Miami, FL',
  'Memphis, TN-New York/NJ',
  'Memphis, TN-Philadelphia, PA',
  'Memphis, TN-Norfolk, VA',
  'Memphis, TN-Boston, MA',
  'Memphis, TN-Long Beach, CA',
  'Memphis, TN-Los Angeles, CA',
  'Memphis, TN-Seattle, WA',
  'Memphis, TN-Portland, OR',
  'Memphis, TN-San Francisco/Oakland, CA',
  'Memphis, TN-Chicago, IL',
  'Memphis, TN-Duluth-Superior, MN/WI'
]);

function isWinterClosed(origin, destination) {
  const m = new Date().getMonth();
  const winter = m === 11 || m <= 2; // Dec–Mar
  const glPorts = ['Chicago, IL', 'Duluth-Superior, MN/WI'];
  return winter && (glPorts.includes(origin) || glPorts.includes(destination));
}

function isRouteAllowed(origin, destination) {
  if (NON_PORT_LOCATIONS.includes(origin) || NON_PORT_LOCATIONS.includes(destination)) {
    return false;
  }
  const pair1 = `${origin}-${destination}`;
  const pair2 = `${destination}-${origin}`;
  if (IMPOSSIBLE_ROUTES.has(pair1) || IMPOSSIBLE_ROUTES.has(pair2)) {
    return false;
  }
  if (isWinterClosed(origin, destination)) {
    return false;
  }
  return true;
}

class MaritimeService {
  constructor() {
    this.shippingRoutes = {
      // ✅ West Coast Coastal Routes with waypoints
      'Los Angeles, CA-San Francisco/Oakland, CA': {
        distance_nm: 347,
        distance_miles: 399,
        route_type: 'coastal',
        waypoints: [
          [33.7292, -118.2620],
          [35.3606, -120.8493],
          [36.6002, -121.8947],
          [37.8044, -122.2712]
        ],
        shipping_lanes: ['Pacific Coast'],
        transit_days: 2
      },
      'Los Angeles, CA-Seattle, WA': {
        distance_nm: 1089,
        distance_miles: 1253,
        route_type: 'coastal',
        waypoints: [
          [33.7292, -118.2620],
          [36.6002, -121.8947],
          [39.1612, -123.7881],
          [43.3504, -124.3738],
          [46.2816, -124.0833],
          [47.6062, -122.3321]
        ],
        shipping_lanes: ['Pacific Coast'],
        transit_days: 5
      },
      'Los Angeles, CA-Portland, OR': {
        distance_nm: 827,
        distance_miles: 952,
        route_type: 'coastal',
        waypoints: [
          [33.7292, -118.2620],
          [36.6002, -121.8947],
          [39.1612, -123.7881],
          [43.3504, -124.3738],
          [45.5152, -122.6784]
        ],
        shipping_lanes: ['Pacific Coast'],
        transit_days: 4
      },

      // ✅ Gulf Coast coastal with waypoints
      'Houston, TX-New Orleans, LA': {
        distance_nm: 305,
        distance_miles: 351,
        route_type: 'coastal',
        waypoints: [
          [29.7050, -95.0030],
          [29.4724, -94.0572],
          [29.9355, -90.0572]
        ],
        shipping_lanes: ['Gulf Intracoastal Waterway'],
        transit_days: 2
      },
      'Houston, TX-Mobile, AL': {
        distance_nm: 304,
        distance_miles: 350,
        route_type: 'coastal',
        waypoints: [
          [29.7050, -95.0030],
          [29.4724, -94.0572],
          [30.6944, -88.0431]
        ],
        shipping_lanes: ['Gulf Coast'],
        transit_days: 2
      },

      // ✅ Atlantic Coast coastal with waypoints
      'New York/NJ-Norfolk, VA': {
        distance_nm: 290,
        distance_miles: 334,
        route_type: 'coastal',
        waypoints: [
          [40.7128, -74.0060],
          [39.3558, -74.4208],
          [37.5407, -75.9665],
          [36.8468, -76.2852]
        ],
        shipping_lanes: ['Atlantic Coast'],
        transit_days: 2
      },
      'Norfolk, VA-Savannah, GA': {
        distance_nm: 320,
        distance_miles: 368,
        route_type: 'coastal',
        waypoints: [
          [36.8468, -76.2852],
          [35.2271, -75.5449],
          [33.8734, -78.8808],
          [32.0835, -81.0998]
        ],
        shipping_lanes: ['Atlantic Coast'],
        transit_days: 2
      },
      'Miami, FL-Norfolk, VA': {
        distance_nm: 720,
        distance_miles: 829,
        route_type: 'coastal',
        waypoints: [
          [25.7617, -80.1918],
          [30.3322, -81.6557],
          [32.0835, -81.0998],
          [33.8734, -78.8808],
          [35.2271, -75.5449],
          [36.8468, -76.2852]
        ],
        shipping_lanes: ['Atlantic Coast'],
        transit_days: 4
      },

      // 🌎 Existing routes retained (unchanged) ↓
      'New Orleans, LA-Mobile, AL': {
        distance_nm: 130,
        distance_miles: 150,
        route_type: 'coastal',
        shipping_lanes: ['Gulf Coast'],
        transit_days: 1
      },
      'Houston, TX-Tampa Bay, FL': {
        distance_nm: 750,
        distance_miles: 863,
        route_type: 'coastal',
        shipping_lanes: ['Gulf of Mexico'],
        transit_days: 3
      },
      'New York/NJ-Philadelphia, PA': {
        distance_nm: 100,
        distance_miles: 115,
        route_type: 'coastal',
        shipping_lanes: ['Atlantic Intracoastal'],
        transit_days: 1
      },
      'Savannah, GA-Jacksonville, FL': {
        distance_nm: 110,
        distance_miles: 127,
        route_type: 'coastal',
        shipping_lanes: ['Atlantic Coast'],
        transit_days: 1
      },
      'Jacksonville, FL-Miami, FL': {
        distance_nm: 290,
        distance_miles: 334,
        route_type: 'coastal',
        shipping_lanes: ['Atlantic Coast'],
        transit_days: 2
      },
      'Los Angeles, CA-Long Beach, CA': {
        distance_nm: 20,
        distance_miles: 23,
        route_type: 'port_to_port',
        shipping_lanes: ['San Pedro Bay'],
        transit_days: 0.5
      },
      'San Francisco/Oakland, CA-Seattle, WA': {
        distance_nm: 700,
        distance_miles: 806,
        route_type: 'coastal',
        shipping_lanes: ['Pacific Coast'],
        transit_days: 3
      },
      'Seattle, WA-Portland, OR': {
        distance_nm: 290,
        distance_miles: 334,
        route_type: 'coastal',
        shipping_lanes: ['Pacific Northwest'],
        transit_days: 2
      },
      'Los Angeles, CA-Houston, TX': {
        distance_nm: 3200,
        distance_miles: 3684,
        route_type: 'panama_canal',
        waypoints: [
          [33.7292, -118.2620],
          [23.033, -109.7],
          [15.0, -96.0],
          [9.0, -79.6],
          [9.1, -79.8],
          [9.3, -79.9],
          [21.5, -86.9],
          [25.3, -90.0],
          [27.0, -94.0],
          [29.7050, -95.0030]
        ],
        shipping_lanes: ['Panama Canal Route'],
        transit_days: 14
      },
      'Los Angeles, CA-New Orleans, LA': {
        distance_nm: 3400,
        distance_miles: 3914,
        route_type: 'panama_canal',
        waypoints: [
          [33.7292, -118.2620],
          [23.033, -109.7],
          [15.0, -96.0],
          [9.0, -79.6],
          [9.1, -79.8],
          [9.3, -79.9],
          [21.5, -86.9],
          [26.0, -90.0],
          [28.0, -91.0],
          [29.9355, -90.0572]
        ],
        shipping_lanes: ['Panama Canal Route'],
        transit_days: 15
      },
      'Seattle, WA-New York/NJ': {
        distance_nm: 5200,
        distance_miles: 5984,
        route_type: 'panama_canal',
        shipping_lanes: ['Panama Canal Route'],
        transit_days: 22
      },
      // Seasonal Great Lakes route (closed Dec–Mar)
      'Chicago, IL-Duluth-Superior, MN/WI': {
        distance_nm: 430,
        distance_miles: 495,
        route_type: 'great_lakes',
        shipping_lanes: ['Great Lakes Seaway'],
        transit_days: 2
      }
    };

    // Port handling unchanged
    this.portCapabilities = {
      'Houston, TX': {
        hydrogen: { cryogenic: true, pressurized: true },
        methanol: { bulk_liquid: true, iso_tanks: true },
        ammonia: { refrigerated: true, pressurized: true },
        port_type: 'major_chemical_port'
      },
      'Long Beach, CA': {
        hydrogen: { cryogenic: true, pressurized: false },
        methanol: { bulk_liquid: true, iso_tanks: true },
        ammonia: { refrigerated: true, pressurized: true },
        port_type: 'container_port'
      },
      'New York/NJ': {
        hydrogen: { cryogenic: false, pressurized: true },
        methanol: { bulk_liquid: true, iso_tanks: true },
        ammonia: { refrigerated: true, pressurized: false },
        port_type: 'general_cargo_port'
      },
      'Seattle, WA': {
        hydrogen: { cryogenic: true, pressurized: true },
        methanol: { bulk_liquid: true, iso_tanks: true },
        ammonia: { refrigerated: true, pressurized: true },
        port_type: 'bulk_port'
      }
    };

    this.isAvailable = true;
    console.log('🚢 Maritime service initialized with shipping lane data');
  }

  // All other methods unchanged...

  createShipRouteResponse(origin, destination, routeData, path) {
    console.log(`🚢 Ship route: ${origin} → ${destination}: ${routeData.distance_miles} miles, ${routeData.transit_days} days`);

    return {
      distance_miles: routeData.distance_miles,
      distance_nautical_miles: routeData.distance_nm,
      duration_hours: routeData.transit_days * 24,
      transit_days: routeData.transit_days,
      route_type: routeData.route_type,
      route_path: routeData.waypoints || path,
      shipping_lanes: routeData.shipping_lanes,
      routing_method: 'maritime_lanes',
      average_speed_knots: 15,
      average_speed_mph: 17,
      port_processing_time: 24,
      vessel_type: 'chemical_tanker',
      waypoints: routeData.waypoints || [],
      coastal_route: routeData.route_type === 'coastal',
      special_requirements: this.getFuelRequirements(origin, destination)
    };
  }

  // ✅ UPDATED: Use distance matrix for consistent routing
  async getShipRoute(origin, destination) {
    try {
      console.log(`🚢 Calculating ship route: ${origin} → ${destination}`);

      if (!isRouteAllowed(origin, destination)) {
        throw new Error('Ship route not possible between ' + origin + ' and ' + destination);
      }
      
      // Import distance matrix
      const { getDistance } = require('./distanceMatrix');
      
      // Check if ship route is available in distance matrix
      const distance = getDistance(origin, destination, 'ship');
      
      if (!distance) {
        throw new Error(`No ship route available between ${origin} and ${destination}`);
      }
      
      // Calculate transit time based on distance
      const averageSpeedMph = 17; // cargo ship average
      const transitHours = Math.round((distance / averageSpeedMph) * 10) / 10;
      const transitDays = Math.round((transitHours / 24) * 10) / 10;
      
      // Check if we have detailed route data
      const routeKey1 = `${origin}-${destination}`;
      const routeKey2 = `${destination}-${origin}`;
      const detailedRoute = this.shippingRoutes[routeKey1] || this.shippingRoutes[routeKey2];
      
      if (detailedRoute) {
        // Use detailed route data if available
        return this.createShipRouteResponse(origin, destination, {
          distance_miles: distance,
          distance_nm: Math.round(distance * 0.868976), // miles to nautical miles
          transit_days: detailedRoute.transit_days || transitDays,
          route_type: detailedRoute.route_type || 'coastal',
          shipping_lanes: detailedRoute.shipping_lanes || ['General Shipping Lane'],
          waypoints: detailedRoute.waypoints || []
        }, [origin, destination]);
      } else {
        // Use distance matrix data
        return this.createShipRouteResponse(origin, destination, {
          distance_miles: distance,
          distance_nm: Math.round(distance * 0.868976),
          transit_days: transitDays,
          route_type: 'estimated_route',
          shipping_lanes: ['General Shipping Lane'],
          waypoints: []
        }, [origin, destination]);
      }
      
    } catch (error) {
      console.error('Ship routing error:', error.message);
      throw error;
    }
  }

  getFuelRequirements(origin, destination) {
    // Basic fuel requirements for chemical transport
    return {
      vessel_type: 'chemical_tanker',
      special_handling: true,
      hazmat_certified: true,
      temperature_controlled: true
    };
  }

  hasPortAccess(location) {
    return !!this.portCapabilities[location];
  }

  getNearbyPorts(location) {
    // Return list of ports that have ship connections
    const { getAvailableRoutes } = require('./distanceMatrix');
    return getAvailableRoutes(location, 'ship').map(route => route.destination);
  }

  async healthCheck() {
    return this.isAvailable && Object.keys(this.shippingRoutes).length > 0;
  }
}

module.exports = new MaritimeService();
