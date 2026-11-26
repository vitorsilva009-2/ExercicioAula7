const BASE_URL = 'https://jsonplaceholder.typicode.com'

export class ApiError extends Error {
  constructor(status, statusText, message) {
    super(message || `${status} ${statusText}`)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
  }
}

async function requisicao(caminho, opcoes = {}) {
  const { signal, ...resto } = opcoes
  const configuracoes = {
    headers: { 'Content-Type': 'application/json' },
    ...resto,
    ...(signal ? { signal } : {}),
  }
  if (opcoes.body) {
    configuracoes.body = JSON.stringify(opcoes.body)
  }
  const resp = await fetch(`${BASE_URL}${caminho}`, configuracoes)
  if (!resp.ok) throw new ApiError(resp.status, resp.statusText)
  if (resp.status === 204) return null
  return await resp.json()
}

export const apiGet = (caminho, opcoes = {}) =>
  requisicao(caminho, { method: 'GET', ...opcoes })

export const apiPost = (caminho, body, opcoes = {}) =>
  requisicao(caminho, { method: 'POST', body, ...opcoes })

export const apiPut = (caminho, body, opcoes = {}) =>
  requisicao(caminho, { method: 'PUT', body, ...opcoes })

export const apiDelete = (caminho, opcoes = {}) =>
  requisicao(caminho, { method: 'DELETE', ...opcoes })