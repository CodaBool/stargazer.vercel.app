'use client'
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps"
import { useState, memo, useEffect, useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import Tooltip from "react-tooltip"
import { geography, points } from './data.js'
import { debounce } from '@/lib/utils.js'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from "@/components/ui/tooltip"
import Menubar from "@/components/menu"

export default function page() {
  const [center, setCenter] = useState([-80, 38])
  const [zoom, setZoom] = useState(4)
  const [content, setContent] = useState("")
  const [size, setSize] = useState()

  function panTo(coordinates) {
    setZoom(12)
    setCenter(coordinates)
  }

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
    <>
      <Toaster />
      <Menubar panTo={panTo} />
      <TooltipProvider>
        <div data-tip="" id="map-container">
          <Tooltip>{content}</Tooltip>
          {size?.length 
            ? <Map setContent={setContent} size={size} center={center} zoom={zoom} />
            : <Skeleton className="w-[80vw] h-[70vh] m-auto mt-10" />
          }
        </div>
      </TooltipProvider>
    </>
  )
}

const Map = memo(({ setContent, size, center, zoom }) => {
  const map = useRef(null)
  return (
    <ComposableMap ref={map} projection="geoMercator" width={size[0]} height={size[1]}>
      <ZoomableGroup center={center} zoom={zoom}>
        <Geographies geography={geography}>
          {({ geographies }) => 
            geographies.map(geo => {
              if (geo.geometry?.type === "Polygon") {
                if (!geo.properties?.name) return
                let fill = "#EAEAEC"
                let stroke = "rgba(255, 255, 255, 0.3)"
                if (geo.properties.type === "cluster") {
                  fill = "rgba(39, 122, 245, 0.1)"
                  stroke = "rgba(39, 83, 245, 0.15)"
                }
                if (geo.properties.type === "territory") {
                  fill = "#e67070"
                  stroke = "rgba(255, 255, 255, 0.3)"
                }
                if (geo.properties.name === "Karrakis Trade Baronies") {
                  fill = "rgba(218,199,143,1)"
                  stroke = "rgba(164,113,52,.5)"
                }
                if (geo.properties.name === "Harrison Armory") {
                  fill = "rgba(124,64,130)"
                  stroke = "rgba(36,19,44,.5)"
                }
                if (geo.properties.name === "IPS-N") {
                  fill = "rgb(202,52,38)"
                  stroke = "rgba(52, 13, 10, .5)"
                  // 
                }
                if (geo.properties.name === "Union Coreworlds") {
                  fill = "rgba(245, 81, 39, 0.1)"
                  stroke = "rgba(245, 39, 39, 0.18)"
                }
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
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
                      hover: { fill: "rgba(61, 150, 98, 0.3)", stroke: "rgba(61, 150, 98, .35)", outline: "none" },
                    }}
                  />
                )
              }
            })
          }
        </Geographies>
        {points.objects.points.geometries.map(({ coordinates, properties, type }, index) => {
          if (type === "Point") {
            return (
              <Marker coordinates={coordinates} key={index}>
                {properties.gate
                  ? <rect width="2" height="2" fill="white" stroke="black" strokeWidth={.5} />
                  : <circle r={1} fill="grey" stroke="black" strokeWidth={.5} />
                }
                {(properties?.name && !properties?.crowded) && 
                  <text
                    textAnchor="middle"
                    y={properties?.gate ? 7 : 3}
                    style={{ fontFamily: "system-ui", fill: "white", fontSize: properties?.gate ? ".3em" : ".1em", textShadow: "0 0 5px black" }}
                  >
                    {properties.name}
                  </text>
                }
              </Marker>
            )
          }
        })}
      </ZoomableGroup>
    </ComposableMap>
  )
})
