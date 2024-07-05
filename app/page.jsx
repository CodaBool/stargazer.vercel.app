'use client'
import { Fragment, useEffect, useState, memo, useRef } from 'react'
import Menubar from "@/components/menu"
import * as topojson from 'topojson-client'
import * as d3 from 'd3'
// import { create } from 'zustand'
import { geography, points } from "./data.js"
import { isMobile } from '@/lib/utils.js'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const world = topojson.feature(geography, geography.objects.collection)
const pointsGeo = topojson.feature(points, points.objects.collection)
const scale = 400
const center = [-80, 40]

function useScreen() {
  if (typeof window === 'undefined') return { width: 1200, height: 1200 }
  const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return ({
    // update if menubar size changes
    height: screenSize.height - 40,
    width: screenSize.width,
  })
}

const Tooltip = ({ name, type, crowded, faction, destroyed }) => {
  return (
    <div className="map-tooltip" style={{ border: "1px solid red", position: "absolute", color: 'white', backgroundColor: 'black', padding: '0.5em', border: '1px dashed gray', borderRadius: '12px', visibility: 'hidden' }}>
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
              {/* <p>crowded: {location.crowded ? 'true' : 'false'}</p> */}
              <p>faction: {location.faction ? location.faction : 'none'}</p>
              <p>destroyed: {location.destroyed ? 'true' : 'false'}</p>
            </CardContent>
            {/* <CardFooter>
              <p>Placeholder</p>
            </CardFooter> */}
          </Card >
        )
      })}
    </div>
  );
};

// TODO:
// - add contribution pages

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

export default function page() {
  const svgRef = useRef(null)
  const gRef = useRef(null)
  const zoomRef = useRef(null)
  const projectionRef = useRef(null)
  const screen = useScreen()
  const mobile = isMobile()
  const [tooltip, setTooltip] = useState()
  const [drawerOpen, setDrawerOpen] = useState()
  const [drawerContent, setDrawerContent] = useState()

  useEffect(() => {
    if ((!svgRef.current || !zoomRef.current || !projectionRef.current) || mobile) return
    if (screen.width === screen.width && screen.height === screen.height) return
    // cradle
    const [x, y] = projectionRef.current([-78, 42])
    console.log("resize event, zoom to", Math.floor(x), Math.floor(y))
    const transform = d3.zoomIdentity.translate(screen.width / 2 - x, screen.height / 2 - y).scale(1)
    d3.select(svgRef.current).transition().duration(750).call(zoomRef.current.transform, transform)
  }, [screen])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    const g = d3.select(gRef.current)

    const projection = d3.geoMercator().scale(scale).center(center).translate([screen.width / 2, screen.height / 2])
    const pathGenerator = d3.geoPath().projection(projection)
    projectionRef.current = projection

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
        const tt = document.querySelector(".map-tooltip")
        tt.style.visibility = "visible"
        tt.style.top = (e.pageY + 50) + "px"
        tt.style.left = (e.pageX - tt.offsetWidth / 2) + "px"
      })
      .on("click", (e, d) => {
        setDrawerOpen()
        if (mobile) return
        const [x, y] = pathGenerator.centroid(d)
        console.log("moving to territory", d.properties.name)
        const transform = d3.zoomIdentity.translate(screen.width / 2 - x * 3, screen.height / 2 - y * 3).scale(3)
        svg.transition().duration(750).call(zoomRef.current.transform, transform)
      })
      .on("mouseout", (e, d) => {
        d3.select(e.currentTarget).attr('fill', getColor(d.properties, false))
        d3.select(e.currentTarget).attr('stroke', getColor(d.properties, true))
        setTooltip()
        document.querySelector(".map-tooltip").style.visibility = "hidden"
      })
      .on("mousemove", e => {
        const tt = document.querySelector(".map-tooltip")
        tt.style.visibility = "visible"
        tt.style.top = (e.pageY + 50) + "px"
        tt.style.left = (e.pageX - tt.offsetWidth / 2) + "px"
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
      .on("click", (e, d) => {

        // TODO: find way to keep drawer open if already open and clicking on another point
        const drawerOpenReal = document.querySelector(".map-sheet")?.getAttribute("data-state") || false
        console.log("drawer open", drawerOpenReal)


        const locations = pointsGeo.features.filter(p => {
          return Math.sqrt(
            Math.pow(p.geometry.coordinates[0] - d.geometry.coordinates[0], 2) +
            Math.pow(p.geometry.coordinates[1] - d.geometry.coordinates[1], 2)
          ) <= 1
        }).map(p => p.properties)
        setDrawerContent({ locations, coordinates: d.geometry.coordinates })
        setDrawerOpen(true)
        if (mobile) return
        const [x, y] = projection(d.geometry.coordinates)
        console.log("moving to point", d.properties.name)
        const transform = d3.zoomIdentity.translate(screen.width / 2 - x * 3, screen.height / 2 - y * 3 - 200).scale(3)
        svg.transition().duration(750).call(zoomRef.current.transform, transform)
      })
      .on("mouseover", (e, d) => {
        setTooltip(d.properties)
        const tt = document.querySelector(".map-tooltip")
        tt.style.visibility = "visible"
        tt.style.top = (e.pageY + 50) + "px"
        tt.style.left = (e.pageX - tt.offsetWidth / 2) + "px"
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
      .translateExtent([[-scale * 1.5, -scale * 1.5], [screen.width + scale * 1.5, screen.height + scale * 1.5]])
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
      <Menubar zoom={zoomRef} width={screen.width} height={screen.height} svg={svgRef} projection={projectionRef} />
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

      <svg ref={svgRef} width={screen.width} height={screen.height}>
        <g ref={gRef}></g>
      </svg>
    </>
  )
}
