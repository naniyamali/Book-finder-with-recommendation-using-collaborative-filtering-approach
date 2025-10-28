import { createClient } from "@/lib/supabase/server"
import { getRecommendations, triggerRecommendationUpdate } from "@/lib/actions/recommendations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"
import Link from "next/link"

async function RefreshButton() {
  async function refreshRecommendations() {
    "use server"
    await triggerRecommendationUpdate()
  }

  return (
    <form action={refreshRecommendations}>
      <Button type="submit" variant="outline">
        Refresh Recommendations
      </Button>
    </form>
  )
}

export default async function RecommendationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: recommendations } = await getRecommendations()

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Recommendations</h1>
          <p className="text-muted-foreground">Books you might enjoy based on your reading history</p>
        </div>
        <RefreshButton />
      </div>

      {recommendations && recommendations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec: any) => (
            <Card key={rec.id}>
              <CardHeader>
                {rec.recommended_book_cover_url && (
                  <img
                    src={rec.recommended_book_cover_url || "/placeholder.svg"}
                    alt={rec.recommended_book_title}
                    className="h-64 w-full rounded-md object-cover"
                  />
                )}
                <CardTitle className="line-clamp-2">{rec.recommended_book_title}</CardTitle>
                {rec.recommended_book_author && <CardDescription>{rec.recommended_book_author}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p>Score: {rec.score}</p>
                    <p className="mt-1">{rec.reason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Recommendations Yet</CardTitle>
            <CardDescription>
              Start exploring books to get personalized recommendations based on your reading patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>Browse Books</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
