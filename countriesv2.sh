#!/bin/bash

# Input and output JSON files
INPUT_FILE="countries.json"
OUTPUT_FILE="new_countries.json"

# Start creating the new JSON structure
echo '{"countries": [' > "$OUTPUT_FILE"

# Read the list of countries from the input JSON
countries=$(jq -r '.countries[]' "$INPUT_FILE")

# Loop over each country
while IFS= read -r country; do
  # Remove quotes from country name
  country=$(echo "$country" | sed 's/"//g')

  # Use curl to get country data from RestCountries API
  response=$(curl -s "https://restcountries.com/v3.1/name/$country?fullText=true")

  # Extract capital, lat, and lon using jq
  capital=$(echo "$response" | jq -r '.[0].capital[0]')
  lat=$(echo "$response" | jq -r '.[0].capitalInfo.latlng[0]')
  lon=$(echo "$response" | jq -r '.[0].capitalInfo.latlng[1]')

  # Check if data was successfully retrieved
  if [[ "$capital" != "null" && "$lat" != "null" && "$lon" != "null" ]]; then
    # Add the country's capital and coordinates to the new JSON
    echo "  {\"name\": \"$country\", \"capital\": \"$capital\", \"lat\": $lat, \"lon\": $lon}," >> "$OUTPUT_FILE"
  else
    echo "Data not available for $country"
  fi
done <<< "$countries"

# Remove the last comma and close the JSON structure
sed -i '$ s/,$//' "$OUTPUT_FILE"
echo ']}' >> "$OUTPUT_FILE"

echo "New JSON with capital cities has been saved to $OUTPUT_FILE"
