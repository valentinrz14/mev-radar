'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const { role } = await res.json();
      router.push(role === 'admin' ? '/admin' : '/buscar');
    } else {
      setError('Email o contraseña incorrectos');
    }
  }
  return (
    <main className="max-w-sm mx-auto mt-24 p-6">
      <h1 className="text-2xl font-bold mb-6">MEV Radar</h1>
      <form onSubmit={submit} className="space-y-4">
        <input
          className="border w-full p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border w-full p-2 rounded"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="bg-blue-600 text-white w-full p-2 rounded">
          Ingresar
        </button>
      </form>
    </main>
  );
}
