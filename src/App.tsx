import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import type { User } from '../types/User';
import { useState } from 'react';
import { loginUser, registerUser } from '../services/api';
import ChatPage from '../src/ChatPage';
import { ToastContainer, toast } from 'react-toastify';

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email format').required('Email is required'),
  username: Yup.string()
  .when('$isRegistering', {
    is: true,
    then: (schema) => schema.required('Username is required').min(4, 'Username must be atleast 4 characters').max(8, 'Username must not exceed 8 characters'),
    otherwise: (schema) => schema.notRequired(),
  }),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

function App() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
    context: { isRegistering },
  });

  const onSubmit = async(data:User) => {
    if(data.username) {
      try {
        const response = await registerUser(data.email, data.username, data.password);
        toast.success(response.message);
        reset();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
          reset();
        } 
      }
    }
    else {
      try {
        const response = await loginUser(data.email, data.password);
        setToken(response.token);
        setUsername(response.username);
        localStorage.setItem("token", response.token);
        localStorage.setItem("username", response.username);
        reset();
        toast.success(response.message);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
          reset();
        }
      }
    }
  };

  const logout = () => {
    setToken("");
    setUsername("");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  const navigateToLogin = () => {
    reset();
    setIsRegistering(false);
  }

  const navigateToRegister = () => {
    reset();
    setIsRegistering(true);
  }

  return (
    <>
      { !token ? <div className="bg-[url('/login.avif')] bg-cover bg-no-repeat bg-center">
        <div className='flex items-center justify-center w-full h-screen'>
            <form onSubmit={handleSubmit(onSubmit)} className='border border-solid border-white rounded-[0.5rem] p-10'>
                <h2 className='flex justify-center text-3xl font-comic-relief mb-2.5 text-white'>{isRegistering ? 'Register' : 'Login'}</h2>
                <div className='flex flex-col gap-2.5'>
                <label htmlFor="email" className='pl-2.5 text-white'>Email</label>
                <input
                    id="email"
                    type="email"
                    autoComplete='off'
                    {...register('email')}
                    className='pl-2.5 border border-solid border-orange-300 rounded-[0.5rem] h-[1.875rem] min-w-2xs text-orange-300'
                />
                {errors.email && <span className='text-red-900'>{errors.email.message}</span>}
                </div>
        
               {isRegistering && <div className='flex flex-col gap-2.5 mt-2.5'>
                <label htmlFor="username" className='pl-2.5 text-white'>Username</label>
                <input
                    id="username"
                    type="username"
                    autoComplete='off'
                    {...register('username')}
                    className='pl-2.5 border border-solid border-orange-300 rounded-[0.5rem] h-[1.875rem] min-w-2xs text-orange-300'
                />
                {errors.username && <span className='text-red-900'>{errors.username.message}</span>}
                </div>}
        
                <div className='flex flex-col gap-2.5 mt-2.5'>
                <label htmlFor="password" className='pl-2.5 text-white'>Password</label>
                <input
                    id="password"
                    type="password"
                    autoComplete='off'
                    {...register('password')}
                    className='pl-2.5 border border-solid border-orange-300 rounded-[0.5rem] h-[1.875rem] min-w-2xs text-orange-300'
                />
                {errors.password && <span className='text-red-900'>{errors.password.message}</span>}
                </div>
          
                 
  
               <div className='flex justify-around items-center mt-6 gap-2.5'>
                    <button 
                    type="submit"
                    className='text-white cursor-pointer border border-solid border-orange-300 p-2.5 rounded-[0.5rem]'>
                    {isRegistering  ? 'Register' : 'Login'}
                    </button>
                    {isRegistering ? (
                      <div className='ml-auto flex gap-1'>
                        <p>Already Registered ?</p>
                        <a href="#" onClick={navigateToLogin} className='cursor-pointer text-white'>Login</a>
                      </div>
                    ) : (
                      <div className='ml-auto flex gap-1'>
                        <p>New User ?</p>
                        <a href="#" onClick={navigateToRegister} className='cursor-pointer text-white'>Register</a>
                      </div>
                    )}
                  </div>  
            </form>
        </div>
      </div>
    :
    <ChatPage token={token} username={username} onLogout={logout} />  
    }
    <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} />
    </>
  )
}

export default App
