'use client'

import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps"
import { useState } from "react"
import Tooltip from "react-tooltip"
import { topojson } from './junk.js'

export default function MapChart() {
  const [content, setContent] = useState("")
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  function handleZoomIn() {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 2 }));
  }

  function handleZoomOut() {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 2 }));
  }

  function handleMoveEnd(position) {
    setPosition(position);
  }

  // console.log(topoPointsJSON.objects.geo_mark)

  // sphere
  // geoAzimuthalEqualArea

  // sphere
  // geoAzimuthalEquidistant

  // orhtho
  // geoOrthographic

  // large sphere
  // geoStereographic

  // square
  // geoMercator

  // square
  // geoTransverseMercator

  // objects.main.geometries

  return (
    <div data-tip="" id="map-container" style={{border: "1px solid grey"}}>
      <Tooltip>{content}</Tooltip>
      <div className="controls">
        <button onClick={handleZoomIn}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button onClick={handleZoomOut}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
      <ComposableMap projection="geoMercator" projectionConfig={{
        center: [0, 0],
        scale: 60,
      }}>
        <ZoomableGroup center={[0,0]} zoom={position.zoom} onMoveEnd={handleMoveEnd}>
          <Geographies geography={topojson}>
            {({ geographies }) => 
              geographies.map(geo => {
                if (geo.geometry.type === "Polygon") {
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#EAEAEC"
                      stroke="#D6D6DA"
                      strokeWidth={.1}
                      onMouseEnter={() => {
                        if (!geo.properties?.name) return
                        setContent(`${geo.properties.name}`)
                      }}
                      onMouseLeave={() => {
                        setContent("")
                      }}
                      style={{
                        default: { fill: "#ffe6e6" },
                        hover: { fill: "#ffe6e6" },
                        pressed: { fill: "#ffe6e6" },
                      }}
                    />
                  )
                }
              })
            }
          </Geographies>
          {/* {topoPointsJSON.objects.collection.geometries.map(({ coordinates, properties, type }, index) => { */}
          {topojson.objects.collection.geometries.map(({ coordinates, properties, type }, index) => {
            if (type === "Point") return (
              <Marker coordinates={coordinates} key={index}>
                <circle r={2} fill="green" stroke="blue" strokeWidth={1} />
                {properties?.name && 
                  <text
                    textAnchor="middle"
                    y={12}
                    style={{ fontFamily: "system-ui", fill: "#5D5A6D", fontSize: ".3em" }}
                  >
                    {properties.name}
                  </text>
                }
              </Marker>
            )
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}
