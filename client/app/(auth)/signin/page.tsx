"use client"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Phone, Lock } from "lucide-react"

const signInSchema = z.object({
  phone: z.string().min(11, "Phone number must be at least 11 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const formFields = [
  {
    name: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "08012345678",
    icon: <Phone className="w-5 h-5 text-gray-400" />,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    icon: <Lock className="w-5 h-5 text-gray-400" />,
  },
]

export default function SignIn() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: any) => {
    try {
      console.log(data)
      reset()
    } catch (error) {
      console.error("Submission error:", error)
    }
  }

  return (
    <section className="max-w-md mx-auto p-4">
       <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Welcome Back</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formFields.map((field) => (
            <div key={field.name} className="space-y-1">
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                {field.label}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  {field.icon}
                </div>
                <input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  className={`w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors[field.name] ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register(field.name)}
                />
              </div>
              {errors[field.name] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[field.name]?.message?.toString()}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Sign In
          </button>
        </form>
    </section>
  )
}





