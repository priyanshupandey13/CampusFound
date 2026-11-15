import { supabase } from './supabase'
import { fetchItems, createItem } from './itemsService'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, NavLink, Route, Routes, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom'
import { ArrowRight, Search, Plus, ShieldCheck, MapPin, Clock3, PackageSearch, HeartHandshake, Menu, X, Bell, UserRound, ChevronDown, SlidersHorizontal, CheckCircle2, UploadCloud, Sparkles, LockKeyhole, LayoutDashboard, FileText, LogOut, CircleHelp, Mail, Instagram, Github, ArrowUpRight } from 'lucide-react'
import { seedItems, categories, locations } from './data'
import type { Item, ItemStatus } from './types'

const readItems = (): Item[] => { try { const v=localStorage.getItem('cf-items'); return v ? JSON.parse(v) : seedItems } catch { return seedItems } }
const readUser = () => localStorage.getItem('cf-user') || ''
const moneyDate = (d:string) => d
function Header({user,onLogout,isAdmin}:{user:string,onLogout:()=>void,isAdmin:boolean}) {
 const [open,setOpen]=useState(false)

 return <header className="header">
  <div className="nav-wrap">
   <Link to="/" className="brand">
    <img src="/lpu-logo.png" className="brand-logo" alt="LPU Logo"/>
    <span className="brand-name">campus<span className="brand-accent">found</span><small>LPU COMMUNITY</small></span>
   </Link>

   <button className="mobile-menu" onClick={()=>setOpen(!open)} aria-label="Toggle menu">
    {open?<X/>:<Menu/>}
   </button>

   <nav className={open?'nav-links show':'nav-links'}>
    <NavLink to="/browse" onClick={()=>setOpen(false)}>Browse items</NavLink>
    <NavLink to="/how-it-works" onClick={()=>setOpen(false)}>How it works</NavLink>

    {user ? <>
     <NavLink to="/dashboard" onClick={()=>setOpen(false)}>My dashboard</NavLink>

     {isAdmin && (
      <NavLink to="/admin" onClick={()=>setOpen(false)} className="admin-nav-link">
       Admin Dashboard
      </NavLink>
     )}

     <button className="nav-login" onClick={onLogout}>Log out</button>
    </> : <NavLink to="/login" onClick={()=>setOpen(false)}>Log in</NavLink>}

    <Link className="btn btn-primary nav-cta" to="/report">
     <Plus size={17}/> Report an item
    </Link>
   </nav>
  </div>
 </header>
}
function ContactSupport() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('support_messages')
        .insert({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim()
        })

      if (error) throw error

      setSuccess(true)
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send your message.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-shell container support-page">
      <div className="support-heading">
        <span className="eyebrow">WE ARE HERE TO HELP</span>
        <h1>Contact <em>support.</em></h1>
        <p>Having trouble with CampusFound? Send us a message and we'll look into it.</p>
      </div>

      <form className="login-card support-card" onSubmit={submit}>
        <label>Your name
          <input required value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name"/>
        </label>

        <label>Email address
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email"/>
        </label>

        <label>Subject
          <input required value={subject} onChange={e => setSubject(e.target.value)} placeholder="What do you need help with?"/>
        </label>

        <label>Your message
          <textarea required value={message} onChange={e => setMessage(e.target.value)} placeholder="Explain your issue..." rows={5}/>
        </label>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">Your message has been sent successfully!</p>}

        <button className="btn btn-primary submit-btn" disabled={loading}>
          {loading ? 'Sending...' : 'Send message'}
          {!loading && <ArrowRight size={17}/>}
        </button>
      </form>
    </main>
  )
}
function AdminDashboard() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState('')
  const [students, setStudents] = useState<any[]>([])
const [loadingStudents, setLoadingStudents] = useState(false)

  const loadAdminItems = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Admin items error:', error.message)
      alert('Unable to load reports: ' + error.message)
    } else {
      setItems(data || [])
    }

    setLoading(false)
  }
  const loadStudents = async () => {
  setLoadingStudents(true)

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, registration_number, role')
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Student loading error:', error.message)
    alert('Unable to load students: ' + error.message)
  } else {
    setStudents(data || [])
  }

  setLoadingStudents(false)
}

  useEffect(() => {
  loadAdminItems()
  loadStudents()
}, [])

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdating(id)

    const { error } = await supabase
      .from('items')
      .update({ approval_status: status })
      .eq('id', id)

    if (error) {
      alert('Update failed: ' + error.message)
    } else {
      await loadAdminItems()
    }

    setUpdating('')
  }

  const pending = items.filter(i => i.approval_status === 'pending')
  const approved = items.filter(i => i.approval_status === 'approved')
  const rejected = items.filter(i => i.approval_status === 'rejected')

  return (
    <main className="page-shell container admin-page">
      <div className="page-intro">
        <span className="eyebrow">CAMPUSFOUND MANAGEMENT</span>
        <h1>Admin <em>dashboard.</em></h1>
        <p>Manage student reports and keep the campus community safe.</p>
      </div>

      <div className="admin-stats">
        <div>
          <span>Total reports</span>
          <strong>{items.length}</strong>
        </div>
        <div>
          <span>Pending approval</span>
          <strong>{pending.length}</strong>
        </div>
        <div>
          <span>Approved reports</span>
          <strong>{approved.length}</strong>
        </div>
        <div>
          <span>Rejected reports</span>
          <strong>{rejected.length}</strong>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <h2>Pending reports</h2>
          <p>Review submissions before they appear publicly.</p>
        </div>
        <button className="btn btn-secondary" onClick={loadAdminItems}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="empty-state">Loading reports...</div>
      ) : pending.length === 0 ? (
        <div className="empty-state">
          <h3>All caught up!</h3>
          <p>There are no pending reports to review.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Location</th>
                <th>Reporter</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map(item => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    <small>{item.category}</small>
                  </td>
                  <td>{item.status}</td>
                  <td>{item.location}</td>
                  <td>{item.reporter_name || 'Campus member'}</td>
                  <td>{item.item_date}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        disabled={updating === item.id}
                        onClick={() => updateStatus(item.id, 'approved')}
                        className="admin-approve"
                      >
                        Approve
                      </button>
                      <button
                        disabled={updating === item.id}
                        onClick={() => updateStatus(item.id, 'rejected')}
                        className="admin-reject"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

function AdminRoute() {
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let active = true

    async function checkAdmin() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
          if (active) setIsAdmin(false)
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (active) {
          setIsAdmin(!profileError && profile?.role === 'admin')
        }
      } catch (error) {
        console.error('Admin verification error:', error)
        if (active) setIsAdmin(false)
      } finally {
        if (active) setChecking(false)
      }
    }

    checkAdmin()

    return () => {
      active = false
    }
  }, [])

  if (checking) {
    return <main className="page-shell container">Checking admin access...</main>
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <AdminDashboard />
}
function Footer(){return <footer className="footer"><div className="container footer-grid"><div><Link to="/" className="brand footer-brand"><img src="/lpu-logo.png" className="brand-logo" alt="LPU Logo"/><span className="brand-name">campus<span className="brand-accent">found</span><small>LPU COMMUNITY</small></span></Link><p>A little help from campus goes a long way. Helping lost things find their way home.</p></div><div><b>Explore</b><Link to="/browse">Browse items</Link><Link to="/report">Report an item</Link><Link to="/how-it-works">How it works</Link></div><div><b>Community</b><Link to="/login">Student login</Link><Link to="/dashboard">My dashboard</Link><Link to="/contact">Contact support</Link></div><div className="footer-note"><ShieldCheck size={22}/><b>Community first</b><span>Share only what is needed. Verify ownership before handing over an item.</span></div></div><div className="container footer-bottom"><span>© 2026 CampusFound · Student-built campus prototype</span><span>Not an official LPU service</span></div></footer>}
function ItemCard({item}:{item:Item}) {
  return (
    <Link to={`/item/${item.id}`} className="item-card">
      <div className="item-photo">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            onError={e => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="item-placeholder">
            <PackageSearch size={55} />
            <span>No photo provided</span>
          </div>
        )}
        <span className={`status ${item.status.toLowerCase()}`}>
          {item.status === 'Lost' ? 'Lost item' : 'Found item'}
        </span>
      </div>

      <div className="item-info">
        <div className="item-top">
          <span>{item.category}</span>
          <span>{item.date}</span>
        </div>
        <h3>{item.title}</h3>
        <p className="item-location">
          <MapPin size={14}/>{item.location}
        </p>
        <div className="card-bottom">
          <span>View details</span>
          <ArrowUpRight size={17}/>
        </div>
      </div>
    </Link>
  )
}
function Home({items}:{items:Item[]}) {
 const [query,setQuery]=useState('')
 const navigate=useNavigate()
 return <><main>
  <section className="hero"><div className="hero-glow"/><div className="container hero-grid"><div className="hero-copy"><div className="eyebrow"><span className="pulse-dot"/> THE LPU CAMPUS COMMUNITY</div><h1>Lost something?<br/><em>Let's bring it</em><br/>back to you.</h1><p className="hero-desc">A misplaced belonging shouldn't mean a lost day. Connect with your campus community and help your belongings find their way home.</p><form className="hero-search" onSubmit={e=>{e.preventDefault();navigate(`/browse?q=${encodeURIComponent(query)}`)}}><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try “black wallet” or “ID card”"/><button className="btn btn-primary">Search</button></form><div className="hero-actions"><Link to="/report?type=Lost" className="btn btn-dark"><Plus size={17}/> I lost something</Link><Link to="/report?type=Found" className="btn btn-outline"><PackageSearch size={17}/> I found something</Link></div><div className="trust-line"><ShieldCheck size={16}/> Student-powered · Simple · Community-first</div></div><div className="hero-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-main"><div className="art-sun"/><PackageSearch size={106} strokeWidth={1.15}/><span className="art-caption">FOUND IT. <b>RETURNED IT.</b></span></div><div className="float-card float-one"><span className="float-icon green"><CheckCircle2 size={18}/></span><span><b>One less worry</b><small>Found on campus</small></span></div><div className="float-card float-two"><span className="float-icon blue"><HeartHandshake size={18}/></span><span><b>Good people,</b><small>helping each other</small></span></div><div className="art-sticker">YOUR CAMPUS.<br/>YOUR COMMUNITY.</div></div></div></section>
  <section className="stats-strip"><div className="container stats-grid"><div><strong>{items.length.toString().padStart(2,'0')}<sup>+</sup></strong><span>Community reports</span></div><div><strong>24<span>/7</span></strong><span>Browse anytime</span></div><div><strong>01</strong><span>Campus community</span></div><div className="stats-message"><ShieldCheck size={22}/><span>Every small act of help<br/><b>makes campus better.</b></span></div></div></section>
  <section className="section container"><div className="section-heading"><div><span className="eyebrow">THE LATEST FINDS</span><h2>Recently reported</h2><p>Fresh updates from around the campus.</p></div><Link to="/browse" className="text-link">Explore all items <ArrowRight size={17}/></Link></div><div className="items-grid">{items.slice().sort((a,b)=>b.createdAt-a.createdAt).slice(0,3).map(i=><ItemCard key={i.id} item={i}/>)}</div></section>
  <section className="how-band"><div className="container"><div className="section-heading"><div><span className="eyebrow">A SIMPLE WAY BACK</span><h2>Good things happen<br/>when we help.</h2></div><p className="heading-side">Three small steps can turn a lost-item story into a happy ending.</p></div><div className="steps-grid"><div className="step"><span>01</span><Search size={24}/><h3>Search or report</h3><p>Look through recent listings or share details of something you've lost or found.</p></div><div className="step"><span>02</span><HeartHandshake size={24}/><h3>Connect privately</h3><p>Send a claim request with details that help verify the rightful owner.</p></div><div className="step"><span>03</span><CheckCircle2 size={24}/><h3>Make the return</h3><p>Arrange a safe handover at a familiar campus location.</p></div></div></div></section>
  <section className="cta-section container"><div><span className="eyebrow">BE THE REASON IT GETS HOME</span><h2>Found something?<br/><em>Someone's looking for it.</em></h2><p>A quick report could make someone's day a whole lot better.</p><Link to="/report?type=Found" className="btn btn-primary">Report a found item <ArrowRight size={17}/></Link></div><div className="cta-icon"><HeartHandshake size={100} strokeWidth={1}/><span>PASS IT ON.</span></div></section>
 </main></>
}
function Browse({items}:{items:Item[]}) {
 const [q,setQ]=useState(new URLSearchParams(location.search).get('q')||'')
 const [status,setStatus]=useState('All')
 const [category,setCategory]=useState('All')
 const [sort,setSort]=useState('Newest first')
 const filtered=useMemo(()=>items.filter(i=>(status==='All'||i.status===status)&&(category==='All'||i.category===category)&&`${i.title} ${i.description} ${i.location}`.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>sort==='Newest first'?b.createdAt-a.createdAt:a.createdAt-b.createdAt),[items,q,status,category,sort])
 return <main className="page-shell container"><div className="page-intro"><span className="eyebrow">CAMPUS COMMUNITY BOARD</span><h1>Browse <em>the board.</em></h1><p>Every listing is a chance to reconnect someone with something they value.</p></div><div className="filter-panel"><div className="search-field"><Search size={18}/><input placeholder="Search items, places or details..." value={q} onChange={e=>setQ(e.target.value)}/></div><select value={status} onChange={e=>setStatus(e.target.value)}><option>All</option><option>Lost</option><option>Found</option></select><select value={category} onChange={e=>setCategory(e.target.value)}><option>All</option>{categories.map(c=><option key={c}>{c}</option>)}</select><select value={sort} onChange={e=>setSort(e.target.value)}><option>Newest first</option><option>Oldest first</option></select></div><div className="results-row"><b>{filtered.length} listings</b><span><SlidersHorizontal size={15}/> Refine your search</span></div>{filtered.length?<div className="items-grid">{filtered.map(i=><ItemCard key={i.id} item={i}/>)}</div>:<div className="empty-state"><PackageSearch size={42}/><h3>No matches just yet</h3><p>Try a different keyword or clear your filters.</p><button className="btn btn-primary" onClick={()=>{setQ('');setStatus('All');setCategory('All')}}>Clear filters</button></div>}</main>
}
function Report({onAdd}:{onAdd:(i:Item)=>Promise<void>}) {
 const navigate=useNavigate(), params=new URLSearchParams(location.search)
 const [type,setType]=useState<ItemStatus>((params.get('type')==='Found'?'Found':'Lost'))
 const [title,setTitle]=useState(''),[category,setCategory]=useState(categories[0]),[description,setDescription]=useState(''),[place,setPlace]=useState(locations[0]),[date,setDate]=useState(''),[image,setImage]=useState(''),[preview,setPreview]=useState('')
 const [done,setDone]=useState(false)
 const submit = async (e: FormEvent) => {
  e.preventDefault()

  if (!title.trim() || !description.trim() || !date) return

  try {
    await onAdd({
      id: '',
      title: title.trim(),
      category,
      status: type,
      location: place,
      date,
      description,
      image: '',
      reporter: 'Campus member',
      createdAt: Date.now(),
      state: 'Open'
    })

    setDone(true)
  } catch (error) {
  console.error('Submission error:', error)
  alert((error as any)?.message || 'Unknown database error')
}
}
 if(done)return <main className="page-shell container"><div className="success-card"><CheckCircle2 size={58}/><span className="eyebrow">REPORT SUBMITTED</span><h1>Thanks for looking out.</h1><p>Your {type.toLowerCase()} item has been added to the community board on this device.</p><div className="hero-actions"><Link to="/browse" className="btn btn-primary">View listings</Link><button className="btn btn-outline" onClick={()=>{setDone(false);setTitle('');setDescription('')}}>Add another</button></div></div></main>
 return <main className="page-shell container"><div className="page-intro"><span className="eyebrow">HELP THE COMMUNITY CONNECT</span><h1>Make a <em>report.</em></h1><p>A few helpful details can make all the difference. Please avoid sharing private information.</p></div><form className="report-layout" onSubmit={submit}><div className="form-card"><h2>What would you like to report?</h2><div className="type-toggle"><button type="button" className={type==='Lost'?'selected':''} onClick={()=>setType('Lost')}><Search/> I lost something</button><button type="button" className={type==='Found'?'selected':''} onClick={()=>setType('Found')}><PackageSearch/> I found something</button></div><label>Item name <input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Black wireless headphones"/></label><div className="form-row"><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Date {type==='Lost'?'lost':'found'}<input type="date" required value={date} onChange={e=>setDate(e.target.value)} max={new Date().toISOString().slice(0,10)}/></label></div><label>Campus location<select value={place} onChange={e=>setPlace(e.target.value)}>{locations.map(l=><option key={l}>{l}</option>)}</select></label><label>Description<textarea required rows={5} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Add identifying details, colour, brand, where it was last seen..."/></label><label className="upload-box"><UploadCloud size={25}/><b>Add an item photo (optional)</b><span>JPG, PNG or WEBP · Max 4 MB</span><input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f&&f.size<4*1024*1024){setImage(f.name);setPreview(URL.createObjectURL(f))}}}/>{image&&<small>{image}</small>}{preview&&<img className="upload-preview" src={preview} alt="Preview"/>}</label><button className="btn btn-primary submit-btn">Submit report <ArrowRight size={17}/></button><p className="form-privacy"><LockKeyhole size={14}/> Your private contact details are not displayed publicly.</p></div><aside className="report-aside"><div className="aside-icon"><ShieldCheck size={28}/></div><h3>A safer way to reunite.</h3><p>Keep a few details private so you can verify the real owner before handing an item over.</p><ul><li>Meet in a public campus location.</li><li>Ask the claimant to describe a hidden detail.</li><li>Never share passwords or OTPs.</li></ul></aside></form></main>
}
function ItemDetail({items}:{items:Item[]}){const {id}=useParams();const item=items.find(i=>i.id===id);const [claim,setClaim]=useState(false);const [note,setNote]=useState('');const [sent,setSent]=useState(false);if(!item)return <main className="page-shell container empty-state"><h2>Listing not found</h2><Link to="/browse" className="btn btn-primary">Back to browse</Link></main>;return <main className="page-shell container"><Link to="/browse" className="back-link">← Back to listings</Link><div className="detail-grid"><img className="detail-image" src={item.image} alt={item.title}/><div className="detail-copy"><span className={`status ${item.status.toLowerCase()}`}>{item.status} item</span><span className="eyebrow">{item.category} · {item.id}</span><h1>{item.title}</h1><p className="item-location"><MapPin size={16}/>{item.location}</p><p className="item-location"><Clock3 size={16}/>{moneyDate(item.date)}</p><h3>About this item</h3><p>{item.description}</p><div className="privacy-callout"><LockKeyhole size={19}/><span>Claims are private. Verify ownership using details that are not shown in this public listing.</span></div>{!claim&&!sent?<button className="btn btn-primary" onClick={()=>setClaim(true)}>I think this is mine <ArrowRight size={17}/></button>:sent?<div className="inline-success"><CheckCircle2/> Claim request saved on this device.</div>:<form className="claim-form" onSubmit={e=>{e.preventDefault();setSent(true)}}><label>Help verify your claim<textarea required rows={4} value={note} onChange={e=>setNote(e.target.value)} placeholder="Describe a detail that only the owner would know."/></label><button className="btn btn-primary">Send claim request</button></form>}</div></div></main>}

function Login({onLogin}:{onLogin:(n:string)=>void}) {
  const navigate = useNavigate()
  const [isRegister,setIsRegister] = useState(false)
  const [name,setName] = useState('')
  const [registrationNumber,setRegistrationNumber] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [loading,setLoading] = useState(false)
  const [message,setMessage] = useState('')
  const [error,setError] = useState('')

  const submit = async (e:FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!/^\d{6,12}$/.test(registrationNumber.trim())) {
      setError('Enter a valid LPU registration number.')
      return
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      if (isRegister) {
        if (!name.trim() || !email.trim()) {
          throw new Error('Please fill in all registration details.')
        }

        const {data,error} = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: name.trim(),
              registration_number: registrationNumber.trim()
            },
            emailRedirectTo: `${window.location.origin}/login`
          }
        })

        if (error) throw error

        if (data.session) {
          onLogin(registrationNumber.trim())
          navigate('/')
        } else {
          setMessage('Registration successful! Check your personal email and verify your account before logging in.')
        }
      } else {
        const {data,error} = await supabase.functions.invoke(
          'login-with-registration',
          {
            body: {
              registrationNumber: registrationNumber.trim(),
              password
            }
          }
        )

        if (error) throw error
        if (data?.error) throw new Error(data.error)
        if (!data?.session?.access_token || !data?.session?.refresh_token) {
          throw new Error('Login failed. Please try again.')
        }

        const {error:sessionError} = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        })

        if (sessionError) throw sessionError

        const { data: { user }, error: userError } = await supabase.auth.getUser()

if (userError || !user) {
  throw new Error('Unable to verify your account.')
}

const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (profileError) throw profileError

onLogin(registrationNumber.trim())

if (profile.role === 'admin') {
  navigate('/admin')
} else {
  navigate('/')
}
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-shell container">
      <form className="login-card" onSubmit={submit}>
        <div className="login-icon"><UserRound/></div>
        <span className="eyebrow">WELCOME TO THE COMMUNITY</span>

        <h1>
          {isRegister ? <>Create your<br/><em>account.</em></> : <>Good to have<br/><em>you here.</em></>}
        </h1>

        <p>
          {isRegister ? 'Join CampusFound with your LPU student details.' : 'Sign in using your LPU registration number.'}
        </p>

        {isRegister && (
          <>
            <label>Full name
              <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name"/>
            </label>

            <label>Personal email
              <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
            </label>
          </>
        )}

        <label>LPU registration number
          <input required inputMode="numeric" value={registrationNumber} onChange={e=>setRegistrationNumber(e.target.value)} placeholder="Enter your registration number"/>
        </label>

        <label>Password
          <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" minLength={8}/>
        </label>

        {error && <p role="alert" className="form-error">{error}</p>}
        {message && <p role="status" className="form-success">{message}</p>}

        <button className="btn btn-primary submit-btn" disabled={loading}>
          {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Login'}
          {!loading && <ArrowRight size={17}/>}
        </button>

        <small className="form-privacy">
          <LockKeyhole size={14}/>
          Your student details are kept private.
        </small>

        <p>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          {' '}
          <button type="button" className="auth-toggle" onClick={() => {
            setIsRegister(!isRegister)
            setError('')
            setMessage('')
          }}>
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </form>
    </main>
  )
}
function Dashboard({items,user}:{items:Item[],user:string}){const mine=items.filter(i=>i.reporter===user);return <main className="page-shell container"><div className="page-intro"><span className="eyebrow">YOUR CAMPUS ACTIVITY</span><h1>Your <em>dashboard.</em></h1><p>Welcome back, <strong className="dashboard-name">{user}</strong>. Keep track of your reports and claims.</p></div><div className="dashboard-stats"><div><FileText/><strong>{mine.length}</strong><span>My reports</span></div><div><Bell/><strong>0</strong><span>Claim updates</span></div><div><HeartHandshake/><strong>0</strong><span>Items reunited</span></div></div><div className="section-heading"><div><h2>My reports</h2><p>Your recent activity on CampusFound.</p></div><Link to="/report" className="btn btn-primary"><Plus size={17}/> New report</Link></div>{mine.length?<div className="items-grid">{mine.map(i=><ItemCard key={i.id} item={i}/>)}</div>:<div className="empty-state"><PackageSearch size={42}/><h3>Your board starts here</h3><p>Reports you submit will appear here.</p><Link to="/report" className="btn btn-primary">Create your first report</Link></div>}</main>}
function How(){return <main className="page-shell container"><div className="page-intro"><span className="eyebrow">A LITTLE GUIDANCE</span><h1>How it <em>works.</em></h1><p>Simple steps, thoughtful details, and a community that looks out for one another.</p></div><div className="steps-grid how-page"><div className="step"><span>01</span><Search/><h3>Search the board</h3><p>Look for your item using keywords, categories and campus locations.</p></div><div className="step"><span>02</span><Plus/><h3>Post a report</h3><p>Share a clear description, approximate date and where it was lost or found.</p></div><div className="step"><span>03</span><ShieldCheck/><h3>Verify safely</h3><p>Use private identifying details to make sure an item reaches its rightful owner.</p></div><div className="step"><span>04</span><HeartHandshake/><h3>Arrange a handover</h3><p>Choose a public, familiar place on campus to return the item.</p></div></div><div className="safety-panel"><ShieldCheck size={28}/><div><h3>A quick safety reminder</h3><p>CampusFound is a student-built prototype, not an official university service. Do not post phone numbers, passwords, OTPs, addresses or sensitive identity details in public listings. Verify ownership before arranging a handover.</p></div></div></main>}
export default function App() {
    const location = useLocation()

useEffect(() => {
  window.scrollTo(0, 0)
}, [location.pathname, location.search])
  const [items, setItems] = useState<Item[]>([])
  const [user, setUser] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
useEffect(() => {
  let active = true

  const syncSession = async (session: any) => {
    if (!session?.user) {
      if (active) {
        setUser('')
        setIsAdmin(false)
      }
      return
    }

    const studentName =
      session.user.user_metadata?.full_name ||
      session.user.user_metadata?.registration_number ||
      ''

    if (active) setUser(studentName)

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()

    if (active) {
      if (error) {
        console.error('Admin role check error:', error)
        setIsAdmin(false)
      } else {
        setIsAdmin(profile?.role === 'admin')
      }
    }
  }

  supabase.auth.getSession().then(({ data, error }) => {
    if (error) console.error('Session error:', error)
    if (active) void syncSession(data.session)
  })

  const { data: { subscription } } =
    supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        if (active) void syncSession(session)
      }, 0)
    })

  return () => {
    active = false
    subscription.unsubscribe()
  }
}, [])

  useEffect(() => {
    async function loadItems() {
      try {
        const data = await fetchItems()
        setItems(data)
      } catch (error) {
        console.error('Failed to load items:', error)
      } finally {
        setLoading(false)
      }
    }

    loadItems()
  }, [])

 const add = async (i: Item): Promise<void> => {
  await createItem(i)
}

const login = (n: string) => {
  setUser(n)
}

const logout = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Logout error:', error.message)
    return
  }

  setUser('')
}

  if (loading) {
    return <div className="page-shell container">Loading CampusFound...</div>
  }

  return (
    <>
      <Header user={user} onLogout={logout} isAdmin={isAdmin} />
      <Routes>
        <Route path="/" element={<Home items={items} />} />
        <Route path="/browse" element={<Browse items={items} />} />
        <Route path="/report" element={<Report onAdd={add} />} />
        <Route path="/item/:id" element={<ItemDetail items={items} />} />
        <Route path="/login" element={<Login onLogin={login} />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/dashboard" element={user ? <Dashboard items={items} user={user} /> : <Login onLogin={login} />} />
        <Route path="/how-it-works" element={<How />} />
        <Route path="/contact" element={<ContactSupport />} />
        <Route path="*" element={<main className="page-shell container empty-state"><h2>Page not found</h2><Link to="/" className="btn btn-primary">Go home</Link></main>} />
      </Routes>
      <Footer />
    </>
  )
}

