import db from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]/route'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) throw "unauthorized"
    const body = await req.json()
    const user = await db.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw "there is an issue with your account or session"
    console.log("create", body)
    let response
    if (body.type === "location") {
      response = await db.location.create({
        data: {
          name: body.name,
          description: body.description,
          type: body.type,
          coordinates: body.coordinates,
          faction: body.faction,
          source: body.source,
          map: body.map,
          userId: user.id,
        }
      })
    } else if (body.type === "comment") {
      response = await db.comment.create({
        data: {
          userId: user.id,
          content: body.content,
          locationId: body.locationId,
        }
      })
    }
    return Response.json({ id: response.id })
  } catch (err) {
    console.error(err)
    if (typeof err === 'string') {
      return Response.json({ err }, { status: 400 })
    } else if (typeof err?.message === "string") {
      return Response.json({ err: err.message }, { status: 500 })
    } else {
      return Response.json(err, { status: 500 })
    }
  }
  // const { searchParams } = new URL(request.url)
  // const id = searchParams.get('id')
  // const formData = await request.formData()
  // const name = formData.get('name')
}

export async function GET(req, res) {
  const { searchParams } = new URL(request.url)
  const map = searchParams.get('map')
  try {
    const questions = await db.question.findMany({
      where: {
        published: true,
        map,
      }
    })
    console.log("questions", questions)
    res.status(200).json(questions)
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
}
