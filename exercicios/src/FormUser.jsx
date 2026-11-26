import { useState } from 'react'

export default function FormUsuario({ inicial, onSalvar, onCancelar }) {
  const [form, setForm] = useState({ name: inicial?.name ?? '', email: inicial?.email ?? '' })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function enviar(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      setErro('Preencha nome e e-mail.')
      return
    }
    setEnviando(true)
    setErro(null)
    try {
      await onSalvar(form)             // o App faz POST ou PUT
    } catch (err) {
      if (err.name !== 'AbortError') setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar}>
      <h2>{inicial ? `Editar usuário ${inicial.id}` : 'Novo usuário'}</h2>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Nome" />
      <input name="email" value={form.email} onChange={handleChange} placeholder="E-mail" />
      <button disabled={enviando}>Salvar</button>
      <button type="button" onClick={onCancelar}>Cancelar</button>
      {enviando && <p>Enviando...</p>}
      {erro && <p>Erro: {erro}</p>}
    </form>
  )
}