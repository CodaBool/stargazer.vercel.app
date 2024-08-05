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
  const [baseMap, variant] = map.split("-")
  const creator = variant === "starwall" ? "s" : "j"

  if (location) {
    redirect(`/contribute/${baseMap}/${location.id}`)
  } else {
    redirect(`/contribute/${baseMap}?v=${creator}`)
  }
  return (
    <div className="flex items-center justify-center mt-[40vh]">
      <LoaderCircle className="w-16 h-16 animate-spin" />
    </div>
  )
}
