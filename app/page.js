'use client'

import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps"
import { useState, memo, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import Tooltip from "react-tooltip"
import { geography, points } from './data.js'
import { debounce } from '../lib/utils.js'

export default function combined() {
  const [content, setContent] = useState("")
  const [size, setSize] = useState()

  const resizeEvent = debounce(() => {
    setSize([document.getElementById("map-container").offsetWidth, document.getElementById("map-container").offsetHeight])
	}, 100)

  useEffect(() => {
    setSize([document.getElementById("map-container").offsetWidth, document.getElementById("map-container").offsetHeight])
    window.addEventListener('resize', resizeEvent)
		return () => {
			window.removeEventListener('resize', resizeEvent)
		}
  }, [])

  return (
    <div data-tip="" id="map-container">
      <Tooltip>{content}</Tooltip>
      {size?.length 
        ? <MapChart setContent={setContent} size={size} />
        : <Skeleton className="w-[80vw] h-[70vh] m-auto mt-10" />
      }
    </div>
  )
}

const MapChart = memo(({ setContent, size }) => {
  return (
    <ComposableMap projection="geoMercator" width={size[0]} height={size[1]}>
      <ZoomableGroup center={[-80, 38]} zoom={4}>
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
                      default: { fill, outline: "none" },
                      hover: { fill: "purple", outline: "none" },
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
  )
})
