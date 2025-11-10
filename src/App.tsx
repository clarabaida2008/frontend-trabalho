import React, { useState, useEffect } from 'react'
import './App.css'
import api from './api/api'
type ProdutoType = {
  _id: string,
  nome: string,
  preco: number,
  descricao: string,
  urlfoto: string
}

function App() {
  return (
    <h1>App</h1>
  )
}

export default App
