const { getDistance } = require('./distanceMatrix');

class PipelineService {
  constructor() {
    this.pipelineNetworks = {
      'Houston, TX': {
        connections: {
          'New Orleans, LA': { distance: 340, systems: ['Enterprise', 'Kinder Morgan'], capacity: 'high' },
          'Mobile, AL': { distance: 342, systems: ['Colonial', 'Plantation'], capacity: 'medium' },
          'Chicago, IL': { distance: 925, systems: ['Explorer'], capacity: 'high' },
          'St. Louis, MO': { distance: 679, systems: ['Magellan'], capacity: 'medium' }
        },
        hub_type: 'major_petrochemical',
        fuel_types: ['methanol', 'ammonia'],
        infrastructure: 'extensive'
      },
      'Chicago, IL': {
        connections: {
          'Houston, TX': { distance: 925, systems: ['Explorer'], capacity: 'high' },
          'St. Louis, MO': { distance: 300, systems: ['Magellan', 'Explorer'], capacity: 'high' },
          'Memphis, TN': { distance: 530, systems: ['Plantation'], capacity: 'medium' },
          'Duluth-Superior, MN/WI': { distance: 350, systems: ['Enbridge'], capacity: 'low' }
        },
        hub_type: 'distribution_center',
        fuel_types: ['methanol', 'ammonia'],
        infrastructure: 'good'
      },
      'Los Angeles, CA': {
        connections: {
          'San Francisco/Oakland, CA': { distance: 382, systems: ['Kinder Morgan'], capacity: 'medium' },
          'Long Beach, CA': { distance: 25, systems: ['Local Network'], capacity: 'high' }
        },
        hub_type: 'west_coast_terminal',
        fuel_types: ['methanol', 'ammonia'],
        infrastructure: 'limited'
      },
      'New Orleans, LA': {
        connections: {
          'Houston, TX': { distance: 340, systems: ['Enterprise'], capacity: 'high' },
          'Mobile, AL': { distance: 145, systems: ['Colonial'], capacity: 'medium' },
          'Memphis, TN': { distance: 358, systems: ['Plantation'], capacity: 'low' }
        },
        hub_type: 'port_terminal',
        fuel_types: ['methanol', 'ammonia'],
        infrastructure: 'good'
      },
      'St. Louis, MO': {
        connections: {
          'Chicago, IL': { distance: 300, systems: ['Magellan'], capacity: 'high' },
          'Houston, TX': { distance: 679, systems: ['Magellan'], capacity: 'medium' },
          'Memphis, TN': { distance: 285, systems: ['Plantation'], capacity: 'low' }
        },
        hub_type: 'inland_hub',
        fuel_types: ['methanol'],
        infrastructure: 'good'
      },
      'Memphis, TN': {
        connections: {
          'Chicago, IL': { distance: 530, systems: ['Plantation'], capacity: 'medium' },
          'New Orleans, LA': { distance: 358, systems: ['Plantation'], capacity: 'low' },
          'St. Louis, MO': { distance: 285, systems: ['Plantation'], capacity: 'low' }
        },
        hub_type: 'inland_hub',
        fuel_types: ['methanol'],
        infrastructure: 'limited'
      }
    };

    this.capacityLevels = {
      'high': { capacity_bpd: 500000, flow_rate: 'fast' },
      'medium': { capacity_bpd: 200000, flow_rate: 'moderate' },
      'low': { capacity_bpd: 50000, flow_rate: 'slow' }
    };

    this.fuelCompatibility = {
      'hydrogen': {
        compatible: false,
        reason: 'Hydrogen requires specialized pipelines due to embrittlement issues',
        alternative: 'Dedicated hydrogen pipeline networks (limited availability)'
      },
      'methanol': {
        compatible: true,
        reason: 'Methanol can use existing refined product pipelines with modifications',
        requirements: ['corrosion-resistant materials', 'water removal systems']
      },
      'ammonia': {
        compatible: true,
        reason: 'Ammonia has dedicated pipeline infrastructure',
        requirements: ['specialized steel', 'pressure management', 'safety systems']
      }
    };

    this.isAvailable = true;
    console.log('⛽ Pipeline service initialized with US pipeline network data');
  }

  // Update getPipelineRoute function (replace existing):
async getPipelineRoute(origin, destination, fuelType) {
  try {
    console.log(`⛽ Calculating pipeline route: ${origin} → ${destination} for ${fuelType}`);

    // Check fuel compatibility first
    const compatibility = this.checkFuelCompatibility(fuelType);
    if (!compatibility.compatible) {
      throw new Error(`Pipeline transport not suitable for ${fuelType}: ${compatibility.reason}`);
    }

    // Check our distance matrix for pipeline availability
    const pipelineDistance = getDistance(origin, destination, 'pipeline');
    
    if (!pipelineDistance) {
      throw new Error(`No pipeline infrastructure available between ${origin} and ${destination}`);
    }

    return {
      distance_miles: pipelineDistance,
      duration_hours: Math.max(6, pipelineDistance / 100), // Minimum 6 hours
      route_type: 'pipeline',
      route_path: [origin, destination],
      pipeline_systems: ['US Pipeline Network'],
      capacity_level: 'medium',
      routing_method: 'pipeline_network',
      fuel_type: fuelType,
      continuous_flow: true,
      infrastructure_quality: 'good'
    };

  } catch (error) {
    console.error('Pipeline routing error:', error.message);
    throw error;
  }
}

  // ✅ UPDATED createPipelineRouteResponse with full calculation
  createPipelineRouteResponse(origin, destination, routeData, path, fuelType) {
    const flowTimeHours = Math.max(12, routeData.distance / 50);
    const connectionTime = (path.length - 1) * 4;
    const totalTime = flowTimeHours + connectionTime;

    console.log(`⛽ Pipeline route: ${origin} → ${destination}: ${routeData.distance} miles, ${totalTime} hours`);

    return {
      distance_miles: routeData.distance,
      duration_hours: totalTime,
      route_type: 'pipeline',
      route_path: path,
      pipeline_systems: routeData.systems,
      routing_method: 'pipeline_network',
      fuel_type: fuelType,
      continuous_flow: true
    };
  }

  checkFuelCompatibility(fuelType) {
    return this.fuelCompatibility[fuelType] || {
      compatible: false,
      reason: `${fuelType} compatibility not defined for pipeline transport`
    };
  }

  findDirectPipelineRoute(origin, destination, fuelType) {
    const originHub = this.pipelineNetworks[origin];
    if (!originHub) return null;

    const connection = originHub.connections[destination];
    if (!connection) return null;

    if (!originHub.fuel_types.includes(fuelType)) return null;

    return {
      distance: connection.distance,
      systems: connection.systems,
      capacity: connection.capacity,
      infrastructure: originHub.infrastructure
    };
  }

  findPipelineNetworkRoute(origin, destination, fuelType) {
    const visited = new Set();
    const queue = [{ location: origin, distance: 0, path: [origin], systems: [] }];

    while (queue.length > 0) {
      const current = queue.shift();

      if (current.location === destination) {
        return this.createPipelineRouteResponse(
          origin,
          destination,
          {
            distance: current.distance,
            systems: [...new Set(current.systems)],
            capacity: this.getWorstCapacity(current.path),
            infrastructure: 'network'
          },
          current.path,
          fuelType
        );
      }

      if (visited.has(current.location)) continue;
      visited.add(current.location);

      const hub = this.pipelineNetworks[current.location];
      if (!hub || !hub.fuel_types.includes(fuelType)) continue;

      for (const [nextLocation, connectionData] of Object.entries(hub.connections)) {
        if (visited.has(nextLocation)) continue;

        queue.push({
          location: nextLocation,
          distance: current.distance + connectionData.distance,
          path: [...current.path, nextLocation],
          systems: [...current.systems, ...connectionData.systems]
        });
      }

      queue.sort((a, b) => a.distance - b.distance);
    }

    return null;
  }

  getWorstCapacity(path) {
    const capacities = ['high', 'medium', 'low'];
    let worst = 'high';

    for (let i = 0; i < path.length - 1; i++) {
      const hub = this.pipelineNetworks[path[i]];
      if (hub && hub.connections[path[i + 1]]) {
        const cap = hub.connections[path[i + 1]].capacity;
        if (capacities.indexOf(cap) > capacities.indexOf(worst)) {
          worst = cap;
        }
      }
    }

    return worst;
  }

  hasPipelineAccess(location, fuelType) {
    const hub = this.pipelineNetworks[location];
    return !!(hub && hub.fuel_types.includes(fuelType));
  }

  getPipelineConnections(location, fuelType) {
    const hub = this.pipelineNetworks[location];
    if (!hub || !hub.fuel_types.includes(fuelType)) return [];
    return Object.keys(hub.connections).filter(dest => {
      const destHub = this.pipelineNetworks[dest];
      return destHub && destHub.fuel_types.includes(fuelType);
    });
  }

  getPipelineHubs(fuelType) {
    return Object.entries(this.pipelineNetworks)
      .filter(([_, hub]) => hub.fuel_types.includes(fuelType))
      .map(([location, hub]) => ({
        location,
        hub_type: hub.hub_type,
        infrastructure: hub.infrastructure,
        connections: Object.keys(hub.connections).length
      }));
  }

  getPipelineCapacity(origin, destination) {
    const hub = this.pipelineNetworks[origin];
    if (!hub || !hub.connections[destination]) return null;

    const connection = hub.connections[destination];
    const capacityData = this.capacityLevels[connection.capacity];

    return {
      capacity_level: connection.capacity,
      capacity_bpd: capacityData.capacity_bpd,
      flow_rate: capacityData.flow_rate,
      systems: connection.systems
    };
  }

  async healthCheck() {
    return this.isAvailable && Object.keys(this.pipelineNetworks).length > 0;
  }
}

module.exports = new PipelineService();
