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
    let response
    if (body.table === "location") {
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
    } else if (body.table === "comment") {
      response = await db.comment.create({
        data: {
          userId: user.id,
          content: body.content,
          locationId: body.locationId,
        }
      })
    }
    if (!response) throw "could not create new row"

    body.links = {
      map: `https://community-maps.vercel.app/${body.map}`,
      publish: `https://community-maps.vercel.app/api/contribute?type=${body.table}&id=${response.id}&secret=${process.env.EMAIL_SECRET}`,
    }
    // send email for review
    const urlParams = new URLSearchParams({
      subject: `New ${body.map} ${body.table} for review`,
      to: "contact@codabool.com",
      name: user.alias ? user.alias : user.email,
      from: user.email,
      format: "text/plain",
      secret: process.env.EMAIL_SECRET,
    }).toString()

    const email = await fetch(`https://email.codabool.workers.dev/?${urlParams}`, {
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      method: "POST",
    })

    if (!email.ok) throw await email.text()

    return Response.json({ msg: "success" })
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
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const id = Number(searchParams.get('id'))
  // const action = searchParams.get('action')
  const secret = searchParams.get('secret')
  if (secret !== process.env.EMAIL_SECRET) throw "unauthorized"
  try {
    await db[type].update({
      where: { id },
      data: { published: true },
    })
    return new Response(`successfully published ${type}`)
    res.status(200).json({ message: `successfully published ${type}` })
  } catch (error) {
    console.error("could not publish", id, type, secret, error);
    return Response.json({ error }, { status: 500 });
  }
}
