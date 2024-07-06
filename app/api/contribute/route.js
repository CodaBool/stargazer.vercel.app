import db from "@/lib/db"

export async function POST(req) {
  // const { searchParams } = new URL(request.url)
  // const id = searchParams.get('id')
  const r = await req.json()
  console.log(r)
  // const formData = await request.formData()
  // const name = formData.get('name')
  // await prisma.todo.create({
  //   data: { title, complete: false },
  // })
  return Response.json(r)
  // return NextResponse.json({ message: "Created Todo" }, { status: 200 });
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
