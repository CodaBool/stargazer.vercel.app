
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route.js"
import db from "@/lib/db"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import CreateLocation from "@/components/forms/location"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function Contribute({ params, searchParams }) {
  const session = await getServerSession(authOptions)
  const { p: openLocationForm } = searchParams
  const { map } = params

  // TODO: test if this will be a cached request for unauth requests
  const user = session ? await db.user.findUnique({ where: { email: session.user.email } }) : null
  const locations = await db.location.findMany({
    where: {
      OR: [
        { published: true },
        { userId: user ? user.id : "" }
      ],
      map,
    },
  })

  return (
    <div className="md:container mx-auto my-10">
      {openLocationForm
        ? <CreateLocation map={map} />
        : <Link href={`/contribute/${map}?p=1`} ><Button variant="outline" className="w-full my-4">Create a new Location</Button ></Link>
      }

      {(!locations || locations?.length === 0) &&
        <h1 className="text-2xl text-blue-100 text-center my-36">Could not fetch Location discussions at this time</h1>
      }

      <div className="flex flex-wrap justify-center">
        {locations?.map(location => {
          return (
            <Card className="w-full h-[120px] m-2 min-[392px]:w-[180px]" key={location.id}>
              <Link href={`/contribute/${map}/${location.id}`} className="block h-full">
                <CardContent className="p-2 m-0">
                  <div className="flex justify-center">
                    <Badge variant="destructive" className={`mx-auto ${location.thirdParty ? "" : "opacity-0"}`}>unofficial</Badge>
                  </div>
                  <p className="font-bold text-xl text-center overflow-hidden overflow-ellipsis">{location.name}</p>
                  <p className="text-center text-gray-500">{location.type}</p>
                </CardContent>
              </Link>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
