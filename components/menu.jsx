'use client'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { Heart, Github, Copyright, History, Sparkles, Telescope, SquareArrowOutUpRight } from "lucide-react"
import Dialog from './dialog'
import CustomDialog from './contribute'
import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "./ui/button"

export default function Menu({ width, height, zoom, svg, projection, nav }) {
  const { data: session, status } = useSession()

  if (nav) return (
    <Menubar style={{ color: 'white' }}>
      <MenubarMenu>
        <MenubarTrigger>Maps</MenubarTrigger>
        <MenubarContent>
          <Link href="/">
            <MenubarItem className="cursor-pointer">
              Lancer
            </MenubarItem >
          </Link>
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
      {session
        ? <MenubarMenu>
          <MenubarTrigger><Heart size={16} className="relative top-[1px] pe-[2px]" /> Contribute</MenubarTrigger>
          <MenubarContent>
            <Link href="/contribute/lancer?tab=edit"><MenubarItem inset className="ps-4 cursor-pointer">Edit existing locations</MenubarItem></Link>
            <MenubarSeparator />
            <Link href="/contribute/lancer?tab=create"><MenubarItem inset className="ps-4 cursor-pointer">Add new locations</MenubarItem></Link>
            <MenubarSeparator />
            <a href="https://github.com/codabool/community-vtt-maps/issues" target="_blank"><MenubarItem inset className="ps-4 cursor-pointer">Create a new map</MenubarItem></a>
            <MenubarSeparator />
            <a href="https://github.com/codabool/community-vtt-maps/issues" target="_blank"><MenubarItem inset className="ps-4 cursor-pointer">Make a suggestion</MenubarItem></a>
          </MenubarContent>
        </MenubarMenu>
        : <MenubarMenu>
          <CustomDialog
            to="/api/auth/signin"
            title="Want to improve this map?"
            content={<span>If you want to contribute, you'll need to signin. Please enter your email and a magic link will be emailed to you.</span>}
          >
            <Heart size={16} className="relative top-[1px] pe-[2px]" /> Contribute
          </CustomDialog>
        </MenubarMenu>
      }

      <MenubarMenu>
        <MenubarTrigger><Github size={16} className="relative top-[1px] pe-[2px]" />  About</MenubarTrigger>
        <MenubarContent>
          <a href="https://github.com/codabool/community-vtt-maps/blob/main/license" target="_blank"><MenubarItem inset className="cursor-pointer"><Copyright size={16} className="inline" /> License</MenubarItem></a>
          <MenubarSeparator />
          <a href="https://github.com/codabool/community-vtt-maps" target="_blank"><MenubarItem inset className="cursor-pointer"><Github size={16} className="inline" /> Source Code</MenubarItem></a>
          <MenubarSeparator />
          <a href="https://github.com/codabool/community-vtt-maps/releases" target="_blank"><MenubarItem inset className="cursor-pointer"><History size={16} className="inline" /> Version History</MenubarItem></a>
          <MenubarSeparator />
          <CustomDialog
            titleJSX={<><Heart size={18} className="pe-[2px] animate-bounce inline" />Credits</>}
            content={<span className="text-xl">
              <span><Telescope className="inline pr-2"/><a href="https://cohost.org/janederscore" target="_blank"> Janederscore <SquareArrowOutUpRight className="inline" size={14} /></a></span><br />
              <span><Sparkles className="inline pr-2"/> Starwall</span><br />
            </span>}
          >
            <Heart size={16} className="relative top-[1px] pe-[2px]" /> Major Credits
          </CustomDialog>
        </MenubarContent>
      </MenubarMenu>
      {session &&
        <MenubarMenu>
          <MenubarTrigger >Account</MenubarTrigger >
          <MenubarContent>
            <MenubarItem inset className="ps-4 cursor-pointer text-gray-500">See Profile</MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => signOut()} className="ps-4 cursor-pointer">
              Signout
            </MenubarItem >
          </MenubarContent>
        </MenubarMenu>
      }
    </Menubar>
  )
}
