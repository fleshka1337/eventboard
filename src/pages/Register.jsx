// Register.jsx — регистрация с дизайном, скрытием пароля и уведомлением

import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useNavigate, Link } from 'react-router-dom'
import '../style.css'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      setShowToast(true)
      setTimeout(() => {
        setShowToast(false)
        navigate('/dashboard')
      }, 1500)
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className="container">
      <div className="form-container">
        <h2>Регистрация в <strong>EventBoard</strong></h2>

        <form onSubmit={handleRegister} className="form">
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
              aria-label="Показать пароль"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Повторите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="blue-btn">Зарегистрироваться</button>
        </form>

        <p className="link-text">
          Уже есть аккаунт? <Link to="/">Войти</Link>
        </p>

        {showToast && <div className="toast show">Регистрация успешна!</div>}
      </div>
    </div>
  )
}

export default Register