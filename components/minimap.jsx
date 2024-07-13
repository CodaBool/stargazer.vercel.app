'use client'
import { useEffect, useState, memo, useRef } from 'react'
import * as topojson from 'topojson-client'
import * as d3 from 'd3'
import { geography, points } from "@/app/data.js"
import { LoaderCircle } from 'lucide-react'

const world = topojson.feature(geography, geography.objects.collection)
const lines = topojson.feature(geography, geography.objects.lines)
const pointsGeo = topojson.feature(points, points.objects.collection)
let touchStartTimeout = null
const scale = 400
let projection, svgGlobal, zoomGlobal
const layers = new Set(["unofficial", "guide", "background", "crosshair"])
const center = [-78, 26]

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

export default function WaitForScreen() {
  const [size, setSize] = useState()

  useEffect(() => {
    if (document.querySelector(".map-container")) {
      const width = document.querySelector(".map-container").clientWidth
      if (width < 500) {
        setSize(width)
      } else {
        setSize(width - 100)
      }
    }
  }, [])

  if (!size) return (
    <div className="flex items-center justify-center mt-[40vh]">
      <LoaderCircle className="w-16 h-16 animate-spin" />
    </div>
  )

  return (
    <Map width={size} height={size} />
  )
}

function Map({ width, height }) {
  const svgRef = useRef(null)
  const gRef = useRef(null)

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
    const svg = d3.select(svgRef.current)
    const g = d3.select(gRef.current)
    svgGlobal = svg
    projection = d3.geoMercator().scale(scale).center(center).translate([width / 2, height / 2])
    const pathGenerator = d3.geoPath().projection(projection)


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

    const coordinatesText = svg.append('text')
      .attr('class', 'coordinates-text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('opacity', 0.7)
      .style('font-size', '30px')
      .style('pointer-events', 'none');

    svg.on("mousemove", (e) => {
      if (!layers.has("crosshair")) return
      const [mouseX, mouseY] = d3.pointer(e)
      crosshairX.attr('y1', mouseY).attr('y2', mouseY).style('visibility', 'visible')
      crosshairY.attr('x1', mouseX).attr('x2', mouseX).style('visibility', 'visible')

      const transform = d3.zoomTransform(svg.node())
      const transformedX = (mouseX - transform.x) / transform.k;
      const transformedY = (mouseY - transform.y) / transform.k
      const [x, y] = projection.invert([transformedX, transformedY])
      coordinatesText.text(`X: ${Math.floor(x)}, Y: ${Math.floor(y)}`).style('visibility', 'visible')
    });

    svg.on("touchstart", (e) => {
      if (!layers.has("crosshair")) return
      // use a timeout since touchmove will begin with a touchstart and override
      touchStartTimeout = setTimeout(() => {
        // since the map is not taking the full screen, adjust for the parent nodes
        const rect = svg.node().getBoundingClientRect()
        const touchX = e.touches[0].clientX - rect.left
        const touchY = e.touches[0].clientY - rect.top
        crosshairX.attr('y1', touchY).attr('y2', touchY).style('visibility', 'visible')
        crosshairY.attr('x1', touchX).attr('x2', touchX).style('visibility', 'visible')
        const transform = d3.zoomTransform(svg.node());
        const transformedX = (touchX - transform.x) / transform.k;
        const transformedY = (touchY - transform.y) / transform.k;
        const [x, y] = projection.invert([transformedX, transformedY])
        coordinatesText.text(`X: ${Math.floor(x)}, Y: ${Math.floor(y)}`).style('visibility', 'visible')
      }, 80)
    })

    svg.on("touchmove", (e) => {
      if (!layers.has("crosshair")) return
      clearTimeout(touchStartTimeout)
      crosshairX.style('visibility', 'hidden')
      crosshairY.style('visibility', 'hidden')
      coordinatesText.style('visibility', 'hidden')
    })

    svg.on("mouseout", () => {
      if (!layers.has("crosshair")) return
      crosshairX.style('visibility', 'hidden')
      crosshairY.style('visibility', 'hidden')
      coordinatesText.style('visibility', 'hidden')
    })

    svg.on("mousedown", () => {
      if (!layers.has("crosshair")) return
      crosshairX.style('visibility', 'hidden');
      crosshairY.style('visibility', 'hidden')
      coordinatesText.style('visibility', 'hidden')
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
      })
      .on("mouseout", (e, d) => {
        d3.select(e.currentTarget).attr('fill', getColor(d.properties, false))
        d3.select(e.currentTarget).attr('stroke', getColor(d.properties, true))
      })

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
      .on("mouseover", (e, d) => {
        d3.select(e.currentTarget).attr('fill', 'rgba(61, 150, 98, 0.5)')
        d3.select(e.currentTarget).attr('stroke', 'rgba(61, 150, 98, .7)')
      })
      .on("mouseout", (e, d) => {
        d3.select(e.currentTarget).attr('fill', getColor(d.properties, false))
        d3.select(e.currentTarget).attr('stroke', getColor(d.properties, true))
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
        svg.style("cursor", "grabbing")
      })
      .on("end", () => {
        svg.style("cursor", "grab")
      })

    zoomGlobal = zoom
    svg.call(zoom)
  }, [])

  return (
    <svg ref={svgRef} width={width} height={height}>
      <g ref={gRef}></g>
    </svg>
  )
}
