# GPX to Route Data Converter

A Node.js script that converts GPX files (exported from GPS devices like Garmin) into JSON formats optimized for React Native running route applications.

## What it does

The `convert.js` script transforms a single GPX file into three specialized JSON outputs:
- **GeoJSON** for map visualization with @rnmapbox/maps
- **Elevation profile data** for charts using Victory Native XL
- **Route statistics** for database storage

## Prerequisites

- Node.js (version 12 or higher)
- npm (comes with Node.js)

## Setup

1. Clone this repository:
   ```bash
   git clone <your-repo-url>
   cd gpx-converter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

   This installs the required `fast-xml-parser` package as specified in `package.json`.

## Usage

1. Place your GPX file in the project directory
2. Run the converter with your GPX file:
   ```bash
   node convert.js your-route.gpx
   ```

## Outputs

For a route named "Wadestown Loop", the script generates:

- `wadestown-loop-geojson.json` - Map line data for @rnmapbox/maps
- `wadestown-loop-elevation.json` - Chart data for Victory Native XL  
- `wadestown-loop-stats.json` - Summary statistics for your database

All output files are created in the same directory as the script.

## Output Formats

### GeoJSON (Mapbox)
```json
{
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "geometry": {
      "type": "LineString",
      "coordinates": [[longitude, latitude], ...]
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
*Distance in kilometers, elevation in meters*

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

## Technical Details

- **Time estimation**: Uses 6 min/km average pace
- **Distance calculation**: Haversine formula for GPS accuracy
- **Elevation changes**: Calculated from point-to-point GPS data
- **Coordinate format**: [longitude, latitude] (GeoJSON standard)

## Troubleshooting

- **"Cannot find module 'fast-xml-parser'"**: Run `npm install`
- **"No such file or directory"**: Ensure your GPX file path is correct
- **Empty output files**: Check that your GPX file contains track points with coordinates

## File Structure
```
gpx-converter/
├── convert.js          # Main conversion script
├── package.json        # Dependencies and project info
├── README.md          # This file
├── your-route.gpx     # Your GPX files go here
└── output-files.json  # Generated files appear here
```