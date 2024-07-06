"use client"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession, signIn, signOut } from "next-auth/react"
import { redirect } from 'next/navigation'
import { LoaderCircle } from "lucide-react"
import { Menubar } from "@/components/ui/menubar"

export default function Contribute({ params }) {
  const { data: session, status } = useSession()
  const { register, control, handleSubmit, watch, getFieldState, formState: { errors } } = useForm()
  const { map } = params

  if (status === "unauthenticated") {
    signIn()
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="animate-spin w-16 h-16" />
      </div>
    )
  }
  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="animate-spin w-16 h-16" />
      </div>
    )
  }

  function submit(data) {
    console.log(data)
  }

  return (
    <Form getFieldState={getFieldState}>
      <form onSubmit={handleSubmit(submit)} className="space-y-8">
        <div className="text-center mt-24 text-green-200 animate-bounce text-4xl">
          coming soon
        </div >
        {/* <FormField
          control={control}
          name="username"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button> */}
      </form>
    </Form >
  )
}
