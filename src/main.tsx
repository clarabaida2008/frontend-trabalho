import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Login from './componentes/login/login.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Admin from './componentes/admin/admin.tsx'
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CartaoPagamento from './componentes/pagamento/pagamento.tsx';

const stripe = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY); // sua chave pública

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/finalizar-compra" element={<Elements stripe={stripe}><CartaoPagamento/></Elements>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
