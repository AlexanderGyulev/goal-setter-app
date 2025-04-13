import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [goals, setGoals] = useState([]);
  const [goalText, setGoalText] = useState('');
  const [deadline, setDeadline] = useState('');
  const [filter, setFilter] = useState('all');
  const [quote, setQuote] = useState('');
  const [user, setUser] = useState(null);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (savedUser) {
      console.log('🔐 Зареден потребител от localStorage:', savedUser);
      setUser(savedUser);
      loadGoals(savedUser.id);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`goals_${user.id}`, JSON.stringify(goals));
    }
  }, [goals, user]);

  useEffect(() => {
    fetchQuote();
  }, []);

  const fetchQuote = async () => {
    try {
      const response = await fetch('https://api.api-ninjas.com/v1/quotes', {
        headers: {
          'X-Api-Key': 'jJqRYg2LOcnOacD9oUaBNg==lbsCS8z8nWr9HGO8'
        }
      });
      const data = await response.json();
      if (data && data.length > 0) {
        setQuote(`${data[0].quote} — ${data[0].author}`);
      } else {
        setQuote('Не можахме да заредим мотивационна мисъл 😔');
      }
    } catch (error) {
      setQuote('⚠️ Грешка при зареждане на мотивация.');
    }
  };

  const calculateType = (dateStr) => {
    const today = new Date();
    const goalDate = new Date(dateStr);
    const diffTime = goalDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 60 ? 'long' : 'short';
  };

  const addGoal = () => {
    if (goalText.trim() === '' || deadline === '') return;
    const type = calculateType(deadline);
    const newGoal = {
      id: Date.now(),
      text: goalText,
      deadline,
      completed: false,
      type,
    };
    setGoals([...goals, newGoal]);
    setGoalText('');
    setDeadline('');
  };

  const toggleGoal = id => {
    setGoals(goals.map(goal =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const deleteGoal = id => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const filteredGoals = goals.filter(goal => {
    if (filter === 'completed') {
      return goal.completed;
    } else if (filter === 'all') {
      return !goal.completed;
    } else {
      return goal.type === filter && !goal.completed;
    }
  });

  const loadGoals = (userId) => {
    const stored = localStorage.getItem(`goals_${userId}`);
    if (stored) {
      console.log('📥 Заредени цели за userId:', userId);
      setGoals(JSON.parse(stored));
    } else {
      setGoals([]);
    }
  };

  const handleAuth = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (isRegistering) {
      const existingUser = users.find(u => u.email === authEmail.trim());
      if (existingUser) {
        alert('Имейлът вече е регистриран.');
        return;
      }

      const newUser = {
        id: Date.now(),
        email: authEmail.trim(),
        password: authPassword.trim(),
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      console.log('✅ Успешна регистрация:', newUser);
      alert('Успешна регистрация!');
      setUser(newUser);
      loadGoals(newUser.id);
      setIsRegistering(false);
    } else {
      const existingUser = users.find(
        u => u.email === authEmail.trim() && u.password === authPassword.trim()
      );
      if (!existingUser) {
        alert('Невалидни имейл или парола.');
        return;
      }

      localStorage.setItem('currentUser', JSON.stringify(existingUser));
      console.log('✅ Успешен вход:', existingUser);
      setUser(existingUser);
      loadGoals(existingUser.id);
    }

    setAuthEmail('');
    setAuthPassword('');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    setGoals([]);
    console.log('🚪 Изход от профила');
  };

  if (!user) {
    return (
      <div className="auth-background">
        <div className="auth-form">
          <h2>{isRegistering ? 'Регистрация' : 'Вход'}</h2>
          <form onSubmit={handleAuth}>
            <input
              type="email"
              placeholder="Имейл"
              value={authEmail}
              onChange={e => setAuthEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Парола"
              value={authPassword}
              onChange={e => setAuthPassword(e.target.value)}
              required
            />
            <button type="submit">{isRegistering ? 'Регистрирай се' : 'Влез'}</button>
          </form>
          <p onClick={() => setIsRegistering(!isRegistering)} style={{ cursor: 'pointer', marginTop: '1rem' }}>
            {isRegistering ? 'Имаш акаунт? Влез тук.' : 'Нямаш акаунт? Регистрирай се.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>🎯 Лични Цели</h1>
      <p>Здравей, {user.email} <button onClick={logout}>Изход</button></p>

      <div className="input-group">
        <input
          type="text"
          value={goalText}
          onChange={e => setGoalText(e.target.value)}
          placeholder="Опиши целта..."
        />
        <input
          type="date"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
        />
        <button onClick={addGoal}>Добави</button>
      </div>

      <div className="filter-buttons">
        <button onClick={() => setFilter('all')}>Всички</button>
        <button onClick={() => setFilter('short')}>Краткосрочни</button>
        <button onClick={() => setFilter('long')}>Дългосрочни</button>
        <button onClick={() => setFilter('completed')}>Завършени</button>
      </div>

      <ul>
        {filteredGoals.map(goal => (
          <li key={goal.id} className={goal.type}>
            <input
              type="checkbox"
              checked={goal.completed}
              onChange={() => toggleGoal(goal.id)}
            />
            <span style={{ textDecoration: goal.completed ? 'line-through' : 'none' }}>
              [{goal.type === 'short' ? '⏱' : '📅'}] {goal.text}
              <br />
              <small>До: {new Date(goal.deadline).toLocaleDateString()}</small>
            </span>
            <button onClick={() => deleteGoal(goal.id)}>❌</button>
          </li>
        ))}
      </ul>

      <div className="quote">
        <h3>✨ Цитат:</h3>
        <p>{quote}</p>
        <button onClick={fetchQuote}>🔁 Нов цитат</button>
      </div>
    </div>
  );
}

export default App;
