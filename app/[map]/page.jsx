'use client'
import { Fragment, useEffect, useState, memo, useRef } from 'react'
import * as topojson from 'topojson-client'
import * as d3 from 'd3'
import { geography, points } from "../data.js"
import { isMobile } from '@/lib/utils.js'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { LoaderCircle } from 'lucide-react'

const world = topojson.feature(geography, geography.objects.collection)
const pointsGeo = topojson.feature(points, points.objects.collection)
const scale = 400
let projection, svgGlobal, zoomGlobal
const center = [-80, 40]
const MENU_HEIGHT_PX = 40
const TOOLTIP_WIDTH_PX = 200
const TOOLTIP_HEIGHT_PX = 150
const TOOLTIP_Y_OFFSET = 50

function useScreen() {
  // if (typeof window === 'undefined') return null
  // const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  const [screenSize, setScreenSize] = useState()

  useEffect(() => {
    setScreenSize({ width: window.innerWidth, height: window.innerHeight })
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!screenSize) return null

  return ({
    height: screenSize.height - MENU_HEIGHT_PX,
    width: screenSize.width,
  })
}

const Tooltip = ({ name, type, crowded, faction, destroyed }) => {
  return (
    <div className="map-tooltip" style={{ border: "1px solid red", position: "absolute", color: 'white', backgroundColor: 'black', padding: '0.5em', border: '1px dashed gray', borderRadius: '12px', visibility: 'hidden', left: 0, width: TOOLTIP_WIDTH_PX, height: TOOLTIP_HEIGHT_PX }}>
      <h3 className='font-bold text-center pb-2'>{name}</h3 >
      <p>Type: {type}</p>
      {/* <p>crowded: {crowded ? 'true' : 'false'}</p> */}
      <p>faction: {faction ? faction : 'none'}</p>
      <p>destroyed: {destroyed ? 'true' : 'false'}</p>
    </div>
  );
};

const DrawContent = ({ locations }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1rem' }}>
      {locations?.map(location => {
        return (
          <Card key={location.name}>
            <CardHeader>
              <CardTitle>{location.name}</CardTitle>
              <CardDescription>Placeholder</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Type: {location.type}</p>
              <p>faction: {location.faction ? location.faction : 'none'}</p>
              <p>destroyed: {location.destroyed ? 'true' : 'false'}</p>
            </CardContent>
          </Card >
        )
      })}
    </div>
  );
}

function getColor({ name, type }, stroke) {
  if (stroke) {
    if (type === "cluster") return "rgba(39, 83, 245, 0.08)";
    if (name === "Karrakis Trade Baronies") return "rgba(133, 92, 0,1)";
    if (name === "Harrison Armory") return "rgba(99, 0, 128, 1)";
    if (name === "IPS-N") return "rgba(128, 0, 0, .9)";
    if (name === "Union Coreworlds") return "rgba(245, 39, 39, 0.1)"
    if (type === "territory") return "rgba(255, 255, 255, 0.2)";
    return "black";
  } else {
    // fill
    if (type === "cluster") return "rgba(39, 122, 245, 0.1)";
    if (name === "Karrakis Trade Baronies") return "rgba(133, 92, 0,.7)";
    if (name === "Harrison Armory") return "rgba(99, 0, 128, .8)";
    if (name === "IPS-N") return "rgba(128, 0, 0, .8)";
    if (name === "Union Coreworlds") return "rgba(245, 81, 39, 0.1)"
    if (type === "territory") return "rgba(255, 255, 255, 0.15)";
    return "lightgray";
  }
}

function positionTooltip(e) {
  const tt = document.querySelector(".map-tooltip")
  if (e.pageX + TOOLTIP_WIDTH_PX / 2 > window.innerWidth) {
    // left view, since it's too far right
    tt.style.left = (e.pageX - TOOLTIP_WIDTH_PX - TOOLTIP_Y_OFFSET) + "px"
  } else if (e.pageX - TOOLTIP_WIDTH_PX / 2 < 0) {
    // right view, since it's too far left
    tt.style.left = (e.pageX + TOOLTIP_Y_OFFSET) + "px"
  } else {
    // clear space, use center view
    tt.style.left = (e.pageX - tt.offsetWidth / 2) + "px"
  }
  if (e.pageY + TOOLTIP_HEIGHT_PX + TOOLTIP_Y_OFFSET > window.innerHeight) {
    // top view, since it's too low
    tt.style.top = (e.pageY - TOOLTIP_Y_OFFSET - TOOLTIP_HEIGHT_PX) + "px"
  } else {
    // clear space, use bottom view
    tt.style.top = (e.pageY + TOOLTIP_Y_OFFSET) + "px"
  }
  tt.style.visibility = "visible"
}

export default function WaitForScreen() {
  const screen = useScreen()
  if (!screen) return (
    <div className="flex justify-center items-center h-screen">
      <LoaderCircle className="animate-spin w-16 h-16" />
    </div>
  )
  return (
    <Map width={screen.width} height={screen.height} />
  )
}

function getResizeOffsets(width, height) {
  return {
    resizeOffsetX: (window.innerWidth - width) / 2,
    resizeOffsetY: (window.innerHeight - MENU_HEIGHT_PX - height) / 2,
  }
}

export function panTo(location) {
  const point = pointsGeo.features.find(g => (
    g.properties.name === location
  )).geometry.coordinates
  const [x, y] = projection(point)
  const transform = d3.zoomIdentity.translate(window.innerWidth / 2 - x * 3, (window.innerHeight - MENU_HEIGHT_PX) / 2 - y * 3).scale(3)
  svgGlobal.transition().duration(750).call(zoomGlobal.transform, transform)
}

function Map({ width, height }) {
  const svgRef = useRef(null)
  const gRef = useRef(null)
  const resizeTimeout = useRef(null)
  const mobile = isMobile()
  const [tooltip, setTooltip] = useState()
  const [drawerOpen, setDrawerOpen] = useState()
  const [drawerContent, setDrawerContent] = useState()

  useEffect(() => {
    if ((!svgRef.current || !zoomGlobal || !projection) || mobile) return

    // recenter back on Cradle if the window is resized
    const [x, y] = projection([-78, 42])

    // use a timeout to only recenter after the window has stopped resizing
    clearTimeout(resizeTimeout.current)
    resizeTimeout.current = setTimeout(() => {
      const { resizeOffsetX, resizeOffsetY } = getResizeOffsets(width, height)
      console.log("window resized, recentering to", Math.floor(width / 2 - x + resizeOffsetX), Math.floor(height / 2 - y - 200 + resizeOffsetY))
      const transform = d3.zoomIdentity.translate(width / 2 - x + resizeOffsetX, height / 2 - y - 200 + resizeOffsetY).scale(1)
      d3.select(svgRef.current).transition().duration(750).call(zoomGlobal.transform, transform)
    }, 250)
  }, [width, height])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    const g = d3.select(gRef.current)
    svgGlobal = svg
    projection = d3.geoMercator().scale(scale).center(center).translate([width / 2, height / 2])
    const pathGenerator = d3.geoPath().projection(projection)
    // projection = projection

    // Territory SVG Polygons
    g.selectAll('.country')
      .data(world.features)
      .enter().append('path')
      .attr('class', 'country')
      .attr('d', pathGenerator)
      .attr('fill', d => {
        return getColor(d.properties, false)
      })
      .attr('stroke', d => {
        return getColor(d.properties, true)
      })
      .on("mouseover", (e, d) => {
        d3.select(e.currentTarget).attr('fill', 'rgba(61, 150, 98, 0.3)')
        d3.select(e.currentTarget).attr('stroke', 'rgba(61, 150, 98, .35)')
        setTooltip(d.properties)
        positionTooltip(e)
      })
      .on("click", (e, d) => {
        setDrawerOpen()
        // if (mobile) return
        const zoom = 3
        const [x, y] = pathGenerator.centroid(d)
        const { resizeOffsetX, resizeOffsetY } = getResizeOffsets(width, height)
        console.log("moving to territory", d.properties.name, Math.floor(width / 2 - x * zoom + resizeOffsetX), Math.floor(height / 2 - y * zoom - 200 + resizeOffsetY))
        const transform = d3.zoomIdentity.translate(width / 2 - x * zoom + resizeOffsetX, height / 2 - y * zoom - 200 + resizeOffsetY).scale(zoom)
        svg.transition().duration(750).call(zoomGlobal.transform, transform)
      })
      .on("mouseout", (e, d) => {
        d3.select(e.currentTarget).attr('fill', getColor(d.properties, false))
        d3.select(e.currentTarget).attr('stroke', getColor(d.properties, true))
        setTooltip()
        document.querySelector(".map-tooltip").style.visibility = "hidden"
      })
      .on("mousemove", e => positionTooltip(e))


    // Territory Labels
    g.selectAll('.country-label')
      .data(world.features)
      .enter().append('text')
      .attr('class', 'country-label')
      .attr('x', d => pathGenerator.centroid(d)[0])
      .attr('y', d => pathGenerator.centroid(d)[1])
      .attr('dy', '.35em')
      .text(d => d.properties.name)
      .style('font-size', '10px')
      .style('fill', 'white')
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')

    // Draw the points
    g.selectAll('.point')
      .data(pointsGeo.features)
      .enter()
      .append(d => d.properties.type === 'gate' ? document.createElementNS(d3.namespaces.svg, 'rect') : document.createElementNS(d3.namespaces.svg, 'circle'))
      .attr('class', 'point')
      .attr('r', d => d.properties.type !== 'gate' ? 5 : null)
      .attr('cx', d => d.properties.type !== 'gate' ? projection(d.geometry.coordinates)[0] : null)
      .attr('cy', d => d.properties.type !== 'gate' ? projection(d.geometry.coordinates)[1] : null)
      .attr('x', d => d.properties.type === 'gate' ? projection(d.geometry.coordinates)[0] - 5 : null)
      .attr('y', d => d.properties.type === 'gate' ? projection(d.geometry.coordinates)[1] - 5 : null)
      .attr('width', d => d.properties.type === 'gate' ? 10 : null)
      .attr('height', d => d.properties.type === 'gate' ? 10 : null)
      .attr('fill', d => d.properties.type === 'gate' ? 'teal' : 'slategray')
      .attr('stroke', 'black')
      .on("click", (e, d) => {

        // TODO: find way to keep drawer open if already open and clicking on another point
        const drawerOpenReal = document.querySelector(".map-sheet")?.getAttribute("data-state") || false
        // console.log("drawer open", drawerOpenReal)


        const locations = pointsGeo.features.filter(p => {
          return Math.sqrt(
            Math.pow(p.geometry.coordinates[0] - d.geometry.coordinates[0], 2) +
            Math.pow(p.geometry.coordinates[1] - d.geometry.coordinates[1], 2)
          ) <= 1
        }).map(p => p.properties)
        setDrawerContent({ locations, coordinates: d.geometry.coordinates })
        setDrawerOpen(true)
        // if (mobile) return
        const zoom = 3
        const [x, y] = projection(d.geometry.coordinates)
        const { resizeOffsetX, resizeOffsetY } = getResizeOffsets(width, height)
        console.log("moving to point", d.properties.name, Math.floor(width / 2 - x * zoom + resizeOffsetX), Math.floor(height / 2 - y * zoom - 200 + resizeOffsetY))
        const transform = d3.zoomIdentity.translate(width / 2 - x * zoom + resizeOffsetX, height / 2 - y * zoom - 200 + resizeOffsetY).scale(zoom)
        svg.transition().duration(750).call(zoomGlobal.transform, transform)
      })
      .on("mouseover", (e, d) => {
        setTooltip(d.properties)
        positionTooltip(e)
      })
      .on("mouseout", () => {
        setTooltip()
        document.querySelector(".map-tooltip").style.visibility = "hidden"
      })

    // Add text labels for points
    g.selectAll('.point-label')
      .data(pointsGeo.features)
      .enter().append('text')
      .attr('class', 'point-label')
      .attr('x', d => projection(d.geometry.coordinates)[0])
      .attr('y', d => {
        return d.properties.type === 'gate'
          ? projection(d.geometry.coordinates)[1] + 18
          : projection(d.geometry.coordinates)[1] + 10
      })
      .text(d => !d.properties.crowded ? d.properties.name : '')
      .style('font-size', d => d.properties.type === 'gate' ? '14px' : '6px')
      .style('font-weight', d => d.properties.type === 'gate' && 600)
      .style('text-anchor', 'middle')
      .style('fill', 'white')
      .style('opacity', 0)
      .style('pointer-events', 'none')

    // All zoom and pan events
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .translateExtent([[-scale * 1.5, -scale * 1.5], [width + scale * 1.5, height + scale * 1.5]])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
        g.selectAll('.country-label').style('opacity', d => {
          return event.transform.k <= 1.3 ? 1 : 0
        })
        g.selectAll('.point-label').style('opacity', d => {
          if (event.transform.k >= 1.3 && event.transform.k < 2) {
            return d.properties.type === 'gate' ? 1 : 0
          }
          return event.transform.k >= 2 ? 1 : 0
        })
        g.selectAll('.point-label').style('font-size', d => {
          if (event.transform.k > 2) {
            if (event.transform.k > 2.5) {
              return d.properties.type === 'gate' ? '7px' : '5px'
            }
            return d.properties.type === 'gate' ? '6px' : '4px'
          }
          return '12px'
        })
      })
      .on("start", () => {
        document.querySelector(".map-tooltip").style.visibility = "hidden"
        svg.style("cursor", "grabbing")
      })
      .on("end", () => {
        svg.style("cursor", "grab")
      })

    zoomGlobal = zoom
    svg.call(zoom)
  }, [])

  return (
    <>
      <Tooltip {...tooltip} />
      <Sheet onOpenChange={setDrawerOpen} open={drawerOpen} modal={false} style={{ color: 'white' }} >
        <SheetContent side="bottom" style={{ maxHeight: '50vh', overflowY: 'auto' }} className="map-sheet">
          <SheetHeader style={{ color: 'white' }}>
            <SheetTitle>{drawerContent?.coordinates ? `x: ${Math.floor(drawerContent.coordinates[0])}, y: ${Math.floor(drawerContent.coordinates[1])}` : 'unknown'}</SheetTitle>
            <SheetDescription style={{ margin: '.2em' }}>
              placeholder
            </SheetDescription >
          </SheetHeader >
          <DrawContent {...drawerContent} />
        </SheetContent >
      </Sheet >
      <svg ref={svgRef} width={width} height={height}>
        <g ref={gRef}></g>
      </svg>
    </>
  )
}
