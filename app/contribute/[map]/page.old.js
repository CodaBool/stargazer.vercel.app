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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { LoaderCircle } from "lucide-react"
import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then(res => res.json())

export default function Contribute({ params }) {
  const { data: session, status } = useSession()
  const { data, error, isLoading } = useSWR(`/api/contribute?map=${map}`, fetcher)
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

  function submit(input) {
    console.log(input)
  }

  return (
    <Form getFieldState={getFieldState}>
      <form onSubmit={handleSubmit(submit)} className="space-y-8">
        <Accordion type="single" collapsible>
          {questions.map((question, i) => {
            return (
              <AccordionItem value={i}>
                <AccordionTrigger>{question.title}</AccordionTrigger>
                <AccordionContent>
                  <p>resolved: {question.resolved ? 'yes' : 'no'}</p>
                  {question.content}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>

        <FormField
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
        <Button type="submit">Submit</Button>
      </form>
    </Form >
  )
}
