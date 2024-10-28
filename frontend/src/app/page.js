'use client';

import { useState } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import API from '../../axios/API';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = async () => {
    try {
      const response = await API.post( '/api/login',
        { email, password },
        { withCredentials: true });

      console.log('Login successful:', response.data);
      const { token } = response.data;

      localStorage.setItem('token', token);

      window.location.href = '/home';
    } catch (err) {
      console.error('Login failed:', err);
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.containerLogin}>
          <h1 className={styles.logo}>LOGO</h1>

          <div className={styles.containerInput}>
            <input
              className={styles.input}
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              placeholder="E-mail"
              value={email}
            />
            <input
              className={styles.input}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Senha"
              value={password}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.containerButtons}>
            <div onClick={login} className={styles.button}>
              LOGIN
            </div>
            <span>ou</span>
            <Link href="/" className={styles.button}>
              CADASTRE-SE
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
