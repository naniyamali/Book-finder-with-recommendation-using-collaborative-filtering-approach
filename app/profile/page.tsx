import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get reading stats
  const { count: totalViewed } = await supabase
    .from("reading_history")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("action_type", "viewed")

  const { count: totalSaved } = await supabase
    .from("reading_history")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("action_type", "saved")

  const { count: totalRecommendations } = await supabase
    .from("recommendations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">My Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Display Name</p>
              <p className="text-sm text-muted-foreground">{profile?.display_name || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Member Since</p>
              <p className="text-sm text-muted-foreground">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Unknown"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reading Statistics</CardTitle>
            <CardDescription>Your activity summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Books Viewed</span>
              <span className="text-2xl font-bold">{totalViewed || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Books Saved</span>
              <span className="text-2xl font-bold">{totalSaved || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recommendations</span>
              <span className="text-2xl font-bold">{totalRecommendations || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
