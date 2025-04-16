// Login.jsx — с дизайном кнопок и переключением пароля с иконкой

import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useNavigate, Link } from 'react-router-dom'
import '../style.css'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/dashboard')
    } catch (error) {
      alert('Ошибка входа: ' + error.message)
    }
  }

  return (
    <div className="container">
      <div className="form-container">
        <h2>Вход в <strong>EventBoard</strong></h2>

        <form onSubmit={handleLogin} className="form">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <div className="password-toggle">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-btn icon-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Показать или скрыть пароль"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" className="blue-btn">Войти</button>
        </form>

        <p className="link-text">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
