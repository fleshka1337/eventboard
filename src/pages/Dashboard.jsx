// Dashboard — с Firebase функционалом и HTML/CSS дизайном

import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import '../style.css'

function Dashboard() {
  const [events, setEvents] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(null)
  const [editId, setEditId] = useState(null)
  const [filterTitle, setFilterTitle] = useState('')
  const [filterDate, setFilterDate] = useState(null)
  const [user, setUser] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) navigate('/')
      else setUser(currentUser)
    })
    return unsubscribe
  }, [navigate])

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'events'),
        where('userId', '==', user.uid),
        orderBy('date', 'asc')
      )
      const unsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setEvents(items)
      })
      return () => unsub()
    }
  }, [user])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setDate(null)
    setEditId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !date) return alert('Заполните все поля')

    if (editId) {
      const ref = doc(db, 'events', editId)
      await updateDoc(ref, { title, description, date })
    } else {
      await addDoc(collection(db, 'events'), {
        title,
        description,
        date,
        userId: user.uid,
        createdAt: new Date()
      })
    }
    resetForm()
  }

  const removeEvent = async (id) => await deleteDoc(doc(db, 'events', id))

  const editEvent = (event) => {
    setEditId(event.id)
    setTitle(event.title)
    setDescription(event.description)
    setDate(new Date(event.date.seconds * 1000))
  }

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  const filteredEvents = events.filter(event => {
    const matchTitle = event.title.toLowerCase().includes(filterTitle.toLowerCase())
    const matchDate = !filterDate || format(new Date(event.date.seconds * 1000), 'yyyy-MM-dd') === format(filterDate, 'yyyy-MM-dd')
    return matchTitle && matchDate
  })

  const handleExport = () => {
    const docPDF = new jsPDF()
    const tableData = filteredEvents.map((event, index) => [
      `${index + 1}`,
      event.title,
      event.description,
      format(new Date(event.date.seconds * 1000), 'dd.MM.yyyy, HH:mm')
    ])

    autoTable(docPDF, {
      head: [['#', 'Title', 'Description', 'Date']],
      body: tableData,
      startY: 20,
      margin: { horizontal: 10 },
      styles: { fontSize: 10, font: 'helvetica' },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        halign: 'center',
        fontStyle: 'bold'
      }
    })
    docPDF.save('events.pdf')
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2500)
  }

  return (
    <div className="container">
      <div className="form-container">
        <h2>Добро пожаловать на <strong>EventBoard</strong></h2>

        <form onSubmit={handleSubmit} className="form">
          <input type="text" placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input type="datetime-local" value={date ? format(date, "yyyy-MM-dd'T'HH:mm") : ''} onChange={(e) => setDate(new Date(e.target.value))} required />
          <div className="btn-group">
            <button type="submit">{editId ? 'Сохранить' : 'Добавить'}</button>
            {editId && <button type="button" onClick={resetForm} className="cancel">Отмена</button>}
          </div>
        </form>

        <div className="filter-section">
          <input type="text" placeholder="Поиск по названию" value={filterTitle} onChange={(e) => setFilterTitle(e.target.value)} />
          <input type="date" onChange={(e) => setFilterDate(e.target.value ? new Date(e.target.value) : null)} />
          <button className="export" onClick={handleExport}>Экспорт в PDF</button>
          <button className="logout-bottom red" onClick={handleLogout}>Выйти</button>
        </div>

        {showToast && <div className="toast show">PDF экспортирован!</div>}

        <div className="event-list">
          {filteredEvents.length === 0 ? (
            <p>Нет событий</p>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="event-item">
                <div className="event-info">
                  <strong>{event.title}</strong>
                  <p>{event.description}</p>
                  <small>Дата: {new Date(event.date.seconds * 1000).toLocaleString()}</small>
                </div>
                <div className="event-actions">
                  <button onClick={() => editEvent(event)}>Редактировать</button>
                  <button className="danger" onClick={() => removeEvent(event.id)}>Удалить</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard