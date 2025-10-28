import { createClient } from "@/lib/supabase/server"
import { getReadingHistory, getSavedBooks } from "@/lib/actions/reading-history"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { redirect } from "next/navigation"

export default async function HistoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: history } = await getReadingHistory()
  const { data: savedBooks } = await getSavedBooks()

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">My Reading History</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All History</TabsTrigger>
          <TabsTrigger value="saved">Saved Books</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {history && history.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {history.map((item: any) => (
                <Card key={item.id}>
                  <CardHeader>
                    {item.book_cover_url && (
                      <img
                        src={item.book_cover_url || "/placeholder.svg"}
                        alt={item.book_title}
                        className="h-48 w-full rounded-md object-cover"
                      />
                    )}
                    <CardTitle className="line-clamp-2">{item.book_title}</CardTitle>
                    {item.book_author && <CardDescription>{item.book_author}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="capitalize">{item.action_type}</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No History Yet</CardTitle>
                <CardDescription>Start exploring books to build your reading history</CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          {savedBooks && savedBooks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedBooks.map((item: any) => (
                <Card key={item.id}>
                  <CardHeader>
                    {item.book_cover_url && (
                      <img
                        src={item.book_cover_url || "/placeholder.svg"}
                        alt={item.book_title}
                        className="h-48 w-full rounded-md object-cover"
                      />
                    )}
                    <CardTitle className="line-clamp-2">{item.book_title}</CardTitle>
                    {item.book_author && <CardDescription>{item.book_author}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Saved on {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Saved Books</CardTitle>
                <CardDescription>Save books you want to read later</CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
