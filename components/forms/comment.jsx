'use client'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession, signIn } from "next-auth/react"
import useSWR from 'swr'
import { useForm } from "react-hook-form"
import { LoaderCircle, X } from "lucide-react"
import { useEffect, useState } from "react"

export default function CreateComment({ map, location }) {
  const { data: session, status } = useSession()
  const [submitting, setSubmitting] = useState()
  const router = useRouter()
  const { toast: toasty } = useToast()
  const form = useForm()

  async function submit(body) {
    body.table = "comment"
    body.map = map
    body.locationId = location.id
    setSubmitting(true)
    const res = await fetch('/api/contribute', {
      method: 'POST',
      body: JSON.stringify(body)
    })
    const response = await res.json();
    setSubmitting(false)
    // console.log(text)
    // TODO: type selection doesn't get reset to "Type"'
    form.reset()
    if (response.id) {
      toast("your comment has been submitted for review")
      // TODO: this doesn't close comment form
      router.refresh()
      router.push(`/contribute/${map}?scroll=${window.scrollY}`)
    } else {
      toasty({
        variant: "destructive",
        title: "Could not create a new comment at this time",
        description: response.err,
      })
    }
  }

  useEffect(() => {
    // scroll to newly opened comment form
    const el = document.querySelector(`.location-${location.id}`)
    if (!el) return
    el.scrollIntoView()
  }, [])

  
  if (status === "unauthenticated") {
    signIn()
    return (
      <LoaderCircle className="animate-spin m-4" />
    )
  } else if (!session) {
    return (
      <LoaderCircle className="animate-spin m-4" />
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="w-full">
        <Card className="">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create Comment</CardTitle>
              <Button variant="ghost" onClick={e => {
                e.preventDefault()
                router.push(`/contribute/${map}?scroll=${window.scrollY}`)
              }}>
                <X />
              </Button>
            </div>
            <CardDescription>Add context to this location</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              rules={{ required: "This is required" }}
              name="content"
              defaultValue=""
              render={({ field }) => (
                <FormItem className="">
                  {/* <FormLabel>Name</FormLabel> */}
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem >
              )}
            />
          </CardContent>
          <CardFooter>
            <Button disabled={submitting} type="submit" variant="outline" className="w-full">
              {submitting
                ? <LoaderCircle className="animate-spin w-16 h-16" />
                : "Submit"
              }
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form >
  )
}
