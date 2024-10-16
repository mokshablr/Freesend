import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


export function TodayTaskAlert({txt, mtotal, mdue, ototal }: { txt: string, mtotal: number, mdue: number, ototal: number }) {

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Welcome Back!</CardTitle>
        <CardDescription>
          {txt} <Link href="/meetings" className="font-semibold">{mtotal} upcoming meetings</Link> (<Link href="/meetings/overdue" className="font-semibold">{mdue} overdue</Link>)
          and <Link href="/opportunities" className="font-semibold">{ototal} opportunities</Link> with close date this week.
        </CardDescription>
      </CardHeader>
    </Card>

  )
}