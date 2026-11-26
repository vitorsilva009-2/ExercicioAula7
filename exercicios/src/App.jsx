import { useEffect, useRef, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from './api'
import ListaUsuario from './ListaUsuario'
import FormUsuario from './FormUser'


function App() {
  const [usuarios, setUsuarios] = useState(null)
  const [erroLista, setErroLista] = useState(null)
  const [erroAcao, setErroAcao] = useState(null)
  const [formAberto, setFormAberto] = useState(null) // null | 'novo' | usuário
  const controleRef = useRef(null)

  useEffect(() => {
  const controle = new AbortController()
  controleRef.current = controle

  async function buscar() {
    try {
      setUsuarios(await apiGet('/users', { signal: controle.signal }))
    } catch (e) {
      if (e.name !== 'AbortError') setErroLista(mensagemDeErro(e))
    }
  }
  buscar()

  return () => controle.abort()
}, [])

  async function salvarUsuario(dados) {
    const signal = controleRef.current.signal
    if (formAberto === 'novo') {
      const criado = await apiPost('/users', dados, { signal })
      setUsuarios(prev => {
        const proximoId = prev.length ? Math.max(...prev.map(u => u.id)) + 1 : 1
        return [...prev, { ...criado, id: proximoId }]
      })
    } else {
      const salvo = await apiPut(
        `/users/${formAberto.id}`,
        { ...formAberto, ...dados },
        { signal }
      )
      setUsuarios(prev => prev.map(u => (u.id === formAberto.id ? salvo : u)))
    }
    setFormAberto(null)
  }
  function mensagemDeErro(e) {
  if (e.name === 'ApiError' && e.status === 404) return 'Recurso não encontrado'
  if (e.name === 'ApiError' && e.status >= 500) return 'Erro no servidor'
  if (e.name === 'ApiError') return `Erro ${e.status}`
  return 'Falha de rede'   // TypeError: Failed to fetch
  }
  async function excluirUsuario(id) {
    const anterior = usuarios
    setErroAcao(null)
    setUsuarios(prev => prev.filter(u => u.id !== id)) // otimista
    try {
      await apiDelete(`/users/${id}`, { signal: controleRef.current.signal })
      console.log(`Usuário ${id} excluído`)
    }  catch (e) {
  if (e.name === 'AbortError') return
  setUsuarios(anterior)
  setErroAcao(mensagemDeErro(e))
}

}
  

  if (erroLista) return <p>Erro: {erroLista}</p>
  if (usuarios === null) return <p>Carregando...</p>

  return (
    <main>
      <h1>Usuários</h1>
      <button onClick={() => setFormAberto('novo')}>Novo</button>

      <ListaUsuario
        usuarios={usuarios}
        erro={erroAcao}
        onEditar={setFormAberto}
        onExcluir={excluirUsuario}
      />

      {formAberto && (
        <FormUsuario
          key={formAberto === 'novo' ? 'novo' : formAberto.id}
          inicial={formAberto === 'novo' ? null : formAberto}
          onSalvar={salvarUsuario}
          onCancelar={() => setFormAberto(null)}
        />
      )}
    </main>
  )
}

export default App