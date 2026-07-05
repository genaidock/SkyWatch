const fs = require('fs');
const path = require('path');

const airlinesJsonPath = path.join(__dirname, '../public/airlines/airlines.json');
const outputPath = path.join(__dirname, '../src/lib/airlineMappings.json');

try {
  const data = fs.readFileSync(airlinesJsonPath, 'utf8');
  const airlines = JSON.parse(data);
  const mapping = {};

  airlines.forEach(airline => {
    if (airline.slug) {
      if (airline.icao) {
        mapping[airline.icao.toUpperCase()] = airline.slug;
      }
      if (airline.iata) {
        mapping[airline.iata.toUpperCase()] = airline.slug;
      }
    }
  });

  fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2), 'utf8');
  console.log(`Generated mapping for ${Object.keys(mapping).length} airline codes at ${outputPath}`);
} catch (error) {
  console.error('Error generating mapping:', error);
}
