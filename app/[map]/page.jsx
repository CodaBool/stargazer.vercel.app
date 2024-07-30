'use client'
import { useEffect, useState, useRef } from 'react'
import * as topojson from 'topojson-client'
import * as d3 from 'd3'
import { geography, points } from "../data.js"
import { isMobile } from '@/lib/utils.js'
import { ChevronLeft, LoaderCircle, Menu } from 'lucide-react'
import { Badge } from '@/components/ui/badge.jsx'
import Sheet from '@/components/sheet'

const world = topojson.feature(geography, geography.objects.collection)
const lines = topojson.feature(geography, geography.objects.lines)
const pointsGeo = topojson.feature(points, points.objects.collection)
let touchStartTimeout = null
const scale = 400
let projection, svgGlobal, zoomGlobal, holdTimer
const layers = new Set(["unofficial", "guide", "background"])
const center = [-78, 26]
const MENU_HEIGHT_PX = 40
const TOOLTIP_WIDTH_PX = 150
const TOOLTIP_HEIGHT_PX = 160
const TOOLTIP_Y_OFFSET = 50
const DRAWER_OFFSET_PX = 100

function useScreen() {
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

const Tooltip = ({ name, type, faction, destroyed, thirdParty }) => {
  if (!name) return (<div className="map-tooltip"></div>)
  return (
    <div className="map-tooltip p-5 rounded-2xl absolute bg-black" style={{ border: '1px dashed gray', visibility: "hidden" }}>
      <p className='font-bold text-center'>{name}</p>
      <p className="text-center text-gray-400">{type}</p>
      <div className="flex flex-col items-center">
        {thirdParty && <Badge variant="destructive" className="mx-auto my-1">unofficial</Badge>}
        {faction && <Badge className="mx-auto my-1">{faction}</Badge>}
        {destroyed && <Badge variant="secondary" className="mx-auto my-1">destroyed</Badge>}
      </div>
    </div>
  );
};

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

export function panTo(location) {
  const point = pointsGeo.features.find(g => (
    g.properties.name === location
  )).geometry.coordinates
  const [x, y] = projection(point)
  const transform = d3.zoomIdentity.translate(window.innerWidth / 2 - x * 3, (window.innerHeight - MENU_HEIGHT_PX) / 2 - y * 3).scale(3)
  svgGlobal.transition().duration(750).call(zoomGlobal.transform, transform)
}

function getResizeOffsets(width, height) {
  return {
    resizeOffsetX: (window.innerWidth - width) / 2,
    resizeOffsetY: (window.innerHeight - MENU_HEIGHT_PX - height) / 2,
  }
}

function Map({ width, height }) {
  const svgRef = useRef(null)
  const gRef = useRef(null)
  const pointRef1 = useRef(null)
  const lineRef = useRef(null)
  const textRef = useRef(null)
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
      group.transition().duration(750).style("opacity", 0)
    } else {
      layers.add(layer)
      if (layer === "background") {
        svg.attr("style", "background: radial-gradient(#000A2E 0%, #000000 100%)")
      } else if (layer === "measure") {
        pointRef1.current.style.visibility = 'visible'
        layers.delete("crosshair")
        document.getElementById("crosshair-checkbox").checked = false;
      } else if (layer === "crosshair") {
        layers.delete("measure")
        document.getElementById("measure-checkbox").checked = false;
      }
      group.transition().duration(750).style("opacity", 1)
    }

    if (!layers.has("measure")) {
      pointRef1.current.style.visibility = 'hidden'
      lineRef.current.style.visibility = 'hidden'
      textRef.current.style('visibility', 'hidden')
    } else if (!layers.has("background")) {
      svg.attr("style", "background: black")
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
    // has issues on mobile, just disable
    if (!svgRef.current || !zoomGlobal || !projection || mobile) return
    setTooltip()
    positionTooltip({ pageX: 0, pageY: 0 })

    // recenter back on Cradle if the window is resized
    // TODO: support mobile landscape (currently is offcentered)
    const [x, y] = projection([-78.01, 48.5])

    // debounce the resize events
    clearTimeout(resizeTimeout.current)
    resizeTimeout.current = setTimeout(() => {
      const { resizeOffsetX, resizeOffsetY } = getResizeOffsets(width, height)
      if (Math.abs(width / 2 - x + resizeOffsetX) < 2 && Math.abs(height / 2 - y - 200 + resizeOffsetY) < 2) return
      console.log("window resized, recentering by", Math.floor(width / 2 - x + resizeOffsetX), Math.floor(height / 2 - y - 200 + resizeOffsetY))
      const transform = d3.zoomIdentity.translate(width / 2 - x + resizeOffsetX, height / 2 - y - 200 + resizeOffsetY).scale(1)
      d3.select(svgRef.current).transition().duration(500).call(zoomGlobal.transform, transform)
    }, 250)
  }, [width, height])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    const g = d3.select(gRef.current)
    svgGlobal = svg
    projection = d3.geoMercator().scale(scale).center(center).translate([width / 2, height / 2])
    const pathGenerator = d3.geoPath().projection(projection)

    // styling
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

    const crosshairX = svg.append('line')
      .attr('class', 'crosshair')
      .attr('x2', width)
      .attr('y1', height / 2)
      .attr('y2', height / 2)
      .attr('stroke', 'white')
      .attr('pointer-events', 'none')
      .style('visibility', 'hidden')

    const crosshairY = svg.append('line')
      .attr('class', 'crosshair')
      .attr('x1', width / 2)
      .attr('x2', width / 2)
      .attr('y2', height)
      .attr('stroke', 'white')
      .attr('pointer-events', 'none')
      .style('visibility', 'hidden')

    textRef.current = svg.append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('opacity', 0.7)
      .style('font-size', '30px')
      .style('pointer-events', 'none')
      .style('visibility', 'hidden')

    svg.on("mousemove", (e) => {
      if (mobile) return
      if (layers.has("crosshair")) {

        const [mouseX, mouseY] = d3.pointer(e)
        const transform = d3.zoomTransform(svg.node())
        const transformedX = (mouseX - transform.x) / transform.k;
        const transformedY = (mouseY - transform.y) / transform.k
        const [x, y] = projection.invert([transformedX, transformedY])
        crosshairX.attr('y1', mouseY).attr('y2', mouseY).style('visibility', 'visible')
        crosshairY.attr('x1', mouseX).attr('x2', mouseX).style('visibility', 'visible')
        textRef.current.text(`X: ${Math.floor(x)}, Y: ${Math.floor(y)}`).style('visibility', 'visible')

      } else if (layers.has("measure")) {
        if (textRef.current.style("visibility") === "hidden") {
          return
        }
        if (lineRef.current.style.visibility === "hidden") {
          lineRef.current.style.visibility = 'visible'
        }
        const [mouseX, mouseY] = d3.pointer(e)
        const transform = d3.zoomTransform(svg.node())
        const transformedX = (mouseX - transform.x) / transform.k;
        const transformedY = (mouseY - transform.y) / transform.k
        lineRef.current.setAttribute('x1', pointRef1.current.getAttribute('cx'));
        lineRef.current.setAttribute('y1', pointRef1.current.getAttribute('cy'))
        lineRef.current.setAttribute('x2', transformedX);
        lineRef.current.setAttribute('y2', transformedY)
        const point = projection.invert([pointRef1.current.getAttribute('cx'), pointRef1.current.getAttribute('cy')])
        const point2 = projection.invert([transformedX, transformedY])
        const lightYears = d3.geoDistance(point, point2) * 87 // 87 is arbitrary
        const fastest = (lightYears / 0.995).toFixed(2);
        textRef.current.text(`${lightYears.toFixed(2)}ly | ${fastest} years`).style('visibility', 'visible')
      }
    })

    // mobile "click"
    svg.on("touchstart", (e) => {
      if (layers.has("crosshair")) {
        // use timeout because zooming and panning will also count as touch starts
        touchStartTimeout = setTimeout(() => {
          const [touchX, touchY] = [e.touches[0].clientX, e.touches[0].clientY];
          crosshairX.attr('y1', touchY - MENU_HEIGHT_PX).attr('y2', touchY - MENU_HEIGHT_PX).style('visibility', 'visible')
          crosshairY.attr('x1', touchX).attr('x2', touchX).style('visibility', 'visible')
          const transform = d3.zoomTransform(svgRef.current);
          const transformedX = (touchX - transform.x) / transform.k;
          const transformedY = (touchY - transform.y - MENU_HEIGHT_PX) / transform.k;
          const [x, y] = projection.invert([transformedX, transformedY])
          textRef.current.text(`X: ${Math.floor(x)}, Y: ${Math.floor(y)}`).style('visibility', 'visible')
        }, 80)
      } else if (layers.has("measure")) {
        const [mouseX, mouseY] = [e.touches[0].clientX, e.touches[0].clientY];
        const transform = d3.zoomTransform(svgRef.current)
        const transformedX = (mouseX - transform.x) / transform.k;
        const transformedY = (mouseY - transform.y - MENU_HEIGHT_PX) / transform.k
        const point = projection.invert([transformedX, transformedY])
        const coord = projection(point)

        holdTimer = setTimeout(() => {
          textRef.current.style('visibility', 'visible')
          pointRef1.current.style.visibility = 'visible'
          d3.select(lineRef.current).raise()
          d3.select(pointRef1.current).raise()

          if (lineRef.current.x2.baseVal.value !== 0) {
            // reset
            pointRef1.current.setAttribute('cx', coord[0])
            pointRef1.current.setAttribute('cy', coord[1])
            lineRef.current.style.visibility = 'hidden'
            lineRef.current.setAttribute('x1', coord[0]);
            lineRef.current.setAttribute('y1', coord[1])
            lineRef.current.setAttribute('x2', 0)
            lineRef.current.setAttribute('y2', 0)
          } else if (lineRef.current.x1.baseVal.value === 0) {
            // first point
            pointRef1.current.setAttribute('cx', coord[0])
            pointRef1.current.setAttribute('cy', coord[1])
            lineRef.current.setAttribute('x1', coord[0]);
            lineRef.current.setAttribute('y1', coord[1])
          } else {
            // second point
            lineRef.current.setAttribute('x2', transformedX);
            lineRef.current.setAttribute('y2', transformedY)
            lineRef.current.style.visibility = 'visible'
            // console.log("finishing line", fastest)

            const point = projection.invert([pointRef1.current.getAttribute('cx'), pointRef1.current.getAttribute('cy')])
            const point2 = projection.invert([transformedX, transformedY])
            const lightYears = d3.geoDistance(point, point2) * 87 // 87 is arbitrary
            const fastest = (lightYears / 0.995).toFixed(2)
            textRef.current.text(`${lightYears.toFixed(2)}ly | ${fastest} years`).style('visibility', 'visible')
          }

        }, 200)
      }
    })


    svg.on("touchmove", (e) => {
      if (!layers.has("crosshair")) return
      clearTimeout(touchStartTimeout)
      // clearTimeout(holdTimer)
      crosshairX.style('visibility', 'hidden')
      crosshairY.style('visibility', 'hidden')
      textRef.current.style('visibility', 'hidden')
    })

    // left app
    svg.on("mouseout", () => {
      if (!layers.has("crosshair")) return
      crosshairX.style('visibility', 'hidden')
      crosshairY.style('visibility', 'hidden')
      textRef.current.style('visibility', 'hidden')
    })

    // triggered by mobile and desktop, but just ignore mobile. Use touchstart instead
    svg.on("mousedown", e => {
      if (!layers.has("measure") || mobile) return
      const [mouseX, mouseY] = d3.pointer(e)
      const transform = d3.zoomTransform(svgRef.current)
      const transformedX = (mouseX - transform.x) / transform.k;
      const transformedY = (mouseY - transform.y) / transform.k
      const point = projection.invert([transformedX, transformedY])
      const coord = projection(point)
      holdTimer = setTimeout(() => {
        textRef.current.style('visibility', 'visible')
        pointRef1.current.setAttribute('cx', coord[0])
        pointRef1.current.setAttribute('cy', coord[1])
        pointRef1.current.style.visibility = 'visible'
        d3.select(pointRef1.current).raise()
        if (lineRef.current.x1.baseVal.value === 0) {
          return
        }
        lineRef.current.setAttribute('x1', coord[0])
        lineRef.current.setAttribute('y1', coord[1])
        d3.select(lineRef.current).raise()
      }, 200)
    })

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
        if (mobile) return
        setTooltip(d.properties)
        positionTooltip(e)
      })
      .on("click", (e, d) => {
        if (layers.has("measure")) return
        // crosshair and mobile dont play nice
        if (layers.has("crosshair") && mobile) return

        setDrawerOpen()
        // if (mobile) return
        const zoom = 3
        const [x, y] = pathGenerator.centroid(d)

        const { resizeOffsetX, resizeOffsetY } = getResizeOffsets(width, height)

        console.log("moving to group", d.properties.name, Math.floor(width / 2 - x * zoom + resizeOffsetX), Math.floor(height / 2 - y * zoom - DRAWER_OFFSET_PX + resizeOffsetY))
        const transform = d3.zoomIdentity.translate(width / 2 - x * zoom + resizeOffsetX, height / 2 - y * zoom - DRAWER_OFFSET_PX + resizeOffsetY).scale(zoom)
        svg.transition().duration(750).call(zoomGlobal.transform, transform)

        setDrawerContent({ locations: [d.properties], coordinates: projection.invert([x, y]) })
        setDrawerOpen(true)

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
        if (layers.has("measure")) return
        // crosshair and mobile dont play nice
        if (layers.has("crosshair") && mobile) return

        // TODO: find way to keep drawer open if already open and clicking on another point
        // const drawerOpenReal = document.querySelector(".map-sheet")?.getAttribute("data-state") || false
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
        console.log("moving to point", d.properties.name, Math.floor(width / 2 - x * zoom + resizeOffsetX), Math.floor(height / 2 - y * zoom - DRAWER_OFFSET_PX + resizeOffsetY))
        const transform = d3.zoomIdentity.translate(width / 2 - x * zoom + resizeOffsetX, height / 2 - y * zoom - DRAWER_OFFSET_PX + resizeOffsetY).scale(zoom)
        svg.transition().duration(750).call(zoomGlobal.transform, transform)
      })
      .on("mouseover", (e, d) => {
        d3.select(e.currentTarget).attr('fill', 'rgba(61, 150, 98, 0.5)')
        d3.select(e.currentTarget).attr('stroke', 'rgba(61, 150, 98, .7)')
        if (mobile) return
        setTooltip(d.properties)
        positionTooltip(e)
      })
      .on("mouseout", (e, d) => {
        d3.select(e.currentTarget).attr('fill', getColor(d.properties, false))
        d3.select(e.currentTarget).attr('stroke', getColor(d.properties, true))
        setTooltip()
        document.querySelector(".map-tooltip").style.visibility = "hidden"
      })
      .on("mousemove", e => positionTooltip(e))

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

        // prevents measure dot from being moved on pan for both mobile and desktop
        if (holdTimer) clearTimeout(holdTimer)

        // hide crosshair while pan/zoom
        if (layers.has("crosshair")) {
          crosshairX.style('visibility', 'hidden');
          crosshairY.style('visibility', 'hidden')
          textRef.current.style('visibility', 'hidden')
        }
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

    // allow for enabling crosshair from URL
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('c') && !layers.has("crosshair")) {
      document.getElementById("crosshair-checkbox").checked = true;
      updateLayerOpacity('crosshair')
    }
  }, [])

  return (
    <>
      <Tooltip {...tooltip} />

      <Sheet {...drawerContent} setDrawerOpen={setDrawerOpen} drawerOpen={drawerOpen} />

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
          <div>
            <input type="checkbox" id="crosshair-checkbox" onChange={() => updateLayerOpacity('crosshair')} />
            <label> Find Coordinates</label>
          </div>
          <div>
            <input type="checkbox" id="measure-checkbox" onChange={() => updateLayerOpacity('measure')} />
            <label> Measure</label>
          </div>
        </div >
      </div>

      <svg ref={svgRef} width={width} height={height}>
        <g ref={gRef}>
          <circle
            r={5}
            ref={pointRef1}
            fill="orange"
            style={{ visibility: 'hidden', pointerEvents: "none" }}
          />
          <line
            ref={lineRef}
            stroke="orange"
            strokeDasharray="5,5"
            style={{ visibility: 'hidden', pointerEvents: "none" }}
          />
        </g>
      </svg>
    </>
  )
}
