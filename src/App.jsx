import { useState, useEffect } from 'react'
import SubscriptionItem from './components/SubscriptionItem'

function App() {
  const [subscriptions, setSubscriptions] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [editingId, setEditingId] = useState(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetch('http://localhost:3000/subscriptions')
      .then(response => response.json())
      .then(data => setSubscriptions(data))
      .catch(error => console.error("Erro ao buscar dados:", error))
  }, [])

  const handleEditClick = (sub) => {
    setEditingId(sub.id)
    setName(sub.name)
    setPrice(sub.price)
    setPaymentDate(sub.payment_date)
    setIsActive(sub.active !== false)
    setIsModalOpen(true) 
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const subscriptionData = { name, price, payment_date: parseInt(paymentDate, 10), active: isActive }

    if (editingId) {
      fetch(`http://localhost:3000/subscriptions/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscriptionData })
      })
      .then(res => res.json())
      .then(data => {
        const novaLista = subscriptions.map(sub => sub.id === editingId ? data : sub)
        novaLista.sort((a, b) => a.payment_date - b.payment_date)
        setSubscriptions(novaLista)
        limparFormulario()
      })
    } else {
      fetch('http://localhost:3000/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscriptionData })
      })
      .then(res => res.json())
      .then(data => {
        const novaLista = [...subscriptions, data]
        novaLista.sort((a, b) => a.payment_date - b.payment_date)
        setSubscriptions(novaLista)
        limparFormulario()
      })
    }
  }

  const handleToggleActive = (sub) => {
    const statusInvertido = !(sub.active !== false)
    
    fetch(`http://localhost:3000/subscriptions/${sub.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: { active: statusInvertido } })
    })
    .then(res => res.json())
    .then(data => {
      setSubscriptions(subscriptions.map(s => s.id === sub.id ? data : s))
    })
  }

  const limparFormulario = () => {
    setName('')
    setPrice('')
    setPaymentDate('')
    setIsActive(true)
    setEditingId(null)
    setIsModalOpen(false)
  }

  const handleDelete = (id) => {
    if (!window.confirm("Tem certeza que deseja apagar?")) return;
    fetch(`http://localhost:3000/subscriptions/${id}`, { method: 'DELETE' })
    .then(response => {
      if (response.ok) {
        setSubscriptions(subscriptions.filter(sub => sub.id !== id));
      }
    })
  }

  const calcularStatusPagamento = (diaPagamento, isAtiva) => {
    if (!isAtiva) return { texto: 'Cancelada', corTema: 'secondary' }

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const diaAtual = hoje.getDate()
    const diaVencimento = parseInt(diaPagamento, 10)

    if (diaVencimento < diaAtual) {
      return { texto: 'Pago este mês', corTema: 'success' }
    }

    const dataVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), diaVencimento)
    dataVencimento.setHours(0, 0, 0, 0)

    const diferencaTempo = dataVencimento.getTime() - hoje.getTime()
    const diasEmFalta = Math.round(diferencaTempo / (1000 * 3600 * 24))

    if (diasEmFalta === 0) return { texto: 'Vence Hoje!', corTema: 'danger' }
    if (diasEmFalta <= 5) return { texto: `Vence em ${diasEmFalta} dias`, corTema: 'warning text-dark' }
    
    return { texto: 'A Vencer', corTema: 'info' }
  }

  const totalGasto = subscriptions
    .filter(sub => sub.active !== false)
    .reduce((total, sub) => total + parseFloat(sub.price || 0), 0)

  const assinaturasAtivas = subscriptions.filter(sub => sub.active !== false).length

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', minWidth: '100vw', paddingLeft: '3%', paddingRight: '3%' }}>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">Meu Dashboard</h2>
        <button 
          className="btn btn-primary fw-bold px-4 py-2 shadow-sm" 
          onClick={() => setIsModalOpen(true)}
        >
          Nova Assinatura
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm border-0 bg-primary text-white h-100">
            <div className="card-body">
              <h6 className="card-title text-uppercase text-white-50 fw-bold">Total Mensal Ativo</h6>
              <h2 className="mb-0">R$ {totalGasto.toFixed(2)}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm border-0 bg-white h-100">
            <div className="card-body">
              <h6 className="card-title text-uppercase text-muted fw-bold">Assinaturas Ativas</h6>
              <h2 className="mb-0 text-dark">{assinaturasAtivas}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {subscriptions.length === 0 ? (
                  <div className="p-5 text-center text-muted">
                    Nenhuma assinatura cadastrada ainda. Clique no botão acima para começar!
                  </div>
                ) : (
                  subscriptions.map(sub => (
                    <SubscriptionItem 
                      key={sub.id} 
                      sub={sub} 
                      onEdit={handleEditClick} 
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                      calcularStatus={calcularStatusPagamento} 
                    />
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              
              <div className={`modal-header text-white ${editingId ? 'bg-warning text-dark' : 'bg-primary'}`}>
                <h5 className="modal-title fw-bold">
                  {editingId ? 'Editando Assinatura' : 'Nova Assinatura'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={limparFormulario}></button>
              </div>
              
              <div className="modal-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Nome do Serviço</label>
                    <input type="text" className="form-control bg-light" placeholder="Ex: Netflix" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="row mb-4">
                    <div className="col-6">
                      <label className="form-label text-muted small fw-bold">Valor (R$)</label>
                      <input type="number" step="0.01" className="form-control bg-light" placeholder="45.90" value={price} onChange={(e) => setPrice(e.target.value)} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-bold">Dia do Vencimento</label>
                      <input type="number" className="form-control bg-light" placeholder="10" min="1" max="31" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required />
                    </div>
                  </div>
                  
                  <div className="form-check mb-4">
                    <input className="form-check-input" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} id="activeCheckModal" />
                    <label className="form-check-label text-muted small fw-bold" htmlFor="activeCheckModal">
                      Assinatura Ativa
                    </label>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button type="button" className="btn btn-light fw-bold" onClick={limparFormulario}>
                      Cancelar
                    </button>
                    <button type="submit" className={`btn btn-${editingId ? 'warning' : 'primary'} fw-bold px-4`}>
                      {editingId ? 'Salvar Alterações' : 'Cadastrar'}
                    </button>
                  </div>
                </form>
              </div>
              
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default App