import { useSession, signIn, signOut } from "next-auth/react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getServerSession } from "next-auth/next"
import { LoaderCircle } from "lucide-react"
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js"
import db from "@/lib/db"
import CommentForm from "@/components/forms/comment"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ScrollTo from "@/components/scroll"
import CreateLocation from "@/components/forms/location"
import Avatar from "boring-avatars"

export default async function Contribute({ params, searchParams }) {
  const session = await getServerSession(authOptions)

  const { map } = params
  const { post, comment, scroll } = searchParams
  const user = session ? await db.user.findUnique({ where: { email: session.user.email } }) : null
  const locations = await db.location.findMany({
    where: {
      OR: [
        { published: true },
        { userId: user ? user.id : "" }
      ],
      map,
    },
    include: {
      comments: {
        where: {
          OR: [
            { published: true },
            { userId: user ? user.id : "" },
          ]
        }
      }
    }
  })
  const commenterIds = locations.flatMap(l => l.comments.map(c => c.userId))
  const commenters = await db.user.findMany({
    where: {
      id: {
        in: commenterIds
      }
    },
    select: {
      id: true,
      alias: true,
      email: true,
    }
  })
  // console.log("aliases", commenters)
  locations.forEach(location => {
    location.comments.forEach(comment => {
      const commenter = commenters.find(user => user.id === comment.userId);
      comment.alias = commenter.alias ? commenter.alias : commenter.email.split('@')[0]
      // comment.email = commenter.email
    })
  })

  // console.log("locations", locations.map(l => l.comments))

  return (
    <>
      {post
        ? <CreateLocation map={map} />
        : <Link href={`/contribute/${map}?post=true`} ><Button variant="outline" className="container mx-auto flex justify-center mt-8">Create new Location</Button ></Link>
      }
      {scroll && <ScrollTo scroll={scroll} />}
      <h1 className="text-2xl text-green-100 text-center mt-8">🚧 All data is temporary while in development! Save any serious submitions for a beta release.</h1>
      {locations.length === 0 && <h1 className="text-bounce text-2xl text-green-100 text-center mt-8">No Location discussions found</h1 >}
      {locations.map(location => {
        return (
          <Card className={`container mx-auto my-8 location-${location.id}`} key={location.id}>
            <CardHeader>
              <CardTitle>{location.name}{!location.published && <Badge className="relative top-[-4px] ml-4">Pending Review</Badge >}</CardTitle>
              <CardDescription>{location.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p><strong>coordinates</strong>: {location.coordinates}</p>
              {location.faction && <p><strong>faction</strong>: {location.faction}</p>}
              <p><strong>source</strong>: {location.source}</p>
              <p><strong>type</strong>: {location.type}</p>
            </CardContent>
            <CardFooter className="flex-col items-start">
              {Number(comment) === location.id
                ? <CommentForm map={map} location={location} />
                : <Link href={`/contribute/${map}?comment=${location.id}`}><Button variant="outline" className="">Create Comment</Button></Link>
              }
              {location.comments?.length > 0 &&
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Comments</AccordionTrigger>
                    <AccordionContent>
                      {location.comments.map(comment => {
                        return (
                          <div className="border border-gray-800 p-2 rounded mb-1" key={comment.id}>
                            <div className="flex items-center mb-1">
                              <Avatar
                                size={25}
                                name={comment.alias}
                                variant="beam"
                                colors={[
                                  '#DBD9B7',
                                  '#C1C9C8',
                                  '#A5B5AB',
                                  '#949A8E',
                                  '#615566',
                                ]}
                              />
                              <h2 className="font-bold text-lg mx-2">{comment.alias}</h2>
                              {!comment.published && <Badge>Pending Review</Badge>}
                            </div>
                            <p>{comment.content}</p>
                          </div>
                        )
                      })}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              }
            </CardFooter >
          </Card>
        )
      })}
    </>
  )
}
