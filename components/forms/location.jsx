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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
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
  const form = useForm()

  if (status === "unauthenticated") {
    router.push("/contribute")
    return (
      <LoaderCircle className="animate-spin mt-[48px] mx-auto" />
    )
  } else if (!session) {
    return (
      <LoaderCircle className="animate-spin mt-[48px] mx-auto" />
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
    const response = await res.json()
    setSubmitting(false)
    // TODO: type selection doesn't get reset to "Type"'
    form.reset()
    if (response.msg) {
      toast.success(response.msg)
      router.push(`/contribute/${map}?scroll=${window.scrollY}`)
    } else {
      toast.warning("Could not create a new location at this time")
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
                        <SelectItem value="cluster">Star Cluster (polygon)</SelectItem>
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
              name="thirdParty"
              defaultValue={false}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Third Party
                    </FormLabel>
                    <FormDescription>
                      Is this location from official Lancer source material or an unofficial third party source
                    </FormDescription>
                  </div>
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
                ? <LoaderCircle className="animate-spin" />
                : "Submit"
              }
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form >
  )
}
