'use client'

import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps"
import { useState, memo } from "react"
import Tooltip from "react-tooltip"
import { geography, points } from './data.js'

export default function combined() {
  const [content, setContent] = useState("")
  return (
    <>
      <Tooltip>{content}</Tooltip>
      <MapChart setContent={setContent} />
    </>
  )
}

const MapChart = memo(({ setContent }) => {
  console.log("ran")
  return (
    <div data-tip="" id="map-container" style={{border: "1px solid grey"}}>
      <ComposableMap projection="geoMercator">
        <ZoomableGroup center={[0, 0]} zoom={9}>
          <Geographies geography={geography}>
            {({ geographies }) => 
              geographies.map(geo => {
                if (geo.geometry?.type === "Polygon") {
                  if (!geo.properties?.name) return
                  let fill = "#EAEAEC"
                  let stroke = "#D6D6DA"
                  if (geo.properties.type === "cluster") {
                    fill = "rgba(39, 122, 245, 0.25)"
                    stroke = "rgba(39, 83, 245, 0.3)"
                  }
                  if (geo.properties.type === "territory") {
                    fill = "#e67070"
                    stroke = "#D6D6DA"
                  }
                  if (geo.properties.name === "Karrakis Trade Baronies") {
                    fill = "#eb9c34"
                    stroke = "#D6D6DA"
                  }
                  if (geo.properties.name === "Harrison Armory") {
                    fill = "#3d34eb"
                    stroke = "#D6D6DA"
                  }
                  if (geo.properties.name === "IPS-N") {
                    fill = "#34ebcf"
                    stroke = "#D6D6DA"
                  }
                  if (geo.properties.name === "Union Coreworlds") {
                    fill = "rgba(245, 81, 39, 0.25)"
                    stroke = "rgba(245, 39, 39, 0.3)"
                  }
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      // fill={fill}
                      stroke={stroke}
                      strokeWidth={1}
                      onMouseEnter={() => {
                        if (!geo.properties?.name) return
                        setContent(`${geo.properties.name}`)
                      }}
                      onMouseLeave={() => {
                        setContent("")
                      }}
                      style={{
                        default: { fill },
                        hover: { fill: "purple" },
                        pressed: { fill: "red" },
                      }}
                    />
                  )
                }
              })
            }
          </Geographies>
          {points.objects.points.geometries.map(({ coordinates, properties, type }, index) => {
            if (type === "Point") return (
              <Marker coordinates={coordinates} key={index}>
                {properties.gate
                  ? <rect width="2" height="2" fill="purple" stroke="black" strokeWidth={.5} />
                  : <circle r={1} fill="grey" stroke="black" strokeWidth={.5} />
                }
                {properties?.name && 
                  <text
                    textAnchor="middle"
                    y={9}
                    style={{ fontFamily: "system-ui", fill: "white", fontSize: ".3em", textShadow: "0 0 5px black" }}
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
})
