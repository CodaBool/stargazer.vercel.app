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

    // check if this user has at least 2 approved comments
    const publishedComments = await db.comment.findMany({ where: { userId: user.id, published: true } })
    const published = publishedComments.length > 1

    let response
    if (body.table === "location") {
      response = await db.location.create({
        data: {
          name: body.name,
          description: body.description,
          type: body.type,
          coordinates: body.coordinates,
          thirdParty: body.thirdParty,
          faction: body.faction,
          source: body.source,
          map: body.map,
          userId: user.id,
          published,
        }
      })
    } else if (body.table === "comment") {
      response = await db.comment.create({
        data: {
          userId: user.id,
          content: body.content,
          locationId: body.locationId,
          published,
        }
      })
    }
    if (!response) throw "could not create new row"

    if (!published) {
      // email for review
      body.links = {
        map: `https://community-maps.vercel.app/${body.map}`,
        publish: `https://community-maps.vercel.app/api/contribute?type=${body.table}&id=${response.id}&secret=${process.env.EMAIL_SECRET}`,
      }
      // send email for review
      const urlParams = new URLSearchParams({
        subject: `New ${body.map} ${body.table} for review`,
        to: "codabool@pm.me",
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
    }

    return Response.json({
      msg: published ? `Your ${body.table} has been published` : `Your ${body.table} has been submitted for review`
    })
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

// be aware that nextjs 13 does aggressive caching on GETs
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
  } catch (error) {
    console.error("could not publish", id, type, secret, error);
    return Response.json({ error }, { status: 500 });
  }
}
