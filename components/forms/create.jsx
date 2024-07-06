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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession, signIn } from "next-auth/react"
import useSWR from 'swr'
import { useForm } from "react-hook-form"
import { LoaderCircle } from "lucide-react"

const fetcher = (...args) => fetch(...args).then(res => res.json())

export default function create() {
  const { data: session, status } = useSession()
  // const { data, error, isLoading } = useSWR(`/api/contribute?map=${map}`, fetcher)
  const form = useForm()
  // const { map } = params

  if (status === "unauthenticated") {
    signIn()
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="animate-spin w-16 h-16" />
      </div>
    )
  } else if (!session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="animate-spin w-16 h-16" />
      </div>
    )
  }

  function submit(input) {
    console.log(input)
  }

  return (
    <Form {...form}>
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Create a New Location</CardTitle>
          <CardDescription>Add either a new polygon or point to the map. For other requests use the issues page</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-8 container mx-auto">
            <FormField
              control={form.control}
              name="name"
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Cradle" {...field} />
                  </FormControl>
                  <FormDescription>
                    The location name, if there are alternative names include them in the description
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select>
                      <SelectTrigger className="w-[551px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent {...field}>
                        <SelectItem value="territory">Territory</SelectItem>
                        <SelectItem value="terrestrial">Terrestrial</SelectItem>
                        <SelectItem value="gate">Gate</SelectItem>
                        <SelectItem value="jovian">Jovian</SelectItem>
                        <SelectItem value="moon">Moon</SelectItem>
                        <SelectItem value="cluster">Cluster</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Polygon locations are either cluster or territory. 
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
                <FormItem>
                  <FormLabel>Faction</FormLabel>
                  <FormControl>
                    <Input placeholder="HA" {...field} />
                  </FormControl>
                  <FormDescription>
                    Who has control over the location. Use "none" if not applicable or mixed control.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source of Information</FormLabel>
                  <FormControl>
                    <Input placeholder="Core pg. 234" {...field} />
                  </FormControl>
                  <FormDescription>
                    Page number from source material and name of book.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              defaultValue=""
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" variant="outline" className="w-full">Submit</Button>
        </CardFooter>
      </Card>
    </Form >
  )
}
