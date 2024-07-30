import { redirect } from "next/navigation"
import db from "@/lib/db"

export default async function RedirectPage({ params, searchParams }) {
  const { name, map } = searchParams
  const location = await db.location.findFirst({
    where: {
      name,
      map,
    },
  })
  if (location) {
    redirect(`/contribute/${map}/${location.id}`)
  } else {
    redirect(`/contribute/${map}`)
  }
  return (
    <div className="flex items-center justify-center mt-[40vh]">
      <LoaderCircle className="w-16 h-16 animate-spin" />
    </div>
  )
}
