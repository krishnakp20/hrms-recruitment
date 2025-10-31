// import { useState } from 'react'
// import { Eye, EyeOff, Lock, User } from 'lucide-react'
// import { useAuth } from '../contexts/AuthContext'
// import { authAPI } from '../services/api'

// const Login = () => {
//   const { login } = useAuth()
//   const [showPassword, setShowPassword] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   })

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')

//     console.log('Login: Starting login process...')
//     const result = await login(formData)
//     console.log('Login: Login result:', result)
    
//     if (!result.success) {
//       console.log('Login: Login failed with error:', result.error)
//       setError(result.error)
//     } else {
//       console.log('Login: Login successful!')
//     }
    
//     setLoading(false)
//   }

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     })
//   }

//   const testConnection = async () => {
//     try {
//       console.log('Testing API connection...')
//       const response = await fetch('http://localhost:8000/health')
//       const data = await response.json()
//       console.log('Health check response:', data)
//       alert('API connection successful! Check console for details.')
//     } catch (error) {
//       console.error('API connection test failed:', error)
//       alert('API connection failed! Check console for details.')
//     }
//   }

//   const testLoginAPI = async () => {
//     try {
//       console.log('Testing login API directly...')
//       const response = await fetch('http://localhost:8000/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email: 'admin@hrms.com',
//           password: 'admin123'
//         })
//       })
//       const data = await response.json()
//       console.log('Direct login API response:', data)
//       alert('Direct login API test successful! Check console for details.')
//     } catch (error) {
//       console.error('Direct login API test failed:', error)
//       alert('Direct login API test failed! Check console for details.')
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
//             <User className="h-8 w-8 text-white" />
//           </div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Sign in to your account
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             HRMS Recruitment System
//           </p>
//         </div>
        
//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
//             {error}
//           </div>
//         )}
        
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           <div className="rounded-md shadow-sm -space-y-px">
//             <div>
//               <label htmlFor="email" className="sr-only">
//                 Email address
//               </label>
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   className="input-field pl-10"
//                   placeholder="Email address"
//                   value={formData.email}
//                   onChange={handleChange}
//                   disabled={loading}
//                 />
//               </div>
//             </div>
//             <div>
//               <label htmlFor="password" className="sr-only">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPassword ? 'text' : 'password'}
//                   autoComplete="current-password"
//                   required
//                   className="input-field pl-10 pr-10"
//                   placeholder="Password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   disabled={loading}
//                 />
//                 <button
//                   type="button"
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   onClick={() => setShowPassword(!showPassword)}
//                   disabled={loading}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <input
//                 id="remember-me"
//                 name="remember-me"
//                 type="checkbox"
//                 className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
//               />
//               <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
//                 Remember me
//               </label>
//             </div>

//             <div className="text-sm">
//               <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
//                 Forgot your password?
//               </a>
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Signing in...' : 'Sign in'}
//             </button>
//           </div>
//         </form>
        
//         <div className="mt-6 space-y-3">
//           <button
//             onClick={testConnection}
//             className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
//           >
//             Test API Connection
//           </button>
          
//           <button
//             onClick={testLoginAPI}
//             className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
//           >
//             Test Login API Directly
//           </button>
          
//           <div className="text-center text-sm text-gray-600">
//             <p>Demo Credentials:</p>
//             <p className="font-mono text-xs mt-1">
//               admin@hrms.com / admin123
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Login 




// Login Page With Model..//
import { useState } from 'react'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Login = () => {
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
 const result = await login(formData)
    console.log("Login result:", result) // Debug

    if (!result.success) {
      setError(result.error || 'Invalid email or password')
    } else {
      toast.success('Login successful!', {
        position: 'top-right',
        autoClose: 3000,
      })
      // navigate('/dashboard')
    }


    // if (!result.success) setError(result.error)
    setLoading(false)
  }

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md space-y-6 bg-white shadow-xl rounded-2xl p-8 animate-fade-in">
        <div className="flex flex-col items-center">
          <div className="bg-blue-600 p-3 rounded-full">
            <User className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 text-center">Sign in to your account</h2>
          <p className="text-sm text-gray-500">HRMS Recruitment System</p>
        </div>

        {error && <div className="text-red-600 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Email"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="relative">
            <Lock className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Password"
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

            {/* ❌ Error message below inputs */}
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox" />
              <span className="text-gray-700">Remember me</span>
            </label>
            <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 pt-2">
        </div>
      </div>
    </div>
  )
}

export default Login

