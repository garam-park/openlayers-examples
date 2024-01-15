import Feature from "ol/Feature.js";
import Map from "ol/Map.js";
import Point from "ol/geom/Point.js";
import View from "ol/View.js";
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from "ol/style.js";
import { Cluster, OSM, Vector as VectorSource } from "ol/source.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import { boundingExtent } from "ol/extent.js";

// S 임의 포인트 만들기
const count = 20000;
const features = new Array(count);
const e = 4500000;
for (let i = 0; i < count; ++i) {
  const coordinates = [2 * e * Math.random() - e, 2 * e * Math.random() - e];
  features[i] = new Feature(new Point(coordinates));
}
// E 임의 포인트 만들기

const styleCache = {};
const clusters = new VectorLayer({
  source: new Cluster({
    distance: 40,
    minDistance: 20,
    source: new VectorSource({
      features: features,
    }),
  }),
  style: function (feature) {
    const size = feature.get("features").length;
    let style = styleCache[size];
    if (!style) {
      style = new Style({
        image: new CircleStyle({
          radius: 10,
          stroke: new Stroke({
            color: "#fff",
          }),
          fill: new Fill({
            color: "#355E3B",
          }),
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: "#fff",
          }),
        }),
      });
      styleCache[size] = style;
    }
    return style;
  },
});

const raster = new TileLayer({
  source: new OSM(),
});

const map = new Map({
  layers: [raster, clusters],
  target: "map",
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

map.on("click", (e) => {
  clusters.getFeatures(e.pixel).then((clickedFeatures) => {
    if (clickedFeatures.length) {
      // Get clustered Coordinates
      const features = clickedFeatures[0].get("features");
      if (features.length > 1) {
        const extent = boundingExtent(
          features.map((r) => r.getGeometry().getCoordinates())
        );
        map
          .getView()
          .fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
      }
    }
  });
});
