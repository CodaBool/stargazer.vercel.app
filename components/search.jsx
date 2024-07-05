import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { points } from '@/app/data.js'
import * as d3 from 'd3'
import { useRef } from "react"
import * as topojson from 'topojson-client'
const pointsGeo = topojson.feature(points, points.objects.collection)

// topo seemed to give same results
function getCoordindates(name) {
  return pointsGeo.features.find(g => (
    g.properties.name === name
  )).geometry.coordinates
}

const locations = points.objects.collection.geometries.map(p => (
  p.properties.name
))

export default function Search({ setOpen, zoom, width, height, svg, projection }) {
  const cmd = useRef(null)

  function handleEnter() {
    const name = cmd.current.querySelector('[data-selected="true"]').textContent
    // panTo()
    // panTo(getCoordindates(name))
    setOpen(false)
  }

  // TODO: add polygon search as well
  // can use shadcn/ui of Command groups
  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput placeholder="Type a command or search..." onKeyDown={e => { if (e.code === 'Enter') handleEnter() }} />
      <CommandList style={{ height: '351px' }}>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup ref={cmd} heading="Suggestions">
          {locations.map(location => (
            <CommandItem key={location} value={location} className="cursor-pointer" onSelect={() => {
              // TODO: validate coords
              const point = getCoordindates(location)
              const [x, y] = projection.current(point)
              const svgD3 = d3.select(svg.current)
              const transform = d3.zoomIdentity.translate(width / 2 - x * 3, height / 2 - y * 3).scale(3)
              svgD3.transition().duration(750).call(zoom.current.transform, transform)


              // previous method
              // panAndZoom({
              //   scaleX: 1800,
              //   scaleY: 1800,
              //   translateX: newTranslateX,
              //   translateY: newTranslateY,
              //   // translateX: point[0],
              //   // translateY: point[1],
              //   skewX: 0,
              //   skewY: 0,
              // });
              setOpen(false)
            }}>
              {location}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command >
  )
}
