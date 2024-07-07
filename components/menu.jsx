'use client'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { Heart, Github, Copyright, History, Sparkles, Telescope, SquareArrowOutUpRight, MoonStar, Sparkle } from "lucide-react"
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
      <MenubarMenu>
        <MenubarTrigger><Heart size={16} className="relative top-[1px] pe-[2px]" /> Contribute</MenubarTrigger>
        <MenubarContent>
          <Link href="/contribute/lancer"><MenubarItem inset className="ps-4 cursor-pointer">Edit existing locations</MenubarItem></Link>
          <MenubarSeparator />
          <Link href="/contribute/lancer?post=true"><MenubarItem inset className="ps-4 cursor-pointer">Add new locations</MenubarItem></Link>
          <MenubarSeparator />
          <a href="https://github.com/codabool/community-vtt-maps/issues" target="_blank"><MenubarItem inset className="ps-4 cursor-pointer">Create a new map</MenubarItem></a>
          <MenubarSeparator />
          <a href="https://github.com/codabool/community-vtt-maps/issues" target="_blank"><MenubarItem inset className="ps-4 cursor-pointer">Make a suggestion</MenubarItem></a>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger><Github size={16} className="relative top-[1px] pe-[2px]" />  About</MenubarTrigger>
        <MenubarContent>
          <a href="https://github.com/codabool/community-vtt-maps/blob/main/license" target="_blank"><MenubarItem inset className="cursor-pointer"><Copyright size={16} className="inline mr-1" /> License</MenubarItem></a>
          <MenubarSeparator />
          <a href="https://github.com/codabool/community-vtt-maps" target="_blank"><MenubarItem inset className="cursor-pointer"><Github size={16} className="inline mr-1" /> Source Code</MenubarItem></a>
          <MenubarSeparator />
          <a href="https://github.com/codabool/community-vtt-maps/releases" target="_blank"><MenubarItem inset className="cursor-pointer"><History size={16} className="inline mr-1" /> Version History</MenubarItem></a>
          <MenubarSeparator />
          <CustomDialog
            titleJSX={<><Heart size={18} className="pe-[2px] animate-bounce inline mr-2" />Credits</>}
            content={<Credits />}
          >
            <span className="relative left-[-25px]">
              <Heart size={16} className="relative top-[-1px] pe-[2px] ml-[1em] inline" /> Credits
            </span >
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

function Credits() {
  return (
    <>
      <span className="text-xl"><Telescope className="inline pr-2 ml-[13em]" size={32} /> Major</span>
      <span className="flex mb-[10em]">
        <span className="flex-1">
          <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(-40, -90) scale(0.4)">
              <path id="svg_3" d="m110.45,277.97498l9.54922,0l2.95078,-8.78524l2.95078,8.78524l9.54921,0l-7.72546,5.42952l2.95093,8.78524l-7.72547,-5.42966l-7.72547,5.42966l2.95093,-8.78524l-7.72547,-5.42952z" stroke="black" fill="#fff" />
              <path id="svg_5" d="m218.45,252.97498l9.54922,0l2.95078,-8.78524l2.95078,8.78524l9.54922,0l-7.72547,5.42952l2.95094,8.78524l-7.72547,-5.42966l-7.72547,5.42966l2.95094,-8.78524l-7.72547,-5.42952z" stroke="black" fill="white" />
              <path id="svg_6" d="m270.45001,295.97498l9.54922,0l2.95078,-8.78524l2.95078,8.78524l9.54922,0l-7.72547,5.42952l2.95094,8.78524l-7.72547,-5.42966l-7.72547,5.42966l2.95094,-8.78524l-7.72547,-5.42952z" stroke="black" fill="#fff" />
              <path id="svg_7" d="m379.45,425.97501l9.54922,0l2.95078,-8.78524l2.95078,8.78524l9.54922,0l-7.72547,5.42952l2.95094,8.78524l-7.72547,-5.42966l-7.72547,5.42966l2.95094,-8.78524l-7.72547,-5.42952z" stroke="black" fill="#fff" />
              <path id="svg_8" d="m529.45003,436.97504l9.54922,0l2.95078,-8.78524l2.95078,8.78524l9.54922,0l-7.72547,5.42952l2.95094,8.78524l-7.72547,-5.42966l-7.72547,5.42966l2.95094,-8.78524l-7.72547,-5.42952z" stroke="black" fill="#fff" />
              <path id="svg_9" d="m547.45006,338.97501l9.54922,0l2.95078,-8.78524l2.95078,8.78524l9.54922,0l-7.72547,5.42952l2.95094,8.78524l-7.72547,-5.42966l-7.72547,5.42966l2.95094,-8.78524l-7.72547,-5.42952z" stroke="black" fill="#fff" />
              <path id="svg_10" d="m362.45003,345.97501l9.54922,0l2.95078,-8.78524l2.95078,8.78524l9.54922,0l-7.72547,5.42952l2.95094,8.78524l-7.72547,-5.42966l-7.72547,5.42966l2.95094,-8.78524l-7.72547,-5.42952z" stroke="black" fill="#fff" />
              <line id="svg_11" y2="257.00005" x2="232.0001" y1="282.00006" x1="123.00008" stroke="mediumpurple" fill="none" />
              <line id="svg_12" y2="441.00008" x2="542.00014" y1="342.00007" x1="560.00015" stroke="mediumpurple" fill="none" />
              <line id="svg_13" y2="442.00008" x2="543.00014" y1="428.00008" x1="391.00012" stroke="mediumpurple" fill="none" />
              <line id="svg_14" y2="342.00007" x2="560.00015" y1="349.00007" x1="376.00012" stroke="mediumpurple" fill="none" />
              <line id="svg_15" y2="300.00006" x2="285.0001" y1="256.00005" x1="230.0001" stroke="mediumpurple" fill="none" />
              <line id="svg_16" y2="346.00007" x2="375.00012" y1="427.00008" x1="391.00012" stroke="mediumpurple" fill="none" />
              <line id="svg_17" y2="349.00007" x2="374.00012" y1="298.00006" x1="284.0001" stroke="mediumpurple" fill="none" />
            </g>
          </svg>
        </span>
        <span className="flex-1 text-left">
          <span><Sparkles className="inline pr-2" /><a href="https://cohost.org/janederscore" target="_blank"> Janederscore <SquareArrowOutUpRight className="inline" size={14} /></a></span><br />
          <span><Sparkles className="inline pr-2" /> Starwall</span><br />
        </span>
      </span>
      <span className="text-xl"><MoonStar className="inline pr-2 ml-[13em]" size={32} /> Minor</span>
      <span className="flex">
        <span className="flex-1">
          <svg width="240" height="100" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(-40, -10) scale(0.4)">
              <path id="svg_3" d="m179.45002,183.97498l9.54922,0l2.95078,-8.78524l2.95078,8.78524l9.54921,0l-7.72546,5.42952l2.95093,8.78524l-7.72547,-5.42966l-7.72547,5.42966l2.95093,-8.78524l-7.72547,-5.42952z" stroke="#000" fill="#fff" />
              <path id="svg_5" d="m226.45,220.97498l9.54922,0l2.95078,-8.78524l2.95078,8.78524l9.54922,0l-7.72547,5.42952l2.95094,8.78524l-7.72547,-5.42966l-7.72547,5.42966l2.95094,-8.78524l-7.72547,-5.42952z" stroke="#000" fill="#fff" />
              <path id="svg_6" d="m239.45,116.97495l9.54922,0l2.95078,-8.78524l2.95078,8.78524l9.54922,0l-7.72547,5.42952l2.95094,8.78524l-7.72547,-5.42966l-7.72547,5.42966l2.95094,-8.78524l-7.72547,-5.42952z" stroke="#000" fill="#fff" />
              <path id="svg_7" d="m476.45001,128.97495l9.54922,0l2.95078,-8.78524l2.95078,8.78524l9.54922,0l-7.72547,5.42952l2.95094,8.78524l-7.72547,-5.42966l-7.72547,5.42966l2.95094,-8.78524l-7.72547,-5.42952z" stroke="#000" fill="#fff" />
              <path id="svg_8" d="m551.45003,151.97501l9.54922,0l2.95078,-8.78524l2.95078,8.78524l9.54922,0l-7.72547,5.42952l2.95094,8.78524l-7.72547,-5.42966l-7.72547,5.42966l2.95094,-8.78524l-7.72547,-5.42952z" stroke="#000" fill="#fff" />
              <path id="svg_9" d="m383.45004,120.97498l9.54922,0l2.95078,-8.78524l2.95078,8.78524l9.54922,0l-7.72547,5.42952l2.95094,8.78524l-7.72547,-5.42966l-7.72547,5.42966l2.95094,-8.78524l-7.72547,-5.42952z" stroke="#000" fill="#fff" />
              <path id="svg_10" d="m274.45002,165.97498l9.54922,0l2.95078,-8.78524l2.95078,8.78524l9.54922,0l-7.72547,5.42952l2.95094,8.78524l-7.72547,-5.42966l-7.72547,5.42966l2.95094,-8.78524l-7.72547,-5.42952z" stroke="#000" fill="#fff" />
              <line id="svg_18" y2="226.00005" x2="240.0001" y1="186.00004" x1="191.00009" stroke="mediumpurple" fill="none" />
              <line id="svg_19" y2="132.00004" x2="487.00014" y1="156.00004" x1="564.00015" stroke="mediumpurple" fill="none" />
              <line id="svg_20" y2="170.00004" x2="287.0001" y1="124.00003" x1="395.00012" stroke="mediumpurple" fill="none" />
              <line id="svg_21" y2="120.00003" x2="252.0001" y1="185.00004" x1="191.00009" stroke="mediumpurple" fill="none" />
              <line id="svg_22" y2="124.00003" x2="394.00012" y1="131.00004" x1="488.00014" stroke="mediumpurple" fill="none" />
              <line id="svg_23" y2="170.00004" x2="289.00011" y1="224.00005" x1="239.0001" stroke="mediumpurple" fill="none" />
              <line id="svg_24" y2="171.00004" x2="289.00011" y1="121.00003" x1="252.0001" stroke="mediumpurple" fill="none" />
            </g >
          </svg>
        </span>
        <span className="flex-1">
          {/* <span><Sparkle className="inline pr-2" /><a href="" target="_blank"> placeholder <SquareArrowOutUpRight className="inline" size={14} /></a></span><br /> */}
          {/* <span><Sparkle className="inline pr-2" /> contribute to be added</span><br /> */}
        </span>
      </span>

      <span className="text-center block text-[dimgray] mt-8">Lancer is copyright Massif Press</span>
    </>
  )
}
