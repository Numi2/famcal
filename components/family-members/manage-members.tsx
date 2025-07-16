"use client"

import { useState } from "react"
import { useLocalFamilyMembers } from "@/lib/local-storage/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Users, Trash2, Edit, AlertCircle } from "lucide-react"

interface ManageMembersProps {
  familyId: string
}

export function ManageMembers({ familyId }: ManageMembersProps) {
  const { members, isLoading, createMember, updateMember, deleteMember } = useLocalFamilyMembers(familyId)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingMember, setEditingMember] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    role: "parent" as "parent" | "child",
    color: "#3b82f6",
    email: ""
  })
  const [formError, setFormError] = useState("")

  const colors = [
    { value: "#3b82f6", label: "Blue" },
    { value: "#ec4899", label: "Pink" },
    { value: "#8b5cf6", label: "Purple" },
    { value: "#10b981", label: "Green" },
    { value: "#f59e0b", label: "Yellow" },
    { value: "#ef4444", label: "Red" },
    { value: "#6366f1", label: "Indigo" },
    { value: "#14b8a6", label: "Teal" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    try {
      if (editingMember) {
        await updateMember(editingMember, formData)
      } else {
        await createMember({
          family_id: familyId,
          ...formData
        })
      }
      
      // Reset form
      setFormData({
        name: "",
        role: "parent",
        color: "#3b82f6",
        email: ""
      })
      setShowAddDialog(false)
      setEditingMember(null)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save member")
    }
  }

  const handleEdit = (member: any) => {
    setFormData({
      name: member.name,
      role: member.role,
      color: member.color,
      email: member.email || ""
    })
    setEditingMember(member.id)
    setShowAddDialog(true)
  }

  const handleDelete = async (memberId: string) => {
    if (confirm("Are you sure you want to remove this family member?")) {
      try {
        await deleteMember(memberId)
      } catch (err) {
        console.error("Failed to delete member:", err)
      }
    }
  }

  if (isLoading) return <div>Loading family members...</div>

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Family Members
            </CardTitle>
            <CardDescription>Manage your family members</CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => {
                setEditingMember(null)
                setFormData({
                  name: "",
                  role: "parent",
                  color: "#3b82f6",
                  email: ""
                })
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingMember ? "Edit" : "Add"} Family Member</DialogTitle>
                <DialogDescription>
                  {editingMember ? "Update the family member's information" : "Add a new member to your family"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {formError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value: "parent" | "child") => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.value }} />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingMember ? "Update" : "Add"} Member
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No family members yet. Click "Add Member" to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(member)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(member.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}