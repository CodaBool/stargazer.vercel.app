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
import { useForm } from "react-hook-form"
import { LoaderCircle, X } from "lucide-react"
import { useEffect, useState } from "react"

export default function CreateLocation({ map }) {
  const { data: session, status } = useSession()
  const [submitting, setSubmitting] = useState()
  const router = useRouter()
  // TODO: pick on toast method
  const { toast: toasty } = useToast()
  const form = useForm()

  if (status === "unauthenticated") {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <p className="max-w-xl mb-8 text-center p-2">To add a new location, we'll have to authenticate you. This is done through magic links. All you need to provide is your email.</p>
        <Button className="w-64" onClick={() => signIn()}>Enter Email</Button >
      </div>
    )
  } else if (!session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="animate-spin w-16 h-16" />
      </div>
    )
  }

  async function submit(body) {
    body.map = map
    body.table = "location"
    setSubmitting(true)
    const res = await fetch('/api/contribute', {
      method: 'POST',
      body: JSON.stringify(body)
    })
    const response = await res.json();
    setSubmitting(false)
    // TODO: type selection doesn't get reset to "Type"'
    form.reset()
    if (response.msg) {
      toast(`${body.name} has been submitted for review`)
      router.push(`/contribute/${map}?scroll=${window.scrollY}`)
    } else {
      toasty({
        variant: "destructive",
        title: "Could not create new location",
        description: response.err,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-8 container mx-auto mt-4">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create a New Location</CardTitle>
              <Button variant="ghost" onClick={e => {
                e.preventDefault()
                router.push(`/contribute/${map}`)
              }}>
                <X />
              </Button>
            </div>
            <CardDescription>Add either a new polygon or point to the map. For other requests use the <a className="text-blue-50" href="https://github.com/CodaBool/community-vtt-maps/issues">issues</a > page</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              rules={{ required: "You must give a location name" }}
              name="name"
              defaultValue=""
              render={({ field }) => (
                <FormItem className="py-4">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Cradle" {...field} />
                  </FormControl>
                  <FormDescription>
                    The location name, if there are alternative names include them in the description
                  </FormDescription>
                  <FormMessage />
                </FormItem >
              )}
            />
            <FormField
              control={form.control}
              rules={{ required: "Pick a location type" }}
              name="type"
              defaultValue=""
              render={({ field }) => (
                <FormItem className="py-4">
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="territory">Territory (polygon)</SelectItem>
                        <SelectItem value="cluster">Cluster (polygon)</SelectItem>
                        <SelectItem value="terrestrial">Terrestrial</SelectItem>
                        <SelectItem value="gate">Gate</SelectItem>
                        <SelectItem value="jovian">Jovian</SelectItem>
                        <SelectItem value="moon">Moon</SelectItem>
                      </SelectContent>
                    </Select >
                  </FormControl>
                  <FormDescription>
                    Category for the location. Default to terrestrial if unknown.
                  </FormDescription>
                  <FormMessage />
                </FormItem >
              )}
            />
            <FormField
              control={form.control}
              rules={{ required: "This location must have coordinates" }}
              name="coordinates"
              defaultValue=""
              render={({ field }) => (
                <FormItem className="py-4">
                  <FormLabel>Coordinates</FormLabel>
                  <FormControl>
                    <Input placeholder="-82, 42" {...field} />
                  </FormControl>
                  <FormDescription>
                    The coordinates for this location. Use the the map to evaluate this. It's fine to use your best guess and add more detail in the description. Should be two numbers separated by a comma.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="faction"
              defaultValue=""
              render={({ field }) => (
                <FormItem className="py-4">
                  <FormLabel>Faction (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="HA" {...field} />
                  </FormControl>
                  <FormDescription>
                    Who has control over the location.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              rules={{ required: "Pick a location type" }}
              name="source"
              defaultValue=""
              render={({ field }) => (
                <FormItem className="py-4">
                  <FormLabel>Source of Information</FormLabel>
                  <FormControl>
                    <Input placeholder="Core pg. 234" {...field} />
                  </FormControl>
                  <FormDescription>
                    Page number from source material and name of book. 3rd party locations are acceptable
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              rules={{ required: "Please write more information about this location" }}
              name="description"
              defaultValue=""
              render={({ field }) => (
                <FormItem className="py-4">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    Formatting support will be added in a later release (newlines are not even supported yet), I'd keeping your description simple until the project progresses
                  </FormDescription>
                  <FormMessage />
                </FormItem>
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
