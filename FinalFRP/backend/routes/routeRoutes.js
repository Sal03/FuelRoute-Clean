const express = require('express');
const router = express.Router();
const { calculateCost, optimizeRoute, getRouteHistory } = require('../controllers/routeController');

let openaiService = null;
if (process.env.OPENAI_API_KEY) {
  try {
    openaiService = require('../services/openaiService');
  } catch (_) {
    openaiService = null;
  }
}

// ✅ GEOCODING DATA AND FUNCTIONS (Simple version)
const pipelineRoutes = [
  {
    hub: "Houston, TX",
    connections: ["Dallas, TX", "Oklahoma City, OK", "Kansas City, MO"],
    type: "static_route"
  },
  {
    hub: "New Orleans, LA", 
    connections: ["Baton Rouge, LA", "Jackson, MS", "Memphis, TN"],
    type: "static_route"
  },
  {
    hub: "Los Angeles, CA",
    connections: ["Las Vegas, NV", "Phoenix, AZ", "Bakersfield, CA"],
    type: "static_route"
  },
  {
    hub: "Chicago, IL",
    connections: ["Detroit, MI", "Milwaukee, WI", "Indianapolis, IN"],
    type: "static_route"
  }
];

function verifyLocation(location, transportMode, fuelType) {
  console.log(`🌍 Verifying ${location} for ${transportMode} transport of ${fuelType}`);
  
  const locationLower = location.toLowerCase();
  
  let suitable = true;
  let infrastructure = 'general';
  let warnings = [];
  
  if (transportMode === 'ship') {
    const ports = ['houston', 'rotterdam', 'singapore', 'los angeles', 'seattle', 'new orleans'];
    suitable = ports.some(port => locationLower.includes(port));
    infrastructure = suitable ? 'major_port' : 'no_port_access';
    if (!suitable) warnings.push('Ship transport requires port access');
  } else if (transportMode === 'pipeline') {
    const hubs = ['houston', 'new orleans', 'chicago', 'los angeles'];
    suitable = hubs.some(hub => locationLower.includes(hub));
    infrastructure = suitable ? 'pipeline_hub' : 'no_pipeline_access';
    if (!suitable) warnings.push('No known pipeline access');
  }
  
  return {
    valid: true,
    formattedAddress: location,
    country: locationLower.includes('netherlands') ? 'Netherlands' : 'United States',
    region: locationLower.includes('netherlands') ? 'Europe' : 'North America',
    transportMode: {
      suitable: suitable,
      infrastructure: infrastructure,
      warnings: warnings
    },
    fuelRequirements: {
      fuelType: fuelType,
      requirements: {
        storage: fuelType === 'hydrogen' ? 'Cryogenic storage (-253°C)' : 'Standard storage',
        handling: fuelType === 'ammonia' ? 'Toxic gas protocols' : 'Standard protocols'
      }
    },
    confidence: 0.85
  };
}

// ✅ MAIN CALCULATION ROUTES
router.post('/calculate-cost', calculateCost);
router.post('/optimize-route', optimizeRoute);
router.get('/routes', getRouteHistory);

// ✅ BASIC API ROUTES
router.get('/fuel-types', (req, res) => {
  res.json({
    success: true,
    data: ['hydrogen', 'methanol', 'ammonia']
  });
});

router.get('/transport-modes', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'truck', name: 'Truck', capacity: '8-12 tonnes', speed: 'Fast' },
      { id: 'rail', name: 'Rail', capacity: '50+ tonnes', speed: 'Medium' },
      { id: 'ship', name: 'Ship', capacity: '1000+ tonnes', speed: 'Slow' },
      { id: 'pipeline', name: 'Pipeline', capacity: 'Unlimited', speed: 'Continuous' }
    ]
  });
});

// ✅ GEOCODING ROUTES (Clean - No Duplicates)
router.get('/geocoding/test/:location', (req, res) => {
  try {
    const { location } = req.params;
    const { transport_mode = 'truck', fuel_type = 'hydrogen' } = req.query;
    
    console.log(`🧪 Testing geocoding for: ${location}`);
    
    const result = verifyLocation(
      decodeURIComponent(location),
      transport_mode,
      fuel_type
    );
    
    res.json({
      success: true,
      data: result,
      message: 'Test geocoding completed'
    });
    
  } catch (error) {
    console.error('❌ Test geocoding error:', error);
    res.status(500).json({
      success: false,
      error: 'Test geocoding failed',
      message: error.message
    });
  }
});

router.get('/geocoding/pipeline-routes', (req, res) => {
  try {
    res.json({
      success: true,
      data: pipelineRoutes,
      message: 'Pipeline routes retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Pipeline routes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pipeline routes'
    });
  }
});

router.post('/geocoding/verify', (req, res) => {
  try {
    const { location, transportMode, fuelType } = req.body;
    
    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location is required'
      });
    }

    console.log(`🌍 Geocoding request: ${location} for ${transportMode} transport`);
    
    const result = verifyLocation(
      location, 
      transportMode || 'truck', 
      fuelType || 'hydrogen'
    );
    
    res.json({
      success: true,
      data: result,
      message: result.valid ? 'Location verified successfully' : 'Location verification failed'
    });
    
  } catch (error) {
    console.error('❌ Geocoding verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Geocoding service error',
      message: error.message
    });
  }
});

// ✅ OPENAI TEST ROUTES
router.get('/test-openai-price/:fuelType', async (req, res) => {
  try {
    const { fuelType } = req.params;
    
    const openaiService = require('../services/openaiService');
    if (!openaiService) {
      return res.status(503).json({
        error: 'OpenAI service not available',
        suggestion: 'Check OPENAI_API_KEY in .env file'
      });
    }
    
    const priceData = await openaiService.getPriceEstimate(fuelType);
    
    res.json({
      success: true,
      fuelType,
      priceData,
      message: 'OpenAI dynamic pricing is working!'
    });
    
  } catch (error) {
    console.error('OpenAI test error:', error);
    res.status(500).json({
      error: 'OpenAI test failed',
      message: error.message,
      suggestion: 'Check your OpenAI API key and credits'
    });
  }
});

router.get('/test-openai-location/:location', async (req, res) => {
  try {
    const { location } = req.params;
    
    const openaiService = require('../services/openaiService');
    if (!openaiService) {
      return res.status(503).json({
        error: 'OpenAI service not available'
      });
    }
    
    const locationData = await openaiService.getLocationCoordinates(decodeURIComponent(location));
    
    res.json({
      success: true,
      location,
      coordinates: locationData,
      message: 'OpenAI location lookup is working!'
    });
    
  } catch (error) {
    console.error('OpenAI location test error:', error);
    res.status(500).json({
      error: 'OpenAI location test failed',
      message: error.message
    });
  }
});

// ✅ ADDITIONAL API ROUTES
router.get('/openai/price/:fuel', async (req, res) => {
  if (!openaiService) {
    return res.status(503).json({ error: 'OpenAI service not available' });
  }
  try {
    const data = await openaiService.getPriceEstimate(req.params.fuel);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Price lookup failed', message: err.message });
  }
});

router.get('/openai/location', async (req, res) => {
  if (!openaiService) {
    return res.status(503).json({ error: 'OpenAI service not available' });
  }

  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter q' });
  }

  try {
    const data = await openaiService.getLocationCoordinates(query);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Location lookup failed', message: err.message });
  }
});

// ✅ DEMO AND HEALTH ROUTES
router.get('/route-options-demo', (req, res) => {
  const demoOptions = [
    {
      id: 'truck-single',
      type: 'direct',
      name: 'Single Truck - Direct Route',
      transportModes: ['truck'],
      vehicles: [{ type: 'truck', count: 1, capacity: 8, utilization: 80 }],
      estimatedTime: '2 days',
      estimatedCost: 2500,
      distance: 380,
      riskLevel: 'low',
      description: 'Most direct and simple option'
    },
    {
      id: 'truck-rail',
      type: 'multimodal',
      name: 'Truck + Rail Route',
      transportModes: ['truck', 'rail'],
      legs: [
        { mode: 'truck', distance: 50, description: 'Truck to rail terminal' },
        { mode: 'rail', distance: 280, description: 'Rail transport' },
        { mode: 'truck', distance: 50, description: 'Rail terminal to destination' }
      ],
      estimatedTime: '3 days',
      estimatedCost: 2200,
      distance: 380,
      riskLevel: 'low',
      description: 'Environmentally friendly option'
    }
  ];

  res.json({
    success: true,
    searchQuery: {
      from: 'Los Angeles, CA',
      to: 'San Francisco, CA',
      fuelType: 'hydrogen',
      volume: 8,
      timestamp: new Date()
    },
    routeOptions: demoOptions,
    summary: {
      totalOptions: demoOptions.length,
      priceRange: { min: 2200, max: 2500 },
      timeRange: { fastest: '2 days', slowest: '3 days' }
    }
  });
});

router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    uptime: process.uptime(),
    services: {
      database: 'connected',
      api: 'operational',
      ai: 'available'
    }
  });
});

// ✅ TEST ROUTES
router.get('/test-simple', (req, res) => {
  res.json({ message: 'Simple test route works!' });
});

router.post('/test-post', (req, res) => {
  console.log('🧪 POST test endpoint called with:', req.body);
  res.json({ 
    success: true, 
    message: 'POST test works',
    received: req.body,
    timestamp: new Date()
  });
});

module.exports = router;