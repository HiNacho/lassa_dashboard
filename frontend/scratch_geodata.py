import pandas as pd
import json
import shapely.wkt
import os

df = pd.read_csv('../dataset/clean_lassa_fever_map_data.csv')

# The dataset seems to have duplicate state records for different years.
# We will extract unique geometries for the GeoJSON.
geo_df = df[['state_clean', 'state_pcode', 'geometry']].drop_duplicates(subset=['state_pcode'])

features = []
for _, row in geo_df.iterrows():
    if pd.isna(row['geometry']): continue
    try:
        poly = shapely.wkt.loads(row['geometry'])
        features.append({
            "type": "Feature",
            "properties": {
                "state": row['state_clean'],
                "state_code": row['state_pcode']
            },
            "geometry": shapely.geometry.mapping(poly)
        })
    except Exception as e:
        print(f"Error parsing geometry for {row['state_clean']}: {e}")

geojson_dict = {
    "type": "FeatureCollection",
    "features": features
}

os.makedirs('public/dataset', exist_ok=True)

with open('public/dataset/nigeria_states.geojson', 'w') as f:
    json.dump(geojson_dict, f)

# Now prepare the lightweight JSON data without geometries
data_df = df.drop(columns=['geometry'])
# We might want to handle NaN properly and fill with 0
data_df.fillna(0, inplace=True)

# Save as JSON array of dicts for easy frontend ingestion
data_list = data_df.to_dict(orient='records')
with open('public/dataset/lassa_state_data.json', 'w') as f:
    json.dump(data_list, f)

print("Successfully Generated nigeria_states.geojson and lassa_state_data.json")
