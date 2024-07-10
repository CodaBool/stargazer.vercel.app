'use client'
import { useEffect, useState, memo, useRef } from 'react'
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
import { ChevronLeft, LoaderCircle, Menu } from 'lucide-react'

const world = topojson.feature(geography, geography.objects.collection)
const lines = topojson.feature(geography, geography.objects.lines)
const pointsGeo = topojson.feature(points, points.objects.collection)
const scale = 400
let projection, svgGlobal, zoomGlobal
const layers = new Set(["unofficial", "guide", "background"])
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
      <h3 className='pb-2 font-bold text-center'>{name}</h3 >
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
    if (type === "cluster") return "rgba(39, 83, 245, 0.3)";
    if (name === "Karrakis Trade Baronies") return "rgba(133, 92, 0,1)";
    if (name === "Harrison Armory") return "rgba(99, 0, 128, 1)";
    if (name === "IPS-N") return "rgba(128, 0, 0, 1)";
    if (name === "Union Coreworlds") return "rgba(245, 39, 39, 0.3)"
    if (type === "territory") return "rgba(255, 255, 255, 0.2)";
    return "black";
  } else {
    // fill
    if (type === "cluster") return "rgba(39, 122, 245, 0.2)";
    if (name === "Karrakis Trade Baronies") return "rgba(133, 92, 0,.7)";
    if (name === "Harrison Armory") return "rgba(99, 0, 128, .8)";
    if (name === "IPS-N") return "rgba(128, 0, 0, .8)";
    if (name === "Union Coreworlds") return "rgba(245, 81, 39, 0.15)"
    if (type === "territory") return "rgba(255, 255, 255, 0.2)";
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
    <div className="flex items-center justify-center mt-[40vh]">
      <LoaderCircle className="w-16 h-16 animate-spin" />
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
  const [showControls, setShowControls] = useState()

  function updateLayerOpacity(layer) {
    const svg = d3.select(svgRef.current)
    const group = svg.selectAll(`.${layer}`)
    if (layers.has(layer)) {
      layers.delete(layer)
      if (layer === "background") {
        svg.attr("style", "background: black")
      }
      group.transition().duration(750).style("opacity", 0)
    } else {
      layers.add(layer)
      if (layer === "background") {
        svg.attr("style", "background: radial-gradient(#000A2E 0%, #000000 100%)")
      }
      group.transition().duration(750).style("opacity", 1)
    }
    const zoomLevel = d3.zoomTransform(svgRef.current).k
    setLabelOpactiy(zoomLevel)
  }

  function setLabelOpactiy(zoomLevel) {
    const g = d3.select(gRef.current)
    const showUnofficial = layers.has("unofficial")
    g.selectAll('.group-label').style('opacity', d => {
      if (d.properties.unofficial === "true" && !showUnofficial) return 0
      return zoomLevel <= 1.3 ? 1 : 0
    })
    g.selectAll('.group-label').style('opacity', d => {
      if (d.properties.unofficial === "true" && !showUnofficial) return 0
      return zoomLevel <= 1.3 ? 1 : 0
    })
    g.selectAll('.point-label').style('opacity', d => {
      if (d.properties.unofficial === "true" && !showUnofficial) return 0
      if (zoomLevel >= 1.3 && zoomLevel < 2) {
        return d.properties.type === 'gate' ? 1 : 0
      }
      return zoomLevel >= 2 ? 1 : 0
    })
    g.selectAll('.point-label').style('font-size', d => {
      if (zoomLevel > 2) {
        if (zoomLevel > 2.5) {
          return d.properties.type === 'gate' ? '7px' : '5px'
        }
        return d.properties.type === 'gate' ? '6px' : '4px'
      }
      return '12px'
    })
  }

  useEffect(() => {
    if (!svgRef.current || !zoomGlobal || !projection) return

    // recenter back on Cradle if the window is resized
    // TODO: support mobile landscape (currently is offcentered)
    const [x, y] = projection([-78, 42])

    // debounce the resize events
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


    // styling
    //
    // background color
    svg.attr("style", "background: radial-gradient(#000A2E 0%, #000000 100%)")
    // stars
    // scale for number of pixels
    // TODO: test this on more devices / DPIs
    for (let i = 0; i < height * width / 10000; i++) {
      svg.append('circle')
        .attr('class', 'background')
        .attr('cx', Math.random() * width)
        .attr('cy', Math.random() * height)
        .attr('r', Math.random() * 2)
        .style('fill', `rgba(255, 255, 255, ${Math.random() / 3})`)
    }

    // Territory SVG Polygons
    g.selectAll('.group')
      .data(world.features)
      .enter().append('path')
      .attr('class', d => d.properties.unofficial ? 'unofficial group' : 'group')
      .attr('d', pathGenerator)
      .attr('stroke-width', 3)
      .style('opacity', 1)
      .attr('fill', d => {
        return getColor(d.properties, false)
      })
      .attr('stroke', d => {
        return getColor(d.properties, true)
      })
      .on("mouseover", (e, d) => {
        d3.select(e.currentTarget).attr('fill', 'rgba(61, 150, 98, 0.5)')
        d3.select(e.currentTarget).attr('stroke', 'rgba(61, 150, 98, .7)')
        setTooltip(d.properties)
        positionTooltip(e)
      })
      .on("click", (e, d) => {
        setDrawerOpen()
        // if (mobile) return
        const zoom = 3
        const [x, y] = pathGenerator.centroid(d)
        setDrawerContent({ locations: [d.properties], coordinates: [x, y] })
        setDrawerOpen(true)
        const { resizeOffsetX, resizeOffsetY } = getResizeOffsets(width, height)
        console.log("moving to group", d.properties.name, Math.floor(width / 2 - x * zoom + resizeOffsetX), Math.floor(height / 2 - y * zoom - 200 + resizeOffsetY))
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

    g.selectAll('.lines-label')
      .data(lines.features)
      .enter().append('text')
      .attr('class', 'lines-label guide')
      .attr('x', d => {
        const centroid = pathGenerator.centroid(d);
        const bounds = pathGenerator.bounds(d);
        const topMostPoint = bounds[0][1] < bounds[1][1] ? bounds[0] : bounds[1];
        const radius = Math.sqrt(
          Math.pow(topMostPoint[0] - centroid[0], 2) +
          Math.pow(topMostPoint[1] - centroid[1], 2)
        )
        const offsetX = 20
        return centroid[0] + offsetX + (radius / 5);
      })
      .attr('y', d => {
        const bounds = pathGenerator.bounds(d);
        const topMostPoint = bounds[0][1] < bounds[1][1] ? bounds[0] : bounds[1]
        return topMostPoint[1] + 35;
      })
      .text(d => d.properties.name)
      .style('font-size', '.7em')
      .style('fill', 'white')
      .style('pointer-events', 'none')

    g.selectAll('.lines')
      .data(lines.features)
      .enter().append('path')
      .attr('class', 'lines guide')
      .attr('d', pathGenerator)
      .style('opacity', 1)
      .attr('stroke-width', 2)
      .attr('fill', "none")
      .attr('stroke', "rgba(255, 255, 255, 0.2)")

    // Territory Labels
    g.selectAll('.group-label')
      .data(world.features)
      .enter().append('text')
      // .attr('class', 'country-label country-layer')
      .attr('class', d => d.properties.unofficial ? 'unofficial group-label' : 'group-label')
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
      // .attr('class', 'point point-layer')
      .attr('class', d => d.properties.unofficial ? 'unofficial point' : 'point')
      .attr('r', d => d.properties.type !== 'gate' ? 5 : null)
      .attr('cx', d => d.properties.type !== 'gate' ? projection(d.geometry.coordinates)[0] : null)
      .attr('cy', d => d.properties.type !== 'gate' ? projection(d.geometry.coordinates)[1] : null)
      .attr('x', d => d.properties.type === 'gate' ? projection(d.geometry.coordinates)[0] - 5 : null)
      .attr('y', d => d.properties.type === 'gate' ? projection(d.geometry.coordinates)[1] - 5 : null)
      .attr('width', d => d.properties.type === 'gate' ? 10 : null)
      .attr('height', d => d.properties.type === 'gate' ? 10 : null)
      .attr('fill', d => d.properties.type === 'gate' ? 'teal' : 'slategray')
      .attr('stroke', 'black')
      .style('opacity', 1)
      .on("click", (e, d) => {

        // TODO: find way to keep drawer open if already open and clicking on another point
        const drawerOpenReal = document.querySelector(".map-sheet")?.getAttribute("data-state") || false
        // console.log("drawer open", drawerOpenReal)

        // add nearby locations to drawer
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
        d3.select(e.currentTarget).attr('fill', 'rgba(61, 150, 98, 0.5)')
        d3.select(e.currentTarget).attr('stroke', 'rgba(61, 150, 98, .7)')
        setTooltip(d.properties)
        positionTooltip(e)
      })
      .on("mouseout", (e, d) => {
        d3.select(e.currentTarget).attr('fill', getColor(d.properties, false))
        d3.select(e.currentTarget).attr('stroke', getColor(d.properties, true))
        setTooltip()
        document.querySelector(".map-tooltip").style.visibility = "hidden"
      })

    // Add text labels for points
    g.selectAll('.point-label')
      .data(pointsGeo.features)
      .enter().append('text')
      .attr('class', d => d.properties.unofficial ? 'unofficial point-label' : 'official point-label')
      // .attr('class', 'point-label point-layer')
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
        setLabelOpactiy(event.transform.k)
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

      <div style={{ position: 'absolute', top: '10vh', left: '10px', backgroundColor: 'rgba(0, 0, 0, 0.7)', borderRadius: '8px' }}>
        <button onClick={() => setShowControls(!showControls)} className='p-1 m-1'>
          {showControls
            ? <ChevronLeft size={28} />
            : <Menu size={28} />
          }
        </button>
        <div style={{ display: showControls ? 'block' : 'none' }} className='p-2'>
          <div>
            <input type="checkbox" onChange={() => updateLayerOpacity('unofficial')} defaultChecked />
            <label> Unofficial</label>
          </div>
          <div>
            <input type="checkbox" onChange={() => updateLayerOpacity('guide')} defaultChecked />
            <label> Guides</label>
          </div>
          <div>
            <input type="checkbox" onChange={() => updateLayerOpacity('background')} defaultChecked />
            <label> Background</label>
          </div>
        </div >
      </div>

      <svg ref={svgRef} width={width} height={height}>
        <g ref={gRef}></g>
      </svg>
    </>
  )
}
