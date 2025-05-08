"use client"
import Image from "next/image"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { User, ChevronDown, ChevronUp, Lock, Mail, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth, logout } from "@/context/auth-context"

export default function Profile() {
  const [personalInfoOpen, setPersonalInfoOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/signin")
    }
  }, [user])

  const handleLogout = () => {
    logout()
    router.push("/signin")
  }

  return (
    <section className="p-4">
      <Header />
      <div className="text-center">
        <div className="mt-7 mx-auto w-56 text-center">
          <Image 
            className="rounded-full mx-auto block" 
            src={user?.profilePicture || "/-go5dvk.jpg"}
            alt="user-profile-pic" 
            width={100} 
            height={100} 
          />
          <p className="text-2xl font-bold">{user.fullName || user.username}<br/>(Subscriber)</p>
        </div>

        <div className="mt-8 max-w-md mx-auto space-y-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setPersonalInfoOpen(!personalInfoOpen)}
              className="w-full flex justify-between items-center p-4 text-left font-medium text-gray-800 hover:bg-gray-50 transition-colors"
            >
              <span><User className="inline-flex mr-3 w-5 h-5" /> Personal Information</span>
              {personalInfoOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {personalInfoOpen && (
              <div className="p-4 pt-0 border-t border-gray-100">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Username:</span>
                    <span className="font-medium">{user.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{user.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Joined:</span>
                    <span className="font-medium">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setPasswordOpen(!passwordOpen)}
              className="w-full flex justify-between items-center p-4 text-left font-medium text-gray-800 hover:bg-gray-50 transition-colors"
            >
              <span><Lock className="inline-flex mr-3 w-5 h-5" /> Update Password</span>
              {passwordOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {passwordOpen && (
              <div className="p-4 pt-0 border-t border-gray-100">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                    <input 
                      type="password" 
                      className="w-full p-2 border border-gray-300 rounded-md" 
                      placeholder="••••••••" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">New Password</label>
                    <input 
                      type="password" 
                      className="w-full p-2 border border-gray-300 rounded-md" 
                      placeholder="••••••••" 
                    />
                  </div>
                  <button className="w-full py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>

          <Link 
            href="/" 
            className="flex items-center w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200 font-medium text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <Mail className="inline-flex mr-3 w-5 h-5" /> Contact Us
          </Link>

          <button 
            onClick={handleLogout}
            className="flex items-center w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200 font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="inline-flex mr-3 w-5 h-5" /> Log Out
          </button>
        </div>
      </div>
      <Footer />
    </section>
  )
}