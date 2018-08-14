import forEach from 'lodash/forEach'

function getCenterLngLat(data) {
  if(!data.geometry) return;
  if (data.geometry.type == "Point") {
    return data.geometry.coordinates;
  }
  if (data.geometry.type == "Polygon") {
    var points = data.geometry.coordinates[0];
    var lngTat = 0, latTat = 0;
    forEach(points, p => {
      lngTat = lngTat + p[0];
      latTat = latTat + p[1];
    })
    return [lngTat / points.length, latTat / points.length];
  }
  if (data.geometry.type == "MultiPolygon") {
    var points = data.geometry.coordinates[0][0];
    var lngTat = 0, latTat = 0;
    forEach(points, p => {
      lngTat = lngTat + p[0];
      latTat = latTat + p[1];
    })
    return [lngTat / points.length, latTat / points.length];
  }
  if (data.geometry.type == "LineString") {
    var len = data.geometry.coordinates.length;
    return data.geometry.coordinates[Math.floor((len - 1) / 2)];
  }
  if (data.geometry.type == "MultiLineString") {
    var len = data.geometry.coordinates[0].length;
    return data.geometry.coordinates[0][Math.floor((len - 1) / 2)];
  }
}
export {
  getCenterLngLat,
}
