"use client"

import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

const ADMIN_EMAILS = [
  "mishkaautomator@gmail.com",
  "hkaur_be23@thapar.edu",
]

export default function ProfileDropdown({
  email,
}: {
  email: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleAdminClick = () => {
    if (ADMIN_EMAILS.includes(email)) {
      router.push("/dashboard")
    } else {
      alert("You are not authorized as Admin.")
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="bg-white px-4 py-2 rounded-md shadow border"
      >
        {email}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border rounded-md p-2">
          <button
            onClick={handleAdminClick}
            className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
          >
            Sign in as Admin
          </button>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}