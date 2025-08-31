# GPX to Route Data Converter

Converts GPX files to JSON formats needed for a React Native running route app.

The `convert.js` script converts a gpx file (e.g. exported from Garmin) into:
- geojson for use with @rnmapbox/maps
- elevation data for use with Victory Native XL charts
- route stats for the application database

## Setup

1. Create new folder: `gpx-converter`
2. Initialize project:
   ```bash
   npm init -y
   npm install fast-xml-parser
   ```
3. Save `convert.js` script in folder

## Usage

1. Save `your-route.gpx` in the same folder
2. Run the below command in the terminal

```bash
node convert.js your-route.gpx
```

## Outputs

For route named "Wadestown Loop", creates:

- `wadestown-loop-geojson.json` - For @rnmapbox/maps
- `wadestown-loop-elevation.json` - For Victory Native XL charts  
- `wadestown-loop-stats.json` - For database insertion

## Output Formats

### GeoJSON (Mapbox)
```json
{
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "geometry": {
      "type": "LineString",
      "coordinates": [[lon, lat], ...]
    }
  }]
}
```

### Elevation Profile (Victory Native XL)
```json
[
  {"distance": 0, "elevation": 10.42},
  {"distance": 0.15, "elevation": 12.1},
  ...
]
```

### Stats (Database)
```json
{
  "totalDistanceKm": 15.2,
  "minElevation": 5,
  "maxElevation": 145,
  "elevationGain": 420,
  "elevationLoss": 418,
  "estimatedTimeMins": 91,
  "bounds": {
    "northeast": [174.7840, -41.2830],
    "southwest": [174.7760, -41.2890]
  }
}
```

## Notes

- Uses 6 min/km pace for time estimation
- Distances calculated with Haversine formula
- Elevation gain/loss from point-to-point changes
- Coordinates in [longitude, latitude] order for GeoJSON