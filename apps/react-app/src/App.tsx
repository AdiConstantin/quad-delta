import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from './store'
import type { Product } from './store'

export default function App(){
  const dispatch = useDispatch()
  const items = useSelector((s:any)=>s.products.items)
  const loading = useSelector((s:any)=>s.products.loading)

  // tab simplu (Products / Audit)
  const [tab, setTab] = useState<'products'|'audit'>('products')

  // create form
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState<number | ''>('')

  // edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [eSku, setESku] = useState('')
  const [eName, setEName] = useState('')
  const [ePrice, setEPrice] = useState<number | ''>('')
  const [eActive, setEActive] = useState(true)

  useEffect(()=>{ dispatch(actions.fetch()) }, [dispatch])

  function submitCreate(){
    if(!sku || !name || price === '' || Number(price) < 0) return
    dispatch(actions.create({ sku, name, price: Number(price) }))
    setSku(''); setName(''); setPrice('')
  }

  function startEdit(p: Product){
    setEditingId(p.id); setESku(p.sku); setEName(p.name); setEPrice(p.price); setEActive(p.isActive)
  }
  function cancelEdit(){ setEditingId(null); setESku(''); setEName(''); setEPrice(''); setEActive(true) }
  function saveEdit(){
    if(editingId==null || !eSku || !eName || ePrice==='') return
    dispatch(actions.update({ id: editingId, body: { sku: eSku, name: eName, price: Number(ePrice), isActive: eActive } }))
    cancelEdit()
  }

  if (tab === 'audit') return <AuditView setTab={setTab} />

  return (
    <>
      <div className="header">
        <div className="brand">QuadDelta • React</div>
        <div className="tag">Node/TS · PostgreSQL</div>
        <div style={{marginLeft:'auto', display:'flex', gap:8}}>
          <button className="button" onClick={()=>setTab('products')}>Products</button>
          <button className="button" onClick={()=>setTab('audit')}>Audit</button>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <div className="form">
            <input className="input" placeholder="SKU" value={sku} onChange={e=>setSku(e.target.value)} />
            <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
            <input className="number" type="number" step="0.01" placeholder="Price"
                   value={price} onChange={e=>setPrice(e.target.value === '' ? '' : Number(e.target.value))} />
            <button className="button" onClick={submitCreate}>Add Product</button>
          </div>

          {loading ? <p>Loading…</p> : (
            <table className="table">
              <thead><tr><th>Id</th><th>SKU</th><th>Name</th><th>Price</th><th>Active</th><th></th></tr></thead>
              <tbody>
                {items.map((p:Product)=>(
                  editingId === p.id ? (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td><input className="input" value={eSku} onChange={e=>setESku(e.target.value)} /></td>
                      <td><input className="input" value={eName} onChange={e=>setEName(e.target.value)} /></td>
                      <td><input className="number" type="number" step="0.01"
                                 value={ePrice} onChange={e=>setEPrice(e.target.value===''?'':Number(e.target.value))} /></td>
                      <td>
                        <label style={{display:'inline-flex', alignItems:'center', gap:6}}>
                          <input type="checkbox" checked={eActive} onChange={e=>setEActive(e.target.checked)} />
                          <span>{eActive ? 'Yes' : 'No'}</span>
                        </label>
                      </td>
                      <td style={{whiteSpace:'nowrap'}}>
                        <button className="button" onClick={saveEdit}>Save</button>
                        <button className="button" onClick={cancelEdit} style={{marginLeft:8}}>Cancel</button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={p.id}>
                      <td>{p.id}</td><td>{p.sku}</td><td>{p.name}</td><td>{p.price}</td>
                      <td>{p.isActive ? 'Yes':'No'}</td>
                      <td style={{whiteSpace:'nowrap'}}>
                        <button className="button" onClick={()=>startEdit(p)}>Edit</button>
                        <button className="button" onClick={()=>dispatch(actions.remove(p.id))} style={{marginLeft:8}}>Delete</button>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}

// --- Simple Audit View in same file to keep deps minimal ---
function AuditView({ setTab }:{ setTab: (t:'products'|'audit')=>void }) {
  const [items, setItems] = useState<any[]>([])
  const [take, setTake] = useState(50)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  async function load(){
    setLoading(true)
    const res = await fetch(`${import.meta.env.VITE_API_URL_NODE || 'http://localhost:5002'}/api/audit?table=products&take=${take}`)
    const data = await res.json()
    setItems(data); setLoading(false)
  }
  useEffect(()=>{ load() }, []) // load on mount

  return (
    <>
      <div className="header">
        <div className="brand">QuadDelta • React</div>
        <div className="tag">Audit · PostgreSQL</div>
        <div style={{marginLeft:'auto'}}><button className="button" onClick={()=>setTab('products')}>Back to Products</button></div>
      </div>

      <div className="container">
        <div className="card">
          <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:12}}>
            <label>Take: <input className="number" type="number" min={1} max={500} value={take} onChange={e=>setTake(Number(e.target.value)||50)} /></label>
            <button className="button" onClick={load}>Refresh</button>
          </div>

          {loading ? <p>Loading…</p> : (
            <table className="table">
              <thead><tr><th>Id</th><th>Action</th><th>When (UTC)</th><th>By</th><th>Data</th></tr></thead>
              <tbody>
                {items.map((e:any)=>(
                  <React.Fragment key={e.id}>
                    <tr>
                      <td>{e.id}</td>
                      <td>{e.action}</td>
                      <td>{e.changedAt}</td>
                      <td>{e.changedBy || 'n/a'}</td>
                      <td><button className="button" onClick={()=>setExpanded(x=>({...x,[e.id]:!x[e.id]}))}>{expanded[e.id]?'Hide':'Show'}</button></td>
                    </tr>
                    {expanded[e.id] && (
                      <tr><td colSpan={5}><pre>{JSON.stringify(e.rowData, null, 2)}</pre></td></tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
