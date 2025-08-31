const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');

// Haversine formula to calculate distance between two points in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function convertGpxToRouteData(gpxFilePath) {
  // Read and parse GPX file
  const gpxData = fs.readFileSync(gpxFilePath, 'utf8');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: ''
  });
  const result = parser.parse(gpxData);
  
  // Extract track points
  const trackPoints = result.gpx.trk.trkseg.trkpt;
  const routeName = result.gpx.trk.name;
  
  // Initialize variables for calculations
  const coordinates = [];
  const elevationProfile = [];
  let totalDistance = 0;
  let elevationGain = 0;
  let elevationLoss = 0;
  let minElevation = Infinity;
  let maxElevation = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;
  let minLon = Infinity, maxLon = -Infinity;
  
  // Process each track point
  for (let i = 0; i < trackPoints.length; i++) {
    const point = trackPoints[i];
    const lat = parseFloat(point.lat);
    const lon = parseFloat(point.lon);
    const elevation = parseFloat(point.ele);
    
    // Add to coordinates array for GeoJSON (lon, lat format)
    coordinates.push([lon, lat]);
    
    // Update bounds
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
    
    // Update elevation stats
    minElevation = Math.min(minElevation, elevation);
    maxElevation = Math.max(maxElevation, elevation);
    
    // Calculate distance and elevation changes
    if (i > 0) {
      const prevPoint = trackPoints[i-1];
      const prevLat = parseFloat(prevPoint.lat);
      const prevLon = parseFloat(prevPoint.lon);
      const prevElevation = parseFloat(prevPoint.ele);
      
      // Add distance
      const segmentDistance = calculateDistance(prevLat, prevLon, lat, lon);
      totalDistance += segmentDistance;
      
      // Calculate elevation change
      const elevationChange = elevation - prevElevation;
      if (elevationChange > 0) {
        elevationGain += elevationChange;
      } else {
        elevationLoss += Math.abs(elevationChange);
      }
    }
    
    // Add to elevation profile
    elevationProfile.push({
      distance: parseFloat(totalDistance.toFixed(3)),
      elevation: elevation
    });
  }
  
  // Create GeoJSON
  const geojson = {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      properties: {
        name: routeName
      },
      geometry: {
        type: "LineString",
        coordinates: coordinates
      }
    }]
  };
  
  // Create elevation profile data (Victory Native XL format)
  const elevationData = elevationProfile;
  
  // Calculate estimated time (assuming 6 min/km average pace)
  const estimatedTimeMins = Math.round(totalDistance * 6);
  
  // Create stats object
  const stats = {
    totalDistanceKm: parseFloat(totalDistance.toFixed(2)),
    minElevation: Math.round(minElevation),
    maxElevation: Math.round(maxElevation),
    elevationGain: Math.round(elevationGain),
    elevationLoss: Math.round(elevationLoss),
    estimatedTimeMins: estimatedTimeMins,
    bounds: {
      northeast: [maxLon, maxLat],
      southwest: [minLon, minLat]
    }
  };
  
  return { geojson, elevationData, stats, routeName };
}

// Main function
async function main() {
  const gpxFile = process.argv[2];
  
  if (!gpxFile) {
    console.log('Usage: node convert.js <path-to-gpx-file>');
    process.exit(1);
  }
  
  try {
    const result = await convertGpxToRouteData(gpxFile);
    
    // Save files
    const baseName = result.routeName.toLowerCase().replace(/\s+/g, '-');
    
    fs.writeFileSync(`${baseName}-geojson.json`, JSON.stringify(result.geojson, null, 2));
    fs.writeFileSync(`${baseName}-elevation.json`, JSON.stringify(result.elevationData, null, 2));
    fs.writeFileSync(`${baseName}-stats.json`, JSON.stringify(result.stats, null, 2));
    
    console.log('✅ Files created:');
    console.log(`  - ${baseName}-geojson.json`);
    console.log(`  - ${baseName}-elevation.json`);
    console.log(`  - ${baseName}-stats.json`);
    console.log('\n📊 Stats:');
    console.log(`  Distance: ${result.stats.totalDistanceKm}km`);
    console.log(`  Elevation: ${result.stats.minElevation}m - ${result.stats.maxElevation}m`);
    console.log(`  Gain/Loss: +${result.stats.elevationGain}m / -${result.stats.elevationLoss}m`);
    console.log(`  Estimated time: ${result.stats.estimatedTimeMins} minutes`);
    
  } catch (error) {
    console.error('Error processing GPX file:', error.message);
  }
}

main();