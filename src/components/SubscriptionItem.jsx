export default function SubscriptionItem({ sub, onEdit, onDelete, onToggleActive, calcularStatus }) {
  const isCancelada = sub.active === false; 
  
  const status = calcularStatus(sub.payment_date, !isCancelada)

  return (
    // Se estiver cancelada, o fundo fica mais cinza
    <li className={`list-group-item d-flex justify-content-between align-items-center p-3 ${isCancelada ? 'bg-light' : ''}`}>
      <div>
        <div className="d-flex align-items-center gap-2 mb-1">
          <strong className={`fs-5 ${isCancelada ? 'text-decoration-line-through text-muted' : ''}`}>
            {sub.name}
          </strong>
          
          <span className={`badge bg-${status.corTema} rounded-pill`}>
            {status.texto}
          </span>
        </div>
        
        <div className={isCancelada ? 'text-muted opacity-50' : 'text-muted'}>
          <span className="text-dark fw-medium me-2">R$ {parseFloat(sub.price).toFixed(2)}</span>
          <small>Vence dia {sub.payment_date}</small>
        </div>
      </div>
      
      <div className="d-flex gap-2">
        <button 
          className={`btn btn-sm ${isCancelada ? 'btn-outline-success' : 'btn-outline-secondary'}`} 
          onClick={() => onToggleActive(sub)}
        >
          {isCancelada ? 'Reativar' : 'Cancelar Assin.'}
        </button>
        
        <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(sub)}>
          Editar
        </button>
        <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(sub.id)}>
          Apagar
        </button>
      </div>
    </li>
  )
}