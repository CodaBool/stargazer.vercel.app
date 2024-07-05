'use client'
import { Fragment, useEffect, useState, memo, useRef } from 'react'
import Menubar from "@/components/menu"
import * as topojson from 'topojson-client'
import * as d3 from 'd3'
// import { create } from 'zustand'
import { geography, points } from "./data.js"

const world = topojson.feature(geography, geography.objects.collection)
const pointsGeo = topojson.feature(points, points.objects.collection)

const width = 1200
const height = 1200
const scale = 400
const center = [-80, 40]

// TODO:
// - make the tooltip more intesting
// - add contribution pages
// - add export to file option
// - make 100% of screen
// - make mobile compatible

export default function page() {
  const svgRef = useRef(null)
  const gRef = useRef(null)
  const zoomRef = useRef(null)
  const projectionRef = useRef(null)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    const g = d3.select(gRef.current)

    const projection = d3.geoMercator().scale(scale).center(center).translate([width / 2, height / 2])
    const pathGenerator = d3.geoPath().projection(projection)
    projectionRef.current = projection

    // TODO: can move these styles into the map-tooltip class
    const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("color", "white")
      .style("background-color", "black")
      .style("border", "1px dashed gray")
      .style("padding", ".5em")
      .style("font-weight", "bold")
      .style("border-radius", "12px")
      .style("font-size", "1.4em")
      .style("visibility", "hidden")
      .attr("class", "map-tooltip")

    // Territory SVG Polygons
    g.selectAll('.country')
      .data(world.features)
      .enter().append('path')
      .attr('class', 'country')
      .attr('d', pathGenerator)
      .attr('fill', d => {
        if (d.properties.type === "cluster") return "rgba(39, 122, 245, 0.1)";
        if (d.properties.name === "Karrakis Trade Baronies") return "rgba(133, 92, 0,.7)";
        if (d.properties.name === "Harrison Armory") return "rgba(99, 0, 128, .8)";
        if (d.properties.name === "IPS-N") return "rgba(128, 0, 0, .8)";
        if (d.properties.name === "Union Coreworlds") return "rgba(245, 81, 39, 0.1)"
        if (d.properties.type === "territory") return "rgba(255, 255, 255, 0.15)";
        return "lightgray";
      })
      .attr('stroke', d => {
        if (d.properties.type === "cluster") return "rgba(39, 83, 245, 0.08)";
        if (d.properties.name === "Karrakis Trade Baronies") return "rgba(133, 92, 0,1)";
        if (d.properties.name === "Harrison Armory") return "rgba(99, 0, 128, 1)";
        if (d.properties.name === "IPS-N") return "rgba(128, 0, 0, .9)";
        if (d.properties.name === "Union Coreworlds") return "rgba(245, 39, 39, 0.1)"
        if (d.properties.type === "territory") return "rgba(255, 255, 255, 0.2)";
        return "black";
      })
      .on("mouseover", (e, d) => {
        tooltip.html(d.properties.name)
          .style("top", (e.pageY - 100) + "px")
          .style("left", (e.pageX - tooltip.node().offsetWidth / 2) + "px")
          .style("visibility", "visible")

      })
      .on("click", (event, d) => {
        const [x, y] = pathGenerator.centroid(d)
        console.log("moving to territory", d.properties.name)
        const transform = d3.zoomIdentity.translate(width / 2 - x * 3, height / 2 - y * 3).scale(3)
        svg.transition().duration(750).call(zoomRef.current.transform, transform)
      })
      .on("mouseout", () => tooltip.style("visibility", "hidden"))
      .on("mousemove", e => {
        tooltip.style("top", (e.pageY - 100) + "px")
          .style("left", (e.pageX - tooltip.node().offsetWidth / 2) + "px")
      })


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
      .on("click", (event, d) => {
        const [x, y] = projection(d.geometry.coordinates)
        console.log("moving to point", d.properties.name)
        const transform = d3.zoomIdentity.translate(width / 2 - x * 3, height / 2 - y * 3).scale(3)
        svg.transition().duration(750).call(zoomRef.current.transform, transform)
      })
      .on("mouseover", (e, d) => {
        tooltip.html(d.properties.name)
          .style("top", (e.pageY - 100) + "px")
          .style("left", (e.pageX - tooltip.node().offsetWidth / 2) + "px")
          .style("visibility", "visible")
      })
      .on("mouseout", () => tooltip.style("visibility", "hidden"))

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
      .translateExtent([[-110, -110], [width + 110, height + 110]])
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

    zoomRef.current = zoom
    svg.call(zoom)
  }, [])

  return (
    <>
      <Menubar zoom={zoomRef} width={width} height={height} svg={svgRef} projection={projectionRef} />
      <svg ref={svgRef} width={width} height={height} style={{ border: '1px solid grey' }}>
        <g ref={gRef}></g>
      </svg>
    </>
  )
}
