'use client'
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { Heart, Github, Copyright, History } from "lucide-react"
import Dialog from './dialog'
import Contribute from './contribute'
import Link from "next/link"

export default function Menu({ width, height, zoom, svg, projection }) {
  return (
    <Menubar style={{ color: 'white' }}>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            <Link href="/points.topojson" target="_blank" download>Download Points Topojson</Link>
          </MenubarItem>
          <MenubarItem>
            <Link href="/polygons.topojson" target="_blank" download>Download Polygon Topojson</Link>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem className="text-gray-500">
            Create embed
          </MenubarItem >
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <Dialog zoom={zoom} width={width} height={height} svg={svg} projection={projection} />
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger><Heart size={16} className="relative top-[1px] pe-[2px]" /> Contribute</MenubarTrigger>
        <MenubarContent>
          <Contribute text="Edit existing content" />
          <MenubarSeparator />
          <Contribute text="Add a new content" />
          <MenubarSeparator />
          <Contribute text="Create a new map" />
          <MenubarSeparator />
          <Contribute text="Make a suggestion" />
          <MenubarSeparator />
          <Contribute text="Make a fork" />
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger><Github size={16} className="relative top-[1px] pe-[2px]" />  About</MenubarTrigger>
        <MenubarContent>
          <MenubarItem inset><a href="https://github.com/codabool/community-vtt-maps/blob/main/license" target="_blank"><Copyright size={16} className="inline" /> License</a></MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset><a href="https://github.com/codabool/community-vtt-maps" target="_blank"><Github size={16} className="inline" /> Source Code</a></MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset><a href="https://github.com/codabool/community-vtt-maps/releases" target="_blank"><History size={16} className="inline" /> Version History</a></MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
